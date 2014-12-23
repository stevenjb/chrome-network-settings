function registerNetworkListItem(doc) {

  var networkListItemPrototype = Object.create(HTMLElement.prototype);

  networkListItemPrototype.createdCallback = function() {
    console.log('networkListItem created');
    var div = this.ownerDocument.createElement('div');
    this.icon_ = this.ownerDocument.createElement('img');
    div.appendChild(this.icon_);
    this.name_ = this.ownerDocument.createElement('span');
    div.appendChild(this.name_);
    this.appendChild(div);
  };

  networkListItemPrototype.setNetwork = function(network) {
    if (network['Type'] == 'WiFi')
      this.icon_.src = '../assets/wifi_dark_100.png';
    this.name_.textContent = network['Name'];
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
