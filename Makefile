
build/build.js: index.js test/*
	@component build --dev -v

test/built.js: test/* index.js
	sourcegraph -p mocha,javascript,nodeish ./test/browser.js | bigfile -p nodeish -x null > $@ 

install: component.json
	@component install --dev

clean:
	rm -fr build components

docs:
	@cat docs/head.md > Readme.md
	@dox --api < index.js >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: clean docs components
