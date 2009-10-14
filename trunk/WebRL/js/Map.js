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
			scr.putCell(this.x, this.y, this.mobile.symbol, this.mobile.color);
		} else {
			scr.putCell(this.x, this.y, this.symbol, this.color);
		}
	}
	
	return {
		map: map,
		x: x,
		y: y,
		traversible: traversible,
		visible: false,
		symbol: symbol,
		color: color,
		mobile: null,
		
		mayEnter: mayEnter,
		mobileEnter: mobileEnter,
		mobileLeave: mobileLeave,
		clear: clear,
		paint: paint,
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
