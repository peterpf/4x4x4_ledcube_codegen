var canvas = document.getElementById('canvas');
var ctx = null;
if(canvas.getContext){
	ctx = canvas.getContext('2d');
}else{
	window.alert("Browser does not support canvas.getContext() !");
}


var CANVAS_WIDTH = 150;
var CANVAS_HEIGHT = 150;
var matrix_size = 4; // matrix: matrix_size * matrix_size * matrix_size
var LAYERS = [ 0, 1, 2, 3];
var COLOR_ON = { r:0, g:255, b:0 };
var COLOR_OFF = { r:0, g:0, b:0 };
var leds = [];

var spacing = 2; // In Pixels - the space between the circle
var radius = 15;


function LED(id, posX, posY, layer, enabled){
	this. id = id;
	this.x = posX;
	this.y = posY;
	this.layer = layer;
	this.enabled = enabled;
}
LED.prototype.draw = function(context){
	context.beginPath();
	context.arc(this.x, this.y, radius, 0, 2*Math.PI, false);
	var alpha = selectedLayer == this.layer ? 1 : 0.08;
	context.fillStyle = this.enabled ? "rgba("+COLOR_ON.r+","+COLOR_ON.g+","+COLOR_ON.b+","+alpha+")" : "rgba("+COLOR_OFF.r+","+COLOR_OFF.g+","+COLOR_OFF.b+","+alpha+")";
	context.fill();
	context.strokeStyle = "rgba(0,0,0, "+alpha+")";
	context.stroke();
	context.closePath();
}
LED.prototype.toggle = function(enabled){
	if(typeof enabled == 'undefined' || (typeof enabled == null)){
	 	this.enabled = !this.enabled;
	}else{
	 	this.enabled = enabled;
	}
}
LED.prototype.contains = function(posX, posY){
	return posX >= this.x - radius && posX <= this.x + radius && posY >= this.y - radius && posY <= this.y + radius;
}
// Return the LED of a given position and selected layer, return null for no result
function getLED(posX, posY, layer){
	for (var i = 0; i < leds.length; i++) {
		var led = leds[i];
		if(led.contains(posX, posY) && led.layer == layer){
			return led;
		}
	}
	return null;
}

function init(){
	console.log("init");
	for (var x = 0, i=0; x < matrix_size; x++) {
		for (var y = 0; y < matrix_size; y++) {
			for (var z = 0; z < matrix_size; z++, i++) {
				var posX = spacing + radius + (spacing + radius*2)*x + (spacing + radius)*z/3;
				var posY = spacing + radius + (spacing + radius*2)*y + (spacing*2 + radius + (spacing + radius*2)/4)*z/3;
				leds[i] = new LED(i, posX, posY, z, false);
			}
		}
	}

}

var patternList = document.getElementById('pattern-list');
function populateDummyList(count){
	for (var i = 0; i < count; i++) {
		var li = document.createElement('li');
		var c = document.createElement('canvas');
		c.setAttribute('width', 150);
		c.setAttribute('height', 150);
		var destCtx = c.getContext('2d');
		destCtx.drawImage(canvas, 0, 0, 150, 150 * canvas.height/canvas.width);
		//li.innerHTML = ""+list[i].id;
		li.appendChild(c);
		patternList.appendChild(li);
	}
}

var selectedLayer = 0;
var selectedLayerDOMElement = document.getElementById('selectedLayer');
function selectLayer(layerId){
	if(selectedLayer != layerId){
		selectedLayer = layerId;
		//selectedLayerDOMElement.innerHTML = selectedLayer+1; // Offset +1 to start count at 1 (and not 0)
		repaint();
	}
}
function repaint(){
	console.log("repaint");
	if(!ctx){
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var c_width = canvas.getAttribute('width');
	var c_height = canvas.getAttribute('height');

	for (var i=0; i < leds.length; i++) {
		leds[i].draw(ctx);
	}
}

// ##################
// ## Resize Logic ##
// ##################
function resizeCanvas(){
	canvas.setAttribute('width', canvas.parentElement.clientWidth);
	canvas.setAttribute('height', canvas.parentElement.clientHeight);
	// TODO: Implement resize LED-radius
}


// #################
// ## Input Logic ##
// #################
var lastFocusElement = canvas;
canvas.addEventListener('click', function(event){
	if(isMouseDown == false){
		return;
	}
	lastFocusElement = canvas;
	var mouseX = event.offsetX;
	var mouseY = event.offsetY;
	for(var i = 0; i < leds.length; i++){
		var led = leds[i];
		if(led.contains(mouseX, mouseY) && led.layer == selectedLayer){
			led.toggle();
			repaint();
		}
	}
}, false);
var ledOnMouseDown = null;
var isMouseDown = false;
canvas.addEventListener('mousedown', function(event){
	isMouseDown = true;
	var mouseX = event.offsetX;
	var mouseY = event.offsetY;
	ledOnMouseDown = getLED(mouseX, mouseY, selectedLayer);
	if(ledOnMouseDown){
		ledOnMouseDown.toggle();
		repaint();
	}
}, false);
canvas.addEventListener('mouseup', function(event){
	isMouseDown = false;
});
canvas.addEventListener('mousemove', function(event){
	if(!isMouseDown || !ledOnMouseDown){
		event.preventDefault();
		return;
	}
	var mouseX = event.offsetX;
	var mouseY = event.offsetY;
	var led = getLED(mouseX, mouseY, selectedLayer);
	if(led && led.id != ledOnMouseDown.id){
		led.toggle(ledOnMouseDown.enabled);
		ledOnMouseDown = led;
		repaint();
	}
}, false);
document.addEventListener('keydown', function(event){
	if(lastFocusElement == canvas){
		var keyChar = String.fromCharCode(event.keyCode);
		switch(event.keyCode){
			case 49: event.preventDefault(); selectLayer(LAYERS[0]); break; // 1
			case 50: event.preventDefault(); selectLayer(LAYERS[1]); break; // 2
			case 51: event.preventDefault(); selectLayer(LAYERS[2]); break; // 3
			case 52: event.preventDefault(); selectLayer(LAYERS[3]); break; // 4
			case 38: event.preventDefault(); increaseLayerValue(); break; // Arrow up
			case 40: event.preventDefault(); decreaseLayerValue(); break; // Arrow down
			default:  break;
		}
	}
}, false);

window.addEventListener('load', function(event){
	resizeCanvas();
	init();

	// selectLayer(0); // Selected layer is alreay 1
	repaint();
	populateDummyList(5);
});
window.addEventListener('resize', function(event){
	resizeCanvas();
	repaint();
});
