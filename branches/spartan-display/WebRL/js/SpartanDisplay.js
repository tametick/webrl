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

var SpartanImageScreen = function( width, height, target ) {
	var cells = [];

			/*	Visibility, magic numbers.
				None (0): nothing is visible (except table background)
				Remembered (1): background layer visible, fog of war visible.
				Full (2): background layer visible, object layer overrides.
			*/
	
	var setObjectAt = function( x, y, o ) {
		cells[x][y].obj = o;
	}
	
	var hackupdate = function( px, py ) {
		var t0 = new Date().getTime();
		for(var x=0;x<this.width;x++) {
			var col = cells[x];
			for(var y=0;y<this.height;y++) {
				var cell = col[y];

				// this would normally be done somewhere else, in FOV code
				var d = (x-px)*(x-px) + (y-py)*(y-py);
				var lim = 10;
				if( d > lim*lim ) {
					if( cell.visibility > 0 ) {
						cell.visibility = 1;
					} else {
						cell.visibility = 0;
					}
				} else {
					cell.visibility = 2;
				}

				// back to screen updatin'
				if( cell.visibility != cell.lastVisibility ) {
					cell.lastVisibility = cell.visibility;
					switch( cell.visibility ) {
						case 0:
							cell.darknessLayer.setAttribute( "STYLE", "visibility: visible;" );
							cell.backgroundLayer.setAttribute( "STYLE", "visibility: hidden;" );
							cell.objectLayer.setAttribute( "STYLE", "visibility: hidden;" );
							cell.fogLayer.setAttribute( "STYLE", "visibility: hidden;" );
							break;
						case 1:
							cell.darknessLayer.setAttribute( "STYLE", "visibility: hidden;" );
							cell.backgroundLayer.setAttribute( "STYLE", "visibility: visible;" );
							cell.objectLayer.setAttribute( "STYLE", "visibility: hidden;" );
							cell.fogLayer.setAttribute( "STYLE", "visibility: visible;" );
							break;
						case 2:
							cell.darknessLayer.setAttribute( "STYLE", "visibility: hidden;" );
							cell.fogLayer.setAttribute( "STYLE", "visibility: hidden;" );
							break;
					}
				}

				if( cell.visibility == 2 ) {
					if( cell.obj != null ) {
						cell.backgroundLayer.setAttribute( "STYLE", "visibility: hidden;" );
						cell.objectLayer.setAttribute( "STYLE", "visibility: visible;" );
						if( cell.obj != cell.lastObj ) {
							cell.objectLayer.setAttribute( "SRC", cell.obj );
							cell.lastObj = cell.lastObj;
						}
					} else {
						cell.backgroundLayer.setAttribute( "STYLE", "visibility: visible;" );
						cell.objectLayer.setAttribute( "STYLE", "visibility: hidden;" );
					}
				}

				if( cell.visibility > 0 && cell.bg != cell.lastBg ) {
					cell.backgroundLayer.setAttribute( "SRC", cell.bg );
					cell.lastBg = cell.bg;
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
		setObjectAt: setObjectAt,
	}

	for(var x = 0; x < width; x++) {
		cells[x] = [];
	}
	var tileWidth = 32;
	var tileHeight = 32;
	var sizeString = "";
	sizeString += "width: " + tileWidth + "px;";
	sizeString += "height: " + tileHeight + "px;";
	var outerCSS = "position: absolute; " + sizeString;
	var innerCSS = "position: absolute; left: 0px; top: 0px; " + sizeString;

	for(var y = 0; y < height; y++) {
		for(var x = 0; x < width; x++) {

			var containerDivFog = document.createElement( 'DIV' );
			containerDivFog.setAttribute( "STYLE", innerCSS );
			var fogElement = document.createElement('IMG' );
			fogElement.setAttribute( "SRC", "images/fog.png" );
			fogElement.setAttribute( "WIDTH", "32" );
			fogElement.setAttribute( "HEIGHT", "32" );
			fogElement.setAttribute( "STYLE", "visibility: hidden" );
			containerDivFog.appendChild( fogElement );

			var containerDivDarkness = document.createElement( 'DIV' );
			containerDivDarkness.setAttribute( "STYLE", innerCSS );
			var darknessElement = document.createElement('IMG' );
			darknessElement.setAttribute( "SRC", "images/darkness.png" );
			darknessElement.setAttribute( "WIDTH", "32" );
			darknessElement.setAttribute( "HEIGHT", "32" );
			darknessElement.setAttribute( "STYLE", "visibility: hidden" );
			containerDivDarkness.appendChild( darknessElement );

			var containerDivBackground = document.createElement( 'DIV' );
			containerDivBackground.setAttribute( "STYLE", innerCSS );
			var bgElement = document.createElement('IMG' );
			bgElement.setAttribute( "SRC", "images/black-dot.png" );
			bgElement.setAttribute( "WIDTH", "32" );
			bgElement.setAttribute( "HEIGHT", "32" );
			containerDivBackground.appendChild( bgElement );

			var containerDivObject = document.createElement( 'DIV' );
			containerDivObject.setAttribute( "STYLE", innerCSS );
			var objectElement = document.createElement('IMG' );
			objectElement.setAttribute( "SRC", "images/blank.png" );
			objectElement.setAttribute( "WIDTH", "32" );
			objectElement.setAttribute( "HEIGHT", "32" );
			objectElement.setAttribute( "STYLE", "visibility: hidden" );
			containerDivObject.appendChild( objectElement );


			var outerCSSFull = outerCSS;
			outerCSSFull += "left: " + (x * tileWidth) + "px;";
			outerCSSFull += "top: " + (y * tileHeight) + "px;";
			var containerDivOuter = document.createElement( 'DIV' );
			containerDivOuter.setAttribute( "STYLE", outerCSSFull );
			containerDivOuter.appendChild( containerDivBackground );
			containerDivOuter.appendChild( containerDivObject );
			containerDivOuter.appendChild( containerDivFog );
			containerDivOuter.appendChild( containerDivDarkness );

			/*	Visibility, magic numbers.
				None (0): nothing is visible (except table background)
				Remembered (1): background layer visible, fog of war visible.
				Full (2): background layer visible, object layer overrides.
			*/

			cells[x][y] = {
				lastVisibility: "dummy",
				visibility: 0,
				backgroundLayer: bgElement,
				objectLayer: objectElement,
				fogLayer: fogElement,
				darknessLayer: darknessElement,

				lastBg: "black-dot.png",
				lastObj: null,
				bg: "black-dot.png",
				obj: null,
			}

			document.getElementById( target ).appendChild( containerDivOuter );
		}
	}

	return rv;
}

