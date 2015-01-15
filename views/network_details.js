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
    var oncProperties = {};
    PropertyUtil.setNestedProperty(oncProperties, key, value);
    var guid = this.networkId_;
    log('networkDetails.onPropertyChanged: ' + guid + ": " + key + '=' + value);
    chrome.networkingPrivate.setProperties(guid, oncProperties, function() {});
  };

  networkDetails.onOncDictionaryChanged_ = function(oncProperties) {
    var guid = this.networkId_;
    log('networkDetails.onOncDictionaryChanged: ' +
        JSON.stringify(oncProperties, null, ' '));
    chrome.networkingPrivate.setProperties(guid, oncProperties, function() {});
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

  networkDetails.onConfigureNetwork_ = function() {
    var guid = this.networkId_;
    log('networkDetails.onConfigureNetwork: ' + guid);
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
    var connectable = (network['Connectable'] == true);

    doc.querySelector('#connect').style.display = 'none';
    doc.querySelector('#configure').style.display = 'none';
    doc.querySelector('#disconnect').style.display = 'none';

    if (network && type == 'WiFi') {
      if (network['ConnectionState'] == 'NotConnected') {
        if (connectable) {
          doc.querySelector('#connect').style.display = 'inherit';
          doc.querySelector('#configure').style.display = 'inherit';
        } else {
          doc.querySelector('#configure').style.display = 'inherit';
        }
      } else {
        doc.querySelector('#disconnect').style.display = 'inherit';
      }
    }

    var settingsDivs = doc.querySelectorAll('div#settings div');
    for (var i = 0; i < settingsDivs.length; ++i)
      settingsDivs[i].style.display = 'none';
    var settingsTypeDivs = doc.querySelectorAll('div#settings div.' + type);
    for (var i = 0; i < settingsTypeDivs.length; ++i)
      settingsTypeDivs[i].style.display = 'inherit';
    var settingsElements = doc.querySelectorAll('div#settings :not(div)');
    for (var i = 0; i < settingsElements.length; ++i)
      settingsElements[i].disabled = !connectable;
    
    var detailsDivs = doc.querySelectorAll('div#details div');
    for (var i = 0; i < detailsDivs.length; ++i)
      detailsDivs[i].style.display = 'none';
    var detailsTypeDivs = doc.querySelectorAll('div#details div.' + type);
    for (var i = 0; i < detailsTypeDivs.length; ++i)
      detailsTypeDivs[i].style.display = 'inherit';

    var checkboxes = doc.querySelectorAll('onc-checkbox');
    for (var i = 0; i < checkboxes.length; ++i)
      checkboxes[i].setPropertyFromDict(network);

    var oncProperties = doc.querySelectorAll('onc-property');
    for (var i = 0; i < oncProperties.length; ++i)
      oncProperties[i].setPropertyFromDict(network);

    doc.querySelector('onc-ip-config').setPropertyFromDict(network);
    doc.querySelector('onc-nameservers').setPropertyFromDict(network);
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
    doc.querySelector('button#back').onclick = onBack;
    doc.querySelector('button#disconnect').onclick =
        networkDetails.onDisconnectNetwork_.bind(this);
    doc.querySelector('button#connect').onclick =
        networkDetails.onConnectNetwork_.bind(this);
    doc.querySelector('button#configure').onclick =
        networkDetails.onConfigureNetwork_.bind(this);

    var checkboxes = doc.querySelectorAll('onc-checkbox');
    for (var i = 0; i < checkboxes.length; ++i)
      checkboxes[i].onChangeFunc = networkDetails.onPropertyChanged_.bind(this);
    doc.querySelector('onc-ip-config').onChangeFunc =
        networkDetails.onOncDictionaryChanged_.bind(this);
    doc.querySelector('onc-nameservers').onChangeFunc =
        networkDetails.onOncDictionaryChanged_.bind(this);

    registerOncCheckbox(doc);
    registerOncProperty(doc);
    registerOncIpConfig(doc);
    registerOncNameservers(doc);
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
