function registerNetworkTdls(doc) {

  var networkTdlsPrototype = Object.create(HTMLElement.prototype);

  function createTemplate(doc) {
    var div = doc.createElement('div');
    div.id = 'outer';

    var address = doc.createElement('input');
    address.id = 'address';
    div.appendChild(address);

    var label = doc.createElement('span');
    label.id = 'label';
    label.innerText = getText('TDLS Status: ');
    div.appendChild(label);

    var status = doc.createElement('span');
    status.id = 'status';
    status.innerText = getText('Unknown');
    div.appendChild(status);

    var toggle = doc.createElement('button');
    toggle.id = 'toggle';
    toggle.innerText = getText('Enable TDLS');
    toggle.disabled = true;
    div.appendChild(toggle);

    return div;
  };

  networkTdlsPrototype.onGetWifiTDLSStatus_ = function(status) {
    if (status == undefined)
      status = 'Failed';
    this.status_ = status;
    log('TDLS Status=' + status);
    this.root_.querySelector('span#status').innerText = getText(status);
    // Set the toggle button label.
    var toggle =  this.root_.querySelector('button#toggle');
    var label = (status == 'Connected') ? getText('Disable TDLS') :
                                          getText('Enable TDLS');
    toggle.innerText = label;
    // Enable the toggle button regardless.
    toggle.disabled = false;
  };

  networkTdlsPrototype.onToggleClicked_ = function(event) {
    var toggle =  this.root_.querySelector('button#toggle');
    toggle.disabled = true;
    var enabledState = (this.status_ == 'Connected');
    if (enabledState) {
      log('Disable TDLS: ' + this.address_);
      toggle.innerText = getText('Disabling TDLS...');
    } else {
      log('Enable TDLS: ' + this.address_);
      toggle.innerText = getText('Enabling TDLS...');
    }
    chrome.networkingPrivate.setWifiTDLSEnabledState(
      this.address_, !enabledState,
      networkTdlsPrototype.onGetWifiTDLSStatus_.bind(this));
  };

  networkTdlsPrototype.onAddressChanged_ = function(event) {
    this.address_ = this.root_.querySelector('input#address').value || '';
    log('TDLS Address=' + this.address_);
    if (this.address_ != '') {
      chrome.networkingPrivate.getWifiTDLSStatus(
          this.address_, networkTdlsPrototype.onGetWifiTDLSStatus_.bind(this));
    }
  };

  networkTdlsPrototype.createdCallback = function() {
    var hostCss = 'display: inline-block;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);

    this.root_.querySelector('input#address').onblur =
        networkTdlsPrototype.onAddressChanged_.bind(this);
    this.root_.querySelector('button#toggle').onclick =
        networkTdlsPrototype.onToggleClicked_.bind(this);

    this.address_ = '';
    this.status_ = '';
  };

  var componentHelper_ =
      new ComponentHelper(doc, 'network-tdls', networkTdlsPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/network-tdls.css');
}
