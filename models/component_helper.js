function ComponentHelper(doc, id) {
  this.doc_ = doc;
  this.id_ = id + 'Template';
};

ComponentHelper.prototype = {
  createTemplate: function(root) {
    var template = this.doc_.createElement('template');
    template.id = this.id_;
    template.content.appendChild(root);
    this.doc_.head.appendChild(template);
  },

  getTemplate: function() {
    return this.doc_.querySelector('#' + this.id_);
  }
};
