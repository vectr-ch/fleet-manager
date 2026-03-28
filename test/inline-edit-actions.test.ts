import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Check, X } from "lucide-react";
import { InlineEditActions } from "@/components/dashboard/inline-edit-actions";

test("InlineEditActions keeps save and close controls on the same button sizing system", () => {
  const markup = renderToStaticMarkup(
    createElement(InlineEditActions, {
      isPending: false,
      saveLabel: "Save",
      onSave: () => undefined,
      onClose: () => undefined,
      saveIcon: createElement(Check, { className: "size-3" }),
      closeIcon: createElement(X, { className: "size-3" }),
    }),
  );

  assert.match(markup, /Save/);
  assert.match(markup, /bg-foreground text-background font-medium/);
  assert.match(markup, /px-2\.5 py-1\.5/);
  assert.match(markup, /aria-label="Close"/);
  assert.match(markup, /size-7/);
  assert.doesNotMatch(markup, />Close</);
});
