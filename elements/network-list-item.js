function registerNetworkListItem(doc, listType) {

  registerNetworkIcon(doc, listType);

  function getConnectionStateText(stateName, networkName) {
    if (stateName == 'Connected')
      return getText("Connected to %1", [ networkName]);
    if (stateName == 'Connecting')
      return getText("Connecting to %1...", [ networkName]);
    if (stateName == 'NotConnected')
      return getText("Not Connected");
    return getText(stateName);
  };

  var networkListItemPrototype = Object.create(HTMLElement.prototype);

  networkListItemPrototype.clickNetwork = function() {
    if (this.onClickFunc)
      this.onClickFunc(this.guid_);
  };

  function createTemplate(doc) {
    var template = doc.createElement('template');
    template.id = 'networkListItemTemplate';

    var div1 = doc.createElement('div');
    div1.id = 'div-outer';

    var divIcon = doc.createElement('div');
    divIcon.id = 'div-icon';
    divIcon.className = listType;
    var icon = doc.createElement('network-icon');
    icon.id = 'icon';
    divIcon.appendChild(icon);
    div1.appendChild(divIcon);

    var divText = doc.createElement('div');
    divText.id = 'div-text';
    divText.className = listType;
    var name = doc.createElement('span');
    name.id = 'name';
    divText.appendChild(name);
    var state = doc.createElement('span');
    state.id = 'state';
    divText.appendChild(state);
    div1.appendChild(divText);

    template.content.appendChild(div1);

    doc.head.appendChild(template);
  };

  networkListItemPrototype.createdCallback = function() {
    this.root_ = this.createShadowRoot();

    var doc = this.ownerDocument;
    var template = doc.querySelector('#networkListItemTemplate');
    var clone = doc.importNode(template.content, true);
    this.root_.appendChild(clone);

    var css = ':host { display: inline-block; flex: 0 0 auto; }';
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

    var networkType = network['Type'];
    var networkName = network['Name'];
    var stateName = network['ConnectionState'];
    var nameNode = this.root_.querySelector('#name');
    var stateNode = this.root_.querySelector('#state');

    if (listType == 'summary') {
      nameNode.className = '';
      nameNode.textContent = getText(networkType);
      stateNode.display = undefined;  // inherit
      stateNode.className = stateName;
      stateNode.textContent = getConnectionStateText(stateName, networkName);
    } else {
      nameNode.className = stateName;
      nameNode.textContent = networkName;
      stateNode.display = 'none';
    }
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
