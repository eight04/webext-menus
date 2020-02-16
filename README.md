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

Compatibility
--------------

If the browser supports the `visible` property when creating the menu item, the library update the item when `oncontext` is changed.

Otherwise, the library destroy/recreate the item to hide/show the menu.

API reference
-------------

This module exports a single function to initialize a dynamic menu.

### webextMenus

```js
webextMenus(options: Array<Object: MenuProps>, useVisible: Boolean | null)
  => ({update: () => void})
```

`options` is an array of [property object for menus.create](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/menus/create#Parameters). The property object may contain following properties:

* Any property used by `browser.menus.create`.
* `checked` - function, which should return a boolean indicating whether the menu item should be checked. If `checked` is not a function, it is considered static.
* `oncontext` - function, optional. `oncontext` should return a boolean indicating whether the menu item should be shown.

`useVisible` decides whether to hide menu items by updating the `visible` property. If `false`, it will remove/recreate the menu item to mimic hide/show effect. If `undefined` or `null`, it will use the `visible` property if supported.

> **Note:** [There is an empty menu bug in Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=1037837) so I suggest setting this argument to `false`.

The function returns an object with an `update` method. When called, it invokes each item's `oncontext`/`checked` and show/hide/toggle the menu item.

`update` is usually hooked to a `change` event. For example:

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

* 0.2.0 (Dec 23, 2019)

  - Add: use `visible` property if possible.
  - Fix: support Chrome without polyfill.

* 0.1.3 (May 13, 2018)

  - Add: Chrome compatibility.

* 0.1.2 (Jan 18, 2018)

  - Fix: dynamic checked.

* 0.1.1 (Jan 17, 2018)

  - Add: dynamic checked.

* 0.1.0 (Jan 17, 2018)

  - First release.
