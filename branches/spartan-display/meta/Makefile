.PHONY: images clean compress

images:
	./ttf2png.py

clean:
	rm -rf ./output-images
	rm -f ./spartan-images.html
	rm -rf ./ttf-bitstream-vera-1.10
	rm -f ./temporary.png

ttf-bitstream-vera-1.10:
	if [ ! -e $@.tar.bz2 ]; then wget "http://ftp.gnome.org/pub/GNOME/sources/ttf-bitstream-vera/1.10/ttf-bitstream-vera-1.10.tar.bz2"; fi
	tar xvfj "ttf-bitstream-vera-1.10.tar.bz2"

vera-mono-bold-30: ttf-bitstream-vera-1.10
	./ttf2png.py ttf-bitstream-vera-1.10/VeraMoBd.ttf 30 $(FONTFLAGS)

vera-mono-30: ttf-bitstream-vera-1.10
	./ttf2png.py ttf-bitstream-vera-1.10/VeraMono.ttf 30 $(FONTFLAGS)

crush:
	for i in ./output-images/*/*; do pngcrush "$$i" temporary.png; cp temporary.png "$$i"; rm temporary.png; done
