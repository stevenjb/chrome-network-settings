function registerCustomCheckbox(doc) {

  function getNestedProperty_(dict, key) {
    var data = dict;
    while (true) {
      var index = key.indexOf('.');
      if (index < 0)
        break;
      var keyComponent = key.substr(0, index);
      if (!(keyComponent in data))
        return undefined;
      data = data[keyComponent];
      key = key.substr(index + 1);
    }
    return data[key];
  };

  var customCheckboxPrototype = Object.create(HTMLElement.prototype);

  function createTemplate(doc) {
    var div = doc.createElement('div');
    var input = doc.createElement('input');
    input.type = 'checkbox';
    div.appendChild(input);
    var label = doc.createElement('span');
    label.id = 'label';
    div.appendChild(label);

    return div;
  };

  customCheckboxPrototype.onChange = function(element) {
    if (!this.onChangeFunc)
      return;
    this.onChangeFunc(this.attributes.oncproperty.value,
                      this.root_.querySelector('input').checked);
  };

  customCheckboxPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('span#label').innerText =
        getText(this.attributes.oncproperty.value);

    this.root_.querySelector('input').onchange =
        customCheckboxPrototype.onChange.bind(this);
  };

  customCheckboxPrototype.setProperty = function(propertyDict) {
    var property = this.attributes.oncproperty.value;
    var value = getNestedProperty_(propertyDict, property);
    if (value == undefined)
      return;
    this.root_.querySelector('input').checked = value;
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'custom-checkbox', customCheckboxPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/custom-checkbox.css');
}
