const menus = {
  pool: {},
  create,
  remove,
  reset
};

global.browser = {menus};

let id = 1;

function create(options) {
  if (options.id == null) {
    options.id = id++;
  }
  for (const context of options.contexts) {
    if (!menus.pool[context]) {
      menus.pool[context] = [];
    }
    menus.pool[context].push(options);
  }
  return options.id;
}

function remove(id) {
  for (const cmds of Object.values(menus.pool)) {
    const index = cmds.findIndex(c => c.id === id);
    if (index >= 0) {
      cmds.splice(index, 1);
    }
  }
}

function reset() {
  menus.pool = {};
}
