function registerOncNameservers(doc) {

  var oncNameserversPrototype = Object.create(HTMLElement.prototype);

  /** @const */ var kNumNameserverFields = 4;
  /** @const */ var kGoogleNameservers = ['8.8.4.4', '8.8.8.8'];

  function createOption(doc, value, label) {
    var option = doc.createElement('option');
    option.value = value;
    option.innerText = getText(label);
    return option;
  };

  function createTemplate(doc) {
    var div = doc.createElement('div');
    div.id = 'outer';

    var divType = doc.createElement('div');
    divType.id = 'type';
    var selectType = doc.createElement('select');
    selectType.id = 'type';

    selectType.appendChild(
        createOption(doc, 'automatic', 'Automatic name servers'));
    selectType.appendChild(createOption(doc, 'google', 'Google name servers'));
    selectType.appendChild(createOption(doc, 'custom', 'Custom name servers'));
    divType.appendChild(selectType);
    div.appendChild(divType);

    var divNameservers = doc.createElement('div');
    divNameservers.id = 'nameservers';
    for (var i = 0; i < kNumNameserverFields; ++i)
      divNameservers.appendChild(doc.createElement('input'));
    div.appendChild(divNameservers);

    return div;
  };

  function getNameserversFromIpConfig(ipconfig) {
    if (!ipconfig)
      return undefined;
    var nameservers = ipconfig['NameServers'];
    if (!nameservers || !nameservers.length)
      return undefined;
    nameservers = nameservers.slice();  // copy
    return nameservers.sort();
  }

  oncNameserversPrototype.onTypeChanged_ = function(event) {
    var target = event.currentTarget;
    var type = target.childNodes[target.selectedIndex].value;
    // log('onTypeChanged: ' + type);
    if (type == this.nameserversType_)
      return;
    if (type == 'custom') {
      var customNameservers = this.customNameservers_;
      var nameserverInputs =
          this.root_.querySelectorAll('div#nameservers input');
      var isGoogle =
          customNameservers.join(',') == kGoogleNameservers.join(',');
      for (var i = 0; i < nameserverInputs.length; ++i) {
        if (i < customNameservers.length && (i == 0 || !isGoogle))
          nameserverInputs[i].value = customNameservers[i];
        else
          nameserverInputs[i].value = '';
      }
      if (!nameserverInputs[0].value)
        nameserverInputs[0].value = kGoogleNameservers[0];
    }
    this.sendNameservers_(type);
  };

  oncNameserversPrototype.onNameserverChanged_ = function(event) {
    this.sendNameservers_('custom');
  };

  oncNameserversPrototype.onObjectChanged_ = function(changes) {
    for (var change of changes) {
      if (change.name == 'disabled')
        this.updateDisabled_();
    }
  };

  oncNameserversPrototype.sendNameservers_ = function(type) {
    var onc = {};
    var staticIpConfig = this.staticIpConfig_ || {};
    if (type == 'automatic') {
      onc['NameServersConfigType'] = 'DHCP';
      delete staticIpConfig['NameServers'];
    } else {
      onc['NameServersConfigType'] = 'Static';
      var nameservers;
      if (type == 'google') {
        nameservers = kGoogleNameservers;
      } else {
        nameservers = [];
        var nameserverInputs =
            this.root_.querySelectorAll('div#nameservers input');
        for (var i = 0; i < nameserverInputs.length; ++i) {
          var nameserver = nameserverInputs[i].value;
          if (nameserver)
            nameservers.push(nameserver);
        }
      }
      staticIpConfig['NameServers'] = nameservers;
    }
    onc['IPAddressConfigType'] = this.ipAddressConfigType_;
    onc['StaticIPConfig'] = staticIpConfig;
    this.onChangeFunc(onc);
  };

  oncNameserversPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('select#type').onchange =
        oncNameserversPrototype.onTypeChanged_.bind(this);
    var nameserverInputs = this.root_.querySelectorAll('div#nameservers input');
    for (var i = 0; i < nameserverInputs.length; ++i) {
      nameserverInputs[i].onblur =
          oncNameserversPrototype.onNameserverChanged_.bind(this);
    }

    Object.observe(this, oncNameserversPrototype.onObjectChanged.bind(this));

    this.customNameservers_ = [];
  };

  oncNameserversPrototype.setPropertyFromDict = function(propertyDict) {
    var nameservers;

    this.ipAddressConfigType_ = propertyDict['IPAddressConfigType'];
    this.staticIpConfig_ = propertyDict['StaticIPConfig'];

    this.nameserversType_ = 'automatic';
    if (propertyDict['NameServersConfigType'] == 'Static') {
      nameservers = getNameserversFromIpConfig(this.staticIpConfig_);
      if (nameservers.join(',') == kGoogleNameservers.join(',')) {
        this.nameserversType_ = 'google';
      } else {
        if (nameservers)
          this.customNameservers_ = nameservers;
        this.nameserversType_ = 'custom';
      }
    }

    if (this.nameserversType_ == 'automatic') {
      var ipConfigs = propertyDict['IPConfigs'];
      var len = ipConfigs ? ipConfigs.length : 0;
      for (var i = 0; i < len; ++i) {
        var ipConfig = ipConfigs[i];
        if (ipConfig['Type'] != 'IPv6') {
          nameservers = getNameserversFromIpConfig(ipConfig);
          break;
        }
      }
    }

    var nameserverInputs = this.root_.querySelectorAll('div#nameservers input');
    var enabled = this.nameserversType_ == 'custom';
    for (var i = 0; i < nameserverInputs.length; ++i) {
      nameserverInputs[i].disabled = !enabled;
      nameserverInputs[i].className = this.nameserversType_;
      var value = (nameservers && i < nameservers.length) ? nameservers[i] : '';
      nameserverInputs[i].value = value;
      nameserverInputs[i].style.display =
          (enabled || value) ? 'inherit' : 'none';
    }

    var selectType = this.root_.querySelector('select#type');
    if (this.nameserversType_ == 'custom')
      selectType.selectedIndex = 2;
    else if (this.nameserversType_ == 'google')
      selectType.selectedIndex = 1;
    else
      selectType.selectedIndex = 0;

    this.updateDisabled_();
  };

  oncNameserversPrototype.updateDisabled_ = function() {
    this.root_.querySelector('select#type').disabled = this.disabled;
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'onc-nameservers', oncNameserversPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/onc-nameservers.css');
}
