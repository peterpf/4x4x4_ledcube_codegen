#define DELAY 400 // Default: 80ms

#define LAYER_NONE 0x00
#define LAYER_1 0
#define LAYER_2 1
#define LAYER_3 2
#define LAYER_4 3

#define NUM_REGISTERS 2 // Number of registers

// Pin connected to SH_CP of 74HC595
const int clockPin = 5;
// Pin connected to ST_CP of 74HC595
const int latchPin = 6;
// Pin connected to DS of 74HC595
const int dataPin = 7;

const int layer_pins[] = {13, 12, 11, 10 }; // LAYER_1 ... LAYER_4
const int layer_pins_length = sizeof(layer_pins) / sizeof(int);

byte* data = new byte[2];

void setup(){
	// Set data pins as output to control the shift-register
	pinMode(latchPin, OUTPUT);
	pinMode(clockPin, OUTPUT);
	pinMode(dataPin, OUTPUT);

	// Set layer-pins as output
	for(int i = 0; i < layer_pins_length; i++){ pinMode(layer_pins[i], OUTPUT); }

	resetAll();
	// selfTest();
	// resetAll();
	delay(1000);
}

// The state of the register
byte* registerState = new byte[NUM_REGISTERS];


/**
 * Set ONE layer as enabled.
 * Pass LAYER_NONE to disable all layers, otherwise pass either LAYER_1, LAYER_2, LAYER_3 or LAYER_4.
 * @param layer The index (0 to 3) of the layer, refering to the layer_pins array.
 */
void setLayer(int layer){
	for(int i = 0; i < layer_pins_length; i++){
		digitalWrite(layer_pins[i], layer == i ? HIGH : LOW);
	}
}
/**
 * Write the data to the register.
 * @param date The data which is pushed into the register.
 */
void updateRegister(){
	digitalWrite(latchPin, LOW);
	shiftOut(dataPin, clockPin, MSBFIRST, *(data+1));
	shiftOut(dataPin, clockPin, MSBFIRST, *data);
	digitalWrite(latchPin, HIGH);
}

/**
 * Reset all outputs so nothing is displayed.
 */
void resetAll(){
	setLayer(LAYER_NONE);
	*data = 0x00;
	*data+2 = 0x00;
	updateRegister();
}

/**
 * Loops the layers for a specific time.
 * @param dt Time which should be looped
 */
void loopLayer(int dt){
	for(int t = 0; t < dt; t+=layer_pins_length){
		for(int i = 0; i < layer_pins_length; i++){
			digitalWrite(layer_pins[i], HIGH);
			delay(1);
			digitalWrite(layer_pins[i], LOW);
		}
	}
}

/**
 * Run a self-test. Light up every single LED.
 */
void selfTest(){
	for(int i = 1; i < 256; i*=2){
		*data = i;
		*(data+1) = i/16;
		updateRegister();
		loopLayer(500);
	}
}

// #################################
// ######   MAIN PROGRAM   #########
// #################################
void loop(){
	*data = 0x60;
	*(data+1) = 0x60;
	updateRegister();
	loopLayer(500);

	*data = 0x06;
	*(data+1) = 0x06;
	updateRegister();
	loopLayer();
}