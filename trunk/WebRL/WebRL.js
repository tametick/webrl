var playerx = 0;
var playery = 0;
var scr;

$(document).ready(function(){
	scr = Screen(80, 24);
	
	for (var y = 0; y < 24; y++) 
		for (var x = 0; x < 80; x++) 
			scr.setColoredChar(x, y, ColoredChar('.', "red"));
	
	scr.update();
});

$(document).keypress(function(e){
	var e = window.event || e;
	
	scr.setColoredChar(playerx, playery, ColoredChar('.', "red"));
	
	if (e.keyCode == 37) // Left
		playerx--;
	else if (e.keyCode == 38) // Up
		playery--;
	else if (e.keyCode == 39) // Right
		playerx++;
	else if (e.keyCode == 40) // Down
		playery++;
	
	scr.setColoredChar(playerx, playery, ColoredChar('@', "blue"));
	scr.update();
});

var ColoredChar = function(ch, color){
	var toString = function(){
		var s = "<font color=\"" + this.color + "\">" + this.ch + "</font>";
		return s;
	};
	return {
		ch: ch,
		color: color,
		toString: toString
	}
}

var Screen = function(width, height){
	var s = '<table class="display" >';
	for (var y = 0; y < height; y++) {
		s += '<tr class="display">';
		for (var x = 0; x < width; x++) 
			s += '<td class="display" id="tile' + x + "_" + y + '"></td>';
		s += '</tr>';
	}
	s += '</table>';
	$("#screen").html(s);
	
	var data = new Array();
	var setColoredChar = function(x, y, cc){
		data["" + x + "_" + y] = cc;
	};
	var update = function(){
		for (var i in data) 
			$("#tile" + i).html(data[i].toString());
		data = new Array();
	};
	
	return {
		setColoredChar: setColoredChar,
		update: update,
	}
}
