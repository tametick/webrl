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
			this.tiles[xy].clear();
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
		
		creature.map = null;
	}
	
	var addCreature = function(creature, x, y) {
		this.getTile(x, y).mobileEnter(creature);
		this.creatures.push(creature);
		creature.tile = this.getTile(x, y);
		creature.map = this;
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
		addCreature: addCreature,
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
	};
}

var MapGen = function(map, seed) {
	var map = map;
	var seed = seed;
	
	// The args could be anything, really.
	var generateMap = function(w, h, args) {
		if (args == "test") {
			if (!this.map) 
				this.map = Map(w, h);
			
			for (var x = 0; x < w; x++) {
				for (var y = 0; y < h; y++) {
					var tile;
					if (x == 0 || y == 0 || x == (w - 1) || y == (h - 1)) {
						tile = Tile(this.map, '#', ColoredChar('#', 'aqua'), x, y, false);
					} else {
						tile = Tile(this.map, '.', ColoredChar('.', 'red'), x, y, true);
					}
					this.map.setTile(x, y, tile);
				}
			}
		}
	}
	
	// Could be anything for the args as well.
	var populateMap = function(args) {
		if (args == "test") {
			var colorfactions = ['darkRed', 'salmon', 'darkGreen', 'lightGreen'];
			
			for (var faction = 0; faction < 4; faction++) {
				for (var monster = 0; monster < 4; monster++) {
					var monster1 = Mobile("Monster", 'M', ColoredChar("M", colorfactions[faction]), Math.random() * 10 + 10, new Faction(faction));
					this.map.addCreature(monster1, 7 + monster * 8, 2 + faction * 5);
					
					var hunter = new KillAllAI(monster1, this.map);
					this.map.controllers.push(hunter);
				}
			}
		}
	}
	
	return {
		map: map,
		seed: seed,
		generateMap: generateMap,
		populateMap: populateMap,
	};
}
