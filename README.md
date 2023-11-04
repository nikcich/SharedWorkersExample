# Using RequireJS with Shared Workers

## Example HTML

Include RequireJS and initiate the main script in your HTML file.

```html
<script data-main="main" src="path-to-require.js/require.js"></script>
```

## Main.js

```js
// main.js
require(['sharedWorker'], function (sharedWorker) {
  // Initialize the Shared Worker after loading the script
  const worker = new SharedWorker(sharedWorker);
  const port = worker.port;

  // ...
});
```

## SharedWorker.js

```js
// sharedWorker.js
self.onconnect = function (e) {
  const port = e.ports[0];

  port.onmessage = function (event) {
    // Handle messages from connected windows/tabs.
  };
};
```