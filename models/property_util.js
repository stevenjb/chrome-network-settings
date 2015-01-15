var PropertyUtil = PropertyUtil || {};

(function() {
  /** @const */ var kDefaultPrefix = 25;  // 255.255.255.128

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

  /**
   * Returns the netmask as a string for a given prefix length.
   * @param {number} prefixLength The ONC routing prefix length.
   * @return {string} The corresponding netmask.
   */
  PropertyUtil.prefixLengthToNetmask = function(prefixLength) {
    // Return the empty string for invalid inputs.
    if (typeof prefixLength != 'number' || prefixLength < 0 ||
        prefixLength > 32) {
      return '';
    }
    var netmask = '';
    for (var i = 0; i < 4; ++i) {
      var remainder = 8;
      if (prefixLength >= 8) {
        prefixLength -= 8;
      } else {
        remainder = prefixLength;
        prefixLength = 0;
      }
      if (i > 0)
        netmask += '.';
      var value = 0;
      if (remainder != 0)
        value = ((2 << (remainder - 1)) - 1) << (8 - remainder);
      netmask += value.toString();
    }
    return netmask;
  };

  /**
   * Returns the prefix length from the netmask string.
   * @param {string} netmask The netmask string, e.g. 255.255.255.0.
   * @return {number} The corresponding netmask or kDefaultPrefix invalid.
   */
  PropertyUtil.netmaskToPrefixLength = function(netmask) {
    var prefixLength = 0;
    var tokens = netmask.split('.');
    if (tokens.length != 4)
      return kDefaultPrefix;
    for (var i = 0; i < tokens.length; ++i) {
      var token = tokens[i];
      // If we already found the last mask and the current one is not
      // '0' then the netmask is invalid. For example, 255.224.255.0
      if (prefixLength / 8 != i) {
        if (token != '0')
          return kDefaultPrefix;  // invalid
      } else {
        var prefixLengthMask = [ 0, 128, 192, 224, 240, 248, 252, 254, 255 ];
        var len = prefixLengthMask.length;
        var delta = undefined;
        for (var p = 0; p < len; ++p) {
          if (token == prefixLengthMask[p]) {
            delta = p;
            break;
          }
        }
        if (delta == undefined)
          return kDefaultPrefix;  // invalid
        prefixLength += delta;
      }
    }
    return prefixLength;
  };
})();
