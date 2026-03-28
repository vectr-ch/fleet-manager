import test from "node:test";
import assert from "node:assert/strict";
import {
  getNodeEditDefaults,
  validateNodeEditBaseId,
  validateNodeEditName,
} from "@/lib/node-edit";

test("validateNodeEditName rejects empty or whitespace-only names", () => {
  assert.equal(validateNodeEditName(""), "Node name is required.");
  assert.equal(validateNodeEditName("   "), "Node name is required.");
  assert.equal(validateNodeEditName("Node Alpha"), null);
});

test("validateNodeEditBaseId rejects clearing an assigned base from the edit form", () => {
  assert.equal(
    validateNodeEditBaseId({
      baseId: "",
      hadBase: true,
    }),
    "Base assignment cannot be cleared from this form.",
  );
});

test("validateNodeEditBaseId allows empty base selection when the node had no base", () => {
  assert.equal(
    validateNodeEditBaseId({
      baseId: "",
      hadBase: false,
    }),
    null,
  );
});

test("getNodeEditDefaults rehydrates edit state from the current node values", () => {
  assert.deepEqual(
    getNodeEditDefaults({
      name: "Node Alpha",
      serial: "SN-1234",
      base_id: "base-1",
    }),
    {
      name: "Node Alpha",
      serial: "SN-1234",
      baseId: "base-1",
    },
  );
});
