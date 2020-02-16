var webextMenus = (function () {
  'use strict';

  function polyfillVisible(MENUS) {
    const ids = new Map; // Map<id, menu>
    const scopes = new Map; // Map<scopeId, menu>
    const ALL_CONTEXTS = getAllContexts(MENUS);
    let INC = 1;
    return {
      create,
      // remove,
      update,
      commit
    };
    
  	function normalizeContexts(contexts) {
      // convert "all" to an array of names
  		return contexts.reduce((set, context) => {
        if (context === "all") {
          ALL_CONTEXTS.forEach(c => set.add(c));
        } else {
          set.add(context);
        }
  			return set;
  		}, new Set);
  	}
  	
  	function getContexts(menu) {
  		if (menu.rawOptions.contexts) {
  			return menu.rawOptions.contexts;
  		}
  		if (menu.rawOptions.parentId != null) {
  			return getContexts(ids.get(menu.rawOptions.parentId));
  		}
  		return ["page"];
  	}
  	
    function create(options) {
      const visible = options.visible !== false;
      delete options.visible;
      options.id = options.id || `WEBEXT_MENUS/${INC++}`;
      // NOTE: can't reuse the same object since Chrome tries modifying it.
      if (visible) {
        MENUS.create(Object.assign({}, options));
      }
      const menu = {
        id: options.id,
        rawOptions: options,
        visible,
        pendingVisible: null,
        prev: [],
        refreshed: false
      };
      ids.set(options.id, menu);
      for (const contextName of normalizeContexts(getContexts(menu))) {
        const scopeName = `${options.parentId}/${contextName}`;
        const lastMenu = scopes.get(scopeName);
        if (lastMenu) {
          menu.prev.push(lastMenu);
        }
        scopes.set(scopeName, menu);
      }
      return options.id;
    }
    
    function update(id, props) {
      // FIXME: Doesn't support update `contexts`, `parentId`
      const menu = ids.get(id);
      if (props.visible != null) {
        if (props.visible !== menu.visible) {
          menu.pendingVisible = props.visible;
        }
        delete props.visible;
      }
      // FIXME: should we check Object.keys(menu).length and bail out?
      Object.assign(menu.rawOptions, props);
      if (menu.visible) {
        return MENUS.update(id, props);
      }
    }
    
    function commit() {
      // FIXME: we rely on the insertion order. Is it gaurateed in `Set`?
      for (const menu of ids.values()) {
        if (menu.prev.some(m => m.refreshed)) {
          menu.refreshed = true;
          if (menu.pendingVisible == null && menu.visible) {
            // remove static shown menus and create again
            MENUS.remove(menu.id);
            menu.pendingVisible = true;
          }
        }
        if (menu.pendingVisible === false) {
          // remove dynamic menu
          MENUS.remove(menu.id);
          menu.visible = false;
          menu.pendingVisible = null;
        } else if (menu.pendingVisible === true) {
          // show dynamic menu and mark as refreshed
          MENUS.create(Object.assign({}, menu.rawOptions));
          menu.visible = true;
          menu.pendingVisible = null;
          menu.refreshed = true;
        }
      }
      for (const menu of ids.values()) {
        menu.refreshed = false;
      }
    }
  }

  function getMenusAPI() {
    const BROWSER = typeof browser !== "undefined" ? browser : chrome; // eslint-disable-line no-undef
    return BROWSER.menus || BROWSER.contextMenus;
  }

  function getAllContexts(MENUS) {
    const ALL_CONTEXTS_EXCLUDE = new Set([
      "all",
      "bookmark",
      "browser_action",
      "launcher",
      "page_action",
      "tab",
      "tools_menu"
    ]);
    return Object.values(MENUS.ContextType)
      .filter(c => !ALL_CONTEXTS_EXCLUDE.has(c));
  }

  function checkVisible(MENUS) {
    let id;
    try {
      id = MENUS.create({visible: false, title: "test_visible"}, () => {
        // eslint-disable-next-line no-undef
        const BROWSER = typeof browser !== "undefined" ? browser : chrome;
        if (BROWSER.runtime.lastError) {
          console.warn("failed to create menu when checking visible property", BROWSER.runtime.lastError);
        }
      });
      return true;
    } catch (err) {
      return false;
    } finally {
      if (id != null) {
        MENUS.remove(id); // FIXME: shuould we catch remove errors?
      }
    }
  }

  function webextMenus(menus, useVisible) {
    const MENUS = getMenusAPI();
  	const dynamicMenus = [];
    const dynamicChecked = [];
    const API = (useVisible == null ? checkVisible(MENUS) : useVisible) ?
      MENUS : polyfillVisible(MENUS);
  	
    init();
    
  	return {update};
  	
  	function init() {
  		for (const menu of menus) {
  			// raw options object for browser.menus.create
  			const options = Object.assign({}, menu);
  			
        // mark as dynamic checked
        if (typeof menu.checked === "function") {
          delete options.checked;
          dynamicChecked.push(menu);
        }
        
  			// mark as dynamic
  			if (menu.oncontext) {
          delete options.oncontext;
  				dynamicMenus.push(menu);
          menu.show = false;
          options.visible = false;
  			} else {
          menu.show = true;
        }
        
        menu.id = API.create(options);
      }
  	}
  	
    function update() {
      updateShown();
      updateChecked();
    }
  	
  	function updateShown() {
  		for (const menu of dynamicMenus) {
  			const shouldShow = Boolean(menu.oncontext());
  			if (menu.show === shouldShow) continue;
  			
        menu.show = shouldShow;
        API.update(menu.id, {visible: shouldShow});
  		}
      if (API.commit) {
        API.commit();
      }
  	}
    
    function updateChecked() {
      for (const menu of dynamicChecked) {
        API.update(menu.id, {checked: menu.checked()});
      }
    }
  }

  return webextMenus;

}());
//# sourceMappingURL=webext-menus.js.map
