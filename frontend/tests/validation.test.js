import test from "node:test";
import assert from "node:assert/strict";
import { validateStep } from "../src/validation.js";

const personal = {
  full_name: "Jordan Lee",
  email: "jordan@example.com",
  phone: "+1 555 123 4567",
  linkedin: "linkedin.com/in/jordan",
  github: "",
  portfolio: "",
};

test("target step requires a job title", () => {
  assert.equal(validateStep(0, { target_title: "   " }).target_title, "Add the job title you are targeting.");
  assert.deepEqual(validateStep(0, { target_title: "Backend developer" }), {});
});

test("personal details accept valid contact details and bare website hosts", () => {
  assert.deepEqual(validateStep(1, personal), {});
});

test("personal details report invalid email, phone, and URLs", () => {
  const errors = validateStep(1, {
    ...personal,
    email: "not-an-email",
    phone: "call me",
    github: "not a url",
  });
  assert.ok(errors.email);
  assert.ok(errors.phone);
  assert.ok(errors.github);
});
