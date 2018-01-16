const menus = {
  ids: new Map,
  pool: {},
  create,
  remove,
  reset,
  update,
  ContextType: {
    "ALL": "all",
    "PAGE": "page",
    "FRAME": "frame",
    "SELECTION": "selection",
    "LINK": "link",
    "EDITABLE": "editable",
    "PASSWORD": "password",
    "IMAGE": "image",
    "VIDEO": "video",
    "AUDIO": "audio",
    "LAUNCHER": "launcher",
    "BROWSER_ACTION": "browser_action",
    "PAGE_ACTION": "page_action",
    "TAB": "tab"
  }
};

global.browser = {menus};

let id = 1;

function create(options) {
  options = Object.assign({}, options);
  if (options.id == null) {
    options.id = id++;
  }
  for (const context of options.contexts) {
    if (!menus.pool[context]) {
      menus.pool[context] = [];
    }
    menus.pool[context].push(options);
  }
  menus.ids.set(options.id, options);
  return options.id;
}

function remove(id) {
  for (const cmds of Object.values(menus.pool)) {
    const index = cmds.findIndex(c => c.id === id);
    if (index >= 0) {
      cmds.splice(index, 1);
    }
  }
  menus.ids.delete(id);
}

function update(id, options) {
  Object.assign(menus.ids.get(id), options);
}

function reset() {
  menus.pool = {};
}
