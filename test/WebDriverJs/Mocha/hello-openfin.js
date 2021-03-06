/**
 * Example test script for Hello OpenFin app using Mocha, CHAI and selenium-webdriver (https://www.npmjs.org/package/selenium-webdriver)
 */


var expect, until, webdriver, chrome, config;
expect = require('chai').expect;
until = require('selenium-webdriver').until;
webdriver = require('selenium-webdriver');
chrome = require('selenium-webdriver/chrome');
config = require("../../config");


describe('Hello OpenFin App testing with selenium-webdriver', function () {
    "use strict";

    var client, notificationButton, cpuInfoButton, cpuInfoExitButton;

    this.timeout(config.testTimeout);

    before(function () {
        // configure webdriver
        var capabilities = webdriver.Capabilities.chrome();
        capabilities.set('chromeOptions', config.desiredCapabilities.chromeOptions);
        client = new webdriver.Builder().usingServer(config.remoteDriverUrl).withCapabilities(capabilities).build();
        var timeouts = new webdriver.WebDriver.Timeouts(client);
        timeouts.implicitlyWait(config.testTimeout);
        timeouts.pageLoadTimeout(config.testTimeout);
        timeouts.setScriptTimeout(config.testTimeout);
    });

    after(function (done) {
        // needs "done" here to give time to run .end()
        client.quit().then(function () {
            done();
        });
    });

    /**
     * Select a Window
     * @param windowHandle handle of the window
     * @param callback callback with window title if selection is successful
     */
    function switchWindow(windowHandle, callback) {
        client.switchTo().window(windowHandle).then(function () {
            client.getTitle().then(function (title) {
                callback(title);
            });
        });
    }

    /**
     * Select the window with specified title.
     *
     * @param windowTitle window title
     * @param done done callback for Mocha
     */
    function switchWindowByTitle(windowTitle, done) {
        client.getAllWindowHandles().then(function (handles) {
            var handleIndex = 0,
                checkTitle = function (title) {
                if (title === windowTitle) {
                        done();
                } else {
                    handleIndex += 1;
                    if (handleIndex < handles.length) {
                        switchWindow(handles[handleIndex], checkTitle);
                    } else {
                        // the window may not be loaded yet, so call itself again
                        switchWindowByTitle(windowTitle, done);
                    }
                }
            };
            switchWindow(handles[handleIndex], checkTitle);
        });
    }

    /**
     * Inject a snippet of JavaScript into the page for execution in the context of the currently selected window.
     * The executed script is assumed to be asynchronous and must signal that is done by invoking the provided callback, which is always
     * provided as the final argument to the function. The value to this callback will be returned to the client.
     *
     * @param script
     * @returns {*|!webdriver.promise.Promise.<T>}
     *
     */
    function executeAsyncJavascript(script) {
        return client.executeAsyncScript(script);
    }

    /**
     * Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame. The executed script is assumed
     * to be synchronous and the result of evaluating the script is returned to the client.
     *
     * @param script
     * @returns {*|!webdriver.promise.Promise.<T>}
     */
    function executeJavascript(script) {
        return client.executeScript(script);
    }

    it('Switch to Hello OpenFin Main window', function(done) {
        expect(client).to.exist;
        switchWindowByTitle("Hello OpenFin", done);
    });

    it('Verify OpenFin Runtime Version', function (done) {
        expect(client).to.exist;
        executeAsyncJavascript("var callback = arguments[arguments.length - 1];" +
            "fin.desktop.System.getVersion(function(v) { callback(v); } );").then(function(v) {
            expect(v).to.equal(config.expectedRuntimeVersion);
                done();
            });
    });


    it("Find notification button", function (done) {
        expect(client).to.exist;
        client.findElements(webdriver.By.id("desktop-notification")).then(function(result) {
            notificationButton = result[0];
            done();
        });
    });

    it("Click notification button", function (done) {
        expect(client).to.exist;
        expect(notificationButton).to.exist;
        notificationButton.click().then(function () {
            done();
        });
    });


    it("Find CPU Info button", function (done) {
        expect(client).to.exist;
        client.findElements(webdriver.By.id("cpu-info")).then(function(result) {
            cpuInfoButton = result[0];
            done();
        });
    });

    it("Click CPU Info button", function (done) {
        expect(client).to.exist;
        expect(cpuInfoButton).to.exist;
        cpuInfoButton.click().then(function () {
            client.sleep(3000).then(function () {
                done();
            });
        });
    });

    it('Switch to CPU Info window', function (done) {
        expect(client).to.exist;
        switchWindowByTitle("Hello OpenFin CPU Info", done);
    });


    it("Find Exit button for CPU Info window", function (done) {
        expect(client).to.exist;
        client.findElements(webdriver.By.id("close-app")).then(function(result) {
            cpuInfoExitButton = result[0];
            done();
        });
    });

    it("Click CPU Info Exit button", function (done) {
        expect(client).to.exist;
        expect(cpuInfoExitButton).to.exist;
        cpuInfoExitButton.click().then(function() {
            client.sleep(3000).then(function() {
                done();
            });
        });
    });

    it('Exit OpenFin Runtime', function (done) {
        expect(client).to.exist;
        executeJavascript("fin.desktop.System.exit();").then(function () {
            done();
        });
    });


});
