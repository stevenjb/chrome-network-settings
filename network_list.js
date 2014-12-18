var networkList = (function() {
  var parentWin_ = null;
  var contentWin_ = null;
  var doc_ = null;
  var networks_ = [];

  function initImpl(parentWin, contentWin, title) {
    log("networkList:init");
    this.parentWin_ = parentWin;  
    this.contentWin_ = contentWin;
    this.doc_ = contentWin.document;

    var titleNode = this.doc_.querySelector('#title');
    titleNode.innerText = title;
  }

  function setNetworksImpl(networks) {
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
    networksNode.addEventListener('change', networkChanged_.bind(this));
  }

  function networkChanged_(event) {
    var networksNode = event.target;
    var index = networksNode.selectedIndex;
    if (index <= 0)
      return;
    var n = networksNode.item(index);
    log("networkChanged: " + n.value);
    var network = this.networks_[index - 1];
    this.parentWin_.showNetwork(network  );
  }

  return {
    init: initImpl,
    setNetworks: setNetworksImpl
  };
})();
