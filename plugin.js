/**
 * plugin.js
 *
 * Copyright, BuboBox
 * Released under MIT License.
 *
 * License: https://www.bubobox.com
 * Contributing: https://www.bubobox.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add("variables", function (editor) {
  var VK = tinymce.util.VK;

  /**
   * Object that is used to replace the variable string to be used
   * in the HTML view
   * @type {object}
   */
  var mapper = editor.getParam("variable_mapper", {});

  /**
   * define a list of variables that are allowed
   * if the variable is not in the list it will not be automatically converterd
   * by default no validation is done
   * @todo  make it possible to pass in a function to be used a callback for validation
   * @type {array}
   */
  var valid = editor.getParam("variable_valid", null);

  /**
   * Get custom variable class name
   * @type {string}
   */
  var className = editor.getParam("variable_class", "variable");
  var codeClassName = editor.getParam("code_class", "code");
  var variableShowCode = editor.getParam("variable_showCode", false);

  //TODO make generic
  // var REGEX_SPECIAL_CHARS = ['\\','^','$','.','|','?','*','+','(',')','[','{'];
  escapeValue = function(value) {return (value == "$" ? value.replace('$','\\$') : value);};

  /**
   * Prefix and suffix to use to mark a variable
   * @type {string}
   */

  var prefix = editor.getParam("variable_prefix", "{{");
  var suffix = editor.getParam("variable_suffix", "}}");
  var regex = editor.getParam("variable_regex", "(.*)?");
  // var stringVariableRegex = new RegExp(prefix + "(.*)?" + suffix, "g");
  var stringVariableRegex = new RegExp(prefix + regex + suffix, "g");

  var extra_variable_ps = editor.getParam("extra_variable_ps");
  var otherVariableRegexArr = [];
  extra_variable_ps.forEach(function(value) {
    otherVariableRegexArr.push({
      prefix: value.prefix,
      suffix: value.suffix,
      regex: new RegExp(
        escapeValue(value.prefix) + value.regex + escapeValue(value.suffix),
        "g"
      )
    });
  });

  /**
   * check if a certain variable is valid
   * @param {string} name
   * @return {bool}
   */
  function isValid(name) {
    if (!valid || valid.length === 0) return true;

    var validString = "|" + valid.join("|") + "|";

    return validString.indexOf("|" + name + "|") > -1 ? true : false;
  }

  function getMappedValue(cleanValue, value) {
    if (typeof mapper === "function") return mapper(cleanValue);

    return mapper.hasOwnProperty(cleanValue) ? {mapped : true, value: mapper[cleanValue]} : {mapped:false, value:value};
  }

  /**
   * Strip variable to keep the plain variable string
   * @example "{test}" -> "test"
   * @param {string} value
   * @return {string}
   */
  function cleanVariable(value, prefix, suffix) {
    // return value.replace(/[^a-zA-Z._]/g, ""); //original
    value = value.replace(prefix, "");
    value = value.replace(suffix, "");
    return value.replaceAll('"', "'"); //replace all double quotes with single as it causes string issue
  }

  /**
   * convert a text variable "x" to a span with the needed
   * attributes to style it with CSS
   * @param  {string} value
   * @return {string}
   */
  function createHTMLVariable(value, prefix, suffix) {
    var cleanValue = cleanVariable(value, prefix, suffix);

    // check if variable is valid
    if (!isValid(cleanValue)) return value;

    var cleanMappedValue = prefix != "<%" ? getMappedValue(cleanValue, value) : "__code__";
    
    editor.fire("variableToHTML", {
      value: value,
      cleanValue: cleanValue
    });
    
    var variable = prefix + cleanValue + suffix;
    var htmlValue = cleanMappedValue === "__code__" || !cleanMappedValue.mapped ?
    variableShowCode ? (
      '<span class="' +
      codeClassName +
      '" data-original-variable="' +
      variable +
      '" >' +
      cleanValue +
      "</span>"
    ):(
      '<span><span data-tooltip="My code" data-tooltip-position="top"  class="' +
      codeClassName +
      '" data-original-variable="' +
      variable +
      '" contenteditable="false">' +
      "code" +
      "</span></span>"
    ):(
      '<span><span data-tooltip="My Tooltip" data-tooltip-position="top"  class="' +
      className +
      '" data-original-variable="' +
      variable +
      '" contenteditable="false">' +
      cleanMappedValue.value +
      "</span></span>"
    );
    return htmlValue;
  }

  function replaceOtherVariables(nodeValue) {
    otherVariableRegexArr.forEach(function(item) {
      nodeValue = nodeValue.replace(item.regex, function (value) {
        return createHTMLVariable(value, item.prefix, item.suffix);
      });
    });
    return nodeValue;
  }
  // function testVariableIsMapped (regex, value){
  //   var matches = value.match(regex);
  //   if(!matches ) return false;
  //    console.log("regex -> ", regex);
  //   var i=0;
  //   while (matches[i] != null) {
  //     // console.log("matches[i] : ",matches[i])
  //     // console.log(" --i = ",matches[i],  getMappedValue(matches[i]).value);
  //     if(!getMappedValue(matches[i]).mapped) {
  //       return false;
  //     }
  //     i++;
  //   }
  //   console.log("----------> ", true);
  //   return true;
  // }
  /**
   * convert variable strings into html elements
   * @return {void}
   */
  function stringToHTML() {
    var nodeList = [],
      nodeValue,
      node,
      div;
    // find nodes that contain a string variable
    // tinymce.walk(
    //   editor.getBody(),
    //   function (n) {
    //     if (
    //       n.nodeType == 3 &&
    //       n.nodeValue &&
    //       ( testVariableIsMapped(stringVariableRegex,n.nodeValue) ||
    //         otherVariableRegexArr.some(function(value){
    //           return testVariableIsMapped(value.regex, n.nodeValue);
    //         }))
    //     ) {
    //       nodeList.push(n);
    //     }
    //   },
    //   "childNodes"
    // );
    tinymce.walk(
      editor.getBody(),
      function (n) {
        if (
          n.nodeType == 3 &&
          n.nodeValue &&
          (stringVariableRegex.test(n.nodeValue) ||
            otherVariableRegexArr.some(function(value){
              return value.regex.test(n.nodeValue);
            }))
        ) {
          nodeList.push(n);
        }
      },
      "childNodes"
    );

    // loop over all nodes that contain a string variable
    for (var i = 0; i < nodeList.length; i++) {
      nodeValue = nodeList[i].nodeValue.replace(
        stringVariableRegex,
        function (value) {
          return createHTMLVariable(value, prefix, suffix);
        }
      );
      nodeValue = replaceOtherVariables(nodeValue);

      div = editor.dom.create("div", null, nodeValue);
      while ((node = div.lastChild)) {
        editor.dom.insertAfter(node, nodeList[i]);

        if (isVariable(node)) {
          var next = node.nextSibling;
          editor.selection.setCursorLocation(next);
        }
      }

      editor.dom.remove(nodeList[i]);
    }
  }

  /**
   * convert HTML variables back into their original string format
   * for example when a user opens source view
   * @return {void}
   */
  function htmlToString() {
    var nodeList = [],
      nodeValue,
      node,
      div;

    // find nodes that contain a HTML variable
    tinymce.walk(
      editor.getBody(),
      function (n) {
        if (n.nodeType == 1) {
          var original = n.getAttribute("data-original-variable");
          if (original !== null) {
            nodeList.push(n);
          }
        }
      },
      "childNodes"
    );

    // loop over all nodes that contain a HTML variable
    for (var i = 0; i < nodeList.length; i++) {
      nodeValue = nodeList[i].getAttribute("data-original-variable");
      div = editor.dom.create("div", null, nodeValue);
      while ((node = div.lastChild)) {
        editor.dom.insertAfter(node, nodeList[i]);
      }

      // remove HTML variable node
      // because we now have an text representation of the variable
      editor.dom.remove(nodeList[i]);
    }
  }

  function setCursor(selector) {
    var ell = editor.dom.select(selector)[0];
    if (ell) {
      var next = ell.nextSibling;
      editor.selection.setCursorLocation(next);
    }
  }

  /**
   * handle formatting the content of the editor based on
   * the current format. For example if a user switches to source view and back
   * @param  {object} e
   * @return {void}
   */
  function handleContentRerender(e) {
    // store cursor location
    return e.format === "raw" ? stringToHTML() : htmlToString();
    // restore cursor location
  }

  /**
   * insert a variable into the editor at the current cursor location
   * @param {string} value
   * @return {void}
   */
  function addVariable(value) {
    var htmlVariable = createHTMLVariable(value);
    editor.execCommand("mceInsertContent", false, htmlVariable);
  }

  function isVariable(element) {
    if (
      typeof element.getAttribute === "function" &&
      element.hasAttribute("data-original-variable")
    )
      return true;

    return false;
  }

  /**
   * Trigger special event when user clicks on a variable
   * @return {void}
   */
  function handleClick(e) {
    var target = e.target;

    if (!isVariable(target)) return null;

    var value = target.getAttribute("data-original-variable");
    editor.fire("variableClick", {
      value: cleanVariable(value),
      target: target
    });
  }

  editor.on("nodechange", stringToHTML);
  editor.on("keyup", stringToHTML);
  editor.on("beforegetcontent", handleContentRerender);
  editor.on("click", handleClick);

  this.addVariable = addVariable;
});
