var networkDetails = networkDetails || {
  parentWin_: null,
  contentWin_: null,
  doc_: null,
  networkId_: '',
  network_: null
};

(function() {

  function onBack(event) { 
    networkDetails.parentWin_.showNetworkList(); 
  }

  // networkState Observer
  networkDetails.onNetworkStateChanged = function(network) {
    log('networkDetails:onNetworkStateChanged: ' +
        JSON.stringify(network, null, ' '));
    if (network['GUID'] != networkDetails.networkId_)
      return;

    log('networkDetails:onNetworkStateChanged: ' + network['GUID']);
    networkDetails.network_ = network;

    var doc = networkDetails.doc_;
    var name = doc.querySelector('#network_name');
    name.innerText = getText('Network: ', [network['Name']]);

    var guid = doc.querySelector('#network_id');
    guid.innerText = getText('ID: ', [network['GUID']]);

    var state = doc.querySelector('#network_state');
    state.innerText = getText('State: ', [network['ConnectionState']]);
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
    var back = doc.querySelector('#back');
    back.onclick = onBack;
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
