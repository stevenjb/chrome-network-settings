var networkSummary = networkSummary || {
  parentWin_: null,
  contentWin_: null,
  doc_: null,
  observerAdded_: false
};

(function() {

  function onMore(event) {
    networkSummary.parentWin_.showNetworkList();
  }

  networkSummary.onNetworkClicked_ = function(guid) {
    log('networkSummary.onNetworkClicked: ' + guid);
    this.parentWin_.showNetwork(guid);
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

    doc.querySelector('#more').onclick = onMore;

    var items = this.doc_.querySelectorAll('network-list-item');
    for (var i = 0; i < items.length; ++i)
      items[i].onClickFunc = networkSummary.onNetworkClicked_.bind(this);

    networkSummary.onNetworkStateChanged();
    if (!this.observerAdded_) {
      networkState.addObserver(this);
      this.observerAdded_ = true;
    }
  };

  networkSummary.unInit = function() {
    log("networkSummary:unInit: " + this.observerAdded_);
    if (this.observerAdded_) {
      networkState.removeObserver(this)
      this.observerAdded_ = false;
    }
    this.doc_ = null;
  };

})();
