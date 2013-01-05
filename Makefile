
build: index.js
	@component build --dev -v

install: component.json
	@component install --dev

clean:
	rm -fr build components

docs:
	@cat docs/head.md > Readme.md
	@dox --api < index.js >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: clean docs build components
