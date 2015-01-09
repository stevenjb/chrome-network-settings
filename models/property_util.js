var PropertyUtil = PropertyUtil || {};

(function() {
  PropertyUtil.getNestedProperty = function(dict, key) {
    var data = dict;
    while (true) {
      var index = key.indexOf('.');
      if (index < 0)
        break;
      var keyComponent = key.substr(0, index);
      if (!(keyComponent in data))
        return undefined;
      data = data[keyComponent];
      key = key.substr(index + 1);
    }
    return data[key];
  };

  PropertyUtil.getNestedPropertyAsString = function(dict, key) {
    var value = PropertyUtil.getNestedProperty(dict, key);
    if (value === true)
      return getText('True');
    else if (value === false)
      return getText('False');
    return value;
  };

  PropertyUtil.setNestedProperty = function(dict, key, value) {
    var data = dict;
    while (true) {
      var index = key.indexOf('.');
      if (index < 0)
        break;
      var keyComponent = key.substr(0, index);
      if (!(keyComponent in data))
        data[keyComponent] = {};
      data = data[keyComponent];
      key = key.substr(index + 1);
    }
    data[key] = value;
  };

})();
