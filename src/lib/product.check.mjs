// Self-check for the price-filter helpers in product.ts. No test runner in this
// project, so it is a plain script:
//   node --experimental-strip-types src/lib/product.check.mjs
import assert from "node:assert/strict";
import { activePriceRange, inPriceRange, priceLimits } from "./product.ts";

// Limits: real prices only — 0 (no variant), NaN and Infinity are ignored.
assert.deepEqual(priceLimits([1, 300, 5000, 400, 40000]), { min: 1, max: 40000 });
assert.deepEqual(priceLimits([0, NaN, Infinity, 250, 900]), { min: 250, max: 900 });
assert.deepEqual(priceLimits([499.5, 1999.2]), { min: 499, max: 2000 }); // reachable in ₹1 steps
assert.equal(priceLimits([]), null);
assert.equal(priceLimits([0, NaN]), null);
assert.deepEqual(priceLimits([700, 700]), { min: 700, max: 700 }); // one price: valid, not a crash

const limits = { min: 1, max: 40000 };

// No selection, or a selection covering the full limits, is no filter.
assert.equal(activePriceRange(null, limits), null);
assert.equal(activePriceRange([1, 40000], limits), null);
assert.equal(activePriceRange([5000, 5000], null), null);

// A narrowed selection filters, clamped into the limits.
assert.deepEqual(activePriceRange([300, 5000], limits), [300, 5000]);
assert.deepEqual(activePriceRange([-50, 5000], limits), [1, 5000]);
assert.deepEqual(activePriceRange([300, 99999], limits), [300, 40000]);
// Limits shrink under an old selection: it never inverts.
assert.deepEqual(activePriceRange([30000, 40000], { min: 1, max: 20000 }), [20000, 20000]);

// Boundaries are inclusive; unpriced pieces never match a set range.
assert.equal(inPriceRange(300, [300, 5000]), true);
assert.equal(inPriceRange(5000, [300, 5000]), true);
assert.equal(inPriceRange(299, [300, 5000]), false);
assert.equal(inPriceRange(5001, [300, 5000]), false);
assert.equal(inPriceRange(0, [0, 5000]), false);
assert.equal(inPriceRange(5000, [5000, 5000]), true);

console.log("price filter checks passed");
