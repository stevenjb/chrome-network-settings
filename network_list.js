var networkList = networkList || {
   parentWin_: null,
   contentWin_: null,
   doc_: null,
   networks_: []
};

(function() {

  function onSelectedNetworkChanged_(event) {
    var networksNode = event.target;
    var index = networksNode.selectedIndex;
    if (index <= 0)
      return;
    var n = networksNode.item(index);
    log("networkChanged: " + n.value);
    var network = this.networks_[index - 1];
    this.parentWin_.showNetwork(network['GUID']);
  }

  // networkList functions

  // networkState Observer
  networkList.networkListChanged = function(networks) {
    log('networkList.networkListChanged');
    this.networks_ = networks;
    var networksNode = this.doc_.querySelector('#network-entries');
    while (networksNode.length > 0)
      networksNode.remove(0);
    var first = this.doc_.createElement('option');
    first.text = getText("Select a network");
    networksNode.add(first);
    for (var i = 0; i < networks.length; ++i) {
      var network = networks[i];
      var n = this.doc_.createElement('option');
      n.text = network['Name'];
      n.value = network['GUID'];
      networksNode.add(n);
    }
    networksNode.addEventListener('change',
                                  onSelectedNetworkChanged_.bind(this));
  };

  networkList.init = function(parentWin, contentWin, title) {
    log("networkList:init");
    networkList.parentWin_ = parentWin;  
    networkList.contentWin_ = contentWin;
    var doc = contentWin.document;
    networkList.doc_ = doc;

    var titleNode = doc.querySelector('#title');
    titleNode.innerText = title;

    networkList.networkListChanged(networkState.networks);
    networkState.addObserver(this);
  };

})();
