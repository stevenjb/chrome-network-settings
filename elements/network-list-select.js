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
    var template = doc.createElement('template');
    template.id = 'networkListSelectTemplate';

    var containerDiv = doc.createElement('div');
    containerDiv.id = 'container-div';

    template.content.appendChild(containerDiv);
    doc.head.appendChild(template);
  }

  networkListSelectPrototype.createdCallback = function() {
   this.root_ = this.createShadowRoot();

    var doc = this.ownerDocument;
    var template = doc.querySelector('#networkListSelectTemplate');
    var clone = doc.importNode(template.content, true);
    this.root_.appendChild(clone);

    var css = ':host { '
        + ' display: flex; flex-direction: column;'
        + ' flex: 1 1 auto; width: 100%; height: 100%;'
        + '}';
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    this.root_.appendChild(style);
  };

  createTemplate(doc);

  var networkListSelectElement = doc.registerElement(
      'network-list-select', { prototype : networkListSelectPrototype });

  var css =  doc.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', '/elements/network-list-select.css');
  doc.getElementsByTagName('head')[0].appendChild(css);

  console.log('networkListSelect registered');
}
