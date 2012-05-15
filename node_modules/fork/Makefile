
build/default/createpair.node: build
	node-waf build

build:
	node-waf configure

test: build/default/createpair.node
	node example/invisible/fork.js

clean:
	rm -rf build .lock-wscript

