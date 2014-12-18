var NetworkDetails = function(parentWin, contentWin) {
  this.parentWin = parentWin;  
  this.contentWin = contentWin;
  this.doc = contentWin.document;
}

NetworkDetails.prototype = {
  // Public methods

  init: function(network) {
    log('NetworkDetails:init');
    var name = this.doc.querySelector('#network_name');
    name.innerText = getText('Network: ', [ network['Name'] ]);
    var guid = this.doc.querySelector('#network_id');
    guid.innerText = getText('ID: ', [ network['GUID'] ]);
    var parentWin = this.parentWin;
    var back = this.doc.querySelector('#back');
    back.onclick = function(event) {
      parentWin.showNetworkList();
    }
  },

  // Private methods
  
}
