# 11. Semantic linked-data exports

## Goal

Publish every system-code, spelling-system, and authority in three machine-readable formats: JSON-LD (embedded in HTML + standalone), RDF/Turtle, and RDF/XML. Plus a site-wide dump at `/data/rdf/iso-24229-register.{ttl,rdf,nt}`.

## Architecture

A single `SemanticExporter` abstract class with three concrete subclasses (`JsonLdExporter`, `TurtleExporter`, `RdfXmlExporter`). Each consumes a `RegisterItem` and produces a string. Adding a format = adding a subclass. Adding a new item class = the abstract class has a hook method to override.

## Implementation

1. `src/semantic/SemanticExporter.ts` — abstract base with `exportItem(item: RegisterItem): string` and `exportIndex(index: RegisterIndex): string`.
2. `src/semantic/JsonLdExporter.ts` — embeds schema.org types (`Language`, `DefinedTerm`, `Organization`).
3. `src/semantic/TurtleExporter.ts` — emits `@prefix`-style TTL.
4. `src/semantic/RdfXmlExporter.ts` — emits RDF/XML.
5. `src/pages/register/[itemClass]/i/[uuid].astro` embeds JSON-LD via `<script type="application/ld+json">` in the head.
6. `src/pages/register/[itemClass]/i/[uuid].ttl.ts` and `.rdf.ts` — endpoints that stream the alternative formats.
7. `src/pages/data/rdf/[filename].ts` — site-wide dumps.
8. `src/pages/sparql/index.astro` — a basic SPARQL query form (communica-engine based) over the dump.

## Vocabulary

| Item class | Primary schema.org type | Custom predicates |
| --- | --- | --- |
| `system-code` | `DefinedTerm` | `iso24229:authority`, `iso24229:sourceSpelling`, `iso24229:targetSpelling`, `iso24229:identifyingSegment` |
| `spelling-system` | `Language` | `iso24229:languageCode`, `iso24229:scriptCode`, `iso24229:countryCode` |
| `authority` | `Organization` | schema.org `address`, `contactPoint` |
| `system-relation` | (custom type) | `iso24229:type`, `iso24229:targetSystem` |

## Acceptance

- [ ] Each system-code page passes the W3C RDF validator for all three formats
- [ ] JSON-LD validates via schema.org's structured data linter
- [ ] Site-wide TTL dump loads in Apache Jena or rdflib
- [ ] `/sparql/` query form executes basic SELECTs
