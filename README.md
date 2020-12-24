# XS Framework

An JavaScript microframework for IE >= 9 and all modern browsers. No additional dependencies. Made to simplify creation of Single Page Applications in situations where you cannot use modern tools like React, Vue.js, Elm.

## Licence
Public Domain, Unlicense (https://choosealicense.com/licenses/unlicense/), WTFPL (http://www.wtfpl.net/)

## Basic concepts

Creating new instance of framework object:

```javascript
 var xs = newXtraSmallFramework();
```

After that instead of writing:

```javascript
 document.getElementById('myId')
```

you can write more simply:

```javascript
 xs.myId
```

Moreover, the framework allows you to define properties. There are three kinds of properties, all of them you can set by `x.prop("name", value)` and/or `xs.update(["name1", value1, "name2", value2, ...])` methods:

- Element properties have names aka keys of the form `#elementId.attribute` and allow to manipulate a specific DOM element, for example the code below sets the element's inner text:
```javascript
 xs.update([
     '#myId.innerText', "Hello, world!"
 ]);
```

- Selector properties have keys being CSS selector and allow to mainipulate elements returned by the selector, for example:
```javascript
 xs.update([
     '.isVisible', true
 ]);
```

- Plain properties have keys being identifiers and allow to do other manipulations:
```javascript
 xs.update([
     'totalSum', 5 + 3 + 4
 ]);
```


## Defining properties

Only few properties are defined by framework, in most cases you have to define properties on your own. Only setters need to be defined, in XS Framework there is no concept of getters, but you can obtain the last set value of ther property by calling `xs.prop('name')` (single argument call).

### Defining element properties
You can define setter for the specific id:
```javascript
 xs.define({
    '#myId.color': function(xs, element, value) {
        element.style.backgroundColor = value;
    }
 });
```
Moreover, you can define default setter for all elements passing the star (`*`) character instead of id:
```javascript
 xs.define({
    '#myId.color': function(xs, element, value) {
        element.style.backgroundColor = value;
        element.style.color = 'blue';
    },
    '#*.color': function(xs, element, value) {
        element.style.backgroundColor = value;
    }
 });
```

The framework when executes the setter, first tries to execute function defined for specified id, if it doesn't find such function, it executes the function for `#*`. So, the above code set background and text clolor for element `myID` and background color only for other elements.

You can call `xs.define()` more than once, in the case when property key is the same in two definitions, the newer definiton overwrites the older one.

### Defining selector properties
The setter for selector properties is called for every element returned by the seletor and has five arguments:
```javascript
 xs.define({
    '.isVisible': function(xs, element, value, i, n) {
        element.style.display = value? 'block' : 'none';
    }
 });
```
The last two arguments are: 
- `i` - the 0-based index of current element in the selection result, 
- `n` - the total count of elements in the selection result.

Thanks to them the setter has ability to determine if the current element is first or last and take specific actions for the first/last element.

### Defining plain properties
The definition of the setter for plain property is a bit similar to the case of the setter for element property, but the second argument is the key (aka name) of the property, not an DOM element:
```javascript
 xs.define({
    'totalSum': function(xs, key, value) {
        var element = xs.InfoDiv; //yes, this is the abbreviation of document.getElementById('InfoDiv')
        element.style.backgroundColor = (value >= 0)? 'yellow' : 'pink';
        element.innerText = 'The sum is: ' + value.toString();
    }
 });
```

### Defining several properties with the same behaviour
If you want to define more than one property with the same setter function, separate keys by semicolon (`;`):
```javascript
 xs.define({
    ".visible_if_first_check_pressed; .visible_if_second_check_pressed; .visible_if_third_check_pressed": 
        function(xs, element, value, i, n) {
            element.style.display = value? 'block' : 'none';
        }
 });
```
