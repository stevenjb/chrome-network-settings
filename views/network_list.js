var networkList = networkList || {
  parentWin_: null,
  contentWin_: null,
  doc_: null,
  networks_: [],
  observerAdded_: false
};

(function() {
  function onBack(event) { 
    networkList.parentWin_.showNetworkSummary(); 
  }

  networkList.onNetworkClicked_ = function(guid) {
    log('networkList.onNetworkClicked: ' + guid);
    this.parentWin_.showNetwork(guid);
  };

  // networkState Observer
  networkList.onNetworkListChanged = function(networks) {
    log('networkList.onNetworkListChanged');
    assert(this.doc_);
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
    assert(doc);
    networkList.doc_ = doc;

    registerNetworkListSelect(doc);

    doc.querySelector('#network-entries').onClickFunc =
        networkList.onNetworkClicked_.bind(this);
    doc.querySelector('#back').onclick = onBack;

    networkList.onNetworkListChanged(networkState.networks);
    if (!this.observerAdded_) {
      networkState.addObserver(this);
      this.observerAdded_ = true;
    }
  };

  networkList.unInit = function() {
    log("networkList:unInit: " + this.observerAdded_);
    if (this.observerAdded_) {
      networkState.removeObserver(this)
      this.observerAdded_ = false;
    }
    this.doc_ = null;
  };

})();
