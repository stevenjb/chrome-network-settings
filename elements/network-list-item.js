function registerNetworkListItem(doc, listType) {

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

    var state = network['ConnectionState'];
    var type = network['Type'];
    var strength = network['Strength'];
    var iconType;
    var iconAmt;
    if (type == 'WiFi') {
      iconType = 'wifi';
      if (listType == 'summary' && state != 'Connected')
        iconAmt = '00';
      else if (strength <= 25)
        iconAmt = '25';
      else if (strength <= 50)
        iconAmt = '50';
      else if (strength <= 75)
        iconAmt = '75';
      else
        iconAmt = '100';
    }
    if (iconType)
      this.icon_.src = '../assets/' + iconType + '_' + iconAmt + '.png';

    this.name_.textContent = network['Name'];

    this.state_.className = state;
    this.state_.textContent = getText(state);
  };

  var networkListItemElement = doc.registerElement(
      'network-list-item', { prototype : networkListItemPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', '/elements/network-list-item.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkListItem registered');
}
