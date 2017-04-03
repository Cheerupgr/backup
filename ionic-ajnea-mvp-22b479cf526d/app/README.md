# Ajnea_Victorise
Victorise's project by [Ajnea](http://www.Ajnea.com/thecms/)

## Prerequisites

- NodeJS
- Cordova
- Ionic
- Gulp

## Installation

1) Install [NodeJS](https://nodejs.org/en/) (with the Node Package Manager)

2) Install [Cordova](https://nodejs.org/en/)
```bash
npm install -g cordova
```
3) Install [Ionic](http://ionicframework.com/)
```bash
npm install -g ionic
```
4) Install [Gulp](http://gulpjs.com/)
```bash
npm install -g gulp

```
## Installation update
```bash
1. npm install
2. ionic state reset
3. cordova plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="AIzaSyAPW2HT8rsavNWQwQEMELc5KeVfMG1NjEA" --variable API_KEY_FOR_IOS="AIzaSyDb7DwdC_t-5YmFF-A16-5xV9Hnm59t0BE"
4. ionic platform add ios
5. ionic emulate ios -lc
```
for Android modify the following in 
platform/android/project.properties
```bash
target=android-24
android.library.reference.1=CordovaLib
cordova.system.library.1=com.google.android.gms:play-services-analytics:+
cordova.system.library.2=com.google.android.gms:play-services-maps:10.0.0
cordova.system.library.3=com.google.android.gms:play-services-location:10.0.0
cordova.system.library.4=com.android.support:support-v4:+
cordova.gradle.include.1=cordova-background-geolocation/victoriseapp-build.gradle
```

## Run project in your computer browser

In the project app root folder, just execute
```bash
ionic serve
```

## Run in another platform

In the project app root folder, check the available platforms
```bash
ionic platform list
```
Install the desired platform if needed
```bash
ionic platform add <platform>
```
Build the project
```bash
ionic build <platform>
```
> Note: If you are trying to run an IOS virtual machine, then you need to look for the Xcode workspace inside the platforms/IOS folder and run the virtual machine from the Xcode project that opens up.
Run the project (it will automatically find a device like an emulator or a connected phone)
```bash
ionic run <platform>
```

> Note: You will probably need a SDK installed on your computer (SDK Manager for Android, ...)

## Get an Android APK

You can find an APK in "dist/sprintX/Ajnea_Victorise.apk"


## Setting up the plugins

To find out which plugins are installed in your project
```bash
cordova plugins list
```
To install/update a missing plugin
```bash
cordova plugins add/update <Name of plugin>
```
To delete a plugin
```bash
cordova plugin remove <Name of plugin>
```



## Short explanation dealing with the Audio player and Audio Recorder
- This app uses the ng-cordova's Media and MediaCapture libraries to play and record Audio files
> Note: both have the capability to play and record, but we are using the Media plugin to play files and the MediaCaptura plugin to record them.
- You can access the Audio capabilities through the service factory called 'AudioServce'
> Note: code has comments to explain how to use it.
- We have look for the files in two different places before playing
- - www/audio for Predefined Audio files that were downloaded with the app
- - A custom location that differs between Android and IOS
> Note: Each Android manufacturer stores the audio files in a different pre-defined audio codec/format and in a different location, therefore we depend on cordova.file.<location> functionality to locate the correct places.
- Once an Audio file has been recorded it will be moved automatically to into a private folder belonging the our app where the user cannot access it directly.
> Note: In Android, we move the file into the app's Media/File folder. In IOS, we move it into the Documents folder where the files will be detected by apps like Itunes.

## How to setup a local server in your computer

1) Have all the prerequisites fulfilled
1.1) MongoDB installed with a victorise database created
1.2) Node and NPM capabilities installed
1.3) ionic platform build and ready to run virtual machines
1.4) Make sure your $PATHS variable, or Windows equivalent, can find the commands:
```bash
mongo
mongod
ionic
cordova
node
```

2) Alter the applications client-side server information
- Go to App.js and at the very top there are two sets of routes:
```bash
.constant("server", { url: "<Victorise IP Address>", port: "8080" })
.constant("server", { url: "http://localhost", port: "8080"})
```
- The first one points to our server in the web (always remember to set it back when you are done debugging the server locally) and the second one is for testing and debugging locally; Uncomment only ONE at a time.

2) Run the applications in this order
- MongoDB database daemon
```bash
Mongod --dbpath <path to database>
```
> Note: if you installed the MongoDB in the default directory, then you can call on Mongod only without the extra flags
- Victorise_server
```bash
node server.js
```
> Note: you have to be in the server's root folder, so that the paths in the files can find all the important information
- Ionic Virtual Machine
```bash
ionic serve
```
> Note: you can also run it in your device, but why make your life harder... just debug using the browser's inspector
> Note 2: you should actually run mostly on device or emulator because we rely on many plugins that arenot available in browser. you should only use the browser for layout or anything not relyin on the device. 
use this to get log in the console
```bash
ionic emulate ios -lc
```
