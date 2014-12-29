var networkList = networkList || {
   parentWin_: null,
   contentWin_: null,
   doc_: null,
   networks_: []
};

(function() {
  networkList.onNetworkClicked_ = function(guid) {
    log('networkList.onNetworkClicked: ' + guid);
    this.parentWin_.showNetwork(guid);
  };

  // networkState Observer
  networkList.onNetworkListChanged = function(networks) {
    log('networkList.onNetworkListChanged');
    this.networks_ = networks;
    var networksNode = this.doc_.querySelector('#network-entries');
    networksNode.clearNetworks();
    for (var i = 0; i < networks.length; ++i) {
      networksNode.addNetwork(networks[i]);
    }
  };

  networkList.init = function(parentWin, contentWin) {
    log("networkList:init");
    networkList.parentWin_ = parentWin;  
    networkList.contentWin_ = contentWin;
    var doc = contentWin.document;
    networkList.doc_ = doc;
    registerNetworkListItem(doc);
    registerNetworkListSelect(doc);

    doc.querySelector('#title').innerText = getText('Network List');
    doc.querySelector('#select-text').innerText = getText('Select a network:');

    this.doc_.querySelector('#network-entries').onClickFunc =
        networkList.onNetworkClicked_.bind(this);

    networkList.onNetworkListChanged(networkState.networks);
    networkState.addObserver(this);
  };

})();