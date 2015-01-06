function registerNetworkListSelect(doc) {

  registerNetworkListItem(doc, 'list');

  var networkListSelectPrototype = Object.create(HTMLElement.prototype);

  networkListSelectPrototype.clickNetwork = function(network, which) {
    if (this.onClickFunc)
      this.onClickFunc(network, which);
  };

  networkListSelectPrototype.addNetwork = function(network) {
    var n = this.ownerDocument.createElement('network-list-item');
    assert(n.setNetwork);
    n.setNetwork(network);
    n.onClickFunc = networkListSelectPrototype.clickNetwork.bind(this);
    this.listNode_.appendChild(n);
  };

  networkListSelectPrototype.clearNetworks = function(node) {
    while (this.listNode_.firstChild) {
      this.listNode_.removeChild(this.listNode_.firstChild);
    }
  };

  networkListSelectPrototype.createdCallback = function() {
    console.log('networkListSelect created');
    this.listNode_ = this.ownerDocument.createElement('div');
    this.listNode_.id = 'container-div';
    this.appendChild(this.listNode_);
  };

  var networkListSelectElement = doc.registerElement(
      'network-list-select', { prototype : networkListSelectPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', '/elements/network-list-select.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkListSelect registered');
}
