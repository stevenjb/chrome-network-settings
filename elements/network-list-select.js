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
    var containerDiv = this.root_.querySelector('#container-div');
    containerDiv.appendChild(n);
  };

  networkListSelectPrototype.clearNetworks = function(node) {
    var containerDiv = this.root_.querySelector('#container-div');
    while (containerDiv.firstChild) {
      containerDiv.removeChild(containerDiv.firstChild);
    }
  };

  function createTemplate(doc) {
    var div = doc.createElement('div');
    div.id = 'container-div';
    return div;
  }

  networkListSelectPrototype.createdCallback = function() {
    var hostCss = 'display: flex; flex-direction: column;'
        + ' flex: 1 1 auto; width: 100%; height: 100%;';
    this.root_ = componentHelper_.createShadowRoot(this, hostCss);
  };

  var componentHelper_ = new ComponentHelper(doc, 'network-list-select',
                                             networkListSelectPrototype);
  componentHelper_.register(createTemplate(doc));
  componentHelper_.addCssFile('/elements/network-list-select.css');
}
