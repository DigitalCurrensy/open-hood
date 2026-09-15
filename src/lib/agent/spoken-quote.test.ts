import assert from "node:assert/strict";
import { test } from "node:test";
import { spokenQuoteLines } from "./spoken-quote.ts";

test("spoken cabin quote becomes a book line", () => {
  assert.equal(spokenQuoteLines("They quoted $89 for a cabin filter"), "Cabin air filter $89");
});

test("short cabin line normalizes to the book name", () => {
  assert.equal(spokenQuoteLines("Cabin filter $89"), "Cabin air filter $89");
});

test("book-shaped cabin line stays intact", () => {
  assert.equal(spokenQuoteLines("Cabin air filter $89"), "Cabin air filter $89");
});
