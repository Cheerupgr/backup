describe('Log In', function(){
  beforeEach(function(){
    browser.driver.manage().window().setSize(376, 591);
    browser.get('http://localhost:8100');
  });

  afterEach(function(){
    browser.driver.manage().window().setSize(800, 600);
  });

  describe('when the user is not logged in', function(){
    it('redirects to the login-in page', function(){
      expect(browser.getCurrentUrl()).toBe('http://localhost:8100/#/session/login');
    });
  });

  describe('when submitting the form', function(){

    describe('when entering invalid data', function(){

      describe('when the user does not exits', function(){

	it('shows a popover with a message', function(){
	  element(by.css('form ion-input[name="email"] input')).sendKeys('invalid@invalid.com').then(function(){
	    element(by.css('form ion-input[name="password"] input')).sendKeys('password').then(function(){
	      element(by.css('form')).submit().then(function(button){
		browser.wait($('.toast-message').isPresent(), 3000);
		expect(element(by.css('.toast-message')).getText()).toEqual("User does not exist.");
	      });
	    });
	  });
	});
      });
    });

    describe('when entering valid data', function(){
      it('logs in the app secure path', function(){
	element(by.css('form ion-input[name="email"] input')).sendKeys('li_ellis2000@yahoo.com').then(function(){
	  element(by.css('form ion-input[name="password"] input')).sendKeys('Li.890922').then(function(){
	    element(by.css('form')).submit().then(function(button){
	      expect(browser.getCurrentUrl()).toBe('http://localhost:8100/#/app/home');
	    });
	  });
	});
      });
    });
  });
});
