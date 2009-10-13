var scr;
var maps;
var player;
var msgLog;

function updateDisplay() {
	$("#hp-display").html("" + player.hp + "/" + player.maxHp);
	msgLog.renderToHtml();
	maps.getCurrentMap().paint();
}

$(document).ready(function() {
	var w = 40, h = 20;
	maps = Maps(Map(w, h));
	scr = Screen(w, h);
	msgLog = new MsgLog;
	
	var currentMap = maps.getCurrentMap();
	
	var mapGen = MapGen(currentMap);
	
	// If one portion of map generation is used in a load sequence,
	// all steps of the map generation must also be part of the load
	// sequence.
	
	var loader = LoadingScreen(function() {
		mapGen.generateMap(w, h, 'test');
	}, function() {
		player = Mobile("Player", '|', ColoredChar('@', 'blue'), 100, new Faction('player'));
		mapGen.map.addCreature(player, 2, 2);
	}, function() {
		mapGen.populateMap('test');
	}, function() {
		updateDisplay();
	});
	
	loader.load();
});

$(document).keypress(function(e) {
	var e = window.event || e;
	
	var code = (e.keyCode == 0) ? e.charCode : e.keyCode;
	
	switch (code) {
		case 37:
			player.tryMove(-1, 0);
			break;
		case 38:
			player.tryMove(0, -1);
			break;
		case 39:
			player.tryMove(1, 0);
			break;
		case 40:
			player.tryMove(0, 1);
			break;
		// Test code, generates a new level after pressing 'r'
		case 114: // 'r'
			var loader = LoadingScreen(function() {
				maps.mapList.push(Map(40, 20));
				var mapGen = MapGen(maps.getCurrentMap());
				
				mapGen.generateMap(40, 20, 'test');
				player.changeMap(mapGen.map, 2, 2);
				
				msgLog.append("Entered dungeon level: " + maps.mapList.length);
			}, function() {
				updateDisplay();
			});
			
			loader.load();
			return false;
		default:
			return true;
	}
	
	for (i = 0; i < maps.getCurrentMap().controllers.length; i++) {
		maps.getCurrentMap().controllers[i].think();
	}
	
	updateDisplay();
	
	return false;
});

// Call with LoadingScreen(func1, func2, func3), this class
// will store the functions and the execute them after
// using .load(). In order for the DOM to update, control
// has to be given back to the browser. This achieves that.
var LoadingScreen = function() {
	var funcs = arguments;
	
	// This can eventually be changed to add a modern overlay
	// load.
	var load = function() {
		var message = "Loading, please wait...<br />";
		var numSteps = funcs.length;
		
		// Hide everything.
		$("#loading_screen").html(message);
		$("#screen").hide();
		$("#hp-display").hide();
		$("#msglog").hide();
		
		// For each function except last, put in queue.
		for (var i = 0; i < funcs.length - 1; ++i) {
			setTimeout(funcs[i], 1);
			$("#loading_screen").html(message + ((i + 1) / numSteps * 100) + "%");
		}
		
		setTimeout(funcs[funcs.length - 1], 1);
		setTimeout(function() {
			$("#screen").show();
			$("#hp-display").show();
			$("#msglog").show();
			$("#loading_screen").html("");
		}, 1);
	}
	
	return {
		load: load,
	};
}

var ColoredChar = function(ch, charColor) {
	var toString = function() {
		var s = "<span class=\"" + charColor + "\">" + ch + "</span>";
		return s;
	};
	return {
		ch: ch,
		charColor: charColor,
		toString: toString
	}
}

var Mobile = function(name, symbol, appearance, maxHp, faction) {
	var tryMove = function(dx, dy) {
		if (this.dead) {
			return;
		}
		var newtile = this.tile.getNeighbour(dx, dy);
		if (newtile != null && newtile.mayEnter(this)) {
			this.tile.mobileLeave();
			newtile.mobileEnter(this);
			this.tile = newtile;
		} else if (newtile != null && newtile.mobile) {
			this.tryAttack(newtile.mobile);
		} else {
			msgLog.append("Blocked!");
		}
	}
	
	var changeMap = function(map, x, y) {
		this.map.removeCreature(this);
		this.map = map;
		this.tile = this.map.getTile(x, y);
		this.tile.mobileEnter(this);
		this.map.creatures.push(this);
	}
	
	var tryAttack = function(target) {
		var dmg = 1;
		var desc = this.name + " attacks " + target.name + " for " + dmg + " damage!";
		msgLog.append(desc);
		target.damage(dmg);
	}
	
	var distanceTo = function(other) {
		return Math.max(Math.abs(this.tile.x - other.tile.x), Math.abs(this.tile.y - other.tile.y));
	}
	
	var damage = function(n) {
		this.hp -= n;
		if (this.hp < 0) {
			var desc = this.name + " dies!";
			this.dead = true;
			this.map.removeCreature(this);
			msgLog.append(desc);
		}
	}
	
	var rv = {
		map: null,
		tile: null,
		appearance: appearance,
		symbol: symbol,
		maxHp: maxHp,
		hp: maxHp,
		dead: false,
		name: name,
		faction: faction,
		
		tryMove: tryMove,
		changeMap: changeMap,
		tryAttack: tryAttack,
		distanceTo: distanceTo,
		damage: damage,
	};
	
	return rv;
}

var Tile = function(map, symbol, appearance, x, y, traversible) {
	var mayEnter = function(mob) {
		if (!this.traversible) {
			return false;
		}
		if (this.mobile) {
			return false;
		}
		return true;
	}
	
	var mobileEnter = function(mob) {
		this.mobile = mob;
		this.map.addDirty(this);
	}
	
	var mobileLeave = function() {
		this.mobile = null;
		this.map.addDirty(this);
	}
	
	var getNeighbour = function(dx, dy) {
		return this.map.getTile(this.x + dx, this.y + dy);
	}
	
	var clear = function() {
		scr.clear(this.x, this.y);
	}
	
	var paint = function() {
		if (this.mobile) {
			scr.putCell(this.x, this.y, this.mobile.symbol, this.mobile.appearance);
		} else {
			scr.putCell(this.x, this.y, this.symbol, this.appearance);
		}
	}
	
	var toString = function() {
		return "Tile(" + this.x + "," + this.y + ")";
	}
	
	return {
		map: map,
		x: x,
		y: y,
		traversible: traversible,
		symbol: symbol,
		appearance: appearance,
		mobile: null,
		
		mayEnter: mayEnter,
		mobileEnter: mobileEnter,
		mobileLeave: mobileLeave,
		clear: clear,
		paint: paint,
		toString: toString,
		getNeighbour: getNeighbour,
	}
}

var Screen = function(width, height) {
	var s = '<table class="display" >';
	
	for (var y = 0; y < height; y++) {
		s += '<tr class="display">';
		for (var x = 0; x < width; x++) {
			s += '<td class="display" id="tile' + x + "_" + y + '"></td>';
		}
		s += '</tr>';
	}
	s += '</table>';
	$("#screen").html(s);
	
	var canvas = document.getElementById('canvasScreen');
	var ctx;
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		ctx.font = '10px monospace';
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	var clear = function(x, y) {
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(x * 10, (y * 10) + 1, 10, 12);
	}
	
	var putCell = function(x, y, symbol, appearance) {
		//$("#tile" + x + "_" + y).html(appearance.toString());
		
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillText(symbol, x * 10, (y + 1) * 10);
	}
	
	return {
		clear: clear,
		putCell: putCell,
	};
}
