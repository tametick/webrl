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
	scr = GameScreen(w, h);
	msgLog = new MsgLog;
	
	var currentMap = maps.getCurrentMap();
	
	var mapGen = MapGen(currentMap);
	
	// If one portion of map generation is used in a load sequence,
	// all steps of the map generation must also be part of the load
	// sequence.
	
	var loader = LoadingScreen(function() {
		mapGen.generateMap(w, h, 'test');
	}, function() {
		player = Mobile("Player", '@', [0, 0, 255], 100, new Faction('player'));
		mapGen.map.addCreature(player, 2, 2);
	}, function() {
		mapGen.populateMap('test');
	}, function() {
		updateDisplay();
	});
	
	loader.load();
});

$(document).keydown(function(e) {
	var e = window.event || e;
	
	var code = e.keyCode;
	
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
		case 82: // 'r'
			var loader = LoadingScreen(function() {
				maps.mapList.push(Map(40, 20));
				var mapGen = MapGen(maps.getCurrentMap());
				
				mapGen.generateMap(40, 20, 'digDug');
				player.changeMap(mapGen.map, mapGen.spawnX, mapGen.spawnY);
				
				msgLog.append("Entered dungeon level: " + maps.mapList.length + ", at: " + mapGen.spawnX + ", " + mapGen.spawnY);
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
		$("#canvasScreen").hide();
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
			$("#canvasScreen").show();
			$("#hp-display").show();
			$("#msglog").show();
			$("#loading_screen").html("");
		}, 1);
	}
	
	return {
		load: load,
	};
}

var Mobile = function(name, symbol, color, maxHp, faction) {
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
		color: color,
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
