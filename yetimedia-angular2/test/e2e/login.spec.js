describe('Log In', function(){
  beforeEach(function(){
    browser.get('http://localhost:8100');
  });

  describe('when the user is not logged in', function(){
    it('redirects to the login-in page', function(){
      expect(browser.getCurrentUrl()).toBe('http://localhost:8100/#/auth/login');
    });
  });

  // testing login function

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
      	  element(by.css('form ion-input[name="password"] input')).sendKeys('Li.12345').then(function(){
      	    element(by.css('form')).submit().then(function(button){
      	      expect(browser.getCurrentUrl()).toBe('http://localhost:8100/#/app/dashboard');
      	    });
      	  });
      	});
      });
    });
  });
});

// testing to create/delete group

describe('group create and delete', function () {
  describe('group create', function () {
    describe('open popover', function () {
      it('click plus button', function () {
        element(by.css('page-dashboard ion-content.dashboard-container .dashboard-stats .buttons-options .button-create')).click().then(function () {
          browser.wait(element(by.css('.create-group create-group')).isPresent(), 3000); browser.sleep(1000);
        });
      });
    });
    describe('enter group name', function () {
      it('typing in the inputbox ', function () {
        element(by.css('.create-group create-group ion-list ion-item .input-group input')).sendKeys('group for testing').then(function () {
          browser.sleep(1000);
        });
      });
    });
    describe('save group', function () {
      it('click DONE', function () {
        element(by.css('.create-group create-group .button-done')).click().then(function () {
          browser.wait(function () {
            return element(by.css('.create-group')).isPresent().then(function (present) {
              return !present;
            });
          }); browser.sleep(2000);
        });
      });
    });
  });

  describe('group delete', function () {
    describe('open popover', function () {
      it('click plus button', function () {
        element(by.css('page-dashboard ion-content.dashboard-container .dashboard-stats .buttons-options .button-create')).click().then(function () {
          browser.wait(element(by.css('.create-group create-group')).isPresent(), 3000); browser.sleep(1000);
        });
      });
    });
    describe('select an item of groups', function () {
      it('check an item ', function () {
        var itemlist = element.all(by.css('.create-group create-group ion-list .group-list ion-item'));
        var itemsToDelete  = itemlist.filter(function (item) {
          return item.element(by.css('ion-label')).getText().then (function (t) {
            return t === 'group for testing';
          })
        });
        itemsToDelete.each(function (item) {
          item.element(by.css('ion-checkbox button')).click();
          browser.sleep(1000);
        });
      });
    });
    describe('save group', function () {
      it('click DONE', function () {
        element(by.css('.create-group create-group .button-done')).click().then(function () {
          browser.wait(function () {
            return element(by.css('.create-group')).isPresent().then(function (present) {
              return !present;
            });
          }); browser.sleep(2000);
        });
      });
    });
  });
});




// testing profile page

describe('on the profile', function() {

  // profile thumb click

  describe('open the profile page', function () {
    it('redirect to the profile page', function () {
      var profileDiv = element(by.css('.header-thumb'));
      profileDiv.click().then(function() {
        expect(browser.getCurrentUrl()).toBe('http://localhost:8100/#/app/profile');
      });
    });
  });

  // edit list of  patients

  describe('edit list of  patients', function () {
    describe('open editing popiver', function () {
      it('click edit button', function () {
        var editButton = element(by.css('page-profile .edit-button'));
        editButton.click().then(function() {
          browser.wait(function () {
            return element(by.css('.edit-patients')).isPresent().then(function (present) {
              return present;
            });
          });
        });
      });
    });

    // add and remove patients

    describe('editing patients', function () {
      describe('add a patinet', function () {
        it('input patinet name', function () {
          element(by.css('.edit-patients ion-input input')).sendKeys('demo patinet').then(function () {
            browser.sleep(1000);
          });
        });
      });

      describe('remove a patinet', function () {
        it('remove an item from the list of patients', function () {
          element.all(by.css('.edit-patients ion-item a')).get(2).click();
        });
      });

      describe('end editing', function () {
        it('click DONE', function () {
          element.all(by.css('.edit-patients edit-patients div button')).get(1).click().then(function () {
            browser.wait(function () {
              return element(by.css('.edit-patients')).isPresent().then(function (present) {
                return !present;
              });
            });
          });
        });
      });
    });
  });


  // switch schedule type

  describe('switch schedule type', function () {
    describe('show dayily schedule', function () {
      it('click day', function () {
        element(by.css('.segment-day')).click();
      });
    });

    describe('show weekly schedule', function () {
      it('click week', function () {
        element(by.css('.segment-week')).click();
      });
    });

    describe('show monthly schedule', function () {
      it('click month', function () {
        element(by.css('.segment-month')).click();
      });
    });
  });

  // explore schedule

  describe('explore schedule', function () {
    describe('open list schedule popover', function () {
      it('click clock icon', function () {
        element(by.css('.list-schedule-button')).click().then(function () {
          browser.wait($('.list-schedule list-schedule').isPresent(), 3000); browser.sleep(1000);
        });
      });
    });

    describe('close list schedule popover', function () {
      it('click export button', function () {
        element(by.css('.list-schedule list-schedule div button')).click().then(function () {
          browser.sleep(1000);
        });
      });
    });
  });

  // edit schedule

  describe('edit schedule', function () {
    describe('open edit schedule popover', function () {
      it('click edit button', function () {
        element(by.css('.edit-schedule-button')).click().then(function () {
          browser.wait($('.edit-schedule edit-schedule').isPresent(), 3000); browser.sleep(1000);
        });
      });
    });

    describe('close list schedule popover', function () {
      it('click export button', function () {
        element.all(by.css('.edit-schedule edit-schedule .content div button')).get(2).click().then(function () {
          browser.wait(function () {
            return element(by.css('.edit-schedule')).isPresent().then(function (present) {
              return !present;
            });
          });
        });
      });
    });
  });
});
