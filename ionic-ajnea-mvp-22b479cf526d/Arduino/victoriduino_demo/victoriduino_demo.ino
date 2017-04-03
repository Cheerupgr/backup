/*********************************************************************
  for nRF51822 based Bluefruit LE modules
*********************************************************************/

#include <string.h>
#include <Arduino.h>

#include <SPI.h>
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
/*=========================================================================*/

Adafruit_NeoPixel pixel = Adafruit_NeoPixel(NUMPIXELS, PIN);

// Create the bluefruit object, either software serial...uncomment these lines
/*
  SoftwareSerial bluefruitSS = SoftwareSerial(BLUEFRUIT_SWUART_TXD_PIN, BLUEFRUIT_SWUART_RXD_PIN);

  Adafruit_BluefruitLE_UART ble(bluefruitSS, BLUEFRUIT_UART_MODE_PIN,
                      BLUEFRUIT_UART_CTS_PIN, BLUEFRUIT_UART_RTS_PIN);
*/

/* ...or hardware serial, which does not need the RTS/CTS pins. Uncomment this line */
// Adafruit_BluefruitLE_UART ble(BLUEFRUIT_HWSERIAL_NAME, BLUEFRUIT_UART_MODE_PIN);

/* ...hardware SPI, using SCK/MOSI/MISO hardware SPI pins and then user selected CS/IRQ/RST */
Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);

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


const int  buttonPin = 5;    // the pin that the pushbutton is attached to
// Variables will change:
int buttonPushCounter = 0;   // counter for the number of button presses
int buttonState = 0;         // current state of the button
int lastButtonState = 0;     // previous state of the button

#include <RBD_Timer.h> // https://github.com/alextaujenis/RBD_Timer

RBD::Timer timer;
int minute =0;
/**************************************************************************/
/*!
    @brief  Sets up the HW an the BLE module (this function is called
            automatically on startup)
*/
/**************************************************************************/
void setup(void)
{

  // initialize the button pin as a input:
  pinMode(buttonPin, INPUT);

  //while (!Serial);  // required for Flora & Micro
  delay(500);

  // turn off neopixel
  pixel.begin(); // This initializes the NeoPixel library.
  for (uint8_t i = 0; i < NUMPIXELS; i++) {
    pixel.setPixelColor(i, pixel.Color(0, 0, 0)); // off
  }
  pixel.show();

  Serial.begin(115200);
 // Serial.println(F("Ho, Bluefruit Neopixel Color Picker Example"));
  //Serial.println(F("------------------------------------------------"));

  /* Initialise the module */
 
  
  timer.setTimeout(5000);
  timer.restart();


}

/**************************************************************************/
/*!
    @brief  Constantly poll for new command or response data
*/
/**************************************************************************/
void loop(void)
{


if(timer.onRestart()) {
  

 
    
    if (minute==1) {pixel.setPixelColor(0, pixel.Color(0,200,0));timer.setTimeout(50000); minute=0;}else
    if (minute==0) {pixel.setPixelColor(0, pixel.Color(200,0,0));timer.setTimeout(50000);minute++;}
    pixel.show(); // This sends the updated pixel color to the hardware.
     Serial.println("Three seconds passed");
     
     delay(40000);
     pixel.setPixelColor(0, pixel.Color(0,0,0));
      pixel.show();
  }



  




    


}


