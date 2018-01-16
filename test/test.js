/* eslint-env mocha, webextensions */
const assert = require("power-assert");

require("./browser-menus-shim");
const webextMenus = require("..");

describe("webextMenus", () => {
  afterEach(() => {
    browser.menus.reset();
  });
  
  it("keep command order", () => {
    const testCmd = {
      title: "test",
      contexts: ["page"],
      oncontext: () => true
    };
    const menus = webextMenus([
      testCmd,
      {
        title: "test2",
        contexts: ["page", "browser_action"]
      },
      {
        title: "test3",
        contexts: ["browser_action"]
      }
    ]);
    menus.update();
    testCmd.oncontext = () => false;
    menus.update();
    testCmd.oncontext = () => true;
    menus.update();
    const pageCmds = browser.menus.pool.page.map(c => c.title);
    assert.deepEqual(pageCmds, ["test", "test2"]);
    const browserActionCmds = browser.menus.pool.browser_action.map(c => c.title);
    assert.deepEqual(browserActionCmds, ["test2", "test3"]);
  });
});
