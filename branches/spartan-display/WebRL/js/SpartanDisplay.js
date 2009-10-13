var SpartanScreen = function( width, height, target ) {
	var cells = [];

	var hackupdate = function( px, py, c ) {
		var t0 = new Date().getTime();
		for(var x=0;x<this.width;x++) {
			var col = cells[x];
			for(var y=0;y<this.height;y++) {
				var cell = col[y];
				if( x == px && y == py ) {
					cell.setAttribute( "bgcolor", "black" );
					cell.childNodes[0].data = ".";
				} else {
					cell.setAttribute( "bgcolor", c );
					cell.childNodes[0].data = ",";
				}
			}
		}
		var t1 = new Date().getTime();
	}

	var rv = {
		cells: cells,

		width: width,
		height: height,

		hackupdate: hackupdate,
	}

	for(var x = 0; x < width; x++) {
		cells[x] = [];
	}
	var tableElement = document.createElement( 'TABLE' );
	for(var y = 0; y < height; y++) {
		var rowElement = document.createElement( 'TR' );
		tableElement.appendChild( rowElement );
		for(var x = 0; x < width; x++) {
			var cellElement = document.createElement( 'TD' );
			rowElement.appendChild( cellElement );
			cells[x][y] = cellElement;

			var cellValue = document.createTextNode( '.' );
			cellElement.appendChild( cellValue );
		}
	}

	document.getElementById( target ).appendChild( tableElement );
	return rv;
}

