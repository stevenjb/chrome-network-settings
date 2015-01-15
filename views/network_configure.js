var networkConfigure = networkConfigure || {
  parentWin_: null,
  contentWin_: null,
  doc_: null,
  networkId_: '',
  network_: null
};

(function() {

  function onBack(event) {
    networkConfigure.parentWin_.closeDetails();
  }

  networkConfigure.onOncPropertyChanged_ = function(key, value) {
    log('networkConfigure.onOncPropertyChanged: ' + key + '=' + value);
    PropertyUtil.setNestedProperty(this.network_, key, value);
    this.onNetworkChanged(this.network_);
  };

  networkConfigure.onOncDictionaryChanged_ = function(oncProperties) {
    log('networkConfigure.onOncDictionaryChanged: ' +
        JSON.stringify(oncProperties, null, ' '));
    PropertyUtil.mergeNestedProperties(this.network_, oncProperties);
    this.onNetworkChanged(this.network_);
  };

  networkConfigure.onConnectNetwork_ = function() {
    var guid = this.networkId_;
    log('networkConfigure.onConnectNetwork: ' + guid);
    chrome.networkingPrivate.startConnect(guid);
  };

  // networkState Observer
  networkConfigure.onNetworkChanged = function(network) {
    // log('networkConfigure:onNetworkChanged: ' +
    //     JSON.stringify(network, null, ' '));
    if (network['GUID'] != networkConfigure.networkId_)
      return;

    log('networkConfigure:onNetworkChanged: ' + network['GUID']);
    networkConfigure.network_ = network;

    var doc = networkConfigure.doc_;

    var icon = doc.querySelector('#header network-icon');
    icon.setNetwork(network);

    doc.querySelector('#network-name').innerText = network['Name'];

    var type = network['Type'];

    var settingsDivs = doc.querySelectorAll('div#settings div');
    for (var i = 0; i < settingsDivs.length; ++i)
      settingsDivs[i].style.display = 'none';
    var settingsTypeDivs = doc.querySelectorAll('div#settings div.' + type);
    for (var i = 0; i < settingsTypeDivs.length; ++i)
      settingsTypeDivs[i].style.display = 'inherit';
    var settingsElements = doc.querySelectorAll('div#settings :not(div)');
    for (var i = 0; i < settingsElements.length; ++i) {
      settingsElements[i].editable = true;
      if (settingsElements[i].setPropertyFromDict)
        settingsElements[i].setPropertyFromDict(network);
    }
  };

  // networkConfigure functions

  networkConfigure.init = function(parentWin) {
    log('networkConfigure:init');
    networkConfigure.parentWin_ = parentWin;
  };

  networkConfigure.setContentWindow = function(contentWin) {
    log('networkConfigure:setContent');
    networkConfigure.contentWin_ = contentWin;
    networkConfigure.doc_ = contentWin.document;

    var doc = networkConfigure.doc_;
    doc.querySelector('button#back').onclick = onBack;
    doc.querySelector('button#connect').onclick =
        networkConfigure.onConnectNetwork_.bind(this);

    var checkboxes = doc.querySelectorAll('onc-checkbox');
    for (var i = 0; i < checkboxes.length; ++i)
      checkboxes[i].onChangeFunc =
          networkConfigure.onOncPropertyChanged_.bind(this);
    doc.querySelector('onc-ip-config').onChangeFunc =
        networkConfigure.onOncDictionaryChanged_.bind(this);
    doc.querySelector('onc-nameservers').onChangeFunc =
        networkConfigure.onOncDictionaryChanged_.bind(this);

    registerOncCheckbox(doc);
    registerOncProperty(doc);
    registerOncIpConfig(doc);
    registerOncNameservers(doc);
    registerNetworkIcon(doc, 'details');
  };

  networkConfigure.setNetworkId = function(networkId) {
    log('networkConfigure:setNetworkId: ' + networkId);
    if (networkConfigure.network_ && networkConfigure.network_['GUID']) {
      networkState.removeNetworkObserver(networkConfigure.network_['GUID'], this);
    }
    networkConfigure.networkId_ = networkId;
    networkState.addNetworkObserver(networkId, this);
    networkState.requestStateForNetworkId(networkId);
  };
})();
