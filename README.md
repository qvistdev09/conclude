# Conclude

> a html template engine for server-side rendering in node.js applications

## Table of Contents

* [Background](#background)
* [Usage](#usage)
  * [Template blocks](#template-blocks)
    * [If-blocks](#if-blocks)
    * [For-blocks](#for-blocks)
    * [Include-blocks](#include-blocks)
    * [Data-interpolation-blocks](#data-interpolation-blocks)
* [Security](#security)

## Background

I wrote this package mostly to challenge myself to understand how a html template engine could be built from scratch. It proved to be a great exercise in recursion and regexes. It is not a published package, and was purely made for the sake of learning, so I do not recommend using it in actual projects.

## Usage

Import the `createEngine` function from the index file and instantiate a new renderer by supplying the folder where you keep your html views.

```javascript
import { createEngine } from "conclude";
import path from "path";

const renderer = createEngine(path.resolve(__dirname, "./views"));
```

The renderer has one method, `renderTemplate`, which returns the rendered template as a string. It expects a filename, referencing one of your views, and a data object of any shape, which holds the data needed to resolve the html template.

```javascript
const data = {
  loggedIn: true,
  username: "qvistdev09",
  interests: ["programming", "spicy food"],
};

const html = renderer.renderTemplate("profile.html", data);
```

### Template blocks

Conclude supports four types of blocks: if-blocks, for-blocks, include-blocks and data-interpolation-blocks.

- if-blocks: renders certain html if condition is true.
- for-blocks: iterates over an array and renders certain html for each element in the array.
- include-blocks: imports the entirety of another html view file.
- data-interpolation: simply interpolates the string value of a variable into the html.

A block in Conclude is always opened with the character set `[:` and closed with `:]`.

Blocks can be nested inside each other to any depth. If-blocks can contain for-blocks, which can contain new if-blocks and so on.

### If-blocks

```html
[:#IF (displayUsername) THEN {
<p>Qvistdev09</p>
}:]
```

If the condition inside the parentheses is true, the html content inside the following curly braces will be rendered.

The following types of conditionals are supported:

- `(someVariable)` - normal javascript truthiness check
- `(!someVariable)` - inverted truthiness check
- `(name = "qvistdev09")` - strictly equal, equals === in javascript
- `(name != "qvistdev09")` - strictly not equal, equals !== in javascript
- `(number > 500)` - greater/lesser than comparisons (`>`, `<`, `>=`, `<=` are all supported)

If-blocks can be a chain of else and else if.

```html
[:#IF (displayUsername) THEN {
  <p>Qvistdev09</p>
}:]
[:#ELSE_IF (displayHobby) THEN {
  <p>Cooking</p>
}:]
[:#ELSE {
  <p>No condition was met!</p>
}:]
```

### For-blocks

For-blocks repeat a block of html for each element in an array.

```html
[:#FOR (book IN books) {
  <div class="card__book">
    <h2>[:book.title:]</h2>
    <p>[:book.description:]</p>
  </div>
}:]
```

### Include-blocks

Include-blocks simply import the contents from another view file.

```html
<body>
  [:#INCLUDE "navigation.html":]
  <p>Some content here!</p>
  [:#INCLUDE "footer.html":]
</body>
```

Circular imports are not possible and will be ignored.

### Data-interpolation-blocks

These blocks interpolate a variable from the data object into the html. Only strings and numbers (on which `.toString()` is called) are considered.

```html
<p>[:someValue:]</p>
```

You can also access nested values with dot notation.

```html
<p>[:person.details.streetName:]</p>
```

## Security

Conclude does not have exhaustive security features. As a bare minimum, the following characters are html encoded: `&`, `"`, `'`, `<`, `>`.

Do not use this package without further html sanitization. For more information, refer to [OWASP - Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/cross_site_scripting_prevention_cheat_sheet.html)
