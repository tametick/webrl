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
						tile = Tile(this.map, '#', [0, 0, 255], x, y, false);
					} else {
						tile = Tile(this.map, '.', [255, 0, 0], x, y, true);
					}
					this.map.setTile(x, y, tile);
				}
			}
		}
	}
	
	// Could be anything for the args as well.
	var populateMap = function(args) {
		if (args == "test") {
			var colorfactions = [[128, 0, 0], [64, 0, 0], [0, 128, 0], [0, 64, 0]];
			
			for (var faction = 0; faction < 4; faction++) {
				for (var monster = 0; monster < 4; monster++) {
					var monster1 = Mobile("Monster", 'M', colorfactions[faction], Math.random() * 10 + 10, new Faction(faction));
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