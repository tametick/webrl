var Tile = function(map, symbol, color, x, y, traversible) {
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
	}
	
	var mobileLeave = function() {
		this.mobile = null;
	}
	
	var getNeighbour = function(dx, dy) {
		return this.map.getTile(this.x + dx, this.y + dy);
	}
	
	var paint = function(sx, sy) {
		if (this.mobile) {
			scr.putCell(sx, sy, this.mobile.symbol, this.mobile.color);
		} else if (this.items.length > 0) {
			var item = this.items[this.items.length - 1];
			scr.putCell(sx, sy, item.symbol, item.color);
		} else {
			scr.putCell(sx, sy, this.symbol, this.color);
		}
	}
	
	return {
		map: map,
		x: x,
		y: y,
		traversible: traversible,
		visible: false,
		symbol: scr.symbol(symbol),
		color: scr.colour(color),
		mobile: null,
		items: [],
		
		mayEnter: mayEnter,
		mobileEnter: mobileEnter,
		mobileLeave: mobileLeave,
		paint: paint,
		getNeighbour: getNeighbour,
	}
}

var Map = function(width, height) {
	var tiles = [];
	var tickCounter = 0;
	
	var creatures = [];
	var controllers = [];
	
	var clear = function() {
		scr.clearAll();
	}
	
	var centerX = function(x) {
		this.dx = Math.floor(scr.width / 2) - x;
	}
	
	var centerY = function(y) {
		this.dy = Math.floor(scr.height / 2) - y;
	}
	
	var maybeRecenter = function(x, y, mzl) {
		if (this.dx === null) {
			this.centerX(x);
		}
		if (this.dy === null) {
			this.centerY(y);
		}
		// Now assumes the player is on-screen.
		var px = x + this.dx;
		var py = y + this.dy;
		if (Math.min(Math.abs(px), Math.abs(scr.width - 1 - px)) < mzl) {
			this.centerX(x);
		}
		if (Math.min(Math.abs(py), Math.abs(scr.height - 1 - py)) < mzl) {
			this.centerY(y);
		}
	}
	
	var paint = function() {
		/* physical + delta = screen */
		var dx = this.dx;
		var dy = this.dy;
		clear();
		for (var sx = 0; sx < scr.width; sx++) {
			for (var sy = 0; sy < scr.height; sy++) {
				var tile = this.tiles[[sx - dx, sy - dy]];
				if (tile != null) {
					tile.paint(sx, sy);
				} else {
					scr.nullpaint(sx, sy);
				}
			}
		}
		scr.update();
	}
	
	var setTile = function(x, y, tile) {
		this.tiles[[x, y]] = tile;
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
	
	var setScent = function(originTile, strength) {
		if (this.scentedTiles) {
			for (var xy in this.scentedTiles) {
				this.scentedTiles[xy].scentDirection = null;
			}
		}
		originTile.scentDirection = [0, 0];
		var currentGen = [originTile];
		this.scentedTiles = [originTile];
		var nextGen = [];
		var dxt = [-1, 0, 1, -1, 1, -1, 0, 1];
		var dyt = [-1, -1, -1, 0, 0, 1, 1, 1];
		while (currentGen.length > 0 && --strength > 0) {
			for (var i = 0; i < currentGen.length; i++) {
				var x = currentGen[i].x;
				var y = currentGen[i].y;
				for (var j = 0; j < 8; j++) {
					var nextTile = this.getTile(x + dxt[j], y + dyt[j]);
					if (nextTile && nextTile.traversible && nextTile.scentDirection == null) {
						nextTile.scentDirection = [-dxt[j], -dyt[j]];
						nextGen.push(nextTile);
						this.scentedTiles.push(nextTile);
					}
				}
			}
			currentGen = nextGen;
			nextGen = [];
		}
	}
	
	return {
		tiles: tiles,
		creatures: creatures,
		controllers: controllers,
		
		width: width,
		height: height,
		
		dx: null,
		dy: null,
		maybeRecenter: maybeRecenter,
		centerX: centerX,
		centerY: centerY,
		
		paint: paint,
		getTile: getTile,
		setTile: setTile,
		removeCreature: removeCreature,
		addCreature: addCreature,
		setScent: setScent,
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
