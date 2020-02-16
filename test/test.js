/* eslint-env mocha, webextensions */
const assert = require("assert");

require("./browser-menus-shim");
const webextMenus = require("..");

function getCmds(context, prop = "title") {
  return browser.menus.pool[context].map(c => c[prop]);
}

describe("webextMenus", () => {
  it("keep command order (legacy)", () => {
    browser.menus.reset();
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
    assert.deepEqual(getCmds("page"), ["test2"]);
    assert.deepEqual(getCmds("browser_action"), ["test2", "test3"]);
    
    testCmd.oncontext = () => true;
    menus.update();
    assert.deepEqual(getCmds("page"), ["test", "test2"]);
    assert.deepEqual(getCmds("browser_action"), ["test2", "test3"]);
  });
  
  it("donnot use visible prop", () => {
    browser.menus.reset();
    const testCmd = {
      title: "test",
      contexts: ["page"],
      oncontext: () => true
    };
    const menus = webextMenus([testCmd]);
    menus.update();
    testCmd.oncontext = () => false;
    menus.update();
  });
  
  it("keep the same ID", () => {
    browser.menus.reset();
    const testCmd = {
      title: "test",
      contexts: ["page"],
      oncontext: () => true
    };
    const menus = webextMenus([testCmd]);
    
    menus.update();
    testCmd.oncontext = () => false;
    menus.update();
    testCmd.oncontext = () => true;
    menus.update();
    testCmd.oncontext = () => false;
    menus.update();
    
    assert.equal(browser.menus.pool["page"].length, 0);
  });
  
  it("throw if visible is not valid", () => {
    browser.menus.reset();
    const testCmd = {
      title: "test",
      contexts: ["page"],
      oncontext: () => true
    };
    assert.throws(() => {
      webextMenus([testCmd], true);
    });
  });
  
  it("use visible property", () => {
    browser.menus.reset(true);
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
    browser.menus.reset(true);
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
