

describe('Creating Patient', function(){
  // profile thumb click

  describe('open the new Patient page', function () {
    it('redirect to the new Patient page', function () {
      var adduserButton = element(by.css('.buttons-actions button:first-child'));
      adduserButton.click().then(function() {
        browser.sleep(1000);
        var addPatient = element(by.css('.add-user-popup .special-popup-item:first-child'));
        addPatient.click().then(function() {
          expect(browser.getCurrentUrl()).toBe('http://localhost:8100/#/app/new-patient');
          browser.sleep(1000);
        });
      });
    });
  });


  // testing patient

  describe('save new patient', function(){
    it('shows a popover with a message', function(){
      element(by.css('.user-form ion-input[name="name"] input')).sendKeys("Invalid").then(function(){
        element(by.css('.user-form ion-input[name="email"] input')).sendKeys("aa@a.com").then(function(){
          var saveButton = element(by.css('.profile-save-button'));
          saveButton.click().then(function() {
            browser.wait($('.toast-message').isPresent(), 1000);
            expect(element(by.css('.toast-message')).getText()).toEqual("Patient Exist");
          });
        });
      });
    });
  });
  
  describe('when submitting the form', function(){
    it('shows a popover with a message', function(){
      let newPatient = 'test.patient@' + Math.floor(Math.random() * 5000) + '.com'
      element(by.css('.user-form ion-input[name="name"] input')).sendKeys("New patient").then(function(){
        element(by.css('.user-form ion-input[name="email"] input')).sendKeys(newPatient).then(function(){
          var saveButton = element(by.css('.profile-save-button'));
          saveButton.click().then(function() {
            browser.wait($('.toast-message').isPresent(), 3000);
            expect(element(by.css('.toast-message')).getText()).toEqual("register success");
          });
        });
      });
    });
  });


});
