/*
    This code works for:
    * ECMAScript 5
    * IE >= 9 and all modern browsers

    Licence:
        Public Domain, Unlicense (https://choosealicense.com/licenses/unlicense/), WTFPL (http://www.wtfpl.net/)
        Feel free to download, copy, modify and use this software in any way you want (commercial or uncommercial).

    https://github.com/darekp7/xsframework
*/
function newXtraSmallFramework(bCreateElementsList) {
    if (arguments.length < 1 || bCreateElementsList === undefined) {
        bCreateElementsList = true;
    }

    function each(x, action) {
        if (!x) {
            return;
        } else if (x.forEach) {
            x.forEach(function(item, key) {
                action(item, key, x);
            });
        } else if (x.length !== undefined) {
            for(var i=0; i < x.length; i++)
                action(x[i], i, x);
        } else if (Object && Object.keys) {
            var keys = Object.keys(x);
            if (keys.forEach) {
                keys.forEach(function(key) {
                    action(x[key], key, x);
                });
            } else {
                for(var i=0; i < keys.length; i++)
                    action(x[keys[i]], keys[i], x);
            }
        } else {
            for (var key in x) {
                if (x.hasOwnProperty(key)) {
                    action(x[key], key, x);
                }
            }
        }
    }

    function isIdentifier(str) {
        str = (str || '').toUpperCase();
        if (str.length <= 0 || '0123456789'.indexOf(str[0]) >= 0)
            return false;
        for(var i=0; i < str.length; i++) {
            if ("~`!@#%^&*()-+=|\\[]{};:'\",.<>/?".indexOf(str[i]) >= 0 || !str[i].trim())
                return false;
        }
        return true;
    }

    function strReplaceAll(str, find, newValue) {
        if (find && find !== newValue) {
            while(str.indexOf(find) >= 0) {
                str = str.replace(find, newValue);
            }
        }
        return str;
    }

    function pipe(val) {
        var res = val;
        for(var i = 1; i < arguments.length; i++)
            res = arguments[i](res);
        return res;
    }

    function isElementPropertyName(str) {
        // element property name format: "#ident.property"
        // where:
        //   "#" must be first char of the string
        //   "ident" must be nonempty
        //   "." must occure exactly once
        //   substring after "." must be an identtifier
        //   string must not contain spaces
        str = (str || '').trim();
        var pos = str.indexOf('.');
        return str.indexOf(' ') < 0 && str[0] == '#' && pos > 2 && pos == str.lastIndexOf('.') && isIdentifier(str.substring(pos + 1));
    }

    var xs = {
        etc: {
            data: {
                __lastErrors: {}
              },
            definedProperties: {},
            reservedIds: [],
            elementIds: []
        }
    };


    function define(propDefinitions) {
        each(propDefinitions, function (action, key) {
            xs.etc.definedProperties[key] = action;
        });
        return xs;
    }

    function setProp(key, value) {
        key = key || '';
        var action = xs.etc.definedProperties[key] || function() { throw new Error("Undefined property: '" + key + "'."); }
        try {
            if (isIdentifier(key)) {
                action(xs, key, value);
            } else if (isElementPropertyName(key)) {
                var element_id = key.substring(1, key.indexOf('.'));
                var element = document.getElementById(element_id);
                if (!element) {
                    // do nothing
                } else if (xs.etc.definedProperties[key]) {
                    action(xs, element, value);
                } else {
                    var default_property_key = "#*" + key.substring(key.indexOf('.'));
                    if (default_property_key !== key && xs.etc.definedProperties[default_property_key]) {
                        action = xs.etc.definedProperties[default_property_key];
                        action(xs, element, value);
                    } else {
                        throw new Error("Undefined property: '" + key + "'.");
                    }
                }
            } else {
                var elements = document.documentElement.querySelectorAll(key);
                for(var i=0; i < elements.length; i++) {
                    action(xs, elements[i], value, i, elements.length);
                }
            }
            xs.etc.data[key] = value;
        } catch(e) {
            xs.etc.data.__lastErrors[key] = e;
            console.error(e);
        }
        return xs;
    }

    function prop(key, value) {
        switch(arguments.length) {
            case 1:
                return xs.etc.data[key];
            case 2:
                setProp(key, value);
                return xs;
            default:
                console.error("XtraSmallFramework: prop() - invalid number of arguments.");
                return xs;
        }
    }

    function update(prop_value_list) {
        if (prop_value_list && prop_value_list.length) {
            for(var i=0; i < prop_value_list.length; i+=2) {
                setProp(prop_value_list[i], prop_value_list[i+1]);
            }
        }
        return xs;
    }

    function eachElement(cssSelectors, action) {
        var elements = document.documentElement.querySelectorAll(cssSelectors);
        for(var i = 0; i < elements.length; i++) {
            action(elements[i], i, elements.length);
        }
    }

    /* adds new elements to object if they exist
       note: if you need refresh them (delete erased elements and add new) just create new XS object
    */
    function updateElementsList() {
        var elements = document.documentElement.querySelectorAll('[id]');
        for(var i = 0; i < elements.length; i++) {
            // note:
            // "id" must be here a local variable in order to make proper variable scope => I (have to) use anonymous function,
            // I use "isIdentifier" because other ids cannot be accessed by dot notation (x.property),
            // if there are more than one element with specified "id" I use first one.
            (function (id) {
                if (isIdentifier(id) && xs.etc.reservedIds.indexOf(id) <= 0 && xs[id] === undefined) {
                    Object.defineProperty(xs, id, {
                        get: function () {
                            return document.getElementById(id);
                        }
                    });
                    xs.etc.elementIds.push(id);
                }
            })(elements[i].id);
        }
        return xs;
    }

    function get_IE_version() {
        // https://www.codegrepper.com/code-examples/javascript/javascript+check+if+browser+is+ie
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var ua = window.navigator.userAgent;
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
        return 0;
    }

    function get_Edge_version() {
        // https://www.codegrepper.com/code-examples/javascript/javascript+check+if+browser+is+ie
        var ua = window.navigator.userAgent;
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        return 0;
    }

    xs.html = document.documentElement;
    xs.define = define;
    xs.prop = prop;
    xs.update = update;
    xs.eachElement = eachElement;
    xs.isIE = !!get_IE_version();
    xs.isEdge = !!get_Edge_version();
    xs.etc.each = each;
    xs.etc.updateElementsList = updateElementsList;
    xs.etc.isIdentifier = isIdentifier;
    xs.etc.strReplaceAll = strReplaceAll;
    xs.etc.pipe = pipe;
    xs.etc.isElementPropertyName = isElementPropertyName;
    xs.etc.get_IE_version = get_IE_version;
    xs.etc.get_Edge_version = get_Edge_version;

    each(xs, function(v, k) {  // reserverd ids are sorted in order to avoid of ambiguity
        for(var i=0; i < xs.etc.reservedIds.length; i++) {
            if (xs.etc.reservedIds[i] > k) {
                xs.etc.reservedIds.splice(i, 0, k);
                return;
            }
        }
        xs.etc.reservedIds.push(k);
    });

    if (bCreateElementsList) {
        xs.etc.updateElementsList();
    }

    xs.define({
        '#*.innerText': function(xs, element, value) {
            element.innerText = value;
          },
        '#*.innerHTML': function(xs, element, value) {
            element.innerHTML = value;
          }
    });
    return xs;
}
