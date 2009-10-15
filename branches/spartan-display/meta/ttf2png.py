#!/usr/bin/python2.5

import sys

fontFile, fontSize = sys.argv[1], int( sys.argv[2] )
glyphs = [ chr(c) for c in range(32,127) ]
colours = [
	(0xff, 0x00, 0x00),
	(0x00, 0xff, 0x00),
	(0x00, 0x00, 0xff),
	(0x80, 0x80, 0x80),
	(0x00, 0x00, 0x00),
	(0xff, 0xff, 0xff),
	(0xff, 0xff, 0x00),
	(0x00, 0xff, 0xff),
	(0xff, 0x00, 0xff),
]
prefix = "./output-images/"


import ImageFont, Image, ImageDraw
import os
import os.path

font = ImageFont.truetype( fontFile, fontSize )
	
html = open( "spartan-images.html", "w" )
print >> html, "<html>"
print >> html, "<body>"
print >> html, "<h1>%s, %dpt</h1>" % (fontFile, fontSize)
print >> html, "<table cellspacing=\"0\" padding=\"0\">"


rwidth, rheight = 0, 0
for glyph in glyphs:
	width, height = font.getsize( glyph )
	rwidth = max( width, rwidth )
	rheight = max( height, rheight )


for glyph in glyphs:
	width, height = font.getsize( glyph )
	x0 = int( (rwidth - width) / 2 + 0.5 )
	y0 = int( (rheight - height) / 2 + 0.5 )

	img = Image.new( "L", (rwidth,rheight) )
	draw = ImageDraw.Draw( img )
	draw.text( (x0,y0), glyph, font = font, fill = 255 )

	dirname = '%s/g%02X/' % (prefix, ord( glyph ) )
	if not os.path.exists( dirname ):
		os.makedirs( dirname )

	for colour in colours:
		r,g,b = colour
		name = "%sg%02X-c%02x%02x%02x.png" % ( dirname, ord(glyph), r, g, b )
		nd = []
		for v in img.getdata():
			t = float(v) / 255.0
			tr = min( int( t * r + 0.5 ), 255 )
			tg = min( int( t * g + 0.5 ), 255 )
			tb = min( int( t * b + 0.5 ), 255 )
			tr, tg, tb = r, g, b
			ta = v
			nd.append( (tr,tg,tb,ta) )
		cimg = Image.new( "RGBA", img.size )
		cimg.putdata( nd )
		cimg.save( name )
		print >> html, "<tr>"
		for c2 in colours:
			r2, g2, b2 = c2
			print >> html, "<td bgcolor=\"#%02x%02x%02x\">" % (r2,g2,b2)
			print >> html, "<img src=\"%s\">" % (name)

print >> html, "</table></body></html>"
html.close()
