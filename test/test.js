/* eslint-env mocha, webextensions */
const assert = require("assert");

require("./browser-menus-shim");
const webextMenus = require("..");

function getCmds(context, prop = "title") {
  return browser.menus.pool[context].map(c => c[prop]);
}

describe("webextMenus", () => {
  afterEach(() => {
    browser.menus.reset();
  });
  
  it("keep command order (legacy)", () => {
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
    ], false);
    menus.update();
    
    testCmd.oncontext = () => false;
    menus.update();
    assert.deepEqual(getCmds("page"), ["test2"]);
    assert.deepEqual(getCmds("browser_action"), ["test2", "test3"]);
    
    testCmd.oncontext = () => true;
    menus.update();
    assert.deepEqual(getCmds("page"), ["test", "test2"]);
    assert.deepEqual(getCmds("browser_action"), ["test2", "test3"]);
  });
  
  it("donnot use visible prop", () => {
    const testCmd = {
      title: "test",
      contexts: ["page"],
      oncontext: () => true
    };
    const menus = webextMenus([testCmd], false);
    
    assert.strictEqual(browser.menus.pool["page"][0].visible, undefined);
    
    menus.update();
    
    assert.strictEqual(browser.menus.pool["page"][0].visible, undefined);
    
    testCmd.oncontext = () => false;
    menus.update();
    
    assert.strictEqual(browser.menus.pool["page"][0].visible, undefined);
  });
  
  it("keep the same ID", () => {
    const testCmd = {
      title: "test",
      contexts: ["page"],
      oncontext: () => true
    };
    const menus = webextMenus([testCmd], false);
    
    menus.update();
    testCmd.oncontext = () => false;
    menus.update();
    testCmd.oncontext = () => true;
    menus.update();
    testCmd.oncontext = () => false;
    menus.update();
    
    assert.equal(browser.menus.pool["page"].length, 0);
  });
  
  it("use visible property", () => {
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
    assert.deepEqual(getCmds("page"), ["test", "test2"]);
    assert.deepEqual(getCmds("page", "visible"), [false, true]);
    assert.deepEqual(getCmds("browser_action"), ["test2", "test3"]);
    
    
    testCmd.oncontext = () => true;
    menus.update();
    assert.deepEqual(getCmds("page"), ["test", "test2"]);
    assert.deepEqual(getCmds("page", "visible"), [true, true]);
    assert.deepEqual(getCmds("browser_action"), ["test2", "test3"]);
  });
  
  it("dynamic checked", () => {
    const testCmd = {
      title: "test",
      checked: () => true,
      contexts: ["page"]
    };
    const menus = webextMenus([testCmd]);
    menus.update();
    assert(browser.menus.pool.page[0].checked === true);
    testCmd.checked = () => false;
    menus.update();
    assert(browser.menus.pool.page[0].checked === false);
  });
});
