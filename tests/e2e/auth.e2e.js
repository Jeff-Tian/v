describe('Login', () => {

    beforeEach(() => {
        browser.get('/admin/sign-in')
    })

    it('should have correct title', () => {
        expect(browser.getTitle()).to.eventually.equal("啪啪加 V - 上传图片自动加 V")
    })

    it('display error message if bad username or password attempts', () => {
        element(by.id('username')).sendKeys('badguy');
        element(by.id('password')).sendKeys('nopass');
        browser.findElement(by.className('primary')).click();
        browser.sleep(2000);

        expect(element(by.className('error message')).getText())
            .to.eventually.equal('fuck you!');
    })

    it('fills out username and password and logged in', () => {
        element(by.id('username')).sendKeys('test');
        element(by.id('password')).sendKeys('test');
        browser.findElement(by.className('primary')).click();
        browser.sleep(1000);

        expect(element(by.className('success message')).getText())
            .to.eventually.equal('welcome');
    })

})