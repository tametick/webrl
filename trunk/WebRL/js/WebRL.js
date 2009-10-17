var maps;
var player;
var msgLog;

var scrWidth = 40, scrHeight = 20;
var mapWidth = 100, mapHeight = 50;

function updateDisplay() {
	$("#hp-display").html("" + player.hp + "/" + player.maxHp);
	var map = maps.getCurrentMap();
	var modifiedZeldaLimit = 5;
	msgLog.renderToHtml();
	if(player.tile) {
		map.maybeRecenter( player.tile.x, player.tile.y, modifiedZeldaLimit );
	}
	maps.getCurrentMap().paint();
}

$(document).ready(function() {
	maps = Maps(Map(mapWidth, mapHeight));
	msgLog = new MsgLog;
	
	var currentMap = maps.getCurrentMap();
	
	var mapGen = MapGen(currentMap, mapWidth, mapHeight);
	
	// If one portion of map generation is used in a load sequence,
	// all steps of the map generation must also be part of the load
	// sequence.
	
	startupLoader.schedule(function() {
		mapGen.generateMap("digDug");
	});
	startupLoader.schedule(function() {
		player = Mobile("Player", '@', [240, 240, 240], 100, new Faction('player'));
		mapGen.map.addCreature(player, mapGen.spawnX, mapGen.spawnY);
	});
	startupLoader.schedule(function() {
		mapGen.populateMap(5);
	});
	startupLoader.schedule(function() {
		updateDisplay();
	});
	
	startupLoader.load();
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
				player.hp = player.maxHp;
				player.dead = false;
				maps.mapList.push(Map(mapWidth, mapHeight));
				var mapGen = MapGen(maps.getCurrentMap(), mapWidth, mapHeight);
				
				mapGen.generateMap('digDug');
				player.changeMap(mapGen.map, mapGen.spawnX, mapGen.spawnY);
				mapGen.populateMap(5);
				
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
		if (this.map) 
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
		color: scr.colour( color ),
		symbol: scr.symbol( symbol ),
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
