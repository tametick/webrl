var playerx = 0;
var playery = 0;


$(document).ready(function(){
	Screen(80, 24);
	
	for (var y = 0; y < 24; y++) 
		for (var x = 0; x < 80; x++) 
			Screen.addColoredChar(x, y, new ColoredChar('.', "red"));
	
	Screen.update();
});

document.onkeypress = function(e){
	var e = window.event || e;
	
	Screen.addColoredChar(playerx, playery, new ColoredChar('.', "red"));
	
	if (e.keyCode == 37) // Left
		playerx--;
	else if (e.keyCode == 38) // Up
		playery--;
	else if (e.keyCode == 39) // Right
		playerx++;
	else if (e.keyCode == 40) // Down
		playery++;
	
	Screen.addColoredChar(playerx, playery, new ColoredChar('@', "blue"));
	Screen.update();
}

function ColoredChar(ch, color){
	this.ch = ch;
	this.color = color;
}

ColoredChar.prototype.toString = function(){
	var s = "<font color=\"" + this.color + "\">" + this.ch + "</font>";
	return s;
}

ColoredChar.prototype.fromString = function(){

}

function Screen(width, height){
	Screen.width = width;
	Screen.height = height;
	
	// This will hold all the updated cells.
	Screen.data = new Array();
	
	var s = '<table class="display" >';
	for (var y = 0; y < height; y++) {
		s += '<tr class="display">';
		for (var x = 0; x < width; x++) 
			s += '<td class="display" id="tile' + x + "," + y + '"></td>';
		s += '</tr>';
	}
	s += '</table>';
	
	$("#screen").html(s)
}

Screen.addColoredChar = function(x, y, cc){
	Screen.data["" + x + "," + y] = cc;
}

Screen.update = function(){
	for (var i in Screen.data) {
		document.getElementById("tile" + i).innerHTML = Screen.data[i];
		//$("#tile" + i).html(Screen.data[i]); <- does't work
	}
	
	Screen.data = new Array();
}
