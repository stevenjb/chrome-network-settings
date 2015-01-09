function registerOncCheckbox(doc) {

  var oncCheckboxPrototype = Object.create(HTMLElement.prototype);

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

  oncCheckboxPrototype.onChange = function(element) {
    if (!this.onChangeFunc)
      return;
    this.onChangeFunc(this.attributes.oncproperty.value,
                      this.root_.querySelector('input').checked);
  };

  oncCheckboxPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('span#label').innerText =
        getText(this.attributes.oncproperty.value);

    this.root_.querySelector('input').onchange =
        oncCheckboxPrototype.onChange.bind(this);
  };

  oncCheckboxPrototype.setPropertyFromDict = function(propertyDict) {
    var property = this.attributes.oncproperty.value;
    var value = PropertyUtil.getNestedProperty(propertyDict, property);
    if (value == undefined)
      return;
    this.root_.querySelector('input').checked = value;
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'onc-checkbox', oncCheckboxPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/onc-checkbox.css');
}
