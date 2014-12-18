var networkState = (function () {

  /**
   * Public init method.
   * @param {Object} handler |handler|.networksChanged will be called when the
   *     available networks or their state has changed.
   **/
  function initPublic(handler) {
    this.handler_ = handler;

    this.ethernet_ = null;
    this.wifi_ = null;
    this.mobile_ = null;
    this.vpn_ = null;

    var filter = { visible: true, configured: false, limit: 0 };
    chrome.networkingPrivate.getNetworks(filter, function(networks) {
      this.onNetworksReceived(networks);
    });
    chrome.networkingPrivate.onNetworkListChanged.addListener(
      this.onNetworksReceived);
  }

  function onNetworksReceived(networks) {
    var ethernet = null;
    var wifi = null;
    var mobile = null;
    var vpn = null;
    for (var n in networks) {
      var state = n['ConnectionState'];
      if (state == 'NotConnected')
        break;  // Connected and Connecting networks are listed first
      var type = n['Type'];
      if (type == 'Ethernet' && !this.ethernet_)
        ethernet = n;
      if (type == 'WiFI' && !this.wifi_)
        wifi = n;
      if ((type == 'Cellular' || type == 'WiMAX') && !this.mobile_)
        mobile = n;
      if (type == 'VPN' && !this.vpn_)
        vpn = n;
    }
    var changed = false;
    if (ethernet == this.ethernet_ &&
        wifi == this.wifi_ &&
        mobile == this.mobile_ &&
        vpn == this.vpn_) {
      return;
    }
    this.ethernet_ = ethernet;
    this.wifi_ = wifi;
    this.mobile_ = mobile;
    this.vpn_ = vpn;
    this.handler_.networksChanged();
  }

  return {
    init: initPublic,
    ethernet: function() { return this.ethernet_; },
    wifi: function() { return this.wifi_; },
    mobile: function() { return this.mobile_; },
    vpn: function() { return this.vpn_; }
  };
})();
