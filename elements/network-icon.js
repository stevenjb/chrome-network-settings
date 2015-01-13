function registerNetworkIcon(doc, defaultListType) {

  var networkIconPrototype = Object.create(HTMLElement.prototype);

  function createTemplate(doc) {
    var div = doc.createElement('div');
    var icon = doc.createElement('img');
    icon.id = 'icon';
    div.appendChild(icon);
    var badge = doc.createElement('img');
    badge.id = 'badge';
    div.appendChild(badge);

    return div;
  };

  networkIconPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);
    this.setListType(defaultListType);
  };

  networkIconPrototype.setListType = function(listType) {
    this.listType_ = listType;
  };

  networkIconPrototype.setNetwork = function(network) {
    var state = network['ConnectionState'];
    var type = network['Type'];
    var strength;
    var security;

    var iconType;
    var iconAmt;
    if (type == 'Ethernet') {
      iconType = 'ethernet';
    } else if (type == 'WiFi') {
      iconType = 'wifi';
      var wifi = network['WiFi'];
      if (wifi) {
        strength = wifi['SignalStrength'];
        security = wifi['Security'];
      }
    } else if (type == 'Cellular') {
      iconType = 'mobile';
      var cellular = network['Cellular'];
      if (cellular)
        strength = cellular['SignalStrength'];
    } else if (type == 'WiMAX') {
      iconType = 'mobile';
      var wimax = network['WiMAX'];
      if (wimax)
        strength = wimax['SignalStrength'];
    } else if (type == 'VPN') {
      iconType = 'vpn';
    }
    if (iconType == 'wifi' || iconType == 'mobile') {
      if (this.listType_ == 'summary' && state != 'Connected')
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
    var icon = this.root_.querySelector('#icon');
    var badge = this.root_.querySelector('#badge');

    if (iconType) {
      var src = '../assets/' + iconType;
      if (iconAmt)
          src += '_' + iconAmt;
      icon.src = src + '.png';
    }
    if (security && security != 'None') {
      badge.style.display = undefined;
      badge.src = '../assets/secure.png';
    } else {
      badge.style.display = 'none';
    }
  };

  networkIconPrototype.setNetworkType = function(type) {
    var iconSrc = 'ethernet';
    if (type == 'WiFi') {
      iconSrc = 'wifi_00';
    } else if (type == 'Cellular') {
      iconSrc = 'mobile_00';
    } else if (type == 'WiMAX') {
      iconSrc = 'mobile_00';
    } else if (type == 'VPN') {
      iconSrc = 'vpn';
    }
    var icon = this.root_.querySelector('#icon');
    var badge = this.root_.querySelector('#badge');
    icon.src = '../assets/' + iconSrc + '.png';
    badge.style.display = 'none';
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'network-icon', networkIconPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/network-icon.css');
}
