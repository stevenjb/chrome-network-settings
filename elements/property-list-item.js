function registerPropertyListItem(doc) {

  var propertyListItemPrototype = Object.create(HTMLElement.prototype);

  function createTemplate(doc) {
    var div = doc.createElement('div');
    var spanLabel = doc.createElement('span');
    spanLabel.id = 'label';
    div.appendChild(spanLabel);
    var spanValue = doc.createElement('span');
    spanValue.id = 'value';
    div.appendChild(spanValue);

    return div;
  };

  propertyListItemPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('span#label').innerText =
        getText(this.attributes.oncproperty.value);
  };

  propertyListItemPrototype.setPropertyFromDict = function(propertyDict) {
    var property = this.attributes.oncproperty.value;
    var value = PropertyUtil.getNestedPropertyAsString(propertyDict, property);
    if (value == undefined) {
      if (!('default' in this.attributes)) {
        this.style.display = 'none';
        return;
      }
      value = this.attributes.default.value;
    }
    if ('postfix' in this.attributes)
      value += this.attributes.postfix.value;
    this.style.display = 'inherit';
    this.root_.querySelector('#value').innerText = value;
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'property-list-item', propertyListItemPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/property-list-item.css');
}
