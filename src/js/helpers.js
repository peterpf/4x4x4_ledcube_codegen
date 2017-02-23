var FILE_NAME = "code";
var FILE_TYPE = "txt";
var DEFAULT_DELAY = 80; // 80 is a good value for fluent transitions
var patternListElement = document.getElementById('pattern-list');
var patternList = [];
var delayList = [];
var selectedPattern;


function uploadCode() {
	console.log("TODO: Implement uploadCode()");
}
function downloadCode() {
	var outputText = ''
		+'#define LAYER_NONE 0x00\n'
		+'#define LAYER_1 0\n'
		+'#define LAYER_2 1\n'
		+'#define LAYER_3 2\n'
		+'#define LAYER_4 3\n'
		+'#define NUM_REGISTERS 2 // Number of registers\n'
		+'\n'
		+'const int clockPin = 5; // Pin connected to SH_CP of 74HC595\n'
		+'const int latchPin = 6; // Pin connected to ST_CP of 74HC595\n'
		+'const int dataPin = 7; // Pin connected to DS of 74HC595\n'
		+'const int layer_pins[] = {13, 12, 11, 10 }; // LAYER_1 ... LAYER_4\n'
		+'const int layer_pins_length = sizeof(layer_pins) / sizeof(int);\n'
		+'\n'
		+'byte* data = new byte[NUM_REGISTERS];\n'
		+'\n'
		+'void setup(){\n'
		+'  pinMode(latchPin, OUTPUT);\n'
		+'  pinMode(clockPin, OUTPUT);\n'
		+'  pinMode(dataPin, OUTPUT);\n'
		+'  for(int i = 0; i < layer_pins_length; i++){ pinMode(layer_pins[i], OUTPUT); }\n'
		+'  resetAll();\n'
		+'  delay(500);\n'
		+'}\n'
		+ '/**\n'
		+ ' * Set ONE layer as enabled.\n'
		+ ' * Pass LAYER_NONE to disable all layers, otherwise pass either LAYER_1, LAYER_2, LAYER_3 or LAYER_4.\n'
		+ ' * @param layer The index (0 to 3) of the layer, refering to the layer_pins array.\n'
		+ ' */\n'
		+'void setLayer(int layer){\n'
		+'  for(int i = 0; i < layer_pins_length; i++){ digitalWrite(layer_pins[i], layer == i ? HIGH : LOW); }\n'
		+'}\n'
		+'/**\n'
		+' * Write the data to the register.\n'
		+' * @param date The data which is pushed into the register.\n'
		+' */\n'
		+'void updateRegister(){\n'
		+'  digitalWrite(latchPin, LOW);\n'
		+'  shiftOut(dataPin, clockPin, MSBFIRST, *(data+1));\n'
		+'  shiftOut(dataPin, clockPin, MSBFIRST, *data);\n'
		+'  digitalWrite(latchPin, HIGH);\n'
		+'}\n'
		+'/**\n'
		+' * Reset all outputs so nothing is displayed.\n'
		+' */\n'
		+'void resetAll(){\n'
		+'  setLayer(LAYER_NONE);\n'
		+'  *data = 0x00; *(data+1) = 0x00;\n'
		+'  updateRegister();\n'
		+'}\n'
		+'\n';
	saveCurrentPatternToList();
	var patternCode = []; // This array contains the layers
	for(var i = 0; i < patternList.length; i++){ // Loop through each pattern
		var pattern = patternList[i].status;
		var layers = []; // Save the stati (enabled: true/false) in this array, separated in layers (layers.length = 4)
		for(var j = 0; j < pattern.length; j++){ // Loop through the LEDs of a pattern
			var enabled = pattern[j];
			var layer_id = Math.floor(j / 16);
			var led_id = j - layer_id*16; // The LED's ID relative to the layer -> LED 16 in Layer 2 gets ID 0
			var led_value = Math.pow(2, led_id); // The binary value of the LED's index (e.g. index 3 -> 2^3=b8)
			if(!layers[layer_id]){ layers[layer_id] = 0; }
			layers[layer_id] +=  enabled ? led_value : 0;
		}
		patternCode.push(layers);
	}

	outputText += 'const int values['+patternCode.length+'][4][2] = {\n' + patternCode.map(function(pattern){ return '  {' + pattern.map(function(layer){return '{' + (layer&0xFF) + ',' + ((layer&0xFF00)>>8) + '}';}) + '}\n'; }) + '};' + '\n';
	outputText += 'const int delays['+patternList.length+'] = {' + patternList.map(function(pattern){ return pattern.delay; })+ '};\n';
	
	outputText += ''
		+ 'void loop(){\n'
		+ '  for(int i = 0; i < '+patternCode.length + '; i++){\n'
		+ '    for(int j=0; j<delays[i]; j++){\n'
		+ '      for(int k=0; k<4; k++){\n'
		+ '        *data = values[i][k][0];\n'
		+ '        *(data+1) = values[i][k][1];\n'
		+ '        updateRegister(); setLayer(k);\n'
		+ '      }\n'
		+ '    }\n'
		+ '  }\n'
		+ '}';
	console.log(outputText);

	var blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
	// saveAs(blob, FILE_NAME + "." + FILE_TYPE);
}



function initPattern(){
	addPattern();
	selectPattern(patternList[patternList.length-1].id);
}
function addPattern(){
	// Save LEDs to current selected pattern
	saveCurrentPatternToList();

	var index = 0;
	for(var i = 0; i < patternList.length; i++){
		if(patternList[i].id > index){
			index = patternList[i].id;
		}
	}

	var stati = ledList.map(function(led){ return led.enabled;});
	var newPattern = { id: index+1, status: stati, delay: DEFAULT_DELAY };
	patternList.push(newPattern);
	var li = document.createElement('li');
	li.classList.add('mdl-list__item');
	li.setAttribute('onclick', 'selectPattern(' + newPattern.id + ')');
	li.setAttribute('id', 'pattern_' + newPattern.id);
	li.innerHTML = 'Pattern ' + newPattern.id;
	patternListElement.appendChild(li);

	selectPattern(newPattern.id);
}
function removePattern(){
	if(patternList.length <= 1 || !selectedPattern){
		return;
	}
	var child = document.getElementById('pattern_' + selectedPattern.id);
	patternList.splice(patternList.indexOf(selectedPattern), 1);
	patternListElement.removeChild(child);
	selectedPattern = null;
	selectPattern(patternList[patternList.length-1].id);
}
function selectPattern(patternID){
	saveCurrentPatternToList();
	var pattern = getPatternFromListById(patternID);
	setLEDs(pattern.status);
	if(selectedPattern){
		var oldPatterElement = document.getElementById('pattern_'+selectedPattern.id);
		oldPatterElement.classList.remove('selected');
	}
	var patternElement = document.getElementById('pattern_'+pattern.id);
	patternElement.classList.add('selected');
	selectedPattern = pattern;
}

function getPatternFromListById(patternID){
	for(var i = 0; i < patternList.length; i++){
		if(patternList[i].id == patternID){ return patternList[i]; }
	}
	return null;
}

function saveCurrentPatternToList(){
	if(!selectedPattern){ return; }

	var stati = ledList.map(function(led){ return led.enabled;});
	var currentPattern = getPatternFromListById(selectedPattern.id);
	currentPattern.status = stati;
	currentPattern.delay = DEFAULT_DELAY;
}