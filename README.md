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

A block in Conclude is always opened with the characters `[:` and closed with `:]`.

### If-blocks

```html
<p>Test</p>
```

