exports.config = {
    framework: 'mocha',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'http://localhost:3000',
    specs: ['e2e/**/*.js'],
    onPrepare: () => {
        browser.ignoreSynchronization = true
        var width = 2250
        var height = 1200
        browser.driver.manage().window().setSize(width, height)

        require('babel-register')
        require('./setup')
    },
    mochaOpts: {
        enableTimeouts: false,
    },
    allScriptsTimeout: 15000,

    browserstackUser: 'browserstackuser',
    browserstackKey: 'browserstackkey',
    multiCapabilities: [
        {
            browserName: 'Chrome',
            browser_version: '54.0',
            os: 'OS X',
            os_version: 'Yosemite',
            resolution: '1920x1080',
            'browserstack.local': true,
        }
    ],

}