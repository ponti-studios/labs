var $ = function (selector) {
  /**
   * @desc This array will hold the results to be returned.
   * @type {Array}
   */
  var elements = [];

  /**
   * @desc This array will hold the class names in the selector
   * @type {Array}
   */
  var classSelectors = [];

  /**
   * @desc This array will hold the id names in the selector
   * @type {Array}
   */
  var idSelectors = [];

  /**
   * @desc This variable will be assigned to the tag name in the selector
   * if one exists.
   * @type {String}
   */
  var tagName;

  /**
   * @desc This object holds Regular Expressions for testing selectors.
   * @type {Object}
   */
  var matcher = {
    id: new RegExp('^#'),
    class: new RegExp('^\\.')
  };

  /**
   * @desc Holder for individual selector names within selector argument
   * @type {Array}
   */
  var selectorNames = [];

  /**
   * @desc Push slice of selector into sel_names
   * @param {number} start - Index to start slice
   * @param {number} end - Index to end slice
   */
  function pushName(start, end) {
    selectorNames.push(selector.slice(start, end));
  }

  /**
   * @desc This function converts NodeLists into an Array.
   * @param els
   * @returns {Array}
   */
  function makeArray(els) {
    return Array.prototype.slice.call(els);
  }

  /**
   * @desc This object is meant to hold a library for
   * @type {Object}
   */
  var DOM = {
    search: {
      /**
       * @desc Search DOM by id
       * @param {String} query
       * @returns {HTMLElement}
       */
      id: function(query) {
        return document.getElementById(query);
      },
      /**
       * @desc Search DOM by class
       * @param {String} query
       * @returns {Array}
       */
      class: function(query) {
        return makeArray(document.getElementsByClassName(query));
      },
      /**
       * @desc Search DOM by tag name
       * @param {String} query
       * @returns {Array}
       */
      tag: function(query) {
        return makeArray(document.getElementsByTagName(query));
      }
    }
  };

  /**
   * @desc Index to begin slice. Set to 0 by default.
   * @type {Number}
   */
  var sliceStart = 0;

  /**
   * @desc This variable holds the length of the selector.
   * @type {Number}
   */
  var selectorLength = selector.length;

  /* Iterate through selector searching for classes and ids */
  for (var i = 1; i < selectorLength; i++) {
    if (matcher.id.test(selector[i]) || matcher.class.test(selector[i])) {
      pushName(sliceStart, i);
      sliceStart = i;
    } else if (i == selectorLength - 1) {
      /* Push last selector name in sel_names */
      pushName(sliceStart, i + 1);
    }
  }

  /**
   * Filter selectorNames checking for ids, classes, and tag names.
   */
  while (selectorNames.length > 0) {
    var sel = selectorNames[0];

    if (matcher.class.test(sel)) {
      classSelectors.push(sel.slice(1));
    } else if (matcher.id.test(sel)) {
      idSelectors.push(sel.slice(1));
    } else {
      tagName = selectorNames[0];
    }

    selectorNames.splice(0, 1);
  }

  /**
   * @desc This number represents the length of the idSelectors array.
   * @type {Number}
   */
  idSelectorsLength = idSelectors.length;

  /**
   * @desc This number represents the length of the classSelectors array.
   * @type {Number}
   */
  classSelectorsLength = classSelectors.length;

  /**
   * @desc Return element
   */


  function hasTagName(el) {
    return (tagName && el.tagName.toLowerCase() == tagName);
  }

  function hasClasses(base) {
    var sels = classSelectors.map(function(sel) {
      return (base && base.classList.contains(sel));
    });
    return !(hasClasses.indexOf(false) > -1);
  }

  /**
   * Return empty elements array because one cannot define more than one id
   * to a HTMLElement
   */
  if (idSelectors.length > 1) {
    return elements;
  }

  /**
   * Return result of document.getElementById in array if only one id in
   * selector and no classes or tag name.
   */
  if (idSelectorsLength == 1 && !classSelectorsLength && !tagName) {
    elements.push(DOM.search.id(idSelectors[0]));
    return elements;
  }

  /**
   * If id and tag name in selector, get result of document.getElementById
   * and check that element has tag name
   */
  if (idSelectorsLength == 1 && !!tagName) {
    var base = DOM.search.id(idSelectors[0]);
    if (hasTagName(base)) elements.push(base);
    return elements;
  }

  /**
   * If id and classes in selector, check result of document.getElementById
   * has classes.
   */
  if (idSelectorsLength && classSelectorsLength) {
    var base = DOM.search.id(idSelectors[0]);
    if (hasClasses(base)) elements.push(base);
    return elements
  }

  /**
   * If only one class and no ids, get result of
   * document.getElementsByClassName and filter them, checking if elements
   * has tag name if one was defined in selector.
   */
  if (classSelectorsLength === 1) {
    elements = DOM.search.class(classSelectors[0]).filter(function(el) {
      if (tagName) return hasTagName(el);
      return true;
    });
    return elements;
  }

  /**
   * If more than one class, get result of document.getElementsByClassName
   * and check that these elements have the rest of the classes in selector
   */
  if (classSelectorsLength > 1) {
    elements = DOM.search.class(classSelectors[0]).filter(function(el) {
      if (tagName) return hasClasses(el) && hasTagName(el);
      return hasClasses(el);
    });
    return elements;
  }

  /**
   * If no classes or ids in selector query, return result of
   * document.getElementsByTagName
   */
  if (tagName) elements = DOM.search.tag(tagName);

  return elements;

};

