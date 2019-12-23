const BROWSER = typeof browser !== "undefined" ? browser : chrome; // eslint-disable-line no-undef
const MENUS = BROWSER.menus || BROWSER.contextMenus;
const ALL_CONTEXTS_EXCLUDE = new Set([
  "all",
  "bookmark",
  "browser_action",
  "launcher",
  "page_action",
  "tab",
  "tools_menu"
]);
const ALL_CONTEXTS = Object.values(MENUS.ContextType)
  .filter(c => !ALL_CONTEXTS_EXCLUDE.has(c));
const SUPPORT_VISIBLE = (() => {
  try {
    const id = MENUS.create({visible: false});
    MENUS.remove(id);
    return true;
  } catch (err) {
    return false;
  }
})();

function destroy(menu) {
  MENUS.remove(menu.id);
  menu.isCreated = false;
}

function createVisibleUpdater() {
  return {createHidden, toggleVisible};
  
  function createHidden(menu) {
    menu.options.visible = false;
    create(menu);
  }
  
  function toggleVisible(menus) {
    for (const menu of menus) {
      menu.options.visible = menu.show;
      MENUS.update(menu.id, {visible: menu.show});
    }
  }
}

function createLegacyVisibleUpdater() {
  const ids = new Map;
  return {toggleVisible, init};
  
  function toggleVisible(menus) {
    for (const menu of menus) {
      if (!menu.show) {
        destroy(menu);
      }
    }
    
    for (const menu of menus) {
      if (menu.show) {
        if (menu.isCreated) {
          // already processed
          continue;
        }
        destroySiblings(menu);
        create(menu);
        createSiblings(menu);
      }
    }
  }
  
	function destroySiblings(menu) {
		if (!menu.nextSibling) return;
		for (const nextMenu of Object.values(menu.nextSibling)) {
			if (nextMenu.isCreated) {
				destroy(nextMenu);
			}
			destroySiblings(nextMenu);
		}
	}
	
	function createSiblings(menu) {
		if (!menu.nextSibling) return;
		for (const nextMenu of Object.values(menu.nextSibling)) {
			if (!nextMenu.isCreated && nextMenu.show) {
				create(nextMenu);
			}
			createSiblings(nextMenu);
		}
	}
	
  function init(menus) {
		const prevSibling = {};
    for (const menu of menus) {
      // save id
      if (menu.id != null) {
        ids.set(menu.id, menu);
      }
      // build sibling relationship
      for (const context of reduceContextType(getMenuContext(menu))) {
        if (!prevSibling[context]) {
          prevSibling[context] = new Map;
        }
        const prevCmd = prevSibling[context].get(menu.parentId);
        if (prevCmd) {
          if (!prevCmd.nextSibling) {
            prevCmd.nextSibling = {};
          }
          prevCmd.nextSibling[context] = menu;
        }
        prevSibling[context].set(menu.parentId, menu);
      }
    }
  }
  
	function reduceContextType(contexts) {
		return contexts.reduce((set, context) => {
      if (context === "all") {
        ALL_CONTEXTS.forEach(c => set.add(c));
      } else {
        set.add(context);
      }
			return set;
		}, new Set);
	}
	
	function getMenuContext(menu) {
		if (menu.contexts) {
			return menu.contexts;
		}
		if (menu.parentId != null) {
			return getMenuContext(ids.get(menu.parentId));
		}
		return ["page"];
	}
	
}

function create(menu) {
  menu.id = MENUS.create(Object.assign({}, menu.options));
  menu.isCreated = true;
}

function webextMenus(menus, _SUPPORT_VISIBLE = SUPPORT_VISIBLE) {
	const dynamicMenus = [];
  const dynamicChecked = [];
  const visibleUpdater = _SUPPORT_VISIBLE ? createVisibleUpdater() : createLegacyVisibleUpdater();
	
	init(menus);
	
	function init(menus) {
		for (const menu of menus) {
			// raw options object for browser.menus.create
			menu.options = Object.assign({}, menu);
			
      // mark as dynamic checked
      if (typeof menu.checked === "function") {
        delete menu.options.checked;
        dynamicChecked.push(menu);
      }
      
			// mark as dynamic
			if (menu.oncontext) {
        delete menu.options.oncontext;
				dynamicMenus.push(menu);
        menu.show = false;
        if (visibleUpdater.createHidden) {
          visibleUpdater.createHidden(menu);
        }
			} else {
        menu.show = true;
        create(menu);
      }
    }
    
    if (visibleUpdater.init) {
      visibleUpdater.init(menus);
    }
	}
	
  function update() {
    updateShown();
    updateChecked();
  }
	
	function updateShown() {
		const changed = [];
		for (const menu of dynamicMenus) {
			const shouldShow = Boolean(menu.oncontext());
			if (menu.show === shouldShow) continue;
			
      menu.show = shouldShow;
      changed.push(menu);
		}
    visibleUpdater.toggleVisible(changed);
	}
  
  function updateChecked() {
    for (const menu of dynamicChecked) {
      MENUS.update(menu.id, {checked: menu.checked()});
    }
  }
	
	return {update};
}

module.exports = webextMenus;
