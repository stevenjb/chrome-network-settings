function registerNetworkListSelect(doc) {

  var networkListSelectPrototype = Object.create(HTMLElement.prototype);

  networkListSelectPrototype.clickNetwork = function(guid) {
    if (this.onClickFunc)
      this.onClickFunc(guid);
  };

  networkListSelectPrototype.addNetwork = function(network) {
    var p = this.ownerDocument.createElement('p');
    var span = this.ownerDocument.createElement('span');
    span.textContent = network['Name'];
    p.appendChild(span);
    var selector = this;
    p.onclick = function(event) { selector.clickNetwork(network['GUID']); };
    this.listNode_.appendChild(p);
  };

  networkListSelectPrototype.clearNetworks = function(node) {
    while (this.listNode_.firstChild) {
      this.listNode_.removeChild(this.listNode_.firstChild);
    }
  };

  networkListSelectPrototype.createdCallback = function() {
    console.log('networkListSelect created');
    this.listNode_ = this.ownerDocument.createElement('div');
    this.appendChild(this.listNode_);
  };

  var networkListSelectElement = doc.registerElement(
      'network-list-select', { prototype : networkListSelectPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', 'elements/network-list-select.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkListSelect registered');
}
