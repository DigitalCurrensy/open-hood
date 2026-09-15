import assert from "node:assert/strict";
import { test } from "node:test";
import { spokenQuoteLines } from "./spoken-quote.ts";

test("spoken cabin quote becomes a book line", () => {
  assert.equal(spokenQuoteLines("They quoted $89 for a cabin filter"), "Cabin air filter $89");
});

test("already-shaped lines stay intact", () => {
  assert.equal(spokenQuoteLines("Cabin filter $89"), "Cabin filter $89");
});
