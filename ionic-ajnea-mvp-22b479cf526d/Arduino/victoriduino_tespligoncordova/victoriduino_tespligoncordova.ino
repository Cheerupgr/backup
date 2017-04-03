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


/**************************************************************************/
/*!
    @brief  Sets up the HW an the BLE module (this function is called
            automatically on startup)
*/
/**************************************************************************/
void setup(void)
{
  Serial.begin(9600);
  pixel.begin();
  pixel.show(); // Initialize all pixels to 'off'.
   ble.begin(115200);  // The Bluetooth Mate defaults to 115200bps
  ble.print("$$$");  // Enter command mode
  delay(100);  // Short delay, wait for the Mate to send back CMD
  ble.println("U,9600,N");  // Temporarily Change the baudrate to 9600, no parity
  // 115200 can be too fast at times for NewSoftSerial to relay the data reliably
  ble.begin(9600);  // Start bluetooth serial at 9600
   Serial.println( F("OK!") );
      if (! ble.sendCommandCheckOK(F("AT+GAPDEVNAME=testjj")) ) {
    error(F("Could not set device name?"));
  }


}

/**************************************************************************/
/*!
    @brief  Constantly poll for new command or response data
*/
/**************************************************************************/
void loop(void)
{
   int red = 0;
  int green = 0;
  int blue = 0;

  if (ble.find("c")) {
    red = ble.parseInt();  // parses numeric characters before the comma
    green = ble.parseInt();// parses numeric characters after the comma
    blue = ble.parseInt(); // parses numeric characters after the comma
    
    Serial.print("Setting color to: " ); // print to console for debugging
    Serial.print(red);Serial.print(", ");
    Serial.print(green);Serial.print(", ");
    Serial.println(blue);
    
   // showColor(red, green, blue);
  }


  

  /* Wait for new data to arrive
    uint8_t len = readPacket(&ble, BLE_READPACKET_TIMEOUT);
    //if (len == 0) return;

    // Got a packet!
    // printHex(packetbuffer, len);

    // Color
    if (packetbuffer[1] == 'C') {
    uint8_t red = packetbuffer[2];
    uint8_t green = packetbuffer[3];
    uint8_t blue = packetbuffer[4];
    Serial.print ("RGB #");
    if (red < 0x10) Serial.print("0");
    Serial.print(red, HEX);
    if (green < 0x10) Serial.print("0");
    Serial.print(green, HEX);
    if (blue < 0x10) Serial.print("0");
    Serial.println(blue, HEX);


     pixel.setPixelColor(0, pixel.Color(red,green,blue));
    pixel.show(); // This sends the updated pixel color to the hardware.

    */






    


}


