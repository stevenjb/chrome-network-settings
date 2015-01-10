var networkDetails = networkDetails || {
  parentWin_: null,
  contentWin_: null,
  doc_: null,
  networkId_: '',
  network_: null
};

(function() {

  function onBack(event) { 
    networkDetails.parentWin_.closeDetails(); 
  }

  networkDetails.onPropertyChanged_ = function(key, value) {
    var properties = {};
    PropertyUtil.setNestedProperty(properties, key, value);
    var guid = this.networkId_;
    log('networkDetails.onPropertyChanged: ' + guid + ": " + key + '=' + value);
    chrome.networkingPrivate.setProperties(guid, properties, function() {});
  };

  networkDetails.onDisconnectNetwork_ = function() {
    var guid = this.networkId_;
    log('networkDetails.onDisconnectNetwork: ' + guid);
    chrome.networkingPrivate.startDisconnect(guid);
  };

  networkDetails.onConnectNetwork_ = function() {
    var guid = this.networkId_;
    log('networkDetails.onConnectNetwork: ' + guid);
    chrome.networkingPrivate.startConnect(guid);
  };

  // networkState Observer
  networkDetails.onNetworkChanged = function(network) {
    // log('networkDetails:onNetworkChanged: ' +
    //     JSON.stringify(network, null, ' '));
    if (network['GUID'] != networkDetails.networkId_)
      return;

    log('networkDetails:onNetworkChanged: ' + network['GUID']);
    networkDetails.network_ = network;

    var doc = networkDetails.doc_;

    var icon = doc.querySelector('#header network-icon');
    icon.setNetwork(network);

    doc.querySelector('#network-name').innerText = network['Name'];

    var stateNode = doc.querySelector('#network-state');
    var stateName = network['ConnectionState'];
    stateNode.className = stateName;
    stateNode.innerText = getText(stateName);

    var type = network['Type'];

    if (network && type == 'WiFi') {
      if (network['ConnectionState'] == 'NotConnected') {
        doc.querySelector('#connect').style.display = 'inherit';
        doc.querySelector('#disconnect').style.display = 'none';
      } else {
        doc.querySelector('#connect').style.display = 'none';
        doc.querySelector('#disconnect').style.display = 'inherit';
      }
    } else {
      doc.querySelector('#connect').style.display = 'none';
      doc.querySelector('#disconnect').style.display = 'none';
    }

    var settingsDivs = doc.querySelectorAll('div#settings div');
    for (var i = 0; i < settingsDivs.length; ++i)
      settingsDivs[i].style.display = 'none';
    var settingsTypeDivs = doc.querySelectorAll('div#settings div.' + type);
    for (var i = 0; i < settingsTypeDivs.length; ++i)
      settingsTypeDivs[i].style.display = 'inherit';

    var detailsDivs = doc.querySelectorAll('div#details div');
    for (var i = 0; i < detailsDivs.length; ++i)
      detailsDivs[i].style.display = 'none';
    var detailsTypeDivs = doc.querySelectorAll('div#details div.' + type);
    for (var i = 0; i < detailsTypeDivs.length; ++i)
      detailsTypeDivs[i].style.display = 'inherit';

    var checkboxes = doc.querySelectorAll('onc-checkbox');
    for (var i = 0; i < checkboxes.length; ++i)
      checkboxes[i].setPropertyFromDict(network);

    var properties = doc.querySelectorAll('onc-property');
    for (var i = 0; i < properties.length; ++i)
      properties[i].setPropertyFromDict(network);
  };

  // networkDetails functions

  networkDetails.init = function(parentWin) {
    log('networkDetails:init');
    networkDetails.parentWin_ = parentWin;
  };

  networkDetails.setContentWindow = function(contentWin) {
    log('networkDetails:setContent');
    networkDetails.contentWin_ = contentWin;
    networkDetails.doc_ = contentWin.document;

    var doc = networkDetails.doc_;
    doc.querySelector('#back').onclick = onBack;
    doc.querySelector('#disconnect').onclick =
        networkDetails.onDisconnectNetwork_.bind(this);
    doc.querySelector('#connect').onclick =
        networkDetails.onConnectNetwork_.bind(this);

    var checkboxes = doc.querySelectorAll('onc-checkbox');
    for (var i = 0; i < checkboxes.length; ++i)
      checkboxes[i].onChangeFunc = networkDetails.onPropertyChanged_.bind(this);

    registerOncCheckbox(doc);
    registerOncProperty(doc);
    registerOncIpConfig(doc);
    registerNetworkIcon(doc, 'details');
  };

  networkDetails.setNetworkId = function(networkId) {
    log('networkDetails:setNetworkId: ' + networkId);
    if (networkDetails.network_ && networkDetails.network_['GUID']) {
      networkState.removeNetworkObserver(networkDetails.network_['GUID'], this);
    }
    networkDetails.networkId_ = networkId;
    networkState.addNetworkObserver(networkId, this);
    networkState.requestStateForNetworkId(networkId);
  };

})();
