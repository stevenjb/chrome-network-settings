var networkList = networkList || {
  parentWin_: null,
  contentWin_: null,
  type_: '',
  doc_: null,
  networks_: [],
  observerAdded_: false
};

(function() {
  function onBack(event) { 
    networkList.parentWin_.showNetworkSummary(); 
  }

  function getConnectionStateText(network) {
    var state = network['ConnectionState'];
    if (state == 'Connected')
      return getText('Connected to %1', [ network['Name'] ]);
    if (state == 'Connecting')
      return getText('Connecting to %1...', [ network['Name'] ]);
    if (state == 'NotConnected')
      return getText('Not Connected');
    return getText(state);
  };

  networkList.getDefaultGuid_ = function() {
    var network;
    if (this.type_ == 'WiFi')
      network = networkState.wifi;
    if (!network)
      return undefined;
    return network['GUID'];
  };

  networkList.onNetworkClicked_ = function(network, which) {
    var guid = network['GUID'];
    log('networkList.onNetworkClicked: ' + guid);
    if (which != 'info-icon' && network['ConnectionState'] == 'NotConnected'
        && network['Connectable']) {
      chrome.networkingPrivate.startConnect(guid);
    } else {
      this.parentWin_.showNetworkDetails(guid);
    }
  };

  networkList.onDefaultNetworkClicked_ = function() {
    var guid = this.getDefaultGuid_();
    if (!guid)
      return;
    log('networkList.onDefaultNetworkClicked: ' + guid);
    this.parentWin_.showNetworkDetails(guid);
  };

  networkList.onDisconnectNetwork_ = function() {
    var guid = this.getDefaultGuid_();
    if (!guid)
      return;
    log('networkList.onDisconnectNetwork: ' + guid);
    chrome.networkingPrivate.startDisconnect(guid);
  };

  // networkState Observer
  networkList.onNetworkListChanged = function(networks) {
    log('networkList.onNetworkListChanged');
    assert(this.doc_);
    this.networks_ = networks;
    var networksNode = this.doc_.querySelector('#network-entries');
    networksNode.clearNetworks();
    for (var i = 0; i < networks.length; ++i) {
      var network = networks[i];
      if (network['Type'] == this.type_)
        networksNode.addNetwork(network);
    }
  };

  networkList.onNetworkStateChanged = function() {
    log('networkList:onNetworkStateChanged');

    var doc = networkList.doc_;

    var defaultNetwork = doc.querySelector('network-list-item#network');
    var network;
    if (networkList.type_ == 'WiFi')
      network = networkState.wifi;
    if (network) {
      doc.querySelector('#header network-icon').setNetwork(network);
      doc.querySelector('#network-state').innerText = 
          getConnectionStateText(network);
    } else {
      doc.querySelector('#header network-icon')
          .setNetworkType(networkList.type_);
      doc.querySelector('#network-state').innerText = getText('Not Connected');
    }
    if (network && network['Type'] == 'WiFi' &&
        network['ConnectionState'] != 'NotConnected') {
      doc.querySelector('#disconnect').style.display = 'inherit';
      doc.querySelector('#info-icon').style.display = 'inherit';
    } else {
      doc.querySelector('#disconnect').style.display = 'none';
      doc.querySelector('#info-icon').style.display = 'none';
    }
  };

  //

  networkList.init = function(parentWin, contentWin, type) {
    log('networkList:init');
    networkList.parentWin_ = parentWin;  
    networkList.contentWin_ = contentWin;
    networkList.type_ = type;
    var doc = contentWin.document;
    assert(doc);
    networkList.doc_ = doc;

    registerNetworkListSelect(doc);
    registerNetworkTdls(doc);

    doc.querySelector('network-list-select').onClickFunc =
        networkList.onNetworkClicked_.bind(this);
    doc.querySelector('button#back').onclick = onBack;
    doc.querySelector('button#disconnect').onclick =
        networkList.onDisconnectNetwork_.bind(this);
    doc.querySelector('img#info-icon').onclick =
        networkList.onDefaultNetworkClicked_.bind(this);
    doc.querySelector('span#network-type').innerText =  getText(type);
    doc.querySelector('div#header network-icon').setListType('summary');

    doc.querySelector('network-tdls').style.display = type == 'WiFi';
    
    networkList.onNetworkListChanged(networkState.networks);
    networkList.onNetworkStateChanged();
    if (!this.observerAdded_) {
      networkState.addObserver(this);
      this.observerAdded_ = true;
    }
  };

  networkList.unInit = function() {
    log('networkList:unInit: ' + this.observerAdded_);
    if (this.observerAdded_) {
      networkState.removeObserver(this);
      this.observerAdded_ = false;
    }
    this.doc_ = null;
  };
})();
