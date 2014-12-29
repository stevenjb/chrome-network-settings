var networkState = networkState || {
  networks: [],
  ethernet: null,
  wifi: null,
  mobile: null,
  vpn: null,
  observers_: [],
  networkObservers_: {}
};

(function () {

  function sameNetworkState(a, b) {
    if (a == null && b == null)
      return true;
    if (a == null || b == null)
      return false;
    return (
        (a['Type'] == b['Type']) &&
        (a['GUID'] == b['GUID']) &&
        (a['ConnectionState'] == b['ConnectionState']));
  }

  function onNetworksReceived(networks) {
    // log('onNetworksReceived: ' + JSON.stringify(networks, null, '\t'));
    log('onNetworksReceived');

    var ethernet = null;
    var wifi = null;
    var mobile = null;
    var vpn = null;
    for (var network of networks) {
      var state = network['ConnectionState'];
      var type = network['Type'];
      if (!ethernet && type == 'Ethernet')
        ethernet = network;
      if (!wifi && type == 'WiFi')
        wifi = network;
      if (!mobile && (type == 'Cellular' || type == 'WiMAX'))
        mobile = network;
      if (!vpn && type == 'VPN')
        vpn = network;
    }

    networkState.networks = networks;
    notifyObservers('onNetworkListChanged', networks);

    if (sameNetworkState(ethernet, networkState.ethernet) &&
        sameNetworkState(wifi, networkState.wifi) &&
        sameNetworkState(mobile, networkState.mobile) &&
        sameNetworkState(vpn, networkState.vpn)) {
      return;
    }

    networkState.ethernet = ethernet;
    networkState.wifi = wifi;
    networkState.mobile = mobile;
    networkState.vpn = vpn;

    notifyObservers('onNetworkStateChanged', undefined);
  }

  function getNetworks() {
    var filter = {
      networkType: 'All',
      visible: true,
      configured: false,
      limit: 0  // No limit
    };
    chrome.networkingPrivate.getNetworks(filter, onNetworksReceived);
  }

  function onNetworkListChanged(networkIds) {
    // log('onNetworkListChanged: ' + JSON.stringify(networkList, null, ' '));
    log('onNetworkListChanged');
    getNetworks();
  }

  function onNetworksChanged(networkIds) {
    // log('onNetworkListChanged: ' + JSON.stringify(networkList, null, ' '));
    log('onNetworksChanged');
    for (var id of networkIds) {
      if (!(id in networkState.networkObservers_))
        continue;
      networkState.requestStateForNetworkId(id);
    }
  }

  function onGetNetworkState(properties) {
    var networkId = properties['GUID'];
    log('onGetNetworkState: ' + networkId);
    for (var id in networkState.networkObservers_) {
      if (id != networkId)
        continue;
      for (var observer of networkState.networkObservers_[id]) {
        if ('onNetworkChanged' in observer)
          observer['onNetworkChanged'](properties);
      }
    }
  }

  function notifyObservers(func, arg) {
    log('notifyObservers: ' + func);
    for (var observer of networkState.observers_) {
      if (func in observer)
        observer[func](arg);
    }
  }

  // Public methods

  networkState.init = function() {
    log('networkState:init');

    getNetworks();
    chrome.networkingPrivate.onNetworkListChanged.addListener(
        onNetworkListChanged);
    chrome.networkingPrivate.onNetworksChanged.addListener(
        onNetworksChanged);
  };

  networkState.addObserver = function(observer) {
    log('networkState:addObserver');
    networkState.observers_.push(observer);
  };

  networkState.addNetworkObserver = function(networkId, observer) {
    log('networkState:addNetworkObserver: ' + networkId);
    if (!(networkId in networkState.networkObservers_))
      networkState.networkObservers_[networkId] = [];
    networkState.networkObservers_[networkId].push(observer);
  };

  networkState.removeNetworkObserver = function(networkId, observer) {
    log('networkState:removeNetworkObserver: ' + networkId);
    if (!(networkId in networkState.networkObservers_))
      return;
    for (var id in networkState.networkObservers_) {
      if (id != networkId)
        continue;
      var observers = networkState.networkObservers_[id];
      var len = observers.length;
      for (var i = 0; i < len; ++i) {
        if (observers[i] == observer) {
          networkState.networkObservers_[id] = observers.splice(i, 1);
          return;
        }
      }
    }
    log('!!! Observer not found !!!');
  };

  networkState.requestStateForNetworkId = function(networkId) {
    chrome.networkingPrivate.getState(networkId, onGetNetworkState);
  };

})();
