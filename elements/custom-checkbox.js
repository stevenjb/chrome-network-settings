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
    var template = doc.createElement('template');
    template.id = 'customCheckboxTemplate';

    var div = doc.createElement('div');
    var input = doc.createElement('input');
    input.type = 'checkbox';
    div.appendChild(input);
    var label = doc.createElement('span');
    label.id = 'label';
    div.appendChild(label);

    template.content.appendChild(div);

    doc.head.appendChild(template);
  };

  customCheckboxPrototype.onChange = function(element) {
    if (!this.onChangeFunc)
      return;
    this.onChangeFunc(this.attributes.oncproperty.value,
                      this.root_.querySelector('input').checked);
  };

  customCheckboxPrototype.createdCallback = function() {
    this.root_ = this.createShadowRoot();

    var doc = this.ownerDocument;
    var template = doc.querySelector('#customCheckboxTemplate');
    var clone = doc.importNode(template.content, true);
    this.root_.appendChild(clone);

    var css = ':host { display: inline-block; }';
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    this.root_.appendChild(style);

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

  createTemplate(doc);

  var customCheckboxElement = doc.registerElement(
      'custom-checkbox', { prototype : customCheckboxPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', '/elements/custom-checkbox.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('custom-checkbox registered');
}
