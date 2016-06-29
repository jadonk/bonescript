PREFIX:=/usr/local
npm_options:=--unsafe-perm=true --progress=false --loglevel=error --prefix $(DESTDIR)$(PREFIX)
NODE_PATH:=$(DESTDIR)$(PREFIX)/lib/node_modules
NODEJS:=nodejs
NPM:=npm

ver=$(shell nodejs -pe "require('./package.json').version")
npm_version=$(shell $(NPM) --version)
node_version=$(shell $(NODEJS) --version)

all:
	@echo "ver=$(ver)"
	@echo "npm_version=$(npm_version)"
	@echo "node_version=$(node_version)"

clean:


test:


install:
	NODE_PATH=$(NODE_PATH) TERM=dumb $(NPM) install -g $(npm_options)
	echo $(ver) > $(NODE_PATH)/bonescript/bonescript.version
	echo $(node_version) > $(NODE_PATH)/bonescript/bonescript.node_version
	systemctl stop bonescript-autorun.service || true
	systemctl stop bonescript.service || true
	systemctl stop bonescript.socket || true
	install -m 0755 -d $(DESTDIR)/etc/default
	install -m 0644 etc/default/node $(DESTDIR)/etc/default/
	install -m 0755 -d $(DESTDIR)/etc/profile.d
	install -m 0755 etc/profile.d/node.sh $(DESTDIR)/etc/profile.d/
	install -m 0755 -d $(DESTDIR)/lib/systemd/system
	install -m 0644 systemd/bonescript.socket $(DESTDIR)/lib/systemd/system/
	install -m 0644 systemd/bonescript.service $(DESTDIR)/lib/systemd/system/
	install -m 0644 systemd/bonescript-autorun.service $(DESTDIR)/lib/systemd/system/
	systemctl enable bonescript.socket || true
	systemctl enable bonescript.service || true
	systemctl enable bonescript-autorun.service || true
	install -m 0755 -d $(DESTDIR)/etc/avahi/services
	install -m 0644 etc/avahi/services/bone101.service $(DESTDIR)/etc/avahi/services/

.PHONY: clean test install
