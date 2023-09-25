SHELL := bash

.PHONY: all
all: serve

.PHONY: astro
astro:
	pnpm run astro

dist:
	make build

.PHONY: build
build:
	pnpm run build

.PHONY: start
start: serve

.PHONY: dev
dev: serve

.PHONY: serve
serve:
	pnpm run dev

.PHONY: preview
preview: dist
	pnpm run preview

.PHONY: check
check:
	pnpm run check

.PHONY: clean
clean:
	rm -rf dist
