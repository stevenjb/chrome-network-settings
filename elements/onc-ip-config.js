function registerOncIpConfig(doc) {

  var oncIpConfigPrototype = Object.create(HTMLElement.prototype);

  function createConfig(doc, property) {
    var div = doc.createElement('div');
    div.className = 'config';
    var label = doc.createElement('span');
    label.id = property + 'Label';
    label.innerText = getText(property);
    div.appendChild(label);
    var value = doc.createElement('span');
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
    input.type = 'checkbox';
    divInput.appendChild(input);

    var label = doc.createElement('span');
    label.innerText = getText('Configure IP Address Automatically');
    divInput.appendChild(label);

    div.appendChild(divInput);

    var divConfig = doc.createElement('div');
    divConfig.id = 'config';
    divConfig.appendChild(createConfig(doc, 'IPAddress'));
    divConfig.appendChild(createConfig(doc, 'RoutingPrefix'));
    divConfig.appendChild(createConfig(doc, 'Gateway'));
    div.appendChild(divConfig);

    return div;
  };

  oncIpConfigPrototype.onChange = function(element) {
    var checked = this.root_.querySelector('input').checked;
    var config = this.root_.querySelector('div#config');
    config.style.display = checked ? 'none' : 'inherit';
  };

  oncIpConfigPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('input').onchange =
        oncIpConfigPrototype.onChange.bind(this);
  };

  oncIpConfigPrototype.setPropertyFromDict = function(propertyDict) {
    var property = this.attributes.oncproperty.value;
    var value = IpConfigUtil.getNestedIpConfigAsString(propertyDict, property);
    if (value == undefined) {
      // this.style.display = 'none';
      return;
    }
    this.style.display = 'inherit';
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'onc-ip-config', oncIpConfigPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/onc-ip-config.css');
}
