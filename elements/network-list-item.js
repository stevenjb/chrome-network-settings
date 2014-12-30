function registerNetworkListItem(doc, listType) {

  registerNetworkIcon(doc, 'list');

  var networkListItemPrototype = Object.create(HTMLElement.prototype);

  networkListItemPrototype.clickNetwork = function() {
    if (this.onClickFunc)
      this.onClickFunc(this.guid_);
  };

  function createTemplate(doc) {
    var template = doc.createElement('template');
    template.id = 'networkListItemTemplate';

    var div = doc.createElement('div');
    var icon = doc.createElement('network-icon');
    icon.id = 'icon';
    div.appendChild(icon);
    var name = doc.createElement('span');
    name.id = 'name';
    div.appendChild(name);
    var state = doc.createElement('span');
    state.id = 'state';
    div.appendChild(state);

    template.content.appendChild(div);

    doc.head.appendChild(template);
  };

  networkListItemPrototype.createdCallback = function() {
    this.root_ = this.createShadowRoot();

    var doc = this.ownerDocument;
    var template = doc.querySelector('#networkListItemTemplate');
    var clone = doc.importNode(template.content, true);
    this.root_.appendChild(clone);

    var css = ':host { display: inline-block; }';
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    this.root_.appendChild(style);

    this.onclick = networkListItemPrototype.clickNetwork.bind(this);
  };

  networkListItemPrototype.setNetwork = function(network) {
    this.guid_ = network['GUID'];

    if (!network) {
      this.style.display = 'none';
      return;
    }
    this.style.display = undefined;  // inherit

    this.root_.querySelector('#icon').setNetwork(network);
    this.root_.querySelector('#name').textContent = network['Name'];

    var stateName = network['ConnectionState'];
    var stateNode = this.root_.querySelector('#state');
    stateNode.className = stateName;
    stateNode.textContent = getText(stateName);
  };

  createTemplate(doc);

  var networkListItemElement = doc.registerElement(
      'network-list-item', { prototype : networkListItemPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', '/elements/network-list-item.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkListItem registered');
}
