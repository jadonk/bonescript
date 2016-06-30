PREFIX:=/usr/local
npm_options:=--unsafe-perm=true --progress=false --loglevel=error
NODE_PATH:=$(DESTDIR)$(PREFIX)/lib/node_modules
NODEJS:=nodejs
NPM:=npm

ver=$(shell nodejs -pe "require('./package.json').version")
npm_version=$(shell $(NPM) --version)
node_version=$(shell $(NODEJS) --version)
bs_path=./build/lib/node_modules/bonescript

all:
	mkdir -p $(bs_path)
	echo $(ver) > $(bs_path)/bonescript.version
	echo $(node_version) > $(bs_path)/bonescript.node_version
	echo $(npm_version) > $(bs_path)/bonescript.npm_version
	TERM=dumb $(NPM) install -g $(npm_options) --prefix ./build
	cp -dr --preserve=mode,timestamp etc/* ./build/etc/

clean:
	rm -rf build

test:


install:
	install -m 0755 -d $(DESTDIR)$(PREFIX)
	cp -dr --preserve=mode,timestamp ./build/* $(DESTDIR)$(PREFIX)/
	systemctl stop bonescript-autorun.service || true
	systemctl stop bonescript.service || true
	systemctl stop bonescript.socket || true
	install -m 0755 -d $(DESTDIR)/lib/systemd/system
	install -m 0644 systemd/bonescript.socket $(DESTDIR)/lib/systemd/system/
	install -m 0644 systemd/bonescript.service $(DESTDIR)/lib/systemd/system/
	install -m 0644 systemd/bonescript-autorun.service $(DESTDIR)/lib/systemd/system/
	systemctl enable bonescript.socket || true
	systemctl enable bonescript.service || true
	systemctl enable bonescript-autorun.service || true

.PHONY: clean test install
