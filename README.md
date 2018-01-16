webext-menus
============

A library helping you create dynamic menus in webextensions. Used by [Image Picka](https://github.com/eight04/image-picka).

Installation
------------

### Via npm

```
npm install webext-menus
```

```js
const webextMenus = require("webext-menus");
const menus = webextMenus([
  {
    title: "My command",
    contexts: ["browser_action"]
  }
]);
```

### Pre-built dist

You can find it under the `dist` folder, or [download from unpkg](https://unpkg.com/webext-menus/dist/).

API reference
-------------

This module exports a single function to initialize a dynamic menu.

### webextMenus(options: Array&lt;object>): object

This function accepts an array of [property object for menus.create](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/menus/create#Parameters). The property object may contain following properties:

* Any property used by `browser.menus.create`.
* `oncontext`: function, optional. `oncontext` should return a boolean indicating whether the menu item should be shown.

This function returns a `menus` object, containing following properties:

* `update`: function. When called, it invokes each item's `oncontext` and show/hide the item. (It actually uses `browser.menus.create` and `browser.menus.remove` since webextension doesn't provide the API to show/hide the menu)

  This method is usually hooked on a `change` event. For example:

  ```js
  // assume there is a preference library
  const menus = webextMenus([
    {
      title: "My command",
      contexts: ["pages"],
      onclick: () => console.log("clicked"),
      oncontext: () => pref.get("shouldShowCommand")
    }
  ]);
  pref.onChange(() => {
    menus.update();
  });
  ```
  
Todos
-----

* What will happen to sub-items if the parent is removed?

Changelog
---------

* 0.1.0 (Jan 17, 2018)

    - First release.
