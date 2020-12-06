/*
    This code works for:
    * ECMAScript 5
    * IE >= 9 and all modern browsers
*/
function newXtraSmallFramework() {
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
        if (str.length <= 0)
            return false;
        for(var i=0; i < str.length; i++) {
            if (str[i] != '_' && (str[i] < '0' || str[i] > '9') && (str[i] < 'A' || str[i] > 'Z'))
                return false;
        }
        return true;
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
                    if (xs.etc.definedProperties[default_property_key]) {
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
            action(xs, elements[i], value, i, elements.length);
        }
    }

    function refreshElements() {
        var elements = document.documentElement.querySelectorAll('[id]');
        each(xs.etc.elementIds, function(id) {
            xs[id] = undefined;
        });
        xs.etc.elementIds = [];
        for(var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var id = element.id;
            if(xs.etc.reservedIds.indexOf(id) <= 0 && !xs[id]) {
                xs[id] = element;
                xs.etc.elementIds.push(id);
            }
        }
        return xs;
    }
    
    xs.html = document.documentElement;
    xs.define = define;
    xs.prop = prop;
    xs.update = update;
    xs.eachElement = eachElement;
    xs.etc.each = each;
    xs.etc.refreshElements = refreshElements;
    xs.etc.isIdentifier = isIdentifier;
    xs.etc.isElementPropertyName = isElementPropertyName;
    
    each(xs, function(v, k) {  // reserverd ids are sorted in order to avoid of ambiguity
        for(var i=0; i < xs.etc.reservedIds.length; i++) {
            if (xs.etc.reservedIds[i] > k) {
                xs.etc.reservedIds.splice(i, 0, k);
                return;
            }
        }            
        xs.etc.reservedIds.push(k);
    });
    
    xs.etc.refreshElements();
    
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