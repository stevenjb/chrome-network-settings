function registerNetworkListItem(doc, defaultListType) {

  registerNetworkIcon(doc, defaultListType);

  function getConnectionStateText(stateName, networkName) {
    if (stateName == 'Connected')
      return getText('Connected to %1', [ networkName]);
    if (stateName == 'Connecting')
      return getText('Connecting to %1...', [ networkName]);
    if (stateName == 'NotConnected')
      return getText('Not Connected');
    return getText(stateName);
  };

  var networkListItemPrototype = Object.create(HTMLElement.prototype);

  networkListItemPrototype.clickNetwork = function(element) {
    if (!this.onClickFunc)
      return;
    this.onClickFunc(this.network_, element.srcElement.id);
  };

  function createTemplate(doc) {
    var template = doc.createElement('template');
    template.id = 'networkListItemTemplate';

    var divOuter = doc.createElement('div');
    divOuter.id = 'div-outer';

    var divIcon = doc.createElement('div');
    divIcon.id = 'div-icon';
    var icon = doc.createElement('network-icon');
    icon.id = 'icon';
    divIcon.appendChild(icon);
    divOuter.appendChild(divIcon);

    var divDetail = doc.createElement('div');
    divDetail.id = 'div-detail';

    var divText = doc.createElement('div');
    divText.id = 'div-text';
    var name = doc.createElement('span');
    name.id = 'name';
    divText.appendChild(name);
    var state = doc.createElement('span');
    state.id = 'state';
    divText.appendChild(state);
    divDetail.appendChild(divText);

    var divInfo = doc.createElement('div');
    divInfo.id = 'div-info';
    var infoIcon = doc.createElement('img');
    infoIcon.id = 'info-icon';
    infoIcon.src = '../assets/info_64.png';
    divInfo.appendChild(infoIcon);
    divDetail.appendChild(divInfo);

    divOuter.appendChild(divDetail);

    template.content.appendChild(divOuter);

    doc.head.appendChild(template);
  };

  networkListItemPrototype.setListType = function(listType) {
    this.listType_ = listType;
    this.root_.querySelector('#div-icon').className = listType;
    this.root_.querySelector('#div-text').className = listType;
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

    this.root_.querySelector('#div-outer').onclick =
        networkListItemPrototype.clickNetwork.bind(this);

    this.setListType(defaultListType);
  };

  networkListItemPrototype.setNetwork = function(network) {
    if (!network) {
      this.style.display = 'none';
      return;
    }
    this.style.display = 'inherit';

    this.network_ = network;

    this.root_.querySelector('#icon').setNetwork(network);

    var networkType = network['Type'];
    var networkName = network['Name'];
    var networkState = network['ConnectionState'];
    var nameNode = this.root_.querySelector('#name');
    var stateNode = this.root_.querySelector('#state');
    var infoNode = this.root_.querySelector('#div-info');
    if (this.listType_ == 'summary') {
      nameNode.className = '';
      nameNode.textContent = getText(networkType);
      stateNode.style.display = 'inherit';
      stateNode.className = networkState;
      stateNode.textContent = getConnectionStateText(networkState, networkName);
      if (networkState == 'NotConnected')
        infoNode.style.display = 'none';
      else
        infoNode.style.display = 'inherit';
    } else {
      nameNode.className = networkState;
      nameNode.textContent = networkName;
      stateNode.style.display = 'none';
      infoNode.style.display = 'inherit';
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
