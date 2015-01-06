var networkSummary = networkSummary || {
  parentWin_: null,
  contentWin_: null,
  doc_: null,
  observerAdded_: false
};

(function() {

  networkSummary.onNetworkClicked_ = function(type, network, which) {
    var guid = network['GUID'];
    log('networkSummary.onNetworkClicked: ' + guid);
    if (which != 'info-icon' && type == 'wifi')
      networkSummary.parentWin_.showNetworkList('WiFi', guid);
    else
      networkSummary.parentWin_.showNetwork(guid);
  };

  // networkState Observer
  networkSummary.onNetworkStateChanged = function() {
    log('networkSummary:onNetworkStateChanged');

    var doc = networkSummary.doc_;

    function updateItem(id, network) {
      var item = doc.querySelector('#' + id);
      item.setNetwork(network);
    }
    updateItem('ethernet', networkState.ethernet);
    updateItem('wifi', networkState.wifi);
    updateItem('mobile', networkState.mobile);
    updateItem('vpn', networkState.vpn);
  };

  // networkSummary functions

  networkSummary.init = function(parentWin, contentWin) {
    log('networkSummary:init');
    networkSummary.parentWin_ = parentWin;
    networkSummary.contentWin_ = contentWin;
    networkSummary.doc_ = contentWin.document;

    var doc = networkSummary.doc_;
    registerNetworkListItem(doc, 'summary');

    function setItemClicked(type) {
      var item = doc.querySelector('#' + type);
      item.onClickFunc = function(network, which) {
        networkSummary.onNetworkClicked_(type, network, which);
      };
    }
    setItemClicked('ethernet');
    setItemClicked('wifi');
    setItemClicked('mobile');
    setItemClicked('vpn');

    networkSummary.onNetworkStateChanged();
    if (!this.observerAdded_) {
      networkState.addObserver(this);
      this.observerAdded_ = true;
    }
  };

  networkSummary.unInit = function() {
    log('networkSummary:unInit: ' + this.observerAdded_);
    if (this.observerAdded_) {
      networkState.removeObserver(this);
      this.observerAdded_ = false;
    }
    this.doc_ = null;
  };

})();
