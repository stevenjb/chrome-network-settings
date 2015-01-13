function registerOncIpConfig(doc) {

  var kIpConfigProperties = [ 'IPAddress', 'RoutingPrefix', 'Gateway' ];

  var oncIpConfigPrototype = Object.create(HTMLElement.prototype);

  function createConfig(doc, property) {
    var div = doc.createElement('div');
    div.className = 'config-property';
    var label = doc.createElement('span');
    label.id = property + 'Label';
    label.innerText = getText(property) + ':';
    div.appendChild(label);
    var value = doc.createElement('input');
    value.className = 'config-property';
    value.id = property + 'Value';
    div.appendChild(value);
    return div;
  };

  function createTemplate(doc) {
    var div = doc.createElement('div');
    div.id = 'outer';

    var divInput = doc.createElement('div');

    divInput.id = 'input';
    var input = doc.createElement('input');
    input.id = 'checkbox';
    input.type = 'checkbox';
    divInput.appendChild(input);

    var label = doc.createElement('span');
    label.innerText = getText('Configure IP Address Automatically');
    divInput.appendChild(label);

    div.appendChild(divInput);

    var divConfig = doc.createElement('div');
    divConfig.id = 'config';
    for (var p of kIpConfigProperties)
      divConfig.appendChild(createConfig(doc, p));
    divConfig.appendChild(createConfig(doc, 'IPAddressV6'));
    div.appendChild(divConfig);

    return div;
  };

  oncIpConfigPrototype.onCheckboxChanged_ = function(element) {
    if (!this.onChangeFunc)
      return;
    var checked = this.root_.querySelector('input#checkbox').checked;
    if (checked) {
      var oncProperties = {};
      PropertyUtil.setNestedProperty(oncProperties, 'IPAddressConfigType',
                                     'DHCP');
      if ('NameServers' in this.staticIp_) {
        PropertyUtil.setNestedProperty(oncProperties, 'NameServersConfigType',
                                       nameServersType);
        var staticIpConfig = {};
        staticIpConfig['NameServers'] = this.staticIp_;
        PropertyUtil.setNestedProperty(oncProperties, 'StaticIPConfig',
                                       staticIpConfig);
      }
      this.onChangeFunc(oncProperties);
    } else {
      this.setStaticIpConfig_();
    }
  };

  oncIpConfigPrototype.onPropertyChanged_ = function(element) {
    if (!this.onChangeFunc)
      return;
    if (this.root_.querySelector('input#checkbox').checked)
      return;
    this.staticIp_ = this.staticIp_ || {};
    this.staticIp_['IPAddress'] =
        this.root_.querySelector('input#IPAddressValue').value;
    var mask = this.root_.querySelector('input#RoutingPrefixValue').value;
    this.staticIp_['RoutingPrefix'] = PropertyUtil.netmaskToPrefixLength(mask);
    this.staticIp_['Gateway'] =
        this.root_.querySelector('input#GatewayValue').value;
    this.setStaticIpConfig_();
  };

  oncIpConfigPrototype.setStaticIpConfig_ = function(element) {
    var oncProperties = {};
    var ipConfig = this.staticIp_ || this.ipv4_;
    var staticIp = {};
    for (var p of kIpConfigProperties)
      staticIp[p] = ipConfig[p];
    if (this.staticIp_ && 'NameServers' in this.staticIp_)
      staticIp['NameServers'] = this.staticIp_['NameServers'];
    PropertyUtil.setNestedProperty(oncProperties, 'IPAddressConfigType',
                                   'Static');
    var nameServersType = ('NameServers' in staticIp) ? 'Static' : 'DHCP';
    PropertyUtil.setNestedProperty(oncProperties, 'NameServersConfigType',
                                   nameServersType);
    PropertyUtil.setNestedProperty(oncProperties, 'StaticIPConfig', staticIp);

    this.onChangeFunc(oncProperties);
  };

  oncIpConfigPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('input#checkbox').onchange =
        oncIpConfigPrototype.onCheckboxChanged_.bind(this);
    var inputs =  this.root_.querySelectorAll('input.config-property');
    for (var i = 0; i < inputs.length; ++i)
      inputs[i].onblur = oncIpConfigPrototype.onPropertyChanged_.bind(this);
  };

  oncIpConfigPrototype.setPropertyFromDict = function(propertyDict) {
    var ipv4, ipv6;
    var ipConfigs = propertyDict['IPConfigs'];
    if (Array.isArray(ipConfigs)) {
      for (var ipConfig of ipConfigs) {
        if (ipConfig['Type'] == 'IPv6') {
          if (ipv6 == undefined)
            ipv6 = ipConfig;
        } else {
          if (ipv4 == undefined)
            ipv4 = ipConfig;
        }
      }
    }
    var staticIp = undefined;
    if (propertyDict['IPAddressConfigType'] == 'Static')
      staticIp = propertyDict['StaticIPConfig'] || {};

    var savedIp = propertyDict['SavedIPConfig'];
    this.ipv4_ = ipv4 || savedIp || {};
    if (!('IPAddress' in this.ipv4_))
      this.ipv4_['IPAddress'] = '0.0.0.0';
    this.ipv6_ = ipv6 || {};
    this.staticIp_ = staticIp;

    this.updateView();
  };

  oncIpConfigPrototype.updateView = function() {
    function mergeIpConfig(base, newConfig) {
      for (var p of kIpConfigProperties) {
        if (newConfig[p] != undefined)
          base[p] = newConfig[p];
      }
    }

    var isStatic = this.staticIp_ != undefined;
    this.root_.querySelector('input#checkbox').checked = !isStatic;
    this.root_.querySelector('div#config').class =
        isStatic ? 'static' : 'automatic';
    var ipConfig = {
      'IPAddress': '',
      'RoutingPrefix': 1,
      'Gateway': ''
    };
    if (isStatic)
      mergeIpConfig(ipConfig, this.staticIp_);
    else
      mergeIpConfig(ipConfig, this.ipv4_);
    this.root_.querySelector('input#IPAddressValue').value =
        ipConfig['IPAddress'];
    var mask = PropertyUtil.prefixLengthToNetmask(ipConfig['RoutingPrefix']);
    this.root_.querySelector('input#RoutingPrefixValue').value = mask;
    this.root_.querySelector('input#GatewayValue').value = ipConfig['Gateway'];

    var inputs =  this.root_.querySelectorAll('input.config-property');
    for (var i = 0; i < inputs.length; ++i)
      inputs[i].disabled = !isStatic;

    var ipv6Label = this.root_.querySelector('span#IPAddressV6Label');
    var ipv6Value = this.root_.querySelector('input#IPAddressV6Value');
    ipv6Value.disabled = true;
    if (this.ipv6_ && this.ipv6_['IPAddress']) {
      ipv6Label.style.display = 'inherit';
      ipv6Value.style.display = 'inherit';
      ipv6Value.value = this.ipv6_['IPAddress'];
    } else {
      ipv6Label.style.display = 'none';
      ipv6Value.style.display = 'none';
    }
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'onc-ip-config', oncIpConfigPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/onc-ip-config.css');
}
