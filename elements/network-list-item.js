function registerNetworkListItem(doc) {

  var networkListItemPrototype = Object.create(HTMLElement.prototype);

  networkListItemPrototype.clickNetwork = function() {
    if (this.onClickFunc)
      this.onClickFunc(this.guid_);
  };

  networkListItemPrototype.createdCallback = function() {
    console.log('networkListItem created');
    var div = this.ownerDocument.createElement('div');
    this.icon_ = this.ownerDocument.createElement('img');
    div.appendChild(this.icon_);
    this.name_ = this.ownerDocument.createElement('span');
    this.name_.id = 'name';
    div.appendChild(this.name_);
    this.state_ = this.ownerDocument.createElement('span');
    this.state_.id = 'state';
    div.appendChild(this.state_);
    this.div_ = div;
    this.appendChild(div);

    this.onclick = networkListItemPrototype.clickNetwork.bind(this);
  };

  networkListItemPrototype.setNetwork = function(network) {
    this.guid_ = network['GUID'];

    if (!network) {
      this.style.display = 'none';
      return;
    }
    this.style.display = undefined;  // inherit

    if (network['Type'] == 'WiFi')
      this.icon_.src = '../assets/wifi_dark_100.png';

    this.name_.textContent = network['Name'];

    var state = network['ConnectionState'];
    this.state_.className = state;
    this.state_.textContent = getText(state);
  };

  var networkListItemElement = doc.registerElement(
      'network-list-item', { prototype : networkListItemPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', 'elements/network-list-item.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkListItem registered');
}
