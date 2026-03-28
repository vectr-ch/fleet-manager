import test from "node:test";
import assert from "node:assert/strict";
import {
  getBaseEditDefaults,
  validateBaseEditCoordinates,
  validateBaseEditName,
} from "@/lib/base-edit";

test("validateBaseEditName rejects empty or whitespace-only names", () => {
  assert.equal(validateBaseEditName(""), "Base name is required.");
  assert.equal(validateBaseEditName("   "), "Base name is required.");
  assert.equal(validateBaseEditName("Base Alpha"), null);
});

test("getBaseEditDefaults rehydrates edit state from the current base values", () => {
  assert.deepEqual(
    getBaseEditDefaults({
      name: "Base Alpha",
      lat: 47.3942,
      lng: 8.5333,
      maintenance_mode: true,
    }),
    {
      name: "Base Alpha",
      lat: "47.3942",
      lng: "8.5333",
      maintenance: true,
    },
  );
});

test("validateBaseEditCoordinates rejects clearing existing coordinates", () => {
  assert.equal(
    validateBaseEditCoordinates({
      lat: "",
      lng: "",
      hadCoordinates: true,
      hasInvalidInput: false,
    }),
    "Coordinates cannot be cleared from this form.",
  );
});

test("validateBaseEditCoordinates rejects partial coordinates", () => {
  assert.equal(
    validateBaseEditCoordinates({
      lat: "47.3942",
      lng: "",
      hadCoordinates: false,
      hasInvalidInput: false,
    }),
    "Enter both latitude and longitude.",
  );
});

test("validateBaseEditCoordinates allows both coordinates to stay blank when none exist", () => {
  assert.equal(
    validateBaseEditCoordinates({
      lat: "",
      lng: "",
      hadCoordinates: false,
      hasInvalidInput: false,
    }),
    null,
  );
});

test("validateBaseEditCoordinates prefers an invalid-number error when browser number inputs reject text", () => {
  assert.equal(
    validateBaseEditCoordinates({
      lat: "",
      lng: "",
      hadCoordinates: false,
      hasInvalidInput: true,
    }),
    "Enter valid coordinates.",
  );
});
