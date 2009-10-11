var scr;
var maps;
var player;
var msgLog;

function updateDisplay() {
	$("#hp-display").html("" + player.hp + "/" + player.maxHp);
	msgLog.renderToHtml();
	maps.getCurrentMap().paint();
}

function startLoad() {
	$("#loading_screen").html("Loading, please wait...");
	$("#screen").hide();
	$("#hp-display").hide();
	$("#msglog").hide();
}

function nextLoad(func) {
	setTimeout(func, 1);
	$("#loading_screen").html($("#loading_screen").html() + "...");
}

function finishLoad(func) {
	setTimeout(func, 1);
	setTimeout(function() {
		$("#screen").show();
		$("#hp-display").show();
		$("#msglog").show();
		$("#loading_screen").html("");
	}, 1);
}

$(document).ready(function() {
	var w = 40, h = 20;
	maps = Maps(Map(w, h));
	scr = Screen(w, h);
	msgLog = new MsgLog;
	
	var currentMap = maps.getCurrentMap();
	
	startLoad();
	
	nextLoad(function() {
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				var tile;
				if (x == 0 || y == 0 || x == (w - 1) || y == (h - 1)) {
					tile = Tile(currentMap, x, y, false, ColoredChar('#', 'aqua'));
				} else {
					tile = Tile(currentMap, x, y, true, ColoredChar('.', 'red'));
				}
				currentMap.setTile(x, y, tile);
			}
		}
		
		player = Mobile(currentMap, 2, 2, "Player", ColoredChar('@', 'blue'), 100);
		player.faction = new Faction('player');
		currentMap.creatures.push(player);
	});
	
	var colorfactions = ['darkRed', 'salmon', 'darkGreen', 'lightGreen'];
	
	finishLoad(function() {
		for (var faction = 0; faction < 4; faction++) {
			for (var monster = 0; monster < 4; monster++) {
				var monster1 = Mobile(currentMap, 7 + monster * 8, 2 + faction * 5, "Monster", ColoredChar("M", colorfactions[faction]), Math.random() * 10 + 10);
				monster1.faction = new Faction(faction);
				currentMap.creatures.push(monster1);
				
				var hunter = new KillAllAI(monster1, currentMap);
				currentMap.controllers.push(hunter);
			}
		}
		
		updateDisplay();
	});
});

$(document).keypress(function(e) {
	var e = window.event || e;
	
	switch (e.keyCode) {
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
		default:
			// Test code, generates a new level after pressing 'r'
			switch (e.charCode) {
				case 114: // 'r'
					startLoad();
					
					finishLoad(function() {
						maps.mapList.push(Map(40, 20));
						
						var currentMap = maps.getCurrentMap();
						for (var x = 0; x < 80; x++) {
							for (var y = 0; y < 24; y++) {
								var tile;
								if (x == 0 || y == 0 || x == (40 - 1) || y == (20 - 1)) {
									tile = Tile(currentMap, x, y, false, ColoredChar('#', 'aqua'));
								} else {
									tile = Tile(currentMap, x, y, true, ColoredChar('.', 'red'));
								}
								currentMap.setTile(x, y, tile);
							}
						}
						player.changeMap(currentMap, 2, 2);
						
						msgLog.append("Entered dungeon level: " + maps.mapList.length);
						
						updateDisplay();
					});
					return false;
				default:
					return true;
			}
			break;
	}
	
	for (i = 0; i < maps.getCurrentMap().controllers.length; i++) {
		maps.getCurrentMap().controllers[i].think();
	}
	
	updateDisplay();
	
	return false;
});

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

var Mobile = function(map, x, y, name, appearance, maxHp) {
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
			this.tile.mobileLeave();
			this.dead = true;
			this.map.removeCreature(this);
			msgLog.append(desc);
		}
	}
	
	var rv = {
		map: map,
		tile: map.getTile(x, y),
		appearance: appearance,
		maxHp: maxHp,
		hp: maxHp,
		dead: false,
		name: name,
		faction: null,
		
		tryMove: tryMove,
		changeMap: changeMap,
		tryAttack: tryAttack,
		distanceTo: distanceTo,
		damage: damage,
	};
	
	map.getTile(x, y).mobileEnter(rv);
	
	return rv;
}

var Tile = function(map, x, y, traversible, appearance) {
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
	
	var paint = function() {
		if (this.mobile) {
			scr.putCell(this.x, this.y, this.mobile.appearance);
		} else {
			scr.putCell(this.x, this.y, this.appearance);
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
		appearance: appearance,
		mobile: null,
		
		mayEnter: mayEnter,
		mobileEnter: mobileEnter,
		mobileLeave: mobileLeave,
		paint: paint,
		toString: toString,
		getNeighbour: getNeighbour,
	}
}

var Map = function(width, height) {
	var tiles = [];
	var dirty = [];
	var tickCounter = 0;
	
	var creatures = [];
	var controllers = [];
	
	var addDirty = function(tile) {
		this.dirty.push([tile.x, tile.y]);
	}
	
	var paint = function() {
		while (this.dirty.length > 0) {
			var xy = this.dirty.pop();
			this.tiles[xy].paint();
		}
	}
	
	var setTile = function(x, y, tile) {
		this.tiles[[x, y]] = tile;
		this.dirty.push([x, y]);
	}
	
	var getTile = function(x, y) {
		return this.tiles[[x, y]];
	}
	
	var removeCreature = function(creature) {
		var i = 0;
		while (i < this.creatures.length && this.creatures[i] != creature) {
			++i;
		}
		if (i < this.creatures.length) {
			this.creatures.splice(i, 1);
		}
		
		i = 0;
		while (i < this.controllers.length && this.controllers[i].puppet != creature) {
			++i;
		}
		if (i < this.controllers.length) {
			this.controllers.splice(i, 1);
		}
		
		if (creature.tile != null) {
			creature.tile.mobileLeave();
			creature.tile = null;
		}
	}
	
	return {
		tiles: tiles,
		dirty: dirty,
		creatures: creatures,
		controllers: controllers,
		
		paint: paint,
		getTile: getTile,
		setTile: setTile,
		addDirty: addDirty,
		removeCreature: removeCreature,
	};
}

var Maps = function(firstMap) {
	var mapList = [firstMap];
	
	var getMap = function(mapIndex) {
		return mapList[mapIndex];
	}
	
	var getCurrentMap = function() {
		return mapList[mapList.length - 1];
	}
	
	return {
		mapList: mapList,
		getMap: getMap,
		getCurrentMap: getCurrentMap,
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
	
	
	var putCell = function(x, y, appearance) {
		$("#tile" + x + "_" + y).html(appearance.toString());
	}
	
	return {
		putCell: putCell,
	};
}
