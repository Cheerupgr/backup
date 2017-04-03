/*********************************************************************
  for nRF51822 based Bluefruit LE modules
*********************************************************************/

#include <string.h>
#include <Arduino.h>
#include <SPI.h>
#include <stdio.h>
#if not defined (_VARIANT_ARDUINO_DUE_X_) && not defined (_VARIANT_ARDUINO_ZERO_)
  #include <SoftwareSerial.h>
#endif

#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "Adafruit_BluefruitLE_UART.h"

#include "BluefruitConfig.h"

#include <Adafruit_NeoPixel.h>



/*=========================================================================
    APPLICATION SETTINGS

      FACTORYRESET_ENABLE       Perform a factory reset when running this sketch
     
                                Enabling this will put your Bluefruit LE module
                              in a 'known good' state and clear any config
                              data set in previous sketches or projects, so
                                running this at least once is a good idea.
     
                                When deploying your project, however, you will
                              want to disable factory reset by setting this
                              value to 0.  If you are making changes to your
                                Bluefruit LE device via AT commands, and those
                              changes aren't persisting across resets, this
                              is the reason why.  Factory reset will erase
                              the non-volatile memory where config data is
                              stored, setting it back to factory default
                              values.
         
                                Some sketches that require you to bond to a
                              central device (HID mouse, keyboard, etc.)
                              won't work at all with this feature enabled
                              since the factory reset will clear all of the
                              bonding data stored on the chip, meaning the
                              central device won't be able to reconnect.
    PIN                       Which pin on the Arduino is connected to the NeoPixels?
    NUMPIXELS                 How many NeoPixels are attached to the Arduino?
    -----------------------------------------------------------------------*/
#define FACTORYRESET_ENABLE     1
#define PIN                     6
#define NUMPIXELS               1
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "MODE"
/*=========================================================================*/

Adafruit_NeoPixel pixel = Adafruit_NeoPixel(NUMPIXELS, PIN);

// Predefined Color for LED
uint32_t RED = pixel.Color(255,0,0);
uint32_t LIME = pixel.Color(0,255,0);
uint32_t BLUE = pixel.Color(0,0,255);
uint32_t YELLOW = pixel.Color(255,255,0);
uint32_t MAGENTA = pixel.Color(255,0,255);
uint32_t ORANGE = pixel.Color(255,165,0);
uint32_t LEDColor[] = {RED, LIME, BLUE, YELLOW, MAGENTA, ORANGE};

boolean isLEDMsg = false;
boolean isBlink = true;
int LEDBlinkInt[] = {0, 50, 100, 200, 500, 1000};
long LEDBlinkDura = 0L;
int LEDBlinkTimes = 0;

// const for button
const int BUTTON_PIN = 5;

// Variables will change:
int buttonPushCounter = 0;   // counter for the number of button presses
int buttonState = 0;         // current state of the button
int lastButtonState = 0;     // previous state of the button

// Create the bluefruit object, either software serial...uncomment these lines

//SoftwareSerial bluefruitSS = SoftwareSerial(BLUEFRUIT_SWUART_TXD_PIN, BLUEFRUIT_SWUART_RXD_PIN);
//
//Adafruit_BluefruitLE_UART ble(bluefruitSS, BLUEFRUIT_UART_MODE_PIN,
//                      BLUEFRUIT_UART_CTS_PIN, BLUEFRUIT_UART_RTS_PIN);

#define BLUEFRUIT_HWSERIAL_NAME           Serial1
/* ...or hardware serial, which does not need the RTS/CTS pins. Uncomment this line */
Adafruit_BluefruitLE_UART ble(Serial1, BLUEFRUIT_UART_MODE_PIN);

/* ...hardware SPI, using SCK/MOSI/MISO hardware SPI pins and then user selected CS/IRQ/RST */
//Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);

/* ...software SPI, using SCK/MOSI/MISO user-defined SPI pins and then user selected CS/IRQ/RST */
//Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_SCK, BLUEFRUIT_SPI_MISO,
//                             BLUEFRUIT_SPI_MOSI, BLUEFRUIT_SPI_CS,
//                             BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);


// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

// function prototypes over in packetparser.cpp
uint8_t readPacket(Adafruit_BLE *ble, uint16_t timeout);
float parsefloat(uint8_t *buffer);
void printHex(const uint8_t * data, const uint32_t numBytes);

// the packet buffer
extern uint8_t packetbuffer[];

/**************************************************************************/
/*!
    @brief  Sets up the HW an the BLE module (this function is called
            automatically on startup)
*/
/**************************************************************************/
void setup(void)
{

  while (!Serial);  // required for Flora & Micro
  delay(2000);

//  // turn off neopixel
//  pixel.begin(); // This initializes the NeoPixel library.
//  for (uint8_t i = 0; i < NUMPIXELS; i++) {
//    pixel.setPixelColor(i, pixel.Color(0, 0, 0)); // off
//  }
//  pixel.show();
//
//  // initialize the button pin as a input:
//  pinMode(BUTTON_PIN, INPUT);

  Serial.begin(115200);
  
  /* Initialise the module */
  Serial.print(F("Initialising the Bluefruit LE module: "));

  if ( !ble.begin(VERBOSE_MODE) )
  {
    error(F("Couldn't find Bluefruit, make sure it's in CoMmanD mode & check wiring?"));
  }
  
  Serial.println( F("OK!") );

  if ( FACTORYRESET_ENABLE )
  {
    /* Perform a factory reset to make sure everything is in a known state */
    Serial.println(F("Performing a factory reset: "));
    if ( ! ble.factoryReset() ) {
      error(F("Couldn't factory reset"));
    }
  }


  /* Disable command echo from Bluefruit */
  ble.echo(false);

  Serial.println("Requesting Bluefruit info:");
  /* Print Bluefruit information */
  ble.info();

    if (! ble.sendCommandCheckOK(F("AT+GAPDEVNAME=Victorise Goggles BLE")) ) {
    error(F("Could not set device name?"));
  }

  Serial.println(F("Please use Adafruit Bluefruit LE app to connect in Controller mode"));
  Serial.println(F("Then activate/use the sensors, color picker, game controller, etc!"));
  Serial.println();

  ble.verbose(false);  // debug info is a little annoying after this point!

  /* Wait for connection */
  while (! ble.isConnected()) {
    delay(500);
  }

  Serial.println(F("***********************"));

  // Set Bluefruit to DATA mode
  //Serial.println( F("Switching to DATA mode!") );
  //ble.setMode(BLUEFRUIT_MODE_DATA);

  Serial.println(F("***********************"));
  
  // LED Activity command is only supported from 0.6.6
  if ( ble.isVersionAtLeast(MINIMUM_FIRMWARE_VERSION) )
  {
    // Change Mode LED Activity
    Serial.println(F("******************************"));
    Serial.println(F("Change LED activity to " MODE_LED_BEHAVIOUR));
    ble.sendCommandCheckOK("AT+HWModeLED=" MODE_LED_BEHAVIOUR);
    Serial.println(F("******************************"));
  }

}

/**************************************************************************/
/*!
    @brief  Constantly poll for new command or response data
*/
/**************************************************************************/
void loop(void)
{
  /*================================================================
 * Code for tag button
================================================================*/
  buttonState = digitalRead(BUTTON_PIN);
 
  // compare the buttonState to its previous state
  if (buttonState != lastButtonState) {
//    buttonPushCounter++;
//    Serial.print("number of button pushes:  ");
//    Serial.println(buttonPushCounter);
    // if the state has changed, increment the counter
    if (buttonState == HIGH) {
      // if the current state is HIGH then the button
      // wend from off to on:
      buttonPushCounter++;
      Serial.println("on");
      Serial.print("number of button pushes:  ");
      Serial.println(buttonPushCounter);
      char TAG[] = {'T', 'A', 'G'};
      ble.print("AT+BLEUARTTX=");
      ble.println(TAG);
    }
    else {
      // if the current state is LOW then the button
      // wend from on to off:
      Serial.println("off");
    }
    // Delay a little bit to avoid bouncing
    delay(50);
  }
  // save the current state as the last state,
  //for next time through the loop
  lastButtonState = buttonState;
 
 
  // turns on the LED every four button pushes by
  // checking the modulo of the button push counter.
  // the modulo function gives you the remainder of
  // the division of two numbers:
//  if (buttonPushCounter % 4 == 0) {
//    digitalWrite(ledPin, HIGH);
//  }
//  else {
//    digitalWrite(ledPin, LOW);
//  }

  
    // Check for user input
  char inputs[BUFSIZE+1];

  if ( getUserInput(inputs, BUFSIZE) )
  {
    // Send characters to Bluefruit
    Serial.print("[Send] ");
    Serial.println(inputs);

    ble.print("AT+BLEUARTTX=");
    ble.println(inputs);

    // check response stastus
    if (! ble.waitForOK() ) {
      Serial.println(F("Failed to send?"));
    }
  }

  // Check for incoming characters from Bluefruit
  ble.println("AT+BLEUARTRX");
  ble.readline();
  if (strcmp(ble.buffer, "OK") == 0) {
    // no data
    return;
  }
  
  // Some data was found, its in the buffer
  Serial.print(F("[Recv] ")); 
  Serial.println(ble.buffer);
  //Serial.print(ble.buffer[0]);

/*================================================================
 * Parsing the received data
================================================================*/
  // Determine message type, 1 for LED Messages
  if (ble.buffer[0] == '1') {
    isLEDMsg = true;
    Serial.print("packet received, LED Messages\n");
  }

/*--------------------------------------------------------------
 * Case1: LED Message
--------------------------------------------------------------*/
  if(isLEDMsg) {
    // Determine LED blink duration
    char tempArr[6];

    // Determine LEK blink or not
    if(ble.buffer[2] == '0') {
      isBlink = false;
    }
    
    for(int i = 0; i < 6; ++i) {
      tempArr[i] = ble.buffer[i+3];
    }

    // please ignore my poor syntax
    LEDBlinkDura = ((tempArr[0] - '0') * 100000L) +
      ((tempArr[1] - '0') * 10000L) +
      ((tempArr[2] - '0') * 1000L) +
      ((tempArr[3] - '0') * 100L) +
      ((tempArr[4] - '0') * 10L) +
      (tempArr[5] - '0');
    
    //sscanf(tempArr, "%d", &LEDBlinkDura);
    Serial.print("LED blink duration: ");
    Serial.print(LEDBlinkDura);
    Serial.print("\n");
    if (isBlink) {
      Serial.print("Blinking\n");
    }
    else {
      Serial.print("Not Blinking\n");
    }

    // Determine LED blink times
    LEDBlinkTimes = LEDBlinkDura / (LEDBlinkInt[ble.buffer[2] - '0'] * 2);
  
    // Let Pixel to blink or stay
    if (isBlink) {
      for (int j = 0; j < LEDBlinkTimes; ++j) {
        pixel.setPixelColor(0, LEDColor[ble.buffer[1] - '0']);
        pixel.show();
        delay(LEDBlinkInt[ble.buffer[2] - '0']);
        pixel.setBrightness(0);
        pixel.show();
        delay(LEDBlinkInt[ble.buffer[2] - '0']);
        pixel.setBrightness(255);
      }
    }
    else {
      pixel.setPixelColor(0, LEDColor[ble.buffer[1] - '0']);
      pixel.show();
      delay(LEDBlinkDura);
      pixel.setBrightness(0);
      pixel.show();
    }
  }
//
//
//  
  isLEDMsg = false;
  isBlink = true;
  LEDBlinkDura = 0L;
  ble.waitForOK();

}

/**************************************************************************/
/*!
    @brief  Checks for user input (via the Serial Monitor)
*/
/**************************************************************************/
bool getUserInput(char buffer[], uint8_t maxSize)
{
  // timeout in 100 milliseconds
  TimeoutTimer timeout(100);

  memset(buffer, 0, maxSize);
  while( (!Serial.available()) && !timeout.expired() ) { delay(1); }

  if ( timeout.expired() ) return false;

  delay(2);
  uint8_t count=0;
  do
  {
    count += Serial.readBytes(buffer+count, maxSize);
    delay(2);
  } while( (count < maxSize) && (Serial.available()) );

  return true;
}


