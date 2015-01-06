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

  function setText(data, select, property) {
    var value = getText(data[property]);
    networkDetails.doc_.querySelector(select).innerText =  
        getText('%1: %2', [property, value ]);
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

    var icon = doc.querySelector('#network-icon');
    icon.setNetwork(network);

    doc.querySelector('#network-name').innerText = network['Name'];

    var stateNode = doc.querySelector('#network-state');
    var stateName = network['ConnectionState'];
    stateNode.className = stateName;
    stateNode.innerText = getText(stateName);

    setText(network, '#connectable', 'Connectable');

    var type = network['Type'];
    if (type == 'WiFi') {
      var wifi = network['WiFi'];
      if (wifi) {
        doc.querySelector('#details-wifi').style.display = 'inherit';
        setText(wifi, '#details-wifi #security', 'Security');
        setText(wifi, '#details-wifi #signal-strength', 'SignalStrength');
      }
    } else {
      doc.querySelector('#details-wifi').style.display = 'none';
    }
    if (type == 'Cellular') {
      var cellular = network['Cellular'];
      if (cellular) {
        doc.querySelector('#details-cellular').style.display = 'inherit';
        setText(cellular, 
                '#details-cellular #network-technology', 'NetworkTechnology');
        setText(cellular, 
                '#details-cellular #activation-state', 'ActivationState');
        setText(cellular, 
                '#details-cellular #romaing-state', 'RomaingState');
      }
    } else {
      doc.querySelector('#details-cellular').style.display = 'none';
    }

    if (network && network['Type'] == 'WiFi') {
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
