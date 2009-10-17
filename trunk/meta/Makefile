.PHONY: images clean compress

FONTSIZE?=30
FONTFLAGS?=invert

clean:
	rm -rf ./output-images
	rm -f ./spartan-images.html
	rm -rf ./ttf-bitstream-vera-1.10
	rm -f ./temporary.png

ttf-bitstream-vera-1.10:
	if [ ! -e $@.tar.bz2 ]; then wget "http://ftp.gnome.org/pub/GNOME/sources/ttf-bitstream-vera/1.10/ttf-bitstream-vera-1.10.tar.bz2"; fi
	tar xvfj "ttf-bitstream-vera-1.10.tar.bz2"

vera-mono-bold: ttf-bitstream-vera-1.10
	./ttf2png.py ttf-bitstream-vera-1.10/VeraMoBd.ttf $(FONTSIZE) $(FONTFLAGS)

vera-mono: ttf-bitstream-vera-1.10
	./ttf2png.py ttf-bitstream-vera-1.10/VeraMono.ttf $(FONTSIZE) $(FONTFLAGS)

crush:
	for i in ./output-images/*/*; do pngcrush "$$i" temporary.png; cp temporary.png "$$i"; rm temporary.png; done

install:
	mkdir -p ../WebRL/symbols
	cp -r ./output-images/* ../WebRL/symbols 

install-current-fit: ttf-bitstream-vera-1.10
	./ttf2png.py ttf-bitstream-vera-1.10/VeraMoBd.ttf 20 invert
	make install
