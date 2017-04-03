/******************************************************************************
Victorise Arduino Message Coding
******************************************************************************/

===============================================================================
PART 1. LED Message Format
===============================================================================

_ _ _ ______
1 2 3    4

1. (First Digit) Message Type. 1 for LED message
2. (Second Digit) LED color:
	0: Red (255,0,0)
	1: Lime(Green) (0,255,0)
	2: Blue (0,0,255)
	3: Yellow (255,255,0)
	4: Magenta (255,0,255)
	5: Orange (255,165, 0)
	6:
	7:
	8:
	9:
3. (Third Digit) Blink Interval, in millisecond
	0: keep the LED on
	1: 50
	2: 100
	3: 200
	4: 500
	5: 1000
	6:
	7:
	8:
	9:
4. (4th to 9th Digit, 6 digits in all) Blinking Duration, in millisecond. If it
is 000000, it means keep blinking until next message.

eg:
105010000: Red LED blinks with 1000ms interval for 10 seconds
110100000: Lime LED keeps on for 100 seconds