// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is Nordic's UART service
var bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

var BLEapp = {
    initialize: function() {
        console.log("BLEapp Initialize -------------------------------");
        //this.bindEvents();
       // detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        var refreshButton = angular.element( document.querySelector('#refreshButton'));
        //refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        //sendButton.addEventListener('click', this.sendData, false);
        //disconnectButton.addEventListener('touchstart', this.disconnect, false);
        //deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling

        //danger.addEventListener('click', this.danger, false);
    },
    onDeviceReady: function() {
        BLEapp.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empties the list
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, BLEapp.onDiscoverDevice, BLEapp.onError);
        } else {
            ble.scan([bluefruit.serviceUUID], 5, BLEapp.onDiscoverDevice, BLEapp.onError);
        }
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId,
            onConnect = function(peripheral) {
                BLEapp.determineWriteType(peripheral);

                // subscribe for incoming data
                ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, BLEapp.onData, BLEapp.onError);
                sendButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                resultDiv.innerHTML = "";
                BLEapp.showDetailPage();
            };

        ble.connect(deviceId, onConnect, BLEapp.onError);
    },
    determineWriteType: function(peripheral) {
        // Adafruit nRF8001 breakout uses WriteWithoutResponse for the TX characteristic
        // Newer Bluefruit devices use Write Request for the TX characteristic

        var characteristic = peripheral.characteristics.filter(function(element) {
            if (element.characteristic.toLowerCase() === bluefruit.txCharacteristic) {
                return element;
            }
        })[0];

        if (characteristic.properties.indexOf('WriteWithoutResponse') > -1) {
            BLEapp.writeWithoutResponse = true;
        } else {
            BLEapp.writeWithoutResponse = false;
        }

    },
    onData: function(data) { // data received from Arduino
        console.log(data);
        resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },

    danger: function(event) {

        var success = function() {
            console.log("success");
            alert("success");
        };

        var failure = function() {
            alert("Failed writing data to the bluefruit le");
        };

        var dangerArr = new Uint8Array(3);
        dangerArr[0] = 0xFF;
        dangerArr[1] = 0X00;
        dangerArr[2] = 0xFF;
        // var aStr = '!B1';
        // var data = stringToBytes(aStr);
        var deviceId = event.target.dataset.deviceId;

        var data = new Uint8Array(1);
        data[0] = 1;
        ble.write(deviceId, "FF10", "FF11", data.buffer, success, failure);

        // if (BLEapp.writeWithoutResponse) {
        //     ble.writeWithoutResponse(
        //         deviceId,
        //         "ccc0", "ccc1",
        //         dangerArr.buffer, success, failure
        //     );
        // } else {
        //     ble.write(
        //         deviceId,
        //         "ccc0", "ccc1",
        //         dangerArr.buffer, success, failure
        //     );
        // }
        //ble.write(deviceId, "ccc0", "ccc1", dangerArr.buffer, success, failure);
        console.log("DANGER!!!!");
    },

    sendData: function(event) { // send data to Arduino

        var success = function() {
            console.log("success");
            resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + messageInput.value + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function() {
            alert("Failed writing data to the bluefruit le");
        };

        var data = stringToBytes(messageInput.value);
        var deviceId = event.target.dataset.deviceId;

        if (BLEapp.writeWithoutResponse) {
            ble.writeWithoutResponse(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        } else {
            ble.write(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        }

    },

    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, BLEapp.showMainPage, BLEapp.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
