# Conclude

> a html template engine for server-side rendering

## Usage

Import the `createEngine` function from the index file and instantiate a new renderer by supplying the folder where you keep your html views.

```javascript
import { createEngine } from "conclude";
import path from 'path';

const renderer = createEngine(path.resolve(__dirname, './views'));
```

The renderer has one method, `renderTemplate`, which expects a filename, referencing one of your html views, and a data object, needed to resolve the template blocks into pure html.

```javascript
const data = {
  loggedIn: true,
  username: 'qvistdev09',
  interests: ["programming", "spicy food"]
}

const html = renderer.renderTemplate("profile.html", data);
```

### Template blocks

Conclude supports four types of blocks: if-blocks, for-blocks, include-blocks and data-interpolation-blocks.

* if-blocks: renders certain html if condition is true.
* for-blocks: iterates over an array an renders certain html for each element in the array
* include-blocks: imports the entirety of another html view file
* data-interpolation: simply interpolates the string value of a variable into the html

A block in Conclude is always opened with the character set `[:` and closed with `:]`.

### If-blocks

```html
[:#IF (displayUsername) THEN {
  <p>Qvistdev09</p>
}:]
```

If the condition inside the parentheses is true, the html content inside the following curly braces will be rendered.

The following types of conditionals are supported:
* `(someVariable)` - normal javascript truthiness check
* `(!someVariable)` - inverted truthiness check
* `(name = "qvistdev09")` - strictly equal, equals === in javascript
* `(name != "qvistdev09")` - strictly not equal, equals !== in javascript
* `(number > 500)` - greater/lesser than comparisons (`>`, `<`, `>=`, `<=` are all supported)

