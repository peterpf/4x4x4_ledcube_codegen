function LED(id, layer, enabled, posX, posY, radius){
	this.id = id;
	this.layer = layer;
	this.enabled = enabled;
	this.posX = posX;
	this.posY = posY;
	this.radius = radius;
}
LED.COLOR_ON = '#76ff03';
LED.COLOR_OFF = '#000';
LED.RADIUS = null;

LED.prototype.toggle = function(enabled) {
	if((typeof enabled == 'undefined') || (typeof enabled == null)) {
		this.enabled = !this.enabled;
	}else{
		this.enabled = enabled;
	}
};
LED.prototype.contains = function(posX, posY){
	return posX >= this.posX - LED.RADIUS && posX <= this.posX + LED.RADIUS && posY >= this.posY - LED.RADIUS && posY <= this.posY + LED.RADIUS;
};
LED.prototype.setPosition = function(x, y){
	this.posX = x;
	this.posY = y;
}
LED.prototype.setRadius = function(rad){
	this.radius = rad;
}


var MATRIX_SIZE = 4;
var SPACING = 6;
var ledList = [];

function initLEDs(){
	var radius = (canvasDiv.offsetWidth > canvasDiv.offsetHeight ? canvasDiv.offsetHeight : canvasDiv.offsetWidth) / (MATRIX_SIZE * 2) - SPACING;
	LED.RADIUS = radius;
	for(var layer = 0, i = 0; layer < MATRIX_SIZE; layer++) {
		for(var x = 0; x < MATRIX_SIZE; x++) {
			for(var y = 0; y < MATRIX_SIZE; y++, i++) {
				var posX = radius + SPACING + (radius * 2  + SPACING) * x;
				var posY = radius + SPACING + (radius * 2  + SPACING) * y;
				ledList[i] = new LED(i, layer, false, posX, posY, radius);
			}
		}
	}
}
function calculateLEDPositions(){
	var radius = (canvasDiv.offsetWidth > canvasDiv.offsetHeight ? canvasDiv.offsetHeight : canvasDiv.offsetWidth) / (MATRIX_SIZE * 2) - SPACING;
	LED.RADIUS = radius;
	for(var layer = 0, i = 0; layer < MATRIX_SIZE; layer++) {
		for(var x = 0; x < MATRIX_SIZE; x++) {
			for(var y = 0; y < MATRIX_SIZE; y++, i++) {
				var posX = radius + SPACING + (radius * 2  + SPACING) * x;
				var posY = radius + SPACING + (radius * 2  + SPACING) * y;
				var led = ledList[i];
				led.setPosition(posX, posY);
			}
		}
	}
}


var btn_selectLayer_list = [
	document.getElementById('btn_sel_l_0'),
	document.getElementById('btn_sel_l_1'),
	document.getElementById('btn_sel_l_2'),
	document.getElementById('btn_sel_l_3')
];
var layerList = [0, 1, 2, 3];
var selectedLayer = 0;


function selectLayer(index){
	if(index >= 0 && index < layerList.length) {
		selectedLayer = layerList[index];
	}
	for(var i = 0; i < btn_selectLayer_list.length; i++){
		var btn = btn_selectLayer_list[i];
		if(selectedLayer == i){
			btn.classList.add('mdl-button--colored');
			btn.classList.add('mdl-button--raised');
		}else{
			btn.classList.remove('mdl-button--colored');
			btn.classList.remove('mdl-button--raised');
		}
	}
}

function getLED(posX, posY){
	for(var i = 0; i < ledList.length; i++) {
		var led = ledList[i];
		if(led.layer == selectedLayer && led.contains(posX, posY)){
			return led;
		}
	}
}
function setLEDs(statusList){
	if(statusList.length != ledList.length){ return; }
	for(var i = 0; i < statusList.length; i++){
		ledList[i].enabled = statusList[i];
	}
}

function toggleAllLEDs(){
	for(var i = 0; i < ledList.length; i++) {
		ledList[i].toggle();
	}
}
function disableAllLEDs(){
	for(var i = 0; i < ledList.length; i++) {
		ledList[i].toggle(false);
	}
}
function enableAllLEDs(){
	for(var i = 0; i < ledList.length; i++) {
		ledList[i].toggle(true);
	}
}