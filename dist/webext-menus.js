var webextMenus = (function () {
'use strict';

/* eslint-env webextensions */

const MENUS = browser.menus || browser.contextMenus;
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

function webextMenus(menus) {
	const ids = new Map;
	const dynamicMenus = [];
	
	init(menus);
	
	function init(menus) {
		const prevSibling = {};
		
		for (const menu of menus) {
			// save id
			if (menu.id != null) {
				ids.set(menu.id, menu);
			}
			
			// raw options object for browser.menus.create
			menu.options = Object.assign({}, menu);
			delete menu.options.oncontext;
			
			// mark as dynamic
			if (menu.oncontext) {
				dynamicMenus.push(menu);
				menu.show = false;
			} else {
				create(menu);
				menu.show = true;
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
	
	function create(menu) {
		menu.id = MENUS.create(menu.options);
		menu.isCreated = true;
	}
	
	function destroy(menu) {
		MENUS.remove(menu.id);
		menu.isCreated = false;
	}
	
	function update() {
		const toShow = [];
		for (const menu of dynamicMenus) {
			const shouldShow = Boolean(menu.oncontext());
			if (menu.show === shouldShow) continue;
			
			if (shouldShow) {
				toShow.push(menu);
				menu.show = true;
			} else {
				destroy(menu);
				menu.show = false;
			}
		}
		for (const menu of toShow) {
			if (menu.isCreated) {
				// already processed
				continue;
			}
			destroySiblings(menu);
			create(menu);
			createSiblings(menu);
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
	
	return {update};
}

var webextMenus_1 = webextMenus;

return webextMenus_1;

}());
//# sourceMappingURL=webext-menus.js.map
