const {authErrorMessage} = require("../../client/share/constants");
describe('Login', () => {

    beforeEach(() => {
        browser.get('/sign-in')
    })

    it('should have correct title', () => {
        expect(browser.getTitle()).to.eventually.equal("啪啪米 - 一款装逼神器")
    })

    it('display error message if bad username or password attempts', () => {
        element(by.id('username')).sendKeys('badguy');
        element(by.id('password')).sendKeys('nopass');
        browser.findElement(by.className('primary')).click();
        browser.sleep(1000);

        expect(element(by.className('error message')).getText())
            .to.eventually.equal(authErrorMessage);
    })

    it('fills out username and password and logged in', () => {
        element(by.id('username')).sendKeys('test');
        element(by.id('password')).sendKeys('test');
        browser.findElement(by.className('primary')).click();
        browser.sleep(1000);

        expect(element(by.className('ui divided items')).getText())
            .to.eventually.contains('订单');
    })

})