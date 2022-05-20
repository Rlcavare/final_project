// Written by Robert Cavaretta 5/1/22
let debug_mode = true;

// Set up the grid
let GRID_WIDTH = 30
let GRID_HEIGHT = 30
let PIXEL_SIZE = 25
var GAME_HTML = $("#game");

// Used to track current color
var selected_color = "rgb(0, 0, 0)"


function game_setup() {

	let game_grid = '<div id="container" style="background-color: #333;' +
		'  height:100%;' +
		'  width: 100%;' +
		'  overflow:hidden;' +
		'  position:relative;">' +
		'<div class="col" id="game_col"' +
		' style="border: dotted;' +
			' width: ' + ((PIXEL_SIZE * GRID_WIDTH) + 10)+ 'px;">' +
		'</div></div>'
	GAME_HTML.append(game_grid)

	for (let i = 0; i < GRID_HEIGHT; i++) {
		// Add column
		$('#game_col').append("<div class='row' id='row_" + i +"'></div>")
		for (let j = 0; j < GRID_WIDTH; j++) {
			$('#row_'+ i).append('<div id="row_' + i + '_col_' + j + '" ' +
				'class="col" ' +
				'style="background: ' + rgb(255, 255 , 255) +'; width: ' + PIXEL_SIZE +
				'px; height: ' + PIXEL_SIZE + 'px;  border: ridge; border-width: thin;"' +
				'</div>')

		}
	}


	update();
}

game_setup()

function update() {
	Draggable.create("#game_col", {
		bounds:GAME_HTML,
		edgeResistance:0.65,
		type:"x,y",
		throwProps:true,
		onClick: function(obj) {
			gridClicked(obj.target)
		},
    autoScroll:true,
	});

	// Draggable.create(".col", {
	// 	bounds: wd,
	// 	edgeResistance:0.65,
	// 	type:"null",
	// 	throwProps:true,
	// 	autoScroll:true,
	// 	lockAxis: true,
	// 	// onDrag: function() {
	// 	// 	console.log("dragged")
	// 	// },
	// 	onClick: function (test) {
	// 		console.log(test)
	// 	}
	// });
}


function gridClicked(grid_item){
	$('#' + grid_item.id).css({
		"background-color": selected_color,
	})
	logger(grid_item.id);
}


// This funtion will set the current color based on the button clicked
function buttonClicked(button_info){
	let text_color = rgb(0,0,0);
	let color_of_button = button_info.style['background'];

	// Set the selected color to the color of the button that was clicked
	selected_color = color_of_button;

	// Check if background is too dark to see text
	if (lightOrDark(selected_color) == 'dark') {
		text_color = rgb(255,255,255);
	}

	// jquery the current_color heading and change the text, background
	$('#current_color').text('Current color: ' + selected_color);
	$('#current_color').css({
		"background-color": selected_color,
		"color": text_color
	})

	//Debug logger
	logger("color_of_button: " + color_of_button);
	logger("selected_color: " + selected_color);
	logger("lightOrDark: " + lightOrDark(selected_color));
}

// <------- HELPER FUNCTIONS ------->

// This function will return a rgb css styled string
function rgb(r, g, b){
	return "rgb("+r+","+g+","+b+")";
}

//This function will print text to console if debugging mode is true
function logger(str){
	if (debug_mode == true) {
		console.log("DEBUG: " + str);
	}
}

// This function will check if a background is dark or light
function lightOrDark(color) {
	// https://awik.io/determine-color-bright-dark-using-javascript/
	// Variables for red, green, blue values
	var r, g, b, hsp;

	// Check the format of the color, HEX or RGB?
	if (color.match(/^rgb/)) {
		// This isn't complicated just some regular expression
		// If RGB --> store the red, green, blue values in separate variables
		color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
		r = color[1];
		g = color[2];
		b = color[3];
	}
	else {
		// If hex --> Convert it to RGB: http://gist.github.com/983661
		color = +("0x" + color.slice(1).replace(
			color.length < 5 && /./g, '$&$&'));
		r = color >> 16;
		g = color >> 8 & 255;
		b = color & 255;
	}

	// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
	hsp = Math.sqrt(
		0.299 * (r * r) +
		0.587 * (g * g) +
		0.114 * (b * b)
	);

	// Using the HSP value, determine whether the color is light or dark
	if (hsp>127.5) {
		return 'light';
	}
	else {
		return 'dark';
	}
}