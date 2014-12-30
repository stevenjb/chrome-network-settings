function registerNetworkIcon(doc, listType) {

  var networkIconPrototype = Object.create(HTMLElement.prototype);

  function createTemplate(doc) {
    var template = doc.createElement('template');
    template.id = 'networkIconTemplate';

    var div = doc.createElement('div');
    var icon = doc.createElement('img');
    icon.id = 'icon';
    div.appendChild(icon);
    var badge = doc.createElement('img');
    badge.id = 'badge';
    div.appendChild(badge);
    template.content.appendChild(div);

    doc.head.appendChild(template);
  };

  networkIconPrototype.createdCallback = function() {
    this.root_ = this.createShadowRoot();

    var doc = this.ownerDocument;
    var template = doc.querySelector('#networkIconTemplate');
    var clone = doc.importNode(template.content, true);
    this.root_.appendChild(clone);

    var css = ':host { display: inline-block; }';
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    this.root_.appendChild(style);
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
      var wifi = network['WiFi'];
      if (wifi)
        strength = wifi['SignalStrength'];
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
    var icon = this.root_.querySelector('#icon');
    var badge = this.root_.querySelector('#badge');

    if (iconType) {
      var src = '../assets/' + iconType;
      if (iconAmt)
          src += '_' + iconAmt;
      icon.src = src + '.png';
    }
    if (security) {
      badge.style.display = undefined;
      badge.src = '../assets/secure.png';
    } else {
      badge.style.display = 'none';
    }
  };

  createTemplate(doc);

  var networkIconElement = doc.registerElement(
      'network-icon', { prototype : networkIconPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', '/elements/network-icon.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkIcon registered');
}
