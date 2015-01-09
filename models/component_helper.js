function ComponentHelper(doc, id, proto) {
  this.doc_ = doc;
  this.id_ = id;
  this.proto_ = proto;
};

ComponentHelper.prototype = {
  createTemplate_: function(root) {
    var template = this.doc_.createElement('template');
    template.id = this.id_;
    template.content.appendChild(root);
    this.doc_.head.appendChild(template);
  },

  register: function(root) {
    this.createTemplate_(root);
    var networkListItemElement = this.doc_.registerElement(
        this.id_, { prototype: this.proto_ });
    console.log('Component registered: ' + this.id_);
  },

  addCssFile: function(cssFile) {
    var css =  this.doc_.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', cssFile);
    this.doc_.getElementsByTagName('head')[0].appendChild(css);
  },

  createShadowRoot: function(host, hostCss) {
    var root = host.createShadowRoot();

    var doc = host.ownerDocument;
    var template = this.doc_.querySelector('template#' + this.id_);
    var clone = doc.importNode(template.content, true);
    root.appendChild(clone);

    if (hostCss) {
      var css = ':host { ' + hostCss + ' }';
      var style = doc.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      root.appendChild(style);
    }

    return root;
  }

};
