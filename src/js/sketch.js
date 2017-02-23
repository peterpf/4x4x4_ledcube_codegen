var p5Canvas;
var canvasDiv;



function setup() {
	canvasDiv = document.getElementById('canvas-holder');
	p5Canvas = createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
	p5Canvas.parent('canvas-holder');

	frameRate(30);

	initLEDs();
	selectLayer(0);

	initPattern();
}

function draw(){
	background(255, 255, 255);
	for(var i = 0; i < ledList.length; i++) {
		var led = ledList[i];
		if(selectedLayer == led.layer){
			var color = led.enabled ? LED.COLOR_ON : LED.COLOR_OFF;
			fill(color);
			ellipse(led.posX, led.posY, LED.RADIUS*2);
		}
	}
}

var LEDOnMouseDown = null;
function mousePressed(){
	LEDOnMouseDown = getLED(mouseX, mouseY);
	if(LEDOnMouseDown){
		LEDOnMouseDown.toggle();
	}
	return false;
}
function mouseDragged(){
	if(!LEDOnMouseDown){
		return false;
	}
	var led = getLED(mouseX, mouseY);
	if(led && led.id != LEDOnMouseDown.id){
		led.toggle(LEDOnMouseDown.enabled);
		ledOnMouseDown = led;
	}
	return false;
}

window.onresize = function(){
	resizeCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
	calculateLEDPositions();
}