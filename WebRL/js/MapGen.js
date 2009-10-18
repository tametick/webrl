var MapGen = function(map, width, height, seed) {
	var map = map;
	var spawnX = null; // possible hacks, should be in map me thinks (stairs)
	var spawnY = null;
	var seed = seed;
	var width = width;
	var height = height;
	var mt = new MersenneTwister19937();
	mt.init_genrand(seed);
	
	// The args could be anything, really.
	var generateMap = function(args) {
		if (args == "test") {
			if (!this.map) 
				this.map = Map(width, height);
			
			for (var x = 0; x < width; x++) {
				for (var y = 0; y < height; y++) {
					var tile;
					if (x == 0 || y == 0 || x == (width - 1) || y == (height - 1)) {
						tile = Tile(this.map, '#', [0, 0, 255], x, y, false);
					} else {
						tile = Tile(this.map, '.', [255, 0, 0], x, y, true);
					}
					this.map.setTile(x, y, tile);
				}
			}
		} else if (args == "digDug") {
			if (!this.map) 
				this.map = Map(width, height);
			var f = DigDug(width, height);
			
			// Copy into map.
			for (var x = 0; x < width; x++) {
				for (var y = 0; y < height; y++) {
					var tile;
					if (f.map[x][y] == '#') 
						tile = Tile(this.map, '#', [200, 150, 100], x, y, false);
					if (f.map[x][y] == '_') 
						tile = Tile(this.map, '#', [75, 50, 25], x, y, false);
					// TODO: Add doors.
					else if (f.map[x][y] == '.' || f.map[x][y] == '+') {
						tile = Tile(this.map, '.', [150, 100, 50], x, y, true);
						this.spawnX = x;
						this.spawnY = y;
					}
					this.map.setTile(x, y, tile);
				}
			}
		}
	}
	
	// Could be anything for the args as well.
	var populateMap = function(args) {
		// Just an example of populating a map, eventually the level of the dungeon and
		// and stuff can take a role. Possibly putting this into a class.
		var openTiles = [];
		
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				if (map.getTile(x, y).traversible)
					openTiles.push([x, y]);
			}
		}
		
		for (var m = 0; m < args; ++m) {
			var i = Math.floor(mt.genrand_real2() * openTiles.length);
			var monster = Mobile("Monster", 'M', [100, 160, 120], Math.random() * 10 + 10, new Faction(1));
			this.map.addCreature(monster, openTiles[i][0], openTiles[i][1]);

			var hunter = new ScentFollowerAI(monster, this.map);
			this.map.controllers.push(hunter);
			
			openTiles.slice(i, i);
		}
	}
	
	return {
		map: map,
		spawnX: spawnX,
		spawnY: spawnY,
		seed: seed,
		generateMap: generateMap,
		populateMap: populateMap,
	};
}

var DigDug = function(w, h) {
	var roomMin = 4, roomMax = 13, hallMax = 14, roomNum = 20;
	var maxTries = 2000, minFloor = w * h * 0.15; // break while() after maxTries, toss levels with < minFloor dug out
	var floorChar = '.', wallChar = '#', voidChar = '_', doorChar = '+';
	
	var grids = new Array(w);
	for (i = 0; i < w; i++) {
		grids[i] = new Array(h);
	}
	
	var digDug = function() {
		fillRect(0, 0, w - 1, h - 1, voidChar); // fill with void
		var roomW, roomH, roomX1, roomY1, roomX2, roomY2; // used for current room
		var lastX1, lastY1, lastX2, lastY2; // used to connect with last room
		var startX, startY, endX, endY; // used to connect to random room-centers
		var firstRoom = true;
		var roomCount = 0;
		var tries = 0;
		while (roomCount < roomNum) {
			roomW = rand(roomMin, roomMax);
			roomH = rand(roomMin, roomMax);
			if (firstRoom) {
				roomX1 = rand(1, w - (roomW + 1));
				roomY1 = rand(1, h - (roomH + 1));
			} else {
				roomX1 = rand(lastX1 - hallMax, lastX2 + hallMax);
				roomY1 = rand(lastY1 - hallMax, lastY2 + hallMax);
			}
			roomX2 = roomX1 + roomW;
			roomY2 = roomY1 + roomH;
			if (checkRect(roomX1 - 1, roomY1 - 1, roomX2 + 1, roomY2 + 1, voidChar)) { // if area is void
				digRoom(roomX1, roomY1, roomX2, roomY2); // dig a random room
				if (!firstRoom) { // connect it to the previous room:
					startX = rand(roomX1 + 1, roomX2 - 1);
					startY = rand(roomY1 + 1, roomY2 - 1);
					endX = rand(lastX1 + 1, lastX2 - 1);
					endY = rand(lastY1 + 1, lastY2 - 1);
					if (startX < endX) 
						digHall(startX, startY, endX, endY);
					else 
						digHall(endX, endY, startX, startY); // dig a hall, sorted left to right
				}
				lastX1 = roomX1; // save this as the previous room
				lastY1 = roomY1;
				lastX2 = roomX2;
				lastY2 = roomY2;
				roomCount++;
				firstRoom = false;
			}
			tries++;
			if (tries > maxTries) 
				break;
		}
		addDoors();
		tossTest();
	}
	
	var digRoom = function(x1, y1, x2, y2) {
		x1 = constrain(x1, 1, w - 2);
		x2 = constrain(x2, 1, w - 2);
		y1 = constrain(y1, 1, h - 2);
		y2 = constrain(y2, 1, h - 2);
		fillRect(x1, y1, x2, y2, wallChar);
		fillRect(x1 + 1, y1 + 1, x2 - 1, y2 - 1, floorChar);
	}
	
	var digHall = function(x1, y1, x2, y2) {
		// assume the two points are already sorted left-to-right...
		if (coinFlip()) {
			digRoom(x1 - 1, y1 - 1, x2 + 1, y1 + 1);
			if (y2 > y1) 
				digRoom(x2 - 1, y1 - 1, x2 + 1, y2 + 1); // for \ cases

			else 
				digRoom(x2 - 1, y2 - 1, x2 + 1, y1 + 1); // for / cases
		} else {
			digRoom(x1 - 1, y2 - 1, x2 + 1, y2 + 1);
			if (y2 > y1) 
				digRoom(x1 - 1, y1 - 1, x1 + 1, y2 + 1); // for \ cases

			else 
				digRoom(x1 - 1, y2 - 1, x1 + 1, y1 + 1); // for / cases
		}
	}
	
	var fillRect = function(x1, y1, x2, y2, gridType) {
		for (var y = y1; y <= y2; y++) {
			for (var x = x1; x <= x2; x++) {
				if ((gridType == voidChar) || (grids[x][y] != floorChar)) 
					grids[x][y] = gridType;
			}
		}
	}
	
	var addDoors = function() {
		for (var y = 1; y < h - 1; y++) {
			for (var x = 1; x < w - 1; x++) {
				if ((grids[x][y] == floorChar) && (rand(0, 10) < 7)) { // give a small chance of no-door
					if (((grids[x + 1][y] == floorChar) && (grids[x - 1][y] == floorChar)) &&
					((grids[x][y + 1] == wallChar) && (grids[x][y - 1] == wallChar))) {
						if (((grids[x + 1][y - 1] == floorChar) || (grids[x + 1][y + 1] == floorChar)) ||
						((grids[x - 1][y - 1] == floorChar) || (grids[x - 1][y + 1] == floorChar))) 
							grids[x][y] = doorChar;
					} else if (((grids[x + 1][y] == wallChar) && (grids[x - 1][y] == wallChar)) &&
					((grids[x][y + 1] == floorChar) && (grids[x][y - 1] == floorChar))) {
						if (((grids[x + 1][y - 1] == floorChar) || (grids[x - 1][y - 1] == floorChar)) ||
						((grids[x + 1][y + 1] == floorChar) || (grids[x - 1][y + 1] == floorChar))) 
							grids[x][y] = doorChar;
					}
				}
			}
		}
	}
	
	var tossTest = function() {
		var floorCount = 0;
		for (var y = 1; y < h - 1; y++) {
			for (var x = 1; x < w - 1; x++) {
				if (grids[x][y] == floorChar) 
					floorCount++;
			}
		}
		if (floorCount < minFloor) 
			digDug();
	}
	
	
	var checkRect = function(x1, y1, x2, y2, gridType) {
		if ((x1 < 0) || (y1 < 0) || (x2 >= w) || (y2 >= h)) 
			return (false);
		for (var y = y1; y <= y2; y++) {
			for (var x = x1; x <= x2; x++) {
				if (grids[x][y] != gridType) 
					return (false);
			}
		}
		return (true);
	}
	
	var constrain = function(inputVal, minVal, maxVal) {
		inputVal = Math.max(inputVal, minVal);
		inputVal = Math.min(inputVal, maxVal);
		return (inputVal);
	}
	
	var rand = function(rMin, rMax) {
		return (rMin + Math.round(Math.random() * (rMax - rMin)));
	}
	
	var coinFlip = function() {
		if (Math.random() < .5) 
			return (true);
		else 
			return (false);
	}
	
	digDug();
	
	return {
		map: grids,
	};
}
