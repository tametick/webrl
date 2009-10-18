var Item = function(name, symbol, colour) {
	return {
		name: name,
		symbol: scr.symbol( symbol ),
		color: scr.colour( colour ),
	}
}

var generateItem = function() {
	// Power and frequency should eventually be considered here...
	var items = [
		Item( "top hat", "M", [100,100,100] ),
		Item( "homburg hat", "m", [200,200,200] ),
		Item( "fedora", "m", [200,100,100] ),
	];
	return items[ Math.floor( Math.random() * items.length ) ];
}

var Inventory = function() {
	return {
		weapon: null,
		hat: null,

		items: [],

		add: function( item ) {
			this.items.push( item );
		},
		remove: function( item ) {
			var i = 0;
			while (i < this.items.length && this.items[i] != item) {
				++i;
			}
			if (i < this.items.length) {
				this.items.splice(i, 1);
			} else {
				return null;
			}
			return item;
		},
		equip: function( item, slot ) {
			if( this[ slot ] ) {
				items.push( this.unequip( slot ) );
			}
			this[ slot ] = this.remove( item );
		},
		unequip: function( slot ) {
			var rv = this[ slot ];
			this[ slot ] = null;
			return rv;
		}
	}
}
