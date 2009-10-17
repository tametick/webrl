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
		symbol: scr.symbol( symbol ),
		color: scr.colour( color ),
		mobile: null,
		
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

	var center = function(x, y) {
		this.dx = scr.width / 2 - x;
		this.dy = scr.height / 2 - y;
	}

	var maybeRecenter = function(x,y, mzl) {
		if( this.dx === null || this.dy === null ) {
			this.center( x, y );
		}
		// Now assumes the player is on-screen.
		var px = x + this.dx;
		var py = y + this.dy;
		if( Math.min( Math.abs(px), Math.abs(py), Math.abs(scr.width-1-px), Math.abs(scr.height-1-py) ) < mzl ) {
			this.center( x, y );
		}
	}
	
	var paint = function() {
		/* physical + delta = screen */
		var dx = this.dx;
		var dy = this.dy;
		clear();
		for(var sx=0;sx<scr.width;sx++) {
			for(var sy=0;sy<scr.height;sy++) {
				var tile = this.tiles[[sx-dx,sy-dy]];
				if( tile != null ) {
					tile.paint( sx, sy );
				} else {
					scr.nullpaint( sx, sy );
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

	var tilesMD = [];
	for(var x=0;x<width;x++) {
		tilesMD[x] = [];
		for(var y=0;y<height;y++) {
			tilesMD[x].push( tiles[[x,y]] );
		}
	}

	return {
		tiles: tiles,
		tilesMD: tilesMD,
		creatures: creatures,
		controllers: controllers,

		dx: null,
		dy: null,
		maybeRecenter: maybeRecenter,
		center: center,

		paint: paint,
		getTile: getTile,
		setTile: setTile,
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
