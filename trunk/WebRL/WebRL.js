var scr;
var player;
var msgLog;

$(document).ready(function(){
	var w = 40, h = 20;
	scr = Screen(w, h);
	msgLog = new MsgLog;
	
	for (var x = 0; x < w; x++) {
		for (var y = 0; y < h; y++) {
			var tile;
			if (x == 0 || y == 0 || x == (w - 1) || y == (h - 1)) {
				tile = Tile(scr, x, y, false, ColoredChar('#', 'cyan'));
			}
			else {
				tile = Tile(scr, x, y, true, ColoredChar('.', 'red'));
			}
			scr.setTile(x, y, tile);
		}
	}
	
	player = Mobile(scr, 2, 2, ColoredChar('@', 'blue'));
	scr.paint();
	
	$("#loading_screen").html("");
});

$(document).keypress(function(e){
	var e = window.event || e;
	
	msgLog.append("The player is trying to move... (Keypress " + e.keyCode + ")");
	msgLog.renderToHtml();
	
	if (e.keyCode == 37) { // Left
		player.tryMove(-1, 0);
	}
	else if (e.keyCode == 38) { // Up
		player.tryMove(0, -1);
	}
	else if (e.keyCode == 39) { // Right
		player.tryMove(1, 0);
	}
	else if (e.keyCode == 40) { // Down
		player.tryMove(0, 1);
	}
	
	scr.paint();
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

var Mobile = function(map, x, y, appearance){
	var tryMove = function(dx, dy){
		var newtile = this.tile.getNeighbour(dx, dy);
		if (newtile != null && newtile.traversible) {
			this.tile.mobileLeave();
			newtile.mobileEnter(this);
			this.tile = newtile;
		}
		else {
			msgLog.append("Blocked!");
			msgLog.renderToHtml();
		}
	}
	
	var rv = {
		map: map,
		tile: map.getTile(x, y),
		appearance: appearance,
		
		tryMove: tryMove,
	};
	
	map.getTile(x, y).mobileEnter(rv);
	
	return rv;
}

var Tile = function(map, x, y, traversible, appearance){
	var mobileEnter = function(mob){
		this.mobile = mob;
		this.map.addDirty(this);
	}
	
	var mobileLeave = function(){
		this.mobile = null;
		this.map.addDirty(this);
	}
	
	var getNeighbour = function(dx, dy){
		return this.map.getTile(this.x + dx, this.y + dy);
	}
	
	var paint = function(){
		if (this.mobile) {
			this.map.putTile(this.x, this.y, this.mobile.appearance);
		}
		else {
			this.map.putTile(this.x, this.y, this.appearance);
		}
	}
	
	var toString = function(){
		return "Tile(" + this.x + "," + this.y + ")";
	}
	
	return {
		map: map,
		x: x,
		y: y,
		traversible: traversible,
		appearance: appearance,
		mobile: null,
		
		mobileEnter: mobileEnter,
		mobileLeave: mobileLeave,
		paint: paint,
		toString: toString,
		getNeighbour: getNeighbour,
	}
}

var Screen = function(width, height){
	var s = '<table class="display" >';
	var tiles = new Array();
	var dirty = new Array();
	
	var addDirty = function(tile){
		this.dirty.push([tile.x, tile.y]);
	}
	
	var paint = function(){
		while (this.dirty.length > 0) {
			var xy = this.dirty.pop();
			this.tiles[xy].paint();
		}
	}
	
	var setTile = function(x, y, tile){
		this.tiles[[x, y]] = tile;
		this.dirty.push([x, y]);
	}
	
	var putTile = function(x, y, appearance){
		$("#tile" + x + "_" + y).html(appearance.toString());
	}
	
	var getTile = function(x, y){
		return this.tiles[[x, y]];
	}
	
	var rv = {
		tiles: tiles,
		dirty: dirty,
		
		paint: paint,
		getTile: getTile,
		setTile: setTile,
		putTile: putTile,
		addDirty: addDirty,
	};
	
	for (var y = 0; y < height; y++) {
		s += '<tr class="display">';
		for (var x = 0; x < width; x++) {
			s += '<td class="display" id="tile' + x + "_" + y + '"></td>';
			tiles[[x, y]] = null;
		}
		s += '</tr>';
	}
	s += '</table>';
	$("#screen").html(s);
	
	return rv;
	
}
