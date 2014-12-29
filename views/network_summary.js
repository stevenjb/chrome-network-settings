var networkSummary = networkSummary || {
  parentWin_: null,
  contentWin_: null,
  doc_: null
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
    registerNetworkListItem(doc);

    doc.querySelector('#more').onclick = onMore;

    var items = this.doc_.querySelectorAll('network-list-item');
    for (var i = 0; i < items.length; ++i)
      items[i].onClickFunc = networkSummary.onNetworkClicked_.bind(this);

    networkSummary.onNetworkStateChanged();
    networkState.addObserver(this);
  };

})();
