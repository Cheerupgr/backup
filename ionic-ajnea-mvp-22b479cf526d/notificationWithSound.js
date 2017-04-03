// TEST FUNCTION, do with it what you will
testSoundNotification = function(){
        // Sound test
        // plugin from https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-media/index.html
        document.addEventListener("deviceready", function(){
            var media = new Media("resources/beep-01a.wav",
            // success callback
            function() {
        
            },
            // error callback
            function(err) {
        
            });
            media.play();
        });
            
        // only works on ios and android
        if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()){
            // Notification test
            // plugin from https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin
            window.plugins.toast.showWithOptions(
            {
                message: "Notification of sorts",
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                // addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            },
            {}, // optional success
            {}  // optional failure
            );
        }
};
// END TEST FUNCTION
testSoundNotification();