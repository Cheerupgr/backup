exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'http://localhost:8100',
    specs: ['test/e2e/*.spec.js'],
    exclude: [],
    multiCapabilities: [{
        browserName: 'chrome'
    }],
    allScriptsTimeout: 150000,
    getPageTimeout: 150000,
    framework: 'jasmine2',
    jasmineNodeOpts: {
        isVerbose: false,
        showColors: true,
        includeStackTrace: false,
        defaultTimeoutInterval: 400000
    },
    onPrepare: function() {
      browser.manage().window().setSize(1600, 1000);
    },

    /**
     * ng2 related configuration
     *
     * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
     * `rootEl`
     *
     */
     useAllAngular2AppRoots: true
};