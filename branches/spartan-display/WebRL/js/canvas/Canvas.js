var scr;
$(document).ready(function() {
	scr = GameScreen(scrWidth, scrHeight);
})

var GameScreen = function(width, height) {
	var clearAll = function() {
		cnvs.ctx.fillStyle = "rgb(0, 0, 0)";
		cnvs.ctx.fillRect(0, 0, cnvs.canvas.width, cnvs.canvas.height);
	}
	
	var putCell = function(x, y, symbol, color) {
		cnvs.ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
		cnvs.ctx.fillText(symbol, x * cnvs.fontWidth(), (y * cnvs.fontHeight()) + cnvs.fontDescent());
	}
	
	var cnvs = Canvas('canvasScreen', width, height);
	clearAll();
	
	return {
		width: width,
		height: height,
		clearAll: clearAll,
		putCell: putCell,

		/* Abstraction layer functions. Since the Spartan interface was
		   written to fit this one, these are just identity functions
		   or no-ops. */
		symbol: function( s ) {
			return s;
		},
		colour: function( rgb ) {
			return rgb;
		},
		update: function() {},
	};
}

// Width/Height are in characters, this class should only be used
// within GameScreen.
var Canvas = function(id, width, height) {
	var ctx;
	var fascent;
	var fdescent;
	var fwidth;
	var supports_text;
	
	var canv;
	
	// Public functions.
	var changeFont = function(to) {
		size = getFontSize(to);
		if (supports_text) {
			fascent = size * 0.1;
			fdescent = size;
			fwidth = size;
			canv.width = (fwidth * width);
			canv.height = (fascent + fdescent) * height;
			ctx.font = to;
		} else {
			fascent = ctx.fontDescent('sans', size);
			fdescent = ctx.fontAscent('sans', size);
			fwidth = ctx.measureText('sans', size, '@');
			canv.width = (fwidth * width);
			canv.height = (fascent + fdescent) * height;
		}
	}
	
	var fontAscent = function() {
		return fascent;
	}
	
	var fontDescent = function() {
		return fdescent;
	}
	
	var fontWidth = function() {
		return fwidth;
	}
	
	var fontHeight = function() {
		return fascent + fdescent;
	}
	
	// Gets the font size from a string like, "10px monospace"
	var getFontSize = function(str) {
		if (!str) 
			return 10;
		if (str.indexOf('px') != -1) {
			return 1 * str.substring(0, str.indexOf('px'));
		} else if (str.indexOf('pt') != -1) {
			return 1 * str.substring(0, str.indexOf('px'));
		} else {
			// default to 10
			return 10;
		}
	}
	
	// Compatibility functions.
	var showText = function(str, x, y) {
		var temp = ctx.strokeStyle;
		ctx.strokeStyle = ctx.fillStyle;
		
		for (var i = 0; i < str.length; ++i) {
			var offset = (fwidth - ctx.measureText('sans', size, str[i])) / 2;
			ctx.drawText('sans', size, x + offset, y, str);
			x += x;
		}
		
		
		ctx.strokeStype = temp;
	}
	
	// Initialize
	canv = document.getElementById(id);
	
	if (!canv || !canv.getContext) 
		return null;
	
	ctx = canv.getContext('2d');
	
	// In case the browser doesn't support text functions
	if (!ctx.fillText) {
		supports_text = false;
		CanvasTextFunctions.enable(ctx);
		
		ctx.fillText = showText;
		ctx.strokeText = showText;
		
		changeFont('14px monospace');
	} else {
		supports_text = true;
		changeFont('14px monospace');
	}
	
	return {
		canvas: canv,
		ctx: ctx,
		
		changeFont: changeFont,
		fontAscent: fontAscent,
		fontDescent: fontDescent,
		fontWidth: fontWidth,
		fontHeight: fontHeight,
	};
}
