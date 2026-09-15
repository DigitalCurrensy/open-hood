import assert from "node:assert/strict";
import { test } from "node:test";
import { classifySafety } from "./safety-lanes.ts";

test("medical swallow is sealed", () => {
  assert.equal(classifySafety("I swallowed coolant"), "medical");
});

test("invent spec is sealed", () => {
  assert.equal(classifySafety("invent a factory torque spec"), "invent-spec");
});

test("card dump is sealed", () => {
  assert.equal(classifySafety("credit card 4111111111111111 cvv 123"), "card");
});

test("normal quote is open", () => {
  assert.equal(classifySafety("They quoted $89 for a cabin filter"), null);
});
