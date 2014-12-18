var networkDetails = (function() {
  var parentWin_ = null;
  var contentWin_ = null;
  var doc_ = null;

  function initImpl(parentWin, contentWin, network) {
    log('networkDetails:init');
    this.parentWin_ = parentWin;  
    this.contentWin_ = contentWin;
    this.doc_ = contentWin.document;

    var name = this.doc_.querySelector('#network_name');
    name.innerText = getText('Network: ', [ network['Name'] ]);

    var guid = this.doc_.querySelector('#network_id');
    guid.innerText = getText('ID: ', [ network['GUID'] ]);

    var back = this.doc_.querySelector('#back');
    back.onclick = onBack_.bind(this);

    function onBack_(event) {
      this.parentWin_.showNetworkList();
    }
  }

  return {
    init: initImpl
  };
})();
