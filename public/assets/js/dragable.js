// Written by Robert Cavaretta 5/1/22
let debug_mode = false

// Set up the grid
let GRID_WIDTH = 30
let GRID_HEIGHT = 30
let PIXEL_SIZE = 25
let TIME_INT = 5
let time_seconds = TIME_INT;
let wait_for_countdown = false

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
			' width: ' + ((PIXEL_SIZE * GRID_WIDTH) + 10 + 2)+ 'px;">' +
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


	// Update the grid colors
	setInterval(function() {
		fetch('/grid', {method: 'GET'})
			.then(function(response) {
				if(response.ok) return response.json();
				throw new Error('Request failed.');
			})
			.then(function(data) {
				for (let i = 0; i < data.length; i++){
					$(`#${data[i]._id}`).css({
						"background-color": data[i].color,
					})
				}
			})
			.catch(function(error) {
				console.log(error);
			});
	}, 400);

	// Update chat
	setInterval(function() {
		fetch('/chat', {method: 'GET'})
			.then(function(response) {
				if(response.ok) return response.json();
				throw new Error('Request failed.');
			})
			.then(function(data) {
				// Clear the chat
				$("#chat_list").empty()
				for (let i = 0; i < data.length; i++){
					$("#chat_list").prepend(`
						<li style="cursor: pointer;margin-top: 8px;">
							<div class="card border-0">
								<div class="card-body">
									<h4 class="text-nowrap text-truncate text-start card-title"> ${data[i].uuid} </h4>
									<h6 class="text-nowrap text-truncate text-muted card-subtitle mb-2" style="font-size: .7rem;"> ${data[i].time} </h6>
									<p class="lh-1"> ${data[i].msg} </p>
								</div>
							</div>
						</li>`)
				}
			})
			.catch(function(error) {
				console.log(error);
			});
	}, 1000);


	// Update countdown
	setInterval(function() {
		if (wait_for_countdown){
			if (time_seconds <= 0){
				if ($(".alert").length > 0){
					$(".alert").alert('close')
				}
				time_seconds = TIME_INT
				$("#timer").text(`Ready`)
				wait_for_countdown = false
			} else {
				time_seconds--;
				$("#timer").text(`0:${time_seconds.toString().padStart(2, "0")}`)
			}
			logger(time_seconds)
		}
	}, 1000);

	update();
	checkUUID();
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
}

// This function will send a message to the database
function sendMessage(){
	let chat_box = $("#chat_box")

	fetch('/chat', {
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			msg: `${chat_box.val()}`,
			uuid: `${getCookie("uuid")}`
		})
	})
		.then(function (response) {
			if (response.ok) {
				logger("Database updated")
				chat_box.val("")
				return;
			}
			throw new Error('Request failed.');
		})
		.catch(function (error) {
			console.log(error);
		});
}

function gridClicked(grid_item){

	if (!wait_for_countdown) {
		$('#' + grid_item.id).css({
			"background-color": selected_color,
		})
		logger(grid_item.id);


		fetch('/grid', {
			method: 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				_id: `${grid_item.id}`,
				color: `${selected_color}`,
				uuid: `${getCookie("uuid")}`
			})
		})
			.then(function (response) {
				if (response.ok) {
					logger("Database updated")
					wait_for_countdown = true;
					return;
				}
				throw new Error('Request failed.');
			})
			.catch(function (error) {
				console.log(error);
			});
	} else {
		logger("Please wait for countdown to finish");
		if ($(".alert").length > 0){
			$(".alert").alert('close')
		}
		$("#body").prepend("<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\" >\n" +
			"        <div class='text-center'>Please wait for the timer to finish before placing another pixel</div>" +
			"    </div>")
	}
}


// This function will set the current color based on the button clicked
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

// This function will set a cookie value
function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// This function will get a cookie value
function getCookie(cname) {
	let name = cname + "=";
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function checkUUID() {
	let uuid = getCookie("uuid");
	if (uuid != "") {
		logger("Welcome back " + uuid);
	} else {
		uuid = prompt("Please enter your name:", "");
		if (uuid != "" && uuid != null) {
			setCookie("uuid", uuid, 365);
		}
	}
}
