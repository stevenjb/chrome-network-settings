var NetworkList = function(parentWin, contentWin) {
  this.parentWin = parentWin;
  this.contentWin = contentWin;
  this.doc = contentWin.document;
}

NetworkList.prototype = {
  // Public methods

  init: function(title) {
    log("NetworkList:init");
    var titleNode = this.doc.querySelector('#title');
    titleNode.innerText = title;
  },

  setNetworks: function(networks) {
    this.networks_ = networks;
    var networksNode = this.doc.querySelector('#network-entries');
    while (networksNode.length > 0)
      networksNode.remove(0);
    var first = this.doc.createElement('option');
    first.text = getText("Select a network");
    networksNode.add(first);
    for (var i = 0; i < networks.length; ++i) {
      var network = networks[i];
      var n = this.doc.createElement('option');
      n.text = network['Name'];
      n.value = network['GUID'];
      networksNode.add(n);
    }
    networksNode.addEventListener('change', this.networkChanged_.bind(this));
  },

  // Private methods
  networks_: [],

  networkChanged_: function(event) {
    var networksNode = event.target;
    var index = networksNode.selectedIndex;
    if (index <= 0)
      return;
    var n = networksNode.item(index)
    log("networkChanged: " + n.value);
    var network = this.networks_[index - 1];
    this.parentWin.showNetwork(network  );
  },

}
