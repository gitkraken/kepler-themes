/*!
 * Kepler theme check 0.13.0
 *
 * Generated from Kepler 0.13.0. Do not edit by hand: it is rebuilt from
 * Kepler and committed here by pull request.
 *
 * MIT License
 *
 * Copyright (c) 2026 GitKraken
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Third-party notices of the code bundled below follow where it requires them.
 */

//#region src/shared/theme/id.ts
/**
* The shape every theme id takes. Imported on its own by the settings
* validators, which Electron main also loads, so it carries no dependencies.
*/
const THEME_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

//#endregion
//#region src/shared/theme/color.ts
const HEX_RE$1 = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;
const NUM$1 = String.raw`(\d*\.?\d+)`;
const OKLCH_RE$1 = new RegExp(String.raw`^oklch\(\s*${NUM$1}\s+${NUM$1}\s+${NUM$1}(?:\s*\/\s*${NUM$1})?\s*\)$`, "i");
const CANONICAL_RE = new RegExp(String.raw`^${NUM$1} ${NUM$1} ${NUM$1}(?: \/ ${NUM$1})?$`);
const MAX_CHROMA = .5;
const ACHROMATIC_CHROMA = 1e-4;
function srgbToLinear$1(v) {
	return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
}
function linearToSrgb$1(v) {
	return v <= .0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - .055;
}
function linearSrgbToOklab(r, g, b) {
	const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
	const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
	const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
	return [
		.2104542553 * l + .793617785 * m - .0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + .4505937099 * s,
		.0259040371 * l + .7827717662 * m - .808675766 * s
	];
}
function oklabToLinearSrgb(L, a, b) {
	const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
	const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
	const s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
		-.0041960863 * l - .7034186147 * m + 1.707614701 * s
	];
}
function inGamut([r, g, b]) {
	const lo = -1e-6;
	const hi = 1.000001;
	return r >= lo && r <= hi && g >= lo && g <= hi && b >= lo && b <= hi;
}
function lchToLinear(l, c, h) {
	const rad = h * Math.PI / 180;
	return oklabToLinearSrgb(l, c * Math.cos(rad), c * Math.sin(rad));
}
function trimmed(value, digits) {
	return String(Number(value.toFixed(digits)));
}
/** Formats as the bare form Kepler's CSS uses: `L C H` or `L C H / a`. */
function formatCanonical({ l, c, h, a }) {
	const base = `${trimmed(l, 4)} ${trimmed(c, 4)} ${trimmed(h, 2)}`;
	const alpha = trimmed(a, 3);
	return Number(alpha) >= 1 ? base : `${base} / ${alpha}`;
}
function validate$1(l, c, h, a) {
	if (![
		l,
		c,
		h,
		a
	].every(Number.isFinite)) return null;
	if (l < 0 || l > 1 || c < 0 || c > MAX_CHROMA || h < 0 || h > 360 || a < 0 || a > 1) return null;
	return {
		l,
		c,
		h,
		a
	};
}
function hexToOklch(hex) {
	if (!HEX_RE$1.exec(hex)) return null;
	const channel = (at) => parseInt(hex.slice(at, at + 2), 16) / 255;
	const [L, A, B] = linearSrgbToOklab(srgbToLinear$1(channel(1)), srgbToLinear$1(channel(3)), srgbToLinear$1(channel(5)));
	const c = Math.hypot(A, B);
	const achromatic = c < ACHROMATIC_CHROMA;
	const hue = Math.atan2(B, A) * 180 / Math.PI;
	return {
		l: Math.min(1, Math.max(0, L)),
		c: achromatic ? 0 : c,
		h: achromatic ? 0 : (hue + 360) % 360,
		a: hex.length === 9 ? channel(7) : 1
	};
}
/** Parses `#rrggbb`, `#rrggbbaa`, `oklch(L C H)` or `oklch(L C H / a)`; null when invalid or out of range. */
function parseColor(input) {
	const hex = hexToOklch(input);
	if (hex) return hex;
	const m = OKLCH_RE$1.exec(input);
	if (!m) return null;
	return validate$1(Number(m[1]), Number(m[2]), Number(m[3]), m[4] === void 0 ? 1 : Number(m[4]));
}
/** Canonical bare form of any accepted color syntax, or null. */
function toCanonical(input) {
	const parsed = parseColor(input);
	return parsed ? formatCanonical(parsed) : null;
}
function toHexByte(v) {
	return Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0");
}
function toSrgbByte(linear) {
	return toHexByte(linearToSrgb$1(Math.min(1, Math.max(0, linear))));
}
function oklchToHexParts({ l, c, h, a }) {
	let rgb = lchToLinear(l, c, h);
	if (!inGamut(rgb)) {
		let lo = 0;
		let hi = c;
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2;
			if (inGamut(lchToLinear(l, mid, h))) lo = mid;
			else hi = mid;
		}
		rgb = lchToLinear(l, lo, h);
	}
	const [lr, lg, lb] = rgb;
	const alpha = toHexByte(a);
	return `#${toSrgbByte(lr)}${toSrgbByte(lg)}${toSrgbByte(lb)}${alpha === "ff" ? "" : alpha}`;
}
/** Hex output form of a terminal or syntax color in any accepted syntax. */
function toHexColor(input) {
	const parsed = parseColor(input);
	return parsed ? oklchToHexParts(parsed) : null;
}
/** Canonical form of a ladder alpha over its source token, for example `var(--ink) / 0.87`. */
function formatLadder(source, alpha) {
	if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) return null;
	return `var(--${source}) / ${trimmed(alpha, 3)}`;
}

//#endregion
//#region node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function joinValues(array, separator = "|") {
	return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
var Cached = class {
	constructor(getter) {
		this._getter = getter;
		this._value = void 0;
	}
	get value() {
		const getter = this._getter;
		if (getter !== void 0) {
			this._value = getter();
			this._getter = void 0;
		}
		return this._value;
	}
};
function cached(getter) {
	return new Cached(getter);
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
	const ratio = val / step;
	const roundedRatio = Math.round(ratio);
	const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
	if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
	return ratio - roundedRatio;
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
/**
* Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
*
* Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
*/
function rawShape(def) {
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	return desc?.get ? desc.get.raw : desc?.value;
}
function sourceShape(schema) {
	return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
function deferProp(target, key, getter) {
	Object.defineProperty(target, key, {
		get() {
			const value = getter();
			assignProp(this, key, value);
			return value;
		},
		enumerable: true,
		configurable: true
	});
}
function putProp(target, key, value) {
	if (key in target) assignProp(target, key, value);
	else target[key] = value;
}
/**
* Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
*
* A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
*/
function mirrorShape(target, source, keys, wrap) {
	const raw = sourceShape(source);
	for (const key of keys) {
		const desc = Object.getOwnPropertyDescriptor(raw, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => {
			const value = source._zod.def.shape[key];
			return wrap ? wrap(value, key) : value;
		});
		else putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
	}
}
function mirrorProps(target, source) {
	for (const key of Reflect.ownKeys(source)) {
		const desc = Object.getOwnPropertyDescriptor(source, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => source[key]);
		else putProp(target, key, desc.value);
	}
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) {
		const descriptors = Object.getOwnPropertyDescriptors(def);
		Object.assign(mergedDescriptors, descriptors);
	}
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = /* @__PURE__*/ cached(() => {
	if (globalConfig.jitless) return false;
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	if (o instanceof Map) return new Map(o);
	if (o instanceof Set) return new Set(o);
	return o;
}
const propertyKeyTypes = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function stringifyPrimitive(value) {
	if (typeof value === "bigint") return value.toString() + "n";
	if (typeof value === "string") return `"${value}"`;
	return `${value}`;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin !== void 0 && shape[k]._zod.optout === "optional";
	});
}
const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
const BIGINT_FORMAT_RANGES = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	const newShape = {};
	mirrorShape(newShape, schema, maskedKeys(schema, mask));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function maskedKeys(schema, mask) {
	const raw = sourceShape(schema);
	const keys = [];
	for (const key of Reflect.ownKeys(mask)) {
		if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) throw new Error(`Unrecognized key: "${String(key)}"`);
		if (mask[key]) keys.push(key);
	}
	return keys;
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	const omitted = new Set(maskedKeys(schema, mask));
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = sourceShape(schema);
		for (const key of Reflect.ownKeys(shape)) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function extended(schema, shape) {
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
	mirrorProps(newShape, shape);
	return newShape;
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
	if (!b?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	const newShape = {};
	mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
	mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
	return clone(a, mergeDefs(a._zod.def, {
		shape: newShape,
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: b._zod.def.checks ?? []
	}));
}
function partial(Class, schema, mask, name = "partial") {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({
		type: "optional",
		innerType: value
	})));
	return clone(schema, mergeDefs(schema._zod.def, {
		shape: newShape,
		checks: []
	}));
}
function required(Class, schema, mask) {
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({
		type: "nonoptional",
		innerType: value
	}));
	return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function explicitlyAborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
	var _a;
	for (let i = start; i < issues.length; i++) (_a = issues[i]).schema ?? (_a.schema = inst);
}
function finalizeIssue(iss, ctx, config) {
	var _a;
	const traits = iss.inst?._zod?.traits;
	if (traits?.has("$ZodType")) {
		if (traits.has("$ZodCheck")) (_a = iss).schema ?? (_a.schema = iss.inst);
		else iss.schema = iss.inst;
	}
	const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : void 0;
	const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	const full = {};
	for (const k of Object.keys(iss)) {
		if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__") continue;
		full[k] = iss[k];
	}
	full.path ?? (full.path = []);
	full.message = message;
	if (ctx?.reportInput) full.input = iss.input;
	return full;
}
const highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
	const units = str.length;
	if (!highSurrogate.test(str)) return units;
	let count = units;
	for (let i = 0; i < units - 1; i++) if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
		count--;
		i++;
	}
	return count;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function parsedType(data) {
	const t = typeof data;
	switch (t) {
		case "number": return Number.isNaN(data) ? "nan" : "number";
		case "object": {
			if (data === null) return "null";
			if (Array.isArray(data)) return "array";
			const obj = data;
			if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
		}
	}
	return t;
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
/**
* Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
*
* Call this from a `proto` initializer, which runs once per prototype — never per instance.
*/
function members(proto, table) {
	for (const key in table) {
		const desc = Object.getOwnPropertyDescriptor(table, key);
		if (desc.get) Object.defineProperty(proto, key, {
			...desc,
			enumerable: false
		});
		else defineBound(proto, key, desc.value);
	}
}
/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
function own(inst, key, value, enumerable = true) {
	Object.defineProperty(inst, key, {
		configurable: true,
		writable: true,
		enumerable,
		value
	});
	return value;
}
/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
function hide(inst, key, value) {
	return own(inst, key, value, false);
}
/** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
function derived(computes, table) {
	for (const key in computes) {
		const compute = computes[key];
		Object.defineProperty(table, key, {
			configurable: true,
			enumerable: true,
			get() {
				return own(this, key, compute(this));
			},
			set(value) {
				own(this, key, value);
			}
		});
	}
	return table;
}
function defineBound(proto, key, fn) {
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			return this == null ? fn : own(this, key, fn.bind(this));
		},
		set(value) {
			own(this, key, value);
		}
	});
}
/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
function claim(inst, sentinel) {
	const proto = Object.getPrototypeOf(inst);
	return sentinel in proto ? void 0 : proto;
}
let installing;
let broke = false;
const breaker = {
	configurable: true,
	get() {
		broke = true;
	}
};
/**
* Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
* constructor, computed from the internals object itself and cached there on
* first read. One accessor per constructor rather than one per instance.
*/
function defineLazyInternal(inst, key, compute) {
	const proto = Object.getPrototypeOf(inst._zod);
	if (key in proto && installing !== inst._zod) {
		installing = void 0;
		return;
	}
	installing = inst._zod;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			Object.defineProperty(this, key, breaker);
			const outer = broke;
			broke = false;
			try {
				const value = compute(this);
				if (broke) delete this[key];
				else Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					value
				});
				broke = broke || outer;
				return value;
			} catch (err) {
				delete this[key];
				broke = broke || outer;
				throw err;
			}
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				value
			});
		}
	});
}
/**
* Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
* data property. One accessor per constructor rather than one per instance, because an own accessor
* puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
*/
function installLazyProp(inst, key, make, enumerable) {
	const proto = claim(inst, key);
	if (!proto) return;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			const desc = {
				configurable: true,
				writable: true,
				enumerable,
				value: void 0
			};
			Object.defineProperty(this, key, desc);
			desc.value = make(this);
			Object.defineProperty(this, key, desc);
			return desc.value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				enumerable,
				value
			});
		}
	});
}
/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
const CONSTANT_CATCH = "~constantCatch";
/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
function constantCatch(value) {
	const fn = () => value;
	fn[CONSTANT_CATCH] = true;
	return fn;
}

//#endregion
//#region node_modules/zod/v4/core/core.js
var _a$1;
const _zodDesc = {
	value: void 0,
	enumerable: false
};
let _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
	const E = _E;
	if (E) {
		const saved = E.stackTraceLimit;
		if (typeof saved === "number") {
			try {
				E.stackTraceLimit = 0;
			} catch {
				_E = null;
				return new Definition();
			}
			try {
				return new Definition();
			} finally {
				E.stackTraceLimit = saved;
			}
		}
	}
	return new Definition();
}
function $constructor(name, initializer, proto, params) {
	const zodProto = {};
	function Internals(def) {
		this.def = def;
		this.constr = _;
		this.traits = /* @__PURE__ */ new Set();
	}
	Internals.prototype = zodProto;
	const protoMembers = proto;
	const initialized = protoMembers && /* @__PURE__ */ new WeakSet();
	function init(inst, def) {
		if (!inst._zod) {
			_zodDesc.value = new Internals(def);
			try {
				Object.defineProperty(inst, "_zod", _zodDesc);
			} finally {
				_zodDesc.value = void 0;
			}
		} else if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		if (initialized) {
			const own = Object.getPrototypeOf(inst);
			const ctorProto = inst._zod.constr.prototype;
			let up = own;
			while (up && up !== ctorProto) up = Object.getPrototypeOf(up);
			const target = up ?? own;
			if (!initialized.has(target)) {
				initialized.add(target);
				members(target, protoMembers);
			}
		}
		const proto = _.prototype;
		for (const k in proto) {
			if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		const inst = params?.Parent ? newError(Definition) : this;
		init(inst, def);
		const deferred = inst._zod.deferred;
		if (deferred) {
			for (const fn of deferred) fn();
			inst._zod.deferred = void 0;
		}
		const pp = globalThis.__zod_globalConfig?.postProcessor;
		if (pp) pp(inst);
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}

//#endregion
//#region node_modules/zod/v4/core/errors.js
function _getMessage() {
	const internals = this._zod;
	internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
	return internals.message;
}
function _setMessage(value) {
	this._zod.message = value;
}
const _messageDesc = {
	get: _getMessage,
	set: _setMessage,
	enumerable: true,
	configurable: true
};
const _issuesDesc = {
	value: void 0,
	enumerable: false
};
const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
const initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	_issuesDesc.value = def;
	Object.defineProperty(inst, "issues", _issuesDesc);
	_issuesDesc.value = void 0;
	Object.defineProperty(inst, "message", _messageDesc);
	const proto = Object.getPrototypeOf(inst);
	if (!_installedToString.has(proto)) {
		_installedToString.add(proto);
		Object.defineProperty(proto, "toString", {
			configurable: true,
			enumerable: false,
			get() {
				const value = () => this.message;
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
				return value;
			},
			set(value) {
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
			}
		});
	}
};
const $ZodError = $constructor("$ZodError", initializer$1);
const $ZodRealError = $constructor("$ZodError", initializer$1, void 0, { Parent: Error });
/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
* ("toString", "constructor") would otherwise read through to the prototype, and assigning
* "__proto__" would hit the setter instead of creating a key. */
function node(obj, key, make) {
	if (!Object.prototype.hasOwnProperty.call(obj, key)) {
		if (key === "__proto__") Object.defineProperty(obj, key, {
			value: make(),
			writable: true,
			enumerable: true,
			configurable: true
		});
		else obj[key] = make();
	}
	return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
	else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error, path = []) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else {
			const fullpath = [...path, ...issue.path];
			if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < fullpath.length) {
					const el = fullpath[i];
					const terminal = i === fullpath.length - 1;
					if (el === "_errors") {
						if (terminal) curr._errors.push(mapper(issue));
						i++;
						continue;
					}
					if (!Object.prototype.hasOwnProperty.call(curr, el)) Object.defineProperty(curr, el, {
						value: { _errors: [] },
						enumerable: true,
						writable: true,
						configurable: true
					});
					const node = curr[el];
					if (terminal) node._errors.push(mapper(issue));
					curr = node;
					i++;
				}
			}
		}
	};
	processError(error);
	return fieldErrors;
}

//#endregion
//#region node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
	return {
		callee: params?.callee ?? callee,
		Err: params?.Err
	};
}
const _parse = (_Err) => {
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		if (result.issues.length) {
			const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, _params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _parseAsync = (_Err) => {
	const fn = async (schema, value, _ctx, params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: true
		} : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		if (result.issues.length) {
			const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
function failure(Err, issues, ctx) {
	let error;
	return {
		success: false,
		get error() {
			if (!error) {
				error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
				issues = void 0;
				ctx = void 0;
			}
			return error;
		},
		set error(e) {
			error = e;
			issues = void 0;
			ctx = void 0;
		}
	};
}
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
const validate = ((schema, value, _ctx) => {
	const validator = schema._zod.bag.validator;
	if (validator !== void 0) {
		if (validator(value) !== COMPILE_INVALID) return true;
		if (validator.definite === true && _ctx === void 0) return false;
	}
	return validateFallback(schema, value, _ctx);
});
function validateFallback(schema, value, _ctx) {
	const ctx = _ctx ? {
		..._ctx,
		async: false,
		abortEarly: true
	} : {
		async: false,
		abortEarly: true
	};
	const fallbackRun = schema._zod.bag.fallbackRun;
	let result;
	if (fallbackRun) {
		ctx[COMPILE_FALLBACK] = true;
		result = fallbackRun({
			value,
			issues: []
		}, ctx);
	} else result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length === 0;
}
const validateAsync$1 = async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true,
		abortEarly: true
	} : {
		async: true,
		abortEarly: true
	};
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length === 0;
};
const _encode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return parse(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		return parse(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _encodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};

//#endregion
//#region node_modules/zod/v4/core/regexes.js
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
	return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
const email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
const httpProtocol = /^https?$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
/** Anchors a pattern source. The interpolation lives here rather than at the call site because
* esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
* will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
function anchor(source) {
	return new RegExp(`^${source}$`);
}
const date = /*@__PURE__*/ anchor(dateSource);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
	const opts = ["Z"];
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const qualified = `${timeSource({
		precision: args.precision,
		seconds: true
	})}(?:${opts.join("|")})`;
	const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const anyString = /^[\s\S]{0,}$/;
const integer = /^-?\d+$/;
const number$1 = /^-?\d+(?:\.\d+)?$/;
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;

//#endregion
//#region node_modules/zod/v4/core/checks.js
const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
const _whenHasLength = (payload) => {
	const val = payload.value;
	return !nullish(val) && val.length !== void 0;
};
const numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_big",
			maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_small",
			minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					continue: false,
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units > def.maximum ? codePointLength(input) : units) <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units) >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	def.pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});

//#endregion
//#region node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = [], closed = {}) {
		this.content = [];
		this.indent = 0;
		this.args = args;
		this.closed = closed;
	}
	indented(fn) {
		this.indent += 1;
		try {
			fn(this);
		} finally {
			this.indent -= 1;
		}
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const content = this?.content ?? [``];
		return new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`)(...Object.values(this.closed));
	}
};

//#endregion
//#region node_modules/zod/v4/core/versions.js
const version$1 = {
	major: 4,
	minor: 6,
	patch: 5
};

//#endregion
//#region node_modules/zod/v4/core/schemas.js
const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version$1;
	const defChecks = inst._zod.def.checks;
	const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			if (payload.memo) return payload;
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (explicitlyAborted(payload)) continue;
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
}, {
	get "~standard"() {
		return hide(this, "~standard", standardProps(this));
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	}
});
/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
async function validateAsync(inst, value) {
	const ctx = { async: true };
	return toStandardResult(await inst._zod.run({
		value,
		issues: []
	}, ctx), ctx);
}
function standardProps(inst) {
	return {
		validate: (value) => {
			const ctx = { async: false };
			try {
				const r = inst._zod.run({
					value,
					issues: []
				}, ctx);
				if (!(r instanceof Promise)) return toStandardResult(r, ctx);
			} catch (_) {}
			return validateAsync(inst, value);
		},
		vendor: "zod",
		version: 1
	};
}
const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = def.pattern ?? anyString;
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
/** The `://` guard rejected the input before the URL constructor saw it. */
const URL_BAD_FORMAT = 1;
/** The URL parser rejected the input. */
const URL_UNPARSEABLE = 2;
function canParseURL(input) {
	try {
		if (typeof URL !== "undefined" && typeof URL.canParse === "function") return URL.canParse(input);
		new URL(input);
		return true;
	} catch {
		return false;
	}
}
function validateURL(trimmed, def) {
	if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) return canParseURL(trimmed) || 2;
	return parseURLObject(trimmed, def);
}
/** Parses a URL while preserving the non-normalizing HTTP guard. */
function parseURLObject(trimmed, def) {
	if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) return 1;
	try {
		if (typeof URL !== "undefined") {
			const URLStatic = URL;
			if (typeof URLStatic.parse === "function") return URLStatic.parse(trimmed) ?? 2;
		}
		return new URL(trimmed);
	} catch {
		return 2;
	}
}
const asciiTabOrNewline = /[\t\n\r]/g;
/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
function stripTabAndNewline(value) {
	return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
	hostname.lastIndex = 0;
	return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
	protocol.lastIndex = 0;
	return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			const url = validateURL(trimmed, def);
			if (url === 1) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === 2) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === true) {
				payload.value = stripTabAndNewline(trimmed);
				return;
			}
			if (def.hostname && !urlHostnameOk(url, def.hostname)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: def.hostname.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			if (def.protocol && !urlProtocolOk(url, def.protocol)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: def.protocol.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
	if (def.length !== void 0 && (!Number.isInteger(def.length) || def.length < 1)) throw new Error(`Invalid nanoid length: ${def.length}`);
	def.pattern ?? (def.pattern = def.length === void 0 ? nanoid : nanoidOfLength(def.length));
	$ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date);
	$ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration);
	$ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
});
/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
	if (!ipv6Alphabet.test(value)) return false;
	return canParseURL(`http://[${value}]`);
}
const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidIPv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
	const parts = value.split("/");
	if (parts.length !== 2) return false;
	const [address, prefix] = parts;
	if (!prefix) return false;
	const prefixNum = Number(prefix);
	if (`${prefixNum}` !== prefix) return false;
	if (prefixNum < 0 || prefixNum > 128) return false;
	return isValidIPv6(address);
}
const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidCIDRv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (/\s/.test(data)) return false;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64Charset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
	if (!base64urlCharset.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64urlCharset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = number$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
		const proms = [];
		const abortEarly = ctx?.abortEarly;
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else {
				handleArrayResult(result, payload, i);
				if (abortEarly && result.issues.length !== 0 && aborted(result)) break;
			}
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, optin, optout) {
	const isPresent = key in input;
	const isOptionalOut = optout === "optional";
	if (!isPresent && isOptionalOut && optin === "optional") return;
	if (result.issues.length) {
		if (optin !== void 0 && isOptionalOut && !isPresent) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (!isPresent && optin === void 0) {
		if (!result.issues.length) final.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [key]
		});
		return;
	}
	if (result.value === void 0) {
		if (isPresent || optin === "defaulted" && !isOptionalOut) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
const NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	const ownSymbols = Object.getOwnPropertySymbols(def.shape);
	const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
	const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
	for (const k of allKeys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		allKeys,
		symbolKeys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const optin = _catchall.optin;
	const optout = _catchall.optout;
	let seen = 0;
	for (const key in input) {
		if (abortEarly && payload.issues.length !== seen) {
			if (aborted(payload, seen)) break;
			seen = payload.issues.length;
		}
		if (keySet.has(key)) continue;
		if (key === "__proto__") {
			if (t === "never") unrecognized.push(key);
			continue;
		}
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
		else handlePropertyResult(r, payload, key, input, optin, optout);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst,
		continue: true
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	const sh = desc?.get ? desc.get.raw : def.shape ?? {};
	if (sh) {
		const get = () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			get.raw = newSh;
			return newSh;
		};
		get.raw = sh;
		Object.defineProperty(def, "shape", { get });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazyInternal(inst, "propValues", (zod) => {
		const shape = zod.def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				if (!Object.prototype.hasOwnProperty.call(propValues, key)) assignProp(propValues, key, /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
				if (field.optin !== void 0) propValues[key].add(void 0);
			}
		}
		return propValues;
	});
	const isObject$2 = isObject;
	const catchall = def.catchall;
	let value;
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$2(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
		const proms = [];
		const shape = value.shape;
		const abortEarly = ctx?.abortEarly;
		let seen = payload.issues.length;
		for (const key of value.allKeys) {
			if (abortEarly && payload.issues.length !== seen) {
				if (aborted(payload, seen)) break;
				seen = payload.issues.length;
			}
			if (key === "__proto__") continue;
			const el = shape[key];
			const optin = el._zod.optin;
			const optout = el._zod.optout;
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
			else handlePropertyResult(r, payload, key, input, optin, optout);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
	};
});
const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const memo = globalConfig.memoizer;
	const generateFastpass = (shape) => {
		const normalized = _normalized.value;
		const syms = normalized.symbolKeys;
		const doc = new Doc(["payload", "ctx"], {
			shape,
			inst,
			memo,
			syms
		});
		const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.allKeys) ids[key] = `key_${counter++}`;
		doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
		for (const key of normalized.allKeys) {
			if (key === "__proto__") continue;
			const id = ids[key];
			const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
			const isPresent = `${k} in input`;
			const schema = shape[key];
			const optin = schema?._zod?.optin;
			const isOptionalIn = optin !== void 0;
			const isOptionalOut = schema?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(k)};`);
			if (isOptionalIn && isOptionalOut) {
				const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
				doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
			} else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
			else {
				doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
				if (optin === "defaulted") doc.write(`newResult[${k}] = ${id}.value;`);
				else doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
			}
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		return doc.compile();
	};
	let fastpass;
	const isObject$1 = isObject;
	const jit = !globalConfig.jitless;
	const allowsEval$1 = allowsEval;
	const fastEnabled = jit && allowsEval$1.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$1(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0);
	defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazyInternal(inst, "values", (zod) => {
		if (zod.def.options.every((o) => o._zod.values)) return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		if (zod.def.options.every((o) => o._zod.pattern)) {
			const patterns = zod.def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const first = def.options.length === 1 ? def.options[0]._zod.run : null;
	inst._zod.parse = (payload, ctx) => {
		if (first) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		if (Object.prototype.hasOwnProperty.call(newObj, "__proto__")) delete newObj.__proto__;
		for (const key of sharedKeys) {
			if (key === "__proto__") continue;
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	const keyIssues = /* @__PURE__ */ new Map();
	const collect = (iss, side) => {
		let keys;
		if (iss.code === "unrecognized_keys" && !iss.path?.length) {
			unrecIssue ?? (unrecIssue = iss);
			keys = iss.keys;
		} else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
			const k = String(iss.path[0]);
			if (!keyIssues.has(k)) keyIssues.set(k, iss);
			keys = [k];
		} else return false;
		for (const k of keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k)[side] = true;
		}
		return true;
	};
	for (const iss of left.issues) if (!collect(iss, "l")) result.issues.push(iss);
	for (const iss of right.issues) if (!collect(iss, "r")) result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length) {
		const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
		if (aggregated.length) result.issues.push({
			...unrecIssue,
			keys: aggregated
		});
		for (const k of bothKeys) if (!aggregated.includes(k) && keyIssues.has(k)) result.issues.push(keyIssues.get(k));
	}
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) {
		if (aborted(result)) return result;
		throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	}
	result.value = merged.data;
	return result;
}
const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
	$ZodType.init(inst, def);
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!isPlainObject(input)) {
			payload.issues.push({
				expected: "record",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		const proms = [];
		const values = def.keyType._zod.values;
		if (values && !def.partial) {
			payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
			const recordKeys = /* @__PURE__ */ new Set();
			for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
				recordKeys.add(typeof key === "number" ? key.toString() : key);
				if (key === "__proto__") continue;
				const keyResult = def.keyType._zod.run({
					value: key,
					issues: []
				}, ctx);
				if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
				if (keyResult.issues.length) {
					payload.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
						input: key,
						path: [key],
						inst
					});
					continue;
				}
				const outKey = keyResult.value;
				if (outKey === "__proto__") continue;
				const result = def.valueType._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}));
				else {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}
			}
			let unrecognized;
			for (const key in input) if (!recordKeys.has(key)) {
				if (def.mode === "loose") {
					if (key === "__proto__") continue;
					payload.value[key] = input[key];
				} else {
					unrecognized = unrecognized ?? [];
					unrecognized.push(key);
				}
			}
			if (unrecognized && unrecognized.length > 0) payload.issues.push({
				code: "unrecognized_keys",
				input,
				inst,
				keys: unrecognized,
				continue: true
			});
		} else {
			payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
			let unrecognized;
			for (const key of Reflect.ownKeys(input)) {
				if (key === "__proto__") continue;
				if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
				let keyResult = def.keyType._zod.run({
					value: key,
					issues: []
				}, ctx);
				if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
				if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
					const retryResult = def.keyType._zod.run({
						value: Number(key),
						issues: []
					}, ctx);
					if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
					if (retryResult.issues.length === 0) keyResult = retryResult;
				}
				if (keyResult.issues.length) {
					if (def.mode === "loose") payload.value[key] = input[key];
					else if (values) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					} else payload.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
						input: key,
						path: [key],
						inst
					});
					continue;
				}
				const outKey = keyResult.value;
				if (outKey === "__proto__") continue;
				const result = def.valueType._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}));
				else {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}
			}
			if (unrecognized && unrecognized.length > 0) payload.issues.push({
				code: "unrecognized_keys",
				input,
				inst,
				keys: unrecognized,
				continue: true
			});
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	defineLazyInternal(inst, "pattern", (zod) => {
		const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
		return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	globalConfig.memoizer?.guard(inst);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		return payload;
	};
});
function handleOptionalResult(payload, result) {
	payload.value = result.issues.length ? void 0 : result.value;
	return payload;
}
const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	inst._zod.optout = "optional";
	defineLazyInternal(inst, "values", (zod) => {
		const values = zod.def.innerType._zod.values;
		return values ? /* @__PURE__ */ new Set([...values, void 0]) : void 0;
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === void 0) {
			if (def.innerType._zod.optin !== "defaulted") return payload;
			const result = def.innerType._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) return result.then((result) => handleOptionalResult(payload, result));
			return handleOptionalResult(payload, result);
		}
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazyInternal(inst, "values", (zod) => {
		return zod.def.innerType._zod.values ? /* @__PURE__ */ new Set([...zod.def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => {
		const v = zod.def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
function handleCatchResult(payload, result, def, ctx) {
	if (!result.issues.length) {
		payload.value = result.value;
		if (result.memo) payload.memo = true;
		return payload;
	}
	payload.value = def.catchValue({
		...result,
		value: payload.value,
		error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
		input: payload.value
	});
	return payload;
}
const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run({
			value: payload.value,
			issues: []
		}, ctx);
		if (result instanceof Promise) return result.then((result) => handleCatchResult(payload, result, def, ctx));
		return handleCatchResult(payload, result, def, ctx);
	};
});
const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues
	}, ctx);
}
const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	if (!payload.memo) payload.value = Object.freeze(payload.value);
	return payload;
}
const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}

//#endregion
//#region node_modules/zod/v4/core/memoizer.js
var $ZodCyclicError = class extends Error {
	constructor() {
		super(`Cannot parse a reference cycle that closes through a transform`);
		this.name = "ZodCyclicError";
	}
};
/** Keyed off the context object every schema in one parse call already shares. */
const STATE = "~memo";
const NO_ISSUES = [];
function isRef(value) {
	return value !== null && typeof value === "object";
}
function cloneIssues(issues) {
	return issues.map((iss) => iss.path ? {
		...iss,
		path: iss.path.slice()
	} : { ...iss });
}
const recursive = /*@__PURE__*/ new WeakMap();
/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
const NONE = 0;
const ASSUMED = 1;
const PROVEN = 2;
/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst, stack, resolve) {
	const cached = recursive.get(inst);
	if (cached !== void 0) return cached ? PROVEN : NONE;
	if (stack.has(inst)) return PROVEN;
	stack.add(inst);
	let result = NONE;
	const check = (child) => {
		if (result !== PROVEN && child?._zod) {
			const answer = isRecursive(child, stack, resolve);
			if (answer > result) result = answer;
		}
	};
	const shape = (sh, spread) => {
		let answer = NONE;
		for (const key of Reflect.ownKeys(sh)) {
			const desc = Object.getOwnPropertyDescriptor(sh, key);
			if (spread && !desc.enumerable) continue;
			const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
			if (child > answer) answer = child;
		}
		return answer;
	};
	const merge = (answer) => {
		if (answer > result) result = answer;
	};
	const def = inst._zod.def;
	switch (def.type) {
		case "object": {
			const raw = rawShape(def);
			merge(raw ? shape(raw, true) : ASSUMED);
			check(def.catchall);
			break;
		}
		case "array":
			check(def.element);
			break;
		case "tuple":
			for (const el of def.items) check(el);
			check(def.rest);
			break;
		case "record":
		case "map":
			check(def.keyType);
			check(def.valueType);
			break;
		case "set":
			check(def.valueType);
			break;
		case "union":
			for (const el of def.options) check(el);
			break;
		case "intersection":
			check(def.left);
			check(def.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			check(def.innerType);
			break;
		case "pipe":
			check(def.in);
			check(def.out);
			break;
		case "function":
			check(def.input);
			check(def.output);
			break;
		case "lazy": {
			const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : void 0);
			merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (const key in def) {
			const desc = Object.getOwnPropertyDescriptor(def, key);
			if (!desc || desc.get) continue;
			const value = desc.value;
			if (!value || typeof value !== "object") continue;
			if (value._zod) check(value);
			else if (Array.isArray(value)) for (const el of value) check(el);
		}
	}
	stack.delete(inst);
	return settle(inst, result);
}
/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
function settle(inst, answer) {
	if (answer !== ASSUMED) recursive.set(inst, answer === PROVEN);
	return answer;
}
function bucketFor(state, inst) {
	let bucket = state.buckets.get(inst);
	if (!bucket) {
		bucket = /* @__PURE__ */ new WeakMap();
		state.buckets.set(inst, bucket);
	}
	return bucket;
}
let handoff;
const open = [];
const memo = {
	alloc(_inst, payload, empty) {
		const bucket = handoff;
		if (!bucket) return empty;
		handoff = void 0;
		const entry = {
			value: empty,
			issues: null
		};
		bucket.set(payload.value, entry);
		open.push(entry);
		return empty;
	},
	guard(inst) {
		var _a;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
				return base(payload, ctx);
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	},
	attach(inst) {
		var _a;
		let isRecursiveInst;
		let rechecked = false;
		let lastCtx;
		let lastBucket;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (isRecursiveInst === void 0) {
					const walked = isRecursive(inst, /* @__PURE__ */ new Set(), false);
					if (walked === NONE) {
						inst._zod.parse = base;
						if (inst._zod.run === wrapped) inst._zod.run = base;
						return base(payload, ctx);
					}
					if (walked === PROVEN || rechecked) isRecursiveInst = true;
					else rechecked = true;
				}
				const input = payload.value;
				if (!isRef(input)) return base(payload, ctx);
				let state = ctx[STATE];
				if (!state) {
					state = {
						buckets: /* @__PURE__ */ new WeakMap(),
						backEdges: void 0
					};
					ctx[STATE] = state;
				}
				let bucket;
				if (lastCtx === ctx) bucket = lastBucket;
				else {
					bucket = bucketFor(state, inst);
					lastCtx = ctx;
					lastBucket = bucket;
				}
				const hit = bucket.get(input);
				if (hit) {
					payload.value = hit.value;
					if (hit.issues) {
						if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
					} else {
						payload.memo = true;
						state.backEdges ?? (state.backEdges = /* @__PURE__ */ new WeakSet());
						state.backEdges.add(hit.value);
					}
					return payload;
				}
				handoff = bucket;
				const depth = open.length;
				const result = base(payload, ctx);
				handoff = void 0;
				const entry = open.length > depth ? open.pop() : void 0;
				if (result instanceof Promise) return result.then((r) => {
					if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
					return r;
				});
				if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
				return result;
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	}
};
/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
function memoizer() {
	return memo;
}
/** Whether this value is a node a back-edge resolved to before it finished. */
function isBackEdge(ctx, value) {
	const backEdges = ctx[STATE]?.backEdges;
	return backEdges !== void 0 && isRef(value) && backEdges.has(value);
}

//#endregion
//#region node_modules/zod/v4/locales/en.js
const error = () => {
	const Sizable = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function getSizing(origin) {
		return Sizable[origin] ?? null;
	}
	const FormatDictionary = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	};
	const TypeDictionary = { nan: "NaN" };
	function getTypeName(type, input) {
		if (type === "number" && typeof input === "number" && !Number.isFinite(input)) return String(input);
		return TypeDictionary[type] ?? type;
	}
	return (issue) => {
		switch (issue.code) {
			case "invalid_type": return `Invalid input: expected ${getTypeName(issue.expected)}, received ${getTypeName(parsedType(issue.input), issue.input)}`;
			case "invalid_value":
				if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
				return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
			case "too_big": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
				return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
			}
			case "too_small": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
				return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
			}
			case "invalid_format": {
				const _issue = issue;
				if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
				if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
				if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
				if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
				return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${issue.origin}`;
			case "invalid_union":
				if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
				if (issue.inclusive === false) return "Invalid input: more than one option matched";
				return "Invalid input";
			case "invalid_element": return `Invalid value in ${issue.origin}`;
			default: return `Invalid input`;
		}
	};
};
function en_default() {
	return { localeError: error() };
}

//#endregion
//#region node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;

//#endregion
//#region node_modules/zod/v4/core/api.js
function snapshotChecks(def) {
	if (def.checks) def.checks = [...def.checks];
	return def;
}
// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
	return new Class(snapshotChecks({
		type: "string",
		...normalizeParams(params)
	}));
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link _cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
	return new Class(snapshotChecks({
		type: "number",
		checks: [],
		...normalizeParams(params)
	}));
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	}, params);
	return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}

//#endregion
//#region node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
	for (const source of sources) for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProp(target, key, source[key]);
	return target;
}
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: params?.external ?? void 0
	};
}
/**
* Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
* `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
* custom JSON Schema was written into `json`, in which case the caller must not write its own.
*/
function handleUnrepresentable(schema, ctx, json, params, message) {
	const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({
		zodSchema: schema,
		path: params.path,
		message
	}) : ctx.unrepresentable;
	if (result === "any") return false;
	if (result === void 0 || result === "throw") throw new Error(message);
	Object.assign(json, result);
	return true;
}
function processSchema(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	ctx.sharedDefsExtractedFor = void 0;
	ctx.sharedEmitDoneFor = void 0;
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			processSchema(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) assignProps(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function encodeJSONPointerSegment(segment) {
	return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external) return;
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}`
			};
		}
		const uriPrefix = `#`;
		const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
		if (entry[1] === root && !entry[1].schema.id) return { ref: uriPrefix };
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + encodeJSONPointerSegment(defId)
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") extractToDef(entry);
		}
	}
	if (ctx.external) ctx.sharedDefsExtractedFor = ctx.external;
}
/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
function compactTypeUnion(schema) {
	const options = schema.anyOf;
	if (!Array.isArray(options) || options.length === 0 || schema.type !== void 0) return;
	const types = [];
	for (const option of options) {
		if (!option || typeof option !== "object") return;
		compactTypeUnion(option);
		const keys = Object.keys(option);
		if (keys.length !== 1 || keys[0] !== "type") return;
		const type = option.type;
		for (const member of Array.isArray(type) ? type : [type]) {
			if (typeof member !== "string") return;
			if (!types.includes(member)) types.push(member);
		}
	}
	delete schema.anyOf;
	schema.type = types.length === 1 ? types[0] : types;
}
/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
* an annotation like `description` — makes a member unfoldable, so a constraint this does not
* understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
const FOLDABLE_KEYS = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]);
const UNION_KEYS = ["oneOf", "anyOf"];
/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
function undeclaredConstraint(member) {
	const extra = member.additionalProperties;
	if (extra === void 0 || extra === false || typeof extra !== "object" || extra === null) return null;
	return Object.keys(extra).length ? extra : null;
}
/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
function foldObjects(members) {
	const objects = [];
	for (const member of members) {
		if (typeof member !== "object" || member.type !== "object") return null;
		for (const key in member) if (!FOLDABLE_KEYS.has(key)) return null;
		objects.push(member);
	}
	const properties = {};
	const required = /* @__PURE__ */ new Set();
	for (const object of objects) {
		for (const key in object.properties) {
			if (Object.prototype.hasOwnProperty.call(properties, key)) continue;
			const parts = [];
			for (const other of objects) {
				const part = other.properties?.[key] ?? undeclaredConstraint(other);
				if (part === null || part === void 0) continue;
				if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part))) parts.push(part);
			}
			const merged = parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts };
			assignProp(properties, key, merged);
		}
		for (const key of object.required ?? []) required.add(key);
	}
	const folded = {
		type: "object",
		properties
	};
	if (required.size) folded.required = [...required];
	if (objects.every((object) => object.additionalProperties === false)) folded.additionalProperties = false;
	else {
		const constraints = [];
		for (const object of objects) {
			const constraint = undeclaredConstraint(object);
			if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint))) constraints.push(constraint);
		}
		if (constraints.length === 1) folded.additionalProperties = constraints[0];
		else if (constraints.length > 1) folded.additionalProperties = { allOf: constraints };
	}
	return folded;
}
/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
* closed object members reject each other's keys and the schema validates nothing. Zod's parser
* pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
* *every* side rejects it — so the emitted schema has to pool them too, and folding the members
* into one object is the encoding that says so on every target.
*
* This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
* machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
* keeps its reference and its own closedness rather than being inlined as a stale copy. */
function foldIntersection(json) {
	const allOf = json.allOf;
	if (!Array.isArray(allOf) || allOf.length < 2) return;
	for (const key of FOLDABLE_KEYS) if (key in json) return;
	const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
	let folded = null;
	if (!unions.length) folded = foldObjects(allOf);
	else {
		const union = unions[0];
		const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
		if (Object.keys(union).length !== 1) return;
		const rest = allOf.filter((m) => m !== union);
		const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
		if (branches.some((b) => !b)) return;
		folded = { [keyword]: branches };
	}
	if (!folded) return;
	delete json.allOf;
	assignProps(json, folded);
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else assignProps(schema, refSchema);
			assignProps(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
		for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
		if (ctx.target !== "openapi-3.0") for (const entry of ctx.seen.entries()) compactTypeUnion(entry[1].def ?? entry[1].schema);
		for (const rewrite of ctx.deferred) rewrite();
		if (ctx.intersections.length) {
			const carriers = /* @__PURE__ */ new Map();
			for (const seen of ctx.seen.values()) for (const json of [seen.schema, seen.def]) {
				const allOf = json?.allOf;
				if (!Array.isArray(allOf)) continue;
				const existing = carriers.get(allOf);
				if (existing) existing.push(json);
				else carriers.set(allOf, [json]);
			}
			for (const allOf of ctx.intersections) for (const json of carriers.get(allOf) ?? []) foldIntersection(json);
		}
	}
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
	const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
	if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
	const defs = ctx.external?.defs ?? {};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) {
			if (seen.def.id === seen.defId) delete seen.def.id;
			assignProp(defs, seen.defId, seen.def);
		}
	}
	if (ctx.external) ctx.sharedEmitDoneFor = ctx.external;
	if (ctx.external) {} else if (Object.keys(defs).length > 0) {
		if (ctx.target === "draft-2020-12") result.$defs = defs;
		else result.definitions = defs;
	}
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") {
		if (_schema._zod.traits.has("$ZodCodec")) return true;
		return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	}
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};

//#endregion
//#region node_modules/zod/v4/core/json-schema-processors.js
const narrowMin = (agg, key, value) => {
	if (agg[key] === void 0 || value > agg[key]) agg[key] = value;
};
const narrowMax = (agg, key, value) => {
	if (agg[key] === void 0 || value < agg[key]) agg[key] = value;
};
const narrowBoth = (agg, value) => {
	narrowMin(agg, "minimum", value);
	narrowMax(agg, "maximum", value);
};
const addDivisor = (agg, value) => {
	agg.multipleOf ?? (agg.multipleOf = []);
	if (!agg.multipleOf.includes(value)) agg.multipleOf.push(value);
};
const addPattern = (agg, pattern) => {
	agg.patterns ?? (agg.patterns = /* @__PURE__ */ new Set());
	agg.patterns.add(pattern);
};
const intersectMime = (agg, mime) => {
	agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
const setFormat = (agg, format) => {
	agg.format = format;
	if (format.includes("int")) agg.isInt = true;
};
const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
const formatContributor = (ranges) => (agg, def) => {
	setFormat(agg, def.format);
	const [minimum, maximum] = ranges[def.format];
	narrowMin(agg, "minimum", minimum);
	narrowMax(agg, "maximum", maximum);
};
const contributors = {
	greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
	less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
	multiple_of: (agg, def) => addDivisor(agg, def.value),
	number_format: formatContributor(NUMBER_FORMAT_RANGES),
	bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
	min_length: minContributor,
	max_length: maxContributor,
	length_equals: (agg, def) => narrowBoth(agg, def.length),
	min_size: minContributor,
	max_size: maxContributor,
	size_equals: (agg, def) => narrowBoth(agg, def.size),
	string_format: (agg, def) => {
		setFormat(agg, def.format);
		if (def.pattern) addPattern(agg, def.pattern);
		if (def.format === "base64" || def.format === "base64url") agg.contentEncoding = def.format;
		if (def.local || def.precision === -1) agg.laxFormat = true;
	},
	mime_type: (agg, def) => intersectMime(agg, def.mime)
};
function aggregateChecks(schema) {
	const agg = {};
	const def = schema._zod.def;
	const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
	for (const ch of list) contributors[ch._zod.def.check]?.(agg, ch._zod.def);
	const bag = schema._zod.bag;
	if (bag.minimum !== void 0) narrowMin(agg, "minimum", bag.minimum);
	if (bag.exclusiveMinimum !== void 0) narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
	if (bag.maximum !== void 0) narrowMax(agg, "maximum", bag.maximum);
	if (bag.exclusiveMaximum !== void 0) narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
	if (bag.multipleOf !== void 0) addDivisor(agg, bag.multipleOf);
	if (bag.format !== void 0) {
		agg.format ?? (agg.format = bag.format);
		if (bag.format.includes("int")) agg.isInt = true;
	}
	if (bag.mime) intersectMime(agg, bag.mime);
	for (const pattern of bag.patterns ?? []) addPattern(agg, pattern);
	return agg;
}
const formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
const exactPatterns = /* @__PURE__ */ new Map([[base64Charset, base64], [base64urlCharset, base64url]]);
const exactPattern = (p) => exactPatterns.get(p) ?? p;
const stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time" || laxFormat) delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const patternList = [...patterns].map(exactPattern);
		if (patternList.length === 1) json.pattern = patternList[0].source;
		else if (patternList.length > 1) json.allOf = [...patternList.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
const numberProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
	json.type = isInt ? "integer" : "number";
	const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
	const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
	const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
	if (exMin) {
		if (legacy) {
			json.minimum = exclusiveMinimum;
			json.exclusiveMinimum = true;
		} else json.exclusiveMinimum = exclusiveMinimum;
	} else if (typeof minimum === "number") json.minimum = minimum;
	if (exMax) {
		if (legacy) {
			json.maximum = exclusiveMaximum;
			json.exclusiveMaximum = true;
		} else json.exclusiveMaximum = exclusiveMaximum;
	} else if (typeof maximum === "number") json.maximum = maximum;
	if (multipleOf) {
		const divisors = /* @__PURE__ */ new Set();
		for (const divisor of multipleOf) if (Number.isFinite(divisor) && divisor !== 0) divisors.add(Math.abs(divisor));
		else handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
		const [first, ...rest] = divisors;
		if (first !== void 0) json.multipleOf = first;
		if (rest.length) json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
	}
};
const neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
const unknownProcessor = (_schema, _ctx, _json, _params) => {};
const enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.length === 0) {
		json.not = {};
		return;
	}
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
const customProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
const transformProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
const arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = processSchema(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
function inputOptin(schema) {
	const def = schema._zod.def;
	if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) return inputOptin(def.out);
	if (def.type === "catch") return inputOptin(def.innerType);
	return schema._zod.optin;
}
const objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const shape = def.shape;
	if (Object.getOwnPropertySymbols(shape).length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) return;
	json.type = "object";
	json.properties = {};
	for (const key in shape) assignProp(json.properties, key, processSchema(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	}));
	const requiredKeys = [];
	for (const key of Object.keys(shape)) {
		const field = def.shape[key];
		if (ctx.io === "input" ? inputOptin(field) === void 0 : field._zod.optout === void 0) requiredKeys.push(key);
	}
	if (requiredKeys.length > 0) json.required = requiredKeys;
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = processSchema(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
const unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => processSchema(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
const intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = processSchema(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = processSchema(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	const allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
	json.allOf = allOf;
	ctx.intersections.push(allOf);
};
/** JSON object keys are always strings, so a numeric record key schema is re-expressed over the
* numeric-string form the record parser matches. Deferred to `finalize`, after the flatten: a key
* behind a wrapper only carries its own `type` before then, and a union key only has its branches.
*
* A numeric bound cannot apply to a property name, so `minimum` and its siblings are dropped rather
* than carried over: keeping them beside `type: "string"` reproduces the match-nothing schema this
* exists to fix. A key that carries one therefore emits wider than the record parses — `z.record(z.number().min(5), V)`
* accepts `"3"` — which is the deliberate trade, since throwing on it would reject an ordinary schema
* outright. */
function stringifyKeyNames(bySchema, json, visited) {
	if (json.$ref) {
		if (visited.has(json)) return json;
		visited.add(json);
		const def = bySchema.get(json)?.def;
		if (!def) return json;
		const inlined = stringifyKeyNames(bySchema, def, visited);
		return inlined === def ? json : inlined;
	}
	for (const keyword of ["anyOf", "oneOf"]) {
		const branches = json[keyword];
		if (!Array.isArray(branches)) continue;
		const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
		if (mapped.some((branch, i) => branch !== branches[i])) json = {
			...json,
			[keyword]: mapped
		};
	}
	const types = Array.isArray(json.type) ? json.type : [json.type];
	const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
	const values = json.enum ?? (json.const !== void 0 ? [json.const] : void 0);
	if (!numericType && !values?.some((v) => typeof v === "number")) return json;
	const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
	if (rest.enum) rest.enum = rest.enum.map((v) => typeof v === "number" ? String(v) : v);
	else if (typeof rest.const === "number") rest.const = String(rest.const);
	if (!numericType) return rest;
	rest.type = "string";
	if (!values) rest.pattern = (types.includes("number") ? number$1 : integer).source;
	return rest;
}
/** Every record of one conversion, so the carriers are found in a single pass rather than once per record. */
const pendingRecords = /* @__PURE__ */ new WeakMap();
function rewriteKeyNames(ctx) {
	const bySchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.values()) if (entry.def && !bySchema.has(entry.schema)) bySchema.set(entry.schema, entry);
	const rewrites = /* @__PURE__ */ new Map();
	for (const record of pendingRecords.get(ctx) ?? []) {
		const seen = ctx.seen.get(record);
		const names = (seen?.def ?? seen?.schema)?.propertyNames;
		if (!names || names === true || rewrites.has(names)) continue;
		const rewritten = stringifyKeyNames(bySchema, names, /* @__PURE__ */ new Set());
		if (rewritten !== names) rewrites.set(names, rewritten);
	}
	if (!rewrites.size) return;
	for (const entry of ctx.seen.values()) for (const carrier of [entry.schema, entry.def]) {
		const rewritten = carrier && rewrites.get(carrier.propertyNames);
		if (rewritten) carrier.propertyNames = rewritten;
	}
}
const recordProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	json.type = "object";
	const keyType = def.keyType;
	const patterns = aggregateChecks(keyType).patterns;
	if (def.mode === "loose" && patterns && patterns.size > 0) {
		const valueSchema = processSchema(def.valueType, ctx, {
			...params,
			path: [
				...params.path,
				"patternProperties",
				"*"
			]
		});
		json.patternProperties = {};
		for (const pattern of patterns) assignProp(json.patternProperties, exactPattern(pattern).source, valueSchema);
	} else {
		if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
			json.propertyNames = processSchema(def.keyType, ctx, {
				...params,
				path: [...params.path, "propertyNames"]
			});
			let pending = pendingRecords.get(ctx);
			if (!pending) {
				pending = [];
				pendingRecords.set(ctx, pending);
				ctx.deferred.push(() => rewriteKeyNames(ctx));
			}
			pending.push(schema);
		}
		json.additionalProperties = processSchema(def.valueType, ctx, {
			...params,
			path: [...params.path, "additionalProperties"]
		});
	}
	const keyValues = keyType._zod.values;
	const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== void 0;
	if (keyValues && !def.partial && !omittableOnInput) {
		const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
		if (validKeyValues.length > 0) json.required = validKeyValues.map(String);
	}
};
const nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
* A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
* unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
const UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
	let unrepresentable = false;
	const serialized = JSON.stringify(value, (_, val) => {
		if (typeof val !== "bigint") return val;
		unrepresentable = true;
		return null;
	});
	if (!unrepresentable) return JSON.parse(serialized);
	handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
	return UNREPRESENTABLE_DEFAULT;
}
const defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
};
const prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io !== "input") return;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
};
const catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const inIsTransform = def.in._zod.traits.has("$ZodTransform");
	const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
	processSchema(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};

//#endregion
//#region node_modules/zod/v4/classic/errors.js
const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
	Object.defineProperty(proto, key, {
		configurable: true,
		enumerable: false,
		get() {
			const value = make(this);
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
			return value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
		}
	});
}
const initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	const proto = Object.getPrototypeOf(inst);
	if (_installedErrorProtos.has(proto)) return;
	_installedErrorProtos.add(proto);
	_lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
	_lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
	_lazyMethod(proto, "addIssue", (self) => (issue) => {
		self.issues.push(issue);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	_lazyMethod(proto, "addIssues", (self) => (issues) => {
		self.issues.push(...issues);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	Object.defineProperty(proto, "isEmpty", {
		configurable: true,
		enumerable: false,
		get() {
			return this.issues.length === 0;
		}
	});
};
const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, void 0, { Parent: Error });

//#endregion
//#region node_modules/zod/v4/classic/parse.js
const parse$2 = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

//#endregion
//#region node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
	if (!globalConfig.localeError) config(en_default());
}
function _ensureDefaultMemoizer() {
	if (!globalConfig.memoizer) config({ memoizer: memoizer() });
}
const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
	_ensureDefaultLocale();
	$ZodType.init(inst, def);
	inst.def = def;
	inst.type = def.type;
	return inst;
}, {
	check(...chks) {
		const def = this.def;
		return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
			check: ch,
			def: { check: "custom" },
			onattach: []
		} } : ch)] }), { parent: true });
	},
	with(...chks) {
		return this.check(...chks);
	},
	clone(def, params) {
		return clone(this, def, params);
	},
	brand() {
		return this;
	},
	register(reg, meta) {
		reg.add(this, meta);
		return this;
	},
	refine(check, params) {
		return this.check(refine(check, params));
	},
	superRefine(refinement, params) {
		return this.check(superRefine(refinement, params));
	},
	overwrite(fn) {
		return this.check(_overwrite(fn));
	},
	optional() {
		return optional(this);
	},
	exactOptional() {
		return exactOptional(this);
	},
	nullable() {
		return nullable(this);
	},
	nullish() {
		return optional(nullable(this));
	},
	nonoptional(params) {
		return nonoptional(this, params);
	},
	array() {
		return array(this);
	},
	or(arg) {
		return union([this, arg]);
	},
	and(arg) {
		return intersection(this, arg);
	},
	transform(tx) {
		return pipe(this, transform(tx));
	},
	default(d) {
		return _default(this, d);
	},
	prefault(d) {
		return prefault(this, d);
	},
	catch(params) {
		return _catch(this, params);
	},
	pipe(target) {
		return pipe(this, target);
	},
	readonly() {
		return readonly(this);
	},
	describe(description) {
		const cl = this.clone();
		globalRegistry.add(cl, { description });
		return cl;
	},
	meta(...args) {
		if (args.length === 0) return globalRegistry.get(this);
		const cl = this.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(fn, ...args) {
		return args.length === 0 ? fn(this) : fn(this, ...args);
	},
	get "~standard"() {
		return hide(this, "~standard", {
			...standardProps(this),
			jsonSchema: {
				input: createStandardJSONSchemaMethod(this, "input"),
				output: createStandardJSONSchemaMethod(this, "output")
			}
		});
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	},
	parse: function _parse(data, params) {
		return parse$2(this, data, params, { callee: _parse });
	},
	parseAsync: async function _parseAsync(data, params) {
		return await parseAsync(this, data, params, { callee: _parseAsync });
	},
	safeParse(data, params) {
		return safeParse(this, data, params);
	},
	async safeParseAsync(data, params) {
		return safeParseAsync(this, data, params);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(value) {
		own(this, "spa", value);
	},
	validate(data, params) {
		return validate(this, data, params);
	},
	validateAsync(data, params) {
		return validateAsync$1(this, data, params);
	},
	encode: function _encode(data, params) {
		return encode(this, data, params, { callee: _encode });
	},
	decode: function _decode(data, params) {
		return decode(this, data, params, { callee: _decode });
	},
	encodeAsync: async function _encodeAsync(data, params) {
		return await encodeAsync(this, data, params, { callee: _encodeAsync });
	},
	decodeAsync: async function _decodeAsync(data, params) {
		return await decodeAsync(this, data, params, { callee: _decodeAsync });
	},
	safeEncode(data, params) {
		return safeEncode(this, data, params);
	},
	safeDecode(data, params) {
		return safeDecode(this, data, params);
	},
	async safeEncodeAsync(data, params) {
		return safeEncodeAsync(this, data, params);
	},
	async safeDecodeAsync(data, params) {
		return safeDecodeAsync(this, data, params);
	},
	toJSONSchema(params) {
		return createToJSONSchemaMethod(this, {})(params);
	},
	get description() {
		return globalRegistry.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
});
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
}, /*@__PURE__*/ derived({
	format: (inst) => aggregateChecks(inst).format ?? null,
	minLength: (inst) => aggregateChecks(inst).minimum ?? null,
	maxLength: (inst) => aggregateChecks(inst).maximum ?? null
}, {
	regex(...args) {
		return this.check(_regex(...args));
	},
	includes(...args) {
		return this.check(_includes(...args));
	},
	startsWith(...args) {
		return this.check(_startsWith(...args));
	},
	endsWith(...args) {
		return this.check(_endsWith(...args));
	},
	min(...args) {
		return this.check(_minLength(...args));
	},
	max(...args) {
		return this.check(_maxLength(...args));
	},
	length(...args) {
		return this.check(_length(...args));
	},
	nonempty(...args) {
		return this.check(_minLength(1, ...args));
	},
	lowercase(params) {
		return this.check(_lowercase(params));
	},
	uppercase(params) {
		return this.check(_uppercase(params));
	},
	trim() {
		return this.check(_trim());
	},
	normalize(...args) {
		return this.check(_normalize(...args));
	},
	toLowerCase() {
		return this.check(_toLowerCase());
	},
	toUpperCase() {
		return this.check(_toUpperCase());
	},
	slugify() {
		return this.check(_slugify());
	}
}));
const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
}, {
	email(params) {
		return this.check(_email(ZodEmail, params));
	},
	url(params) {
		return this.check(_url(ZodURL, params));
	},
	jwt(params) {
		return this.check(_jwt(ZodJWT, params));
	},
	emoji(params) {
		return this.check(_emoji(ZodEmoji, params));
	},
	guid(params) {
		return this.check(_guid(ZodGUID, params));
	},
	uuid(params) {
		return this.check(_uuid(ZodUUID, params));
	},
	uuidv4(params) {
		return this.check(_uuidv4(ZodUUID, params));
	},
	uuidv6(params) {
		return this.check(_uuidv6(ZodUUID, params));
	},
	uuidv7(params) {
		return this.check(_uuidv7(ZodUUID, params));
	},
	nanoid(params) {
		return this.check(_nanoid(ZodNanoID, params));
	},
	cuid(params) {
		return this.check(_cuid(ZodCUID, params));
	},
	cuid2(params) {
		return this.check(_cuid2(ZodCUID2, params));
	},
	ulid(params) {
		return this.check(_ulid(ZodULID, params));
	},
	base64(params) {
		return this.check(_base64(ZodBase64, params));
	},
	base64url(params) {
		return this.check(_base64url(ZodBase64URL, params));
	},
	xid(params) {
		return this.check(_xid(ZodXID, params));
	},
	ksuid(params) {
		return this.check(_ksuid(ZodKSUID, params));
	},
	ipv4(params) {
		return this.check(_ipv4(ZodIPv4, params));
	},
	ipv6(params) {
		return this.check(_ipv6(ZodIPv6, params));
	},
	cidrv4(params) {
		return this.check(_cidrv4(ZodCIDRv4, params));
	},
	cidrv6(params) {
		return this.check(_cidrv6(ZodCIDRv6, params));
	},
	e164(params) {
		return this.check(_e164(ZodE164, params));
	},
	datetime(params) {
		return this.check(_isoDateTime(ZodISODateTime, params));
	},
	date(params) {
		return this.check(_isoDate(ZodISODate, params));
	},
	time(params) {
		return this.check(_isoTime(ZodISOTime, params));
	},
	duration(params) {
		return this.check(_isoDuration(ZodISODuration, params));
	}
});
function string(params) {
	return _string(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function url(params) {
	return _url(ZodURL, params);
}
const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
	inst.isFinite = true;
}, /*@__PURE__*/ derived({
	minValue: (inst) => {
		const { minimum, exclusiveMinimum } = aggregateChecks(inst);
		return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
	},
	maxValue: (inst) => {
		const { maximum, exclusiveMaximum } = aggregateChecks(inst);
		return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
	},
	isInt: (inst) => {
		const { isInt, multipleOf } = aggregateChecks(inst);
		return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
	},
	format: (inst) => aggregateChecks(inst).format ?? null
}, {
	gt(value, params) {
		return this.check(_gt(value, params));
	},
	gte(value, params) {
		return this.check(_gte(value, params));
	},
	min(value, params) {
		return this.check(_gte(value, params));
	},
	lt(value, params) {
		return this.check(_lt(value, params));
	},
	lte(value, params) {
		return this.check(_lte(value, params));
	},
	max(value, params) {
		return this.check(_lte(value, params));
	},
	int(params) {
		return this.check(int(params));
	},
	safe(params) {
		return this.check(int(params));
	},
	positive(params) {
		return this.check(_gt(0, params));
	},
	nonnegative(params) {
		return this.check(_gte(0, params));
	},
	negative(params) {
		return this.check(_lt(0, params));
	},
	nonpositive(params) {
		return this.check(_lte(0, params));
	},
	multipleOf(value, params) {
		return this.check(_multipleOf(value, params));
	},
	step(value, params) {
		return this.check(_multipleOf(value, params));
	},
	finite() {
		return this;
	}
}));
function number(params) {
	return _number(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return _int(ZodNumberFormat, params);
}
const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
	return _unknown(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return _never(ZodNever, params);
}
const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
}, {
	min(n, params) {
		return this.check(_minLength(n, params));
	},
	nonempty(params) {
		return this.check(_minLength(1, params));
	},
	max(n, params) {
		return this.check(_maxLength(n, params));
	},
	length(n, params) {
		return this.check(_length(n, params));
	},
	unwrap() {
		return this.element;
	}
});
function array(element, params) {
	return _array(ZodArray, element, params);
}
const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
	keyof() {
		return _enum(Object.keys(this._zod.def.shape));
	},
	catchall(catchall) {
		return this.clone(mergeDefs(this._zod.def, { catchall }));
	},
	passthrough() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	loose() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	strict() {
		return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
	},
	strip() {
		return this.clone(mergeDefs(this._zod.def, { catchall: void 0 }));
	},
	extend(incoming) {
		return extend(this, incoming);
	},
	safeExtend(incoming) {
		return safeExtend(this, incoming);
	},
	merge(other) {
		return merge(this, other);
	},
	pick(mask) {
		return pick(this, mask);
	},
	omit(mask) {
		return omit(this, mask);
	},
	partial(...args) {
		return partial(ZodOptional, this, args[0]);
	},
	exactPartial(...args) {
		return partial(ZodExactOptional, this, args[0], "exactPartial");
	},
	required(...args) {
		return required(ZodNonOptional, this, args[0]);
	}
});
function strictObject(shape, params) {
	return new ZodObject({
		type: "object",
		shape,
		catchall: never(),
		...normalizeParams(params)
	});
}
const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodRecord.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
	inst.keyType = def.keyType;
	inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
	if (!valueType || !valueType._zod) return new ZodRecord({
		type: "record",
		keyType: string(),
		valueType: keyType,
		...normalizeParams(valueType)
	});
	return new ZodRecord({
		type: "record",
		keyType,
		valueType,
		...normalizeParams(params)
	});
}
const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = [...inst._zod.values];
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
	return new ZodEnum({
		type: "enum",
		entries,
		...normalizeParams(params)
	});
}
const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
	});
}
const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
	return _superRefine(fn, params);
}

//#endregion
//#region src/shared/theme/format.ts
/**
* The format of a theme family file. A file without a `schemaVersion` is version 1,
* so the first format never needs to be stamped and stays valid forever.
*/
const THEME_FORMAT_VERSION = 1;
const VERSION_MESSAGE = "Must be a positive whole number";
const themeFormatVersionSchema = number({ error: VERSION_MESSAGE }).int(VERSION_MESSAGE).positive(VERSION_MESSAGE);
/**
* One step per released format change, in memory only: a file on disk is never
* rewritten. Bumping `THEME_FORMAT_VERSION` without adding the step for the
* previous version fails the format tests.
*/
const THEME_MIGRATIONS = [];
/**
* Runs the steps from `version` up to `target`, each one on the previous one's
* output, and stamps the version it reached. A file already at or past
* `target` comes back untouched. A missing step is a bug in the step list, not
* in the file, so it throws.
*/
function migrateThemeFamily(raw, version, steps = THEME_MIGRATIONS, target = 1) {
	let current = raw;
	for (let from = version; from < target; from++) {
		const step = steps.find((candidate) => candidate.from === from);
		if (!step) throw new Error(`No theme format migration from version ${from}`);
		current = {
			...step.migrate(current),
			schemaVersion: from + 1
		};
	}
	return current;
}

//#endregion
//#region src/shared/theme/schema.ts
const BASE_THEMES = [
	"midnight",
	"dark",
	"light"
];
/**
* A family is one look in a few contrasts and polarities (Gruvbox has six,
* Monokai Pro seven), not a collection: a bigger set splits across files, and
* a family stays small enough to show its themes side by side.
*/
const MAX_THEMES_PER_FAMILY = 8;
const MAX_COLOR_OVERRIDES = 300;
const MAX_TOKEN_COLORS = 500;
const FONT_STYLES = /* @__PURE__ */ new Set([
	"italic",
	"bold",
	"underline",
	"strikethrough"
]);
function isFontStyle(value) {
	if (value === "") return true;
	return value.split(" ").every((part) => FONT_STYLES.has(part));
}
const colorText = string().max(128);
const scopeText = string().min(1).max(200);
const terminalSchema = strictObject({
	background: colorText.optional(),
	foreground: colorText.optional(),
	cursor: colorText.optional(),
	selection: colorText.optional(),
	ansi: array(colorText).length(16).optional()
});
const tokenColorSchema = strictObject({
	name: string().max(200).optional(),
	scope: union([scopeText, array(scopeText).min(1).max(50)]),
	settings: strictObject({
		foreground: colorText.optional(),
		fontStyle: string().max(64).refine(isFontStyle, "Unsupported fontStyle").optional()
	})
});
const syntaxSchema = strictObject({
	base: string().max(64).regex(/^[a-z0-9-]+$/).optional(),
	tokenColors: array(tokenColorSchema).max(500).optional()
});
/**
* Every object is strict so the parser can find unknown keys; it then strips
* and reports them rather than failing, which is what lets an older build read
* a file written for a newer one.
*/
const themeDefinitionSchema = strictObject({
	id: string().max(64).regex(THEME_ID_PATTERN),
	name: string().min(1).max(64),
	extends: _enum(BASE_THEMES),
	colors: record(string().max(64), union([colorText, number()])).refine((o) => Object.keys(o).length <= 300, "Too many color overrides").optional(),
	terminal: terminalSchema.optional(),
	syntax: syntaxSchema.optional()
});
const SPDX_ID = "\\(*[A-Za-z0-9.+-]+\\)*";
/**
* An SPDX id or an expression of ids joined by AND, OR or WITH; neither the
* SPDX list nor the balance of parentheses is checked, since Kepler only shows it.
*/
const SPDX_EXPRESSION = new RegExp(`^${SPDX_ID}(?: (?:AND|OR|WITH) ${SPDX_ID})*$`);
const SEMVER_MESSAGE = "Must be a semantic version, such as 1.0.0";
/** The semver.org regular expression for Semantic Versioning 2.0.0. */
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/** The file's own fields; each theme is validated on its own against `themeDefinitionSchema`. */
const themeFamilyEnvelopeSchema = strictObject({
	$schema: string().max(512).optional(),
	schemaVersion: themeFormatVersionSchema.optional(),
	name: string().min(1).max(64),
	version: string({ error: SEMVER_MESSAGE }).max(64).regex(SEMVER, SEMVER_MESSAGE).optional(),
	author: string().max(128).optional(),
	description: string().min(1).max(200).optional(),
	license: string().max(64).regex(SPDX_EXPRESSION, "Must be an SPDX license id, such as MIT").optional(),
	homepage: url({
		protocol: /^https$/,
		error: "Must be an https URL"
	}).max(512).optional(),
	themes: array(unknown()).min(1).max(8)
});

//#endregion
//#region src/shared/theme/tokens.ts
/**
* Every raw color custom property declared in the renderer stylesheet's
* Midnight `:root` block, by name without the `--`. A theme may override exactly
* these. A parity test fails when the two drift, so a new color token is
* themeable only after joining this list.
*/
const THEMEABLE_TOKENS = [
	"surface-sunken",
	"surface-canvas",
	"surface-raised",
	"surface-overlay",
	"ink",
	"content-strong",
	"content",
	"content-muted",
	"content-subtle",
	"content-on-accent",
	"fill-subtle",
	"fill-muted",
	"fill-strong",
	"edge-subtle",
	"edge",
	"edge-strong",
	"edge-decor",
	"brand",
	"brand-hover",
	"brand-active",
	"brand-fill",
	"brand-fill-hover",
	"brand-fill-active",
	"content-on-brand",
	"ai",
	"ai-hover",
	"selected-bg",
	"selected-border",
	"selected-ink",
	"focus-ring",
	"status-success",
	"status-info",
	"status-warning",
	"status-attention",
	"status-danger",
	"status-merged",
	"status-dormant",
	"host-rose",
	"host-amber",
	"host-lime",
	"host-cyan",
	"host-blue",
	"host-violet",
	"account-rose",
	"account-amber",
	"account-lime",
	"account-cyan",
	"account-blue",
	"account-violet",
	"account-ink-rose",
	"account-ink-amber",
	"account-ink-lime",
	"account-ink-cyan",
	"account-ink-blue",
	"account-ink-violet",
	"channel-staging",
	"channel-staging-mark-hi",
	"channel-staging-mark-mid",
	"channel-staging-mark-deep",
	"channel-dev",
	"channel-dev-mark-hi",
	"channel-dev-mark-mid",
	"channel-dev-mark-deep",
	"channel-source",
	"channel-source-mark-hi",
	"channel-source-mark-mid",
	"channel-source-mark-deep",
	"scrim",
	"diff-added",
	"diff-removed",
	"code-selection",
	"code-find",
	"code-find-current",
	"code-highlight-ink",
	"lane-1",
	"lane-2",
	"lane-3",
	"lane-4",
	"lane-5",
	"lane-6",
	"lane-7",
	"lane-8",
	"provider-github",
	"provider-gitlab",
	"provider-jira",
	"provider-linear",
	"usage-track",
	"usage-consumed",
	"usage-track-toned",
	"control-thumb"
];
/**
* A token that was renamed, by its old name. A theme file written against the
* old name keeps working and its user is told the name changed. Dropping a
* token without an entry here fails the contract test, so a removal is a
* decision and not an accident.
*/
const TOKEN_ALIASES = {};
const THEMEABLE_SET = new Set(THEMEABLE_TOKENS);
function isThemeableToken(name) {
	return THEMEABLE_SET.has(name);
}
/**
* Tokens Kepler writes as an alpha over another token, mapped to that source.
* Only these accept a bare 0..1 number, which resolves to `var(--source) / a`,
* so a theme cannot reference an arbitrary custom property. A published theme
* may rely on a token's source, so this mapping is frozen: a token joins it
* for good, and one that needs a different source is a new token.
*/
function ladderSourceFor(token) {
	if (token === "content" || token === "content-muted" || token === "content-subtle") return "ink";
	if (token.startsWith("fill-")) return "ink";
	if (token === "edge" || token.startsWith("edge-")) return "ink";
	if (token === "selected-bg" || token === "selected-border" || token === "focus-ring") return "brand";
	return null;
}

//#endregion
//#region src/shared/util/record.ts
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

//#endregion
//#region src/shared/theme/resolve.ts
function themePolarityOf(base) {
	return base === "light" ? "light" : "dark";
}
function resolveColors(colors, aliases, renamed, warnings) {
	const vars = {};
	for (const [written, value] of Object.entries(colors ?? {})) {
		const alias = Object.hasOwn(aliases, written) ? aliases[written] : void 0;
		if (alias !== void 0 && colors !== void 0 && alias in colors) continue;
		const token = alias ?? written;
		if (alias !== void 0) renamed.push({
			from: written,
			to: alias
		});
		if (!isThemeableToken(token)) {
			warnings.push(`Unknown color token "${token}" was ignored`);
			continue;
		}
		let canonical;
		if (typeof value === "number") {
			const source = ladderSourceFor(token);
			if (!source) {
				warnings.push(`Color token "${token}" does not accept a number`);
				continue;
			}
			canonical = formatLadder(source, value);
		} else canonical = toCanonical(value);
		if (canonical === null) {
			warnings.push(`Color token "${token}" has an invalid value and was ignored`);
			continue;
		}
		vars[token] = canonical;
	}
	return vars;
}
function hexOrWarn(value, label, warnings) {
	const hex = toHexColor(value);
	if (hex === null) warnings.push(`${label} has an invalid color and was ignored`);
	return hex ?? void 0;
}
function resolveTerminal(terminal, warnings) {
	if (!terminal) return void 0;
	const out = {};
	for (const key of [
		"background",
		"foreground",
		"cursor",
		"selection"
	]) {
		const value = terminal[key];
		if (value === void 0) continue;
		const hex = hexOrWarn(value, `terminal.${key}`, warnings);
		if (hex !== void 0) out[key] = hex;
	}
	if (terminal.ansi) {
		const ansi = terminal.ansi.map((value) => toHexColor(value));
		const complete = ansi.filter((hex) => hex !== null);
		if (complete.length === ansi.length) out.ansi = complete;
		else warnings.push("terminal.ansi has an invalid color and was ignored");
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
function resolveSyntax(syntax, warnings) {
	if (!syntax) return void 0;
	const out = {};
	if (syntax.base !== void 0) out.base = syntax.base;
	if (syntax.tokenColors) {
		const tokenColors = [];
		syntax.tokenColors.forEach((entry, index) => {
			const settings = {};
			if (entry.settings.foreground !== void 0) {
				const hex = hexOrWarn(entry.settings.foreground, `syntax.tokenColors[${index}].foreground`, warnings);
				if (hex !== void 0) settings.foreground = hex;
			}
			if (entry.settings.fontStyle !== void 0) settings.fontStyle = entry.settings.fontStyle;
			if (Object.keys(settings).length === 0) return;
			tokenColors.push({
				...entry.name !== void 0 && { name: entry.name },
				scope: entry.scope,
				settings
			});
		});
		if (tokenColors.length > 0) out.tokenColors = tokenColors;
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
/**
* Never throws: bad tokens and values are skipped and reported in `warnings`.
* A token written under an old name in `aliases` applies as its current one.
*/
function resolveTheme(def, aliases = TOKEN_ALIASES) {
	const warnings = [];
	const renamed = [];
	const vars = resolveColors(def.colors, aliases, renamed, warnings);
	const terminal = resolveTerminal(def.terminal, warnings);
	const syntax = resolveSyntax(def.syntax, warnings);
	return {
		id: def.id,
		name: def.name,
		base: def.extends,
		polarity: themePolarityOf(def.extends),
		vars,
		...terminal && { terminal },
		...syntax && { syntax },
		...renamed.length > 0 && { renamedTokens: renamed },
		warnings
	};
}
function lineFor(path, message) {
	const where = path.map(String).join(".");
	return where ? `${where}: ${message}` : message;
}
/** Removes the value at `path` from a parsed JSON tree, where it exists. */
function deleteAt(tree, path) {
	let node = tree;
	for (const segment of path.slice(0, -1)) {
		const key = String(segment);
		if (Array.isArray(node)) node = node[Number(key)];
		else if (isRecord(node)) node = node[key];
		else return;
	}
	const last = path.at(-1);
	if (isRecord(node) && last !== void 0) delete node[String(last)];
}
/**
* Parses against a schema of strict objects, then drops the keys it did not
* recognise and parses again, so an unknown key is reported without costing the
* value its other fields. `unknownKeys` are full paths, key last.
*/
function parseDroppingUnknownKeys(schema, raw) {
	const first = schema.safeParse(raw);
	if (first.success) return {
		result: first,
		unknownKeys: []
	};
	const unknownKeys = first.error.issues.flatMap((issue) => issue.code === "unrecognized_keys" ? issue.keys.map((key) => [...issue.path, key]) : []);
	if (unknownKeys.length === 0) return {
		result: first,
		unknownKeys
	};
	const cleaned = structuredClone(raw);
	for (const path of unknownKeys) deleteAt(cleaned, path);
	return {
		result: schema.safeParse(cleaned),
		unknownKeys
	};
}
/**
* Validates untrusted JSON at the file boundary. The format's `schemaVersion`
* is read from the raw JSON first, and an older file is upgraded in memory
* before anything is validated. A newer file is read for the fields this version knows. Unknown
* keys at any level are dropped and reported as notices, and each theme is
* validated on its own: one that fails is reported with its id while its
* siblings load.
*/
function parseThemeFamily(json) {
	let raw = json;
	let newer = false;
	if (isRecord(json)) {
		const version = themeFormatVersionSchema.safeParse(json["schemaVersion"] ?? 1);
		if (!version.success) return {
			errors: version.error.issues.map((issue) => ({ message: lineFor(["schemaVersion"], issue.message) })),
			notices: []
		};
		newer = version.data > 1;
		if (version.data < 1) try {
			raw = migrateThemeFamily(json, version.data);
		} catch {
			return {
				errors: [{ message: "Unable to upgrade this file to the current format" }],
				notices: []
			};
		}
	}
	const notices = newer ? [{ kind: "newer-version" }] : [];
	const noteUnknown = (paths, prefix) => {
		if (newer) return;
		for (const path of paths) notices.push({
			kind: "unknown-key",
			key: [...prefix, ...path].map(String).join(".")
		});
	};
	const envelope = parseDroppingUnknownKeys(themeFamilyEnvelopeSchema, raw);
	noteUnknown(envelope.unknownKeys, []);
	if (!envelope.result.success) return {
		errors: envelope.result.error.issues.map((issue) => ({ message: lineFor(issue.path, issue.message) })),
		notices
	};
	const { themes: rawThemes, ...rest } = envelope.result.data;
	const themes = [];
	const errors = [];
	const seen = /* @__PURE__ */ new Set();
	rawThemes.forEach((rawTheme, index) => {
		const prefix = ["themes", index];
		const written = isRecord(rawTheme) ? rawTheme["id"] : void 0;
		const themeId = typeof written === "string" ? written.slice(0, 64) : void 0;
		const withId = (message) => ({
			message,
			...themeId !== void 0 && { themeId }
		});
		const parsed = parseDroppingUnknownKeys(themeDefinitionSchema, rawTheme);
		noteUnknown(parsed.unknownKeys, prefix);
		if (!parsed.result.success) {
			for (const issue of parsed.result.error.issues) errors.push(withId(lineFor([...prefix, ...issue.path], issue.message)));
			return;
		}
		const def = parsed.result.data;
		if (seen.has(def.id)) {
			errors.push(withId(lineFor([...prefix, "id"], `Duplicate theme id "${def.id}"`)));
			return;
		}
		seen.add(def.id);
		themes.push(def);
	});
	return {
		family: {
			...rest,
			themes
		},
		errors,
		notices
	};
}

//#endregion
//#region src/shared/theme/terminal-ansi.ts
/**
* The 16 slots Kepler's terminal draws when a theme names none, in ANSI order.
* Light has its own set; Midnight and Dark share one.
*
* They are deliberately NOT design tokens. They are a terminal protocol: a
* program emitting "bright yellow" is naming a slot, not asking for the app's
* warning color, and remapping them onto the status ramp would corrupt the
* output of every tool that draws with them.
*/
const BUILT_IN_TERMINAL_ANSI = {
	dark: [
		"#000000",
		"#cd3131",
		"#0dbc79",
		"#e5e510",
		"#2472c8",
		"#bc3fbc",
		"#11a8cd",
		"#e5e5e5",
		"#666666",
		"#f14c4c",
		"#23d18b",
		"#f5f543",
		"#3b8eea",
		"#d670d6",
		"#29b8db",
		"#ffffff"
	],
	light: [
		"#000000",
		"#cd3131",
		"#107c10",
		"#949800",
		"#0451a5",
		"#bc05bc",
		"#0598bc",
		"#555555",
		"#666666",
		"#cd3131",
		"#14ce14",
		"#b5ba00",
		"#0451a5",
		"#bc05bc",
		"#0598bc",
		"#a5a5a5"
	]
};

//#endregion
//#region src/shared/theme/validation.ts
/** The owner of an id taken by a theme that ships with Kepler. */
const BUILT_IN_THEME_OWNER = "built-in";

//#endregion
//#region scripts/design/color.mjs
/**
* OKLCH <-> sRGB + WCAG contrast, used by `pnpm design:contrast` to prove the
* palette in src/ui/index.css meets WCAG 2.2 AA in BOTH themes.
*
* Kepler's tokens are stored as bare OKLCH components (`L C H`) so alpha can be
* composed at the call site (`oklch(var(--content) / 0.62)`). That means a
* token's real contrast depends on what it is composited over, which is exactly
* what this module models: `composite()` flattens an alpha ink onto an opaque
* surface before `contrast()` measures it.
*/
const clamp01 = (x) => Math.min(1, Math.max(0, x));
function linearToSrgb(c) {
	return c <= .0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - .055;
}
function srgbToLinear(c) {
	return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
}
/** OKLCH (L 0..1, C, H degrees) -> sRGB 0..255, gamut-clipped by chroma reduction. */
function oklchToRgb(L, C, H) {
	for (let c = C;; c -= .002) {
		const h = H * Math.PI / 180;
		const a = c * Math.cos(h);
		const b = c * Math.sin(h);
		const l_ = L + .3963377774 * a + .2158037573 * b;
		const m_ = L - .1055613458 * a - .0638541728 * b;
		const s_ = L - .0894841775 * a - 1.291485548 * b;
		const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
		const r = 4.0767416621 * l - 3.3077115913 * m + .2309699292 * s;
		const g = -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s;
		const bl = -.0041960863 * l - .7034186147 * m + 1.707614701 * s;
		if ([
			r,
			g,
			bl
		].every((v) => v >= -1e-4 && v <= 1.0001) || c <= 0) return [
			r,
			g,
			bl
		].map((v) => Math.round(clamp01(linearToSrgb(clamp01(v))) * 255));
	}
}
/** Composite an alpha foreground over an opaque background; both [r,g,b] 0..255. */
function composite(fg, bg, alpha) {
	return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
}
const SRGB_TO_XYZ = [
	[
		.4124564,
		.3575761,
		.1804375
	],
	[
		.2126729,
		.7151522,
		.072175
	],
	[
		.0193339,
		.119192,
		.9503041
	]
];
const XYZ_TO_SRGB = [
	[
		3.2404542,
		-1.5371385,
		-.4985314
	],
	[
		-.969266,
		1.8760108,
		.041556
	],
	[
		.0556434,
		-.2040259,
		1.0572252
	]
];
const D65_TO_D50 = [
	[
		1.0479298208405488,
		.022946793341019088,
		-.05019222954313557
	],
	[
		.029627815688159344,
		.990434484573249,
		-.01707382502938514
	],
	[
		-.009243058152591178,
		.015055144896577895,
		.7518742899580008
	]
];
const D50_TO_D65 = [
	[
		.9554734527042182,
		-.023098536874261423,
		.0632593086610217
	],
	[
		-.028369706963208136,
		1.0099954580058226,
		.021041398966943008
	],
	[
		.012314001688319899,
		-.020507696433477912,
		1.3303659366080753
	]
];
const D50 = [
	.3457 / .3585,
	1,
	.2958 / .3585
];
const LAB_E = 216 / 24389;
const LAB_K = 24389 / 27;
const apply = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
function rgbToLab(rgb) {
	const [fx, fy, fz] = apply(D65_TO_D50, apply(SRGB_TO_XYZ, rgb.map((c) => srgbToLinear(c / 255)))).map((v, i) => {
		const t = v / D50[i];
		return t > LAB_E ? Math.cbrt(t) : (LAB_K * t + 16) / 116;
	});
	return [
		116 * fy - 16,
		500 * (fx - fy),
		200 * (fy - fz)
	];
}
function labToRgb([L, a, b]) {
	const fy = (L + 16) / 116;
	const xyz = [
		fy + a / 500,
		fy,
		fy - b / 200
	].map((t, i) => (t ** 3 > LAB_E ? t ** 3 : (116 * t - 16) / LAB_K) * D50[i]);
	return apply(XYZ_TO_SRGB, apply(D50_TO_D65, xyz)).map((v) => Math.round(clamp01(linearToSrgb(clamp01(v))) * 255));
}
/**
* An opaque `fg` mixed into an opaque `bg` by `weight` in CIE Lab, as
* `color-mix(in lab)` does. A diff's changed row is the plate mixed toward its
* wash this way, by the wash's alpha.
*/
function mixLab(fg, bg, weight) {
	const f = rgbToLab(fg);
	return labToRgb(rgbToLab(bg).map((v, i) => v * (1 - weight) + f[i] * weight));
}
function relativeLuminance([r, g, b]) {
	const [R, G, B] = [
		r,
		g,
		b
	].map((c) => srgbToLinear(c / 255));
	return .2126 * R + .7152 * G + .0722 * B;
}
/** WCAG 2.x contrast ratio between two opaque sRGB colors. */
function contrast(a, b) {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05);
}
function hex([r, g, b]) {
	return "#" + [
		r,
		g,
		b
	].map((c) => c.toString(16).padStart(2, "0")).join("");
}
/**
* Pull one theme's `--token: value;` declarations out of a selector block in
* `index.css`. Reads the real shipped file's text rather than a copy, which is
* what keeps every consumer measuring the palette the app actually renders.
*/
function parseThemeBlock(css, selector) {
	const start = css.indexOf(`\n${selector} {`);
	if (start === -1) throw new Error(`theme block not found: ${selector}`);
	const end = css.indexOf("\n}", start);
	const body = css.slice(start, end);
	const tokens = {};
	for (const m of body.matchAll(/^\s{2}(--[a-z0-9-]+):\s*([^;]+);/gm)) tokens[m[1]] = m[2].trim().replace(/\s*\/\*.*$/, "");
	return tokens;
}
/**
* Resolve a token value to `{ rgb, alpha }`, following `var(--x)` references and
* `<color> / <alpha>` composition the same way the browser would. `tokens` is a
* map from `parseThemeBlock` — merge `:root` under a theme's own block first, as
* the cascade does, or an inherited token will read as missing.
*/
function resolveToken(tokens, value, depth = 0) {
	if (depth > 8) throw new Error(`token cycle at: ${value}`);
	const literal = parseColorLiteral(String(value).trim());
	if (literal) return literal;
	let alpha = 1;
	let v = String(value).trim();
	const slash = v.lastIndexOf("/");
	if (slash !== -1) {
		alpha = Number(v.slice(slash + 1).trim());
		v = v.slice(0, slash).trim();
	}
	const varMatch = v.match(/^var\((--[a-z0-9-]+)\)$/);
	if (varMatch) {
		const inner = resolveToken(tokens, tokens[varMatch[1]], depth + 1);
		return {
			rgb: inner.rgb,
			alpha: alpha * inner.alpha
		};
	}
	const [L, C, H] = v.split(/\s+/).map(Number);
	if ([L, C].some(Number.isNaN)) throw new Error(`unparseable token value: ${value}`);
	return {
		rgb: oklchToRgb(L, C, H || 0),
		alpha
	};
}
const HEX_RE = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;
const NUM = String.raw`(\d*\.?\d+)`;
const OKLCH_RE = new RegExp(String.raw`^oklch\(\s*${NUM}\s+${NUM}\s+${NUM}(?:\s*\/\s*${NUM})?\s*\)$`, "i");
/**
* Parse a data-theme literal (`#rrggbb`, `#rrggbbaa`, `oklch(L C H)`,
* `oklch(L C H / a)`) to `{ rgb, alpha }`, or null for any other form. Mirrors
* `parseColor` in `src/shared/theme/color.ts`, which Node cannot import because
* its sibling imports are extensionless.
*/
function parseColorLiteral(value) {
	const hexMatch = HEX_RE.exec(value);
	if (hexMatch) return {
		rgb: [
			0,
			2,
			4
		].map((i) => parseInt(hexMatch[1].slice(i, i + 2), 16)),
		alpha: hexMatch[2] ? parseInt(hexMatch[2], 16) / 255 : 1
	};
	const m = OKLCH_RE.exec(value);
	if (!m) return null;
	return {
		rgb: oklchToRgb(Number(m[1]), Number(m[2]), Number(m[3])),
		alpha: m[4] === void 0 ? 1 : Number(m[4])
	};
}

//#endregion
//#region scripts/design/contrast-core.mjs
/**
* The WCAG 2.2 AA checks behind `pnpm design:contrast`, as pure functions over
* data: the stylesheet's text, Kepler's syntax palette and theme families come
* in as arguments, never from the file system. That is what lets the CLI, the
* CI gate and the backend's theme validator measure a theme the same way.
*
* Every threshold cites the success criterion it enforces; if a check needs
* relaxing, the reason belongs here next to the number rather than in a
* component.
*/
const SURFACES = [
	"--surface-sunken",
	"--surface-canvas",
	"--surface-raised",
	"--surface-overlay"
];
/** WCAG 2.2 AA thresholds. */
const TEXT_MIN = 4.5;
const NON_TEXT_MIN = 3;
const ALERT_TINT_ALPHA = .04;
const ACCENT_TINT_ALPHA = .15;
const SEPARATOR_BAND_ALPHA = .02;
const SEPARATOR_CELL_ALPHA = .05;
const ROW_WASH_MAX_ALPHA = .5;
const SELECTED_NUMBER_SHARE = {
	dark: .4,
	light: .25
};
const BUILT_IN_SELECTORS = {
	midnight: ":root",
	dark: ":root.dark",
	light: ":root.light"
};
/** Ladder tokens a data theme may give as a bare 0..1 alpha, and what that alpha sits over. */
function ladderSource(token) {
	if (token === "content" || token === "content-muted" || token === "content-subtle") return "ink";
	if (token.startsWith("fill-") || token === "edge" || token.startsWith("edge-")) return "ink";
	if (token === "selected-bg" || token === "selected-border" || token === "focus-ring") return "brand";
	return null;
}
/**
* Every theme is measured over `:root`, because that is what the browser does:
* a theme selector sits on the SAME element as `:root`, so any token it does not
* restate falls through. Light restates the whole palette and is unaffected by
* the merge; dark is deliberately a derivation of Midnight and would otherwise
* be measured against a palette full of holes. The merge also means a token
* inherited unchanged still gets checked here, against the overriding theme's
* own surfaces, which is the case worth catching.
*
* `:root` is Midnight, not the default: see the header in index.css.
*/
function builtInPalettes(css) {
	const base = parseThemeBlock(css, ":root");
	const palettes = {};
	for (const [theme, selector] of Object.entries(BUILT_IN_SELECTORS)) palettes[theme] = {
		...base,
		...parseThemeBlock(css, selector)
	};
	return palettes;
}
function readable$1(tokens, value) {
	try {
		resolveToken(tokens, value);
		return true;
	} catch {
		return false;
	}
}
/**
* Themes from parsed family objects: the base's merged block, then the theme's
* `colors` on top. A value the checks could not read is left out and reported
* through `onInvalid`, so a caller decides whether that is fatal.
*/
function dataThemes(families, palettes, keplerSyntax, onInvalid = () => {}) {
	const themes = [];
	for (const family of families) for (const def of family.themes) {
		const tokens = { ...palettes[def.extends] };
		for (const [name, value] of Object.entries(def.colors ?? {})) if (typeof value === "number") {
			const source = ladderSource(name);
			if (!source) {
				onInvalid(`${def.id}: ${name} does not take a bare alpha`);
				continue;
			}
			tokens[`--${name}`] = `var(--${source}) / ${value}`;
		} else if (readable$1(tokens, value)) tokens[`--${name}`] = value;
		else onInvalid(`${def.id}: ${name} has a value that is not a color`);
		const polarity = def.extends === "light" ? "light" : "dark";
		themes.push({
			theme: def.id,
			tokens,
			polarity,
			terminal: def.terminal,
			syntax: def.syntax,
			keplerSyntaxRules: def.syntax?.base === void 0 ? keplerSyntax[polarity].tokenColors : void 0
		});
	}
	return themes;
}
/** Runs every check over `themes` and returns all rows, passing and failing. */
function runChecks(themes) {
	const results = [];
	const check = (theme, label, ratio, min) => {
		results.push({
			theme,
			label,
			ratio,
			min,
			pass: ratio + 1e-9 >= min
		});
	};
	for (const entry of themes) try {
		checkTheme(entry, check);
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		check(entry.theme, `palette could not be read: ${reason}`, 0, TEXT_MIN);
	}
	return results;
}
/**
* Informational rows, never gated: how far each theme's selected segment stands
* off its recessed track. It is a shape cue beside the shadow and the brand
* label, not a WCAG floor.
*/
function thumbSeparation(themes) {
	return themes.map(({ theme, tokens: t }) => {
		try {
			return {
				theme,
				ratio: contrast(resolveToken(t, t["--control-thumb"]).rgb, resolveToken(t, t["--surface-sunken"]).rgb)
			};
		} catch {
			return {
				theme,
				ratio: NaN
			};
		}
	});
}
function checkTheme({ theme, tokens: t, polarity, terminal, syntax, keplerSyntaxRules }, check) {
	const surfaces = SURFACES.map((s) => ({
		name: s,
		rgb: resolveToken(t, t[s]).rgb
	}));
	/** Worst ratio of an (possibly alpha) ink across every surface it can land on. */
	const worstOnSurfaces = (token, over = surfaces) => {
		const { rgb, alpha } = resolveToken(t, t[token]);
		return Math.min(...over.map((s) => contrast(composite(rgb, s.rgb, alpha), s.rgb)));
	};
	for (const step of [
		"--content-strong",
		"--content",
		"--content-muted",
		"--content-subtle"
	]) check(theme, `${step} on every surface`, worstOnSurfaces(step), TEXT_MIN);
	check(theme, "--edge-strong control boundary", worstOnSurfaces("--edge-strong", surfaces.slice(1, 3)), 3);
	check(theme, "--focus-ring indicator", worstOnSurfaces("--focus-ring"), 3);
	for (const accent of ["--brand", "--ai"]) {
		check(theme, `${accent} as text`, worstOnSurfaces(accent), TEXT_MIN);
		const accentInk = resolveToken(t, t[accent]);
		const onTint = Math.min(...surfaces.map((s) => {
			const tint = composite(accentInk.rgb, s.rgb, ACCENT_TINT_ALPHA);
			return contrast(composite(accentInk.rgb, tint, accentInk.alpha), tint);
		}));
		check(theme, `${accent} as text on its 15% tint`, onTint, TEXT_MIN);
		const fill = resolveToken(t, t[accent]);
		const ink = resolveToken(t, t["--content-on-accent"]);
		check(theme, `--content-on-accent on ${accent}`, contrast(composite(ink.rgb, fill.rgb, ink.alpha), fill.rgb), TEXT_MIN);
	}
	{
		const ink = resolveToken(t, t["--selected-ink"]);
		const wash = resolveToken(t, t["--selected-bg"]);
		const track = resolveToken(t, t["--fill-subtle"]);
		check(theme, "--selected-ink on the selected wash", Math.min(...surfaces.flatMap((s) => [s.rgb, composite(track.rgb, s.rgb, track.alpha)].map((under) => {
			const bg = composite(wash.rgb, under, wash.alpha);
			return contrast(composite(ink.rgb, bg, ink.alpha), bg);
		}))), TEXT_MIN);
	}
	const brandInk = resolveToken(t, t["--brand"]);
	const thumb = resolveToken(t, t["--control-thumb"]);
	const segTrack = resolveToken(t, t["--surface-sunken"]);
	check(theme, "--brand on --control-thumb", contrast(composite(brandInk.rgb, thumb.rgb, brandInk.alpha), thumb.rgb), TEXT_MIN);
	const mutedInk = resolveToken(t, t["--content-muted"]);
	check(theme, "--content-muted on the segmented track", contrast(composite(mutedInk.rgb, segTrack.rgb, mutedInk.alpha), segTrack.rgb), TEXT_MIN);
	for (const fillToken of [
		"--brand-fill",
		"--brand-fill-hover",
		"--brand-fill-active"
	]) {
		const fill = resolveToken(t, t[fillToken]);
		const ink = resolveToken(t, t["--content-on-brand"]);
		check(theme, `--content-on-brand on ${fillToken}`, contrast(composite(ink.rgb, fill.rgb, ink.alpha), fill.rgb), TEXT_MIN);
	}
	for (const status of Object.keys(t).filter((k) => k.startsWith("--status-") && k !== "--status-dormant")) check(theme, `${status} as text`, worstOnSurfaces(status), TEXT_MIN);
	for (const status of ["--status-warning", "--status-danger"]) {
		const ink = resolveToken(t, t[status]);
		const onTint = Math.min(...surfaces.map((s) => {
			const tint = composite(ink.rgb, s.rgb, ALERT_TINT_ALPHA);
			return contrast(composite(ink.rgb, tint, ink.alpha), tint);
		}));
		check(theme, `${status} Alert text on its 4% tint`, onTint, TEXT_MIN);
	}
	check(theme, "--status-dormant ring", worstOnSurfaces("--status-dormant"), 3);
	for (const channel of Object.keys(t).filter((k) => k.startsWith("--channel-") && !/-mark-(hi|mid|deep)$/.test(k))) check(theme, `${channel} as text`, worstOnSurfaces(channel), TEXT_MIN);
	for (const p of Object.keys(t).filter((k) => k.startsWith("--provider-"))) check(theme, `${p} as glyph`, worstOnSurfaces(p), 3);
	const lanes = Object.keys(t).filter((k) => /^--lane-\d+$/.test(k));
	for (const lane of lanes) check(theme, `${lane} stroke`, worstOnSurfaces(lane), 3);
	const hostAccents = Object.keys(t).filter((k) => /^--host-[a-z]+$/.test(k));
	for (const host of hostAccents) check(theme, `${host} chip/tile/strip`, worstOnSurfaces(host), 3);
	for (const account of Object.keys(t).filter((k) => /^--account-[a-z]+$/.test(k))) check(theme, `${account} as glyph`, worstOnSurfaces(account), 3);
	for (const ink of Object.keys(t).filter((k) => /^--account-ink-[a-z]+$/.test(k))) check(theme, `${ink} as text`, worstOnSurfaces(ink), TEXT_MIN);
	const overlay = surfaces.filter((s) => s.name === "--surface-overlay");
	for (const id of Object.keys(t).filter((k) => /^--account-ink-[a-z]+$/.test(k)).map((k) => k.slice(14))) check(theme, `--account-ink-${id} chip text on overlay`, worstOnSurfaces(`--account-ink-${id}`, overlay), TEXT_MIN);
	const BAR_TINT_ALPHA = .1;
	const canvasSurface = surfaces.find((s) => s.name === "--surface-canvas");
	for (const host of hostAccents) {
		const { rgb: hostRgb } = resolveToken(t, t[host]);
		const tintedBar = composite(hostRgb, canvasSurface.rgb, BAR_TINT_ALPHA);
		for (const step of ["--content-muted", "--content-strong"]) {
			const ratio = worstOnSurfaces(step, [{
				name: `${host} bar`,
				rgb: tintedBar
			}]);
			check(theme, `${step} on ${host} TopBar wash`, ratio, TEXT_MIN);
		}
	}
	const codePlate = resolveToken(t, t["--surface-raised"]).rgb;
	const highlightInk = resolveToken(t, t["--code-highlight-ink"]).rgb;
	for (const highlight of [
		"--code-selection",
		"--code-find",
		"--code-find-current"
	]) {
		const fill = resolveToken(t, t[highlight]).rgb;
		check(theme, `--code-highlight-ink on ${highlight}`, contrast(highlightInk, fill), TEXT_MIN);
		check(theme, `${highlight} against the code plate`, contrast(fill, codePlate), 3);
	}
	const codeInk = defaultCodeInk(t, [...keplerSyntaxRules ?? [], ...syntax?.tokenColors ?? []]);
	const subtleInk = resolveToken(t, t["--content-subtle"]);
	const mutedSepInk = resolveToken(t, t["--content-muted"]);
	const plateInk = resolveToken(t, t["--ink"]).rgb;
	const onBg = (ink, bg) => contrast(composite(ink.rgb, bg, ink.alpha), bg);
	const band = composite(plateInk, codePlate, SEPARATOR_BAND_ALPHA);
	const cell = composite(plateInk, codePlate, SEPARATOR_CELL_ALPHA);
	const hoverFill = resolveToken(t, t["--fill-subtle"]);
	const hovered = (under) => composite(plateInk, composite(hoverFill.rgb, codePlate, hoverFill.alpha), under);
	check(theme, "diff line number on the code plate", onBg(subtleInk, codePlate), TEXT_MIN);
	check(theme, "diff separator label on its band", onBg(subtleInk, band), TEXT_MIN);
	check(theme, "diff separator chevron on its cell", onBg(subtleInk, cell), TEXT_MIN);
	check(theme, "diff separator label on its hovered band", onBg(mutedSepInk, hovered(SEPARATOR_BAND_ALPHA)), TEXT_MIN);
	check(theme, "diff separator chevron on its hovered cell", onBg(mutedSepInk, hovered(SEPARATOR_CELL_ALPHA)), TEXT_MIN);
	const selectedNumberCell = mixLab(resolveToken(t, t["--code-selection"]).rgb, codePlate, SELECTED_NUMBER_SHARE[polarity]);
	check(theme, "diff selected line number on its selection", onBg(resolveToken(t, t["--content-strong"]), selectedNumberCell), TEXT_MIN);
	for (const [hue, wash, row] of [[
		"--status-success",
		"--diff-added",
		"added"
	], [
		"--status-danger",
		"--diff-removed",
		"removed"
	]]) {
		const ink = resolveToken(t, t[hue]);
		const fill = resolveToken(t, t[wash]);
		const bg = mixLab(fill.rgb, codePlate, Math.min(fill.alpha, ROW_WASH_MAX_ALPHA));
		check(theme, `diff ${row} line number on its wash`, contrast(composite(ink.rgb, bg, ink.alpha), bg), TEXT_MIN);
		if (codeInk) {
			const emphasis = composite(fill.rgb, bg, fill.alpha);
			check(theme, `diff ${row} word emphasis under the default code text`, contrast(composite(codeInk.rgb, emphasis, codeInk.alpha), emphasis), TEXT_MIN);
		}
	}
	const track = resolveToken(t, t["--usage-track"]);
	const consumed = resolveToken(t, t["--usage-consumed"]);
	check(theme, "--usage-track vs --usage-consumed", contrast(track.rgb, consumed.rgb), 3);
	const tonedTrack = resolveToken(t, t["--usage-track-toned"]);
	for (const tone of [
		"--status-success",
		"--status-warning",
		"--status-danger"
	]) {
		const fill = resolveToken(t, t[tone]);
		check(theme, `${tone} vs --usage-track-toned`, contrast(tonedTrack.rgb, fill.rgb), 3);
	}
	if (terminal) checkTerminal(theme, t, polarity, terminal, check);
	if (syntax?.tokenColors) checkSyntax(theme, t, syntax.tokenColors, surfaces, check);
	if (keplerSyntaxRules) checkSyntax(theme, t, keplerSyntaxRules, surfaces, check, "kepler syntax");
}
/**
* The color plain code is drawn in: the last `source` or `text` rule, as the
* composed syntax theme takes it for `editor.foreground`. Null when no rule
* names one (a named Shiki theme keeps its own default, which is not read
* here) or the color is unreadable, which the syntax checks already report.
*/
function defaultCodeInk(t, tokenColors) {
	const value = tokenColors.filter(({ scope }) => (typeof scope === "string" ? [scope] : scope ?? []).some((s) => s === "source" || s === "text")).map(({ settings }) => settings?.foreground).findLast((foreground) => foreground !== void 0);
	return value === void 0 ? null : colorOf(t, value);
}
/** A terminal or syntax color, or null for one that is not a color the checks can read. */
function colorOf(t, value) {
	try {
		return resolveToken(t, value);
	} catch {
		return null;
	}
}
/** A color the checks cannot read is a failure to fix, never a check skipped. */
function unreadable(theme, label, value, check) {
	check(theme, `${label} is not a color: ${value}`, 0, TEXT_MIN);
}
/**
* 1.4.3 / 1.4.11 — the terminal draws on its own background (the theme's
* sunken surface unless it names one). The ANSI slot that IS the background
* (black on a dark theme; white and bright white on a light one) is exempt:
* it exists to paint fills, not to be read on the background.
*/
function checkTerminal(theme, t, polarity, terminal, check) {
	const named = terminal.background ? colorOf(t, terminal.background) : null;
	if (terminal.background && !named) unreadable(theme, "terminal background", terminal.background, check);
	const bg = (named ?? resolveToken(t, t["--surface-sunken"])).rgb;
	const onBg = (value, label, min) => {
		const c = colorOf(t, value);
		if (!c) {
			unreadable(theme, label, value, check);
			return;
		}
		check(theme, label, contrast(composite(c.rgb, bg, c.alpha), bg), min);
	};
	if (terminal.foreground) onBg(terminal.foreground, "terminal foreground on background", TEXT_MIN);
	if (terminal.cursor) onBg(terminal.cursor, "terminal cursor on background", 3);
	const sel = terminal.selection ? colorOf(t, terminal.selection) : null;
	if (terminal.selection && !sel) unreadable(theme, "terminal selection", terminal.selection, check);
	const fg = terminal.foreground ? colorOf(t, terminal.foreground) : null;
	if (sel && fg) {
		const selBg = composite(sel.rgb, bg, sel.alpha);
		check(theme, "terminal foreground on selection", contrast(composite(fg.rgb, selBg, fg.alpha), selBg), TEXT_MIN);
	}
	const exempt = polarity === "light" ? [7, 15] : [0];
	(terminal.ansi ?? []).forEach((value, slot) => {
		if (exempt.includes(slot)) return;
		onBg(value, `terminal ansi ${slot} on background`, TEXT_MIN);
	});
}
/** 1.4.3 — code is read on the raised, sunken and canvas surfaces (code plate, diffs, editor wells). */
function checkSyntax(theme, t, tokenColors, surfaces, check, name = "syntax") {
	const plates = surfaces.filter((s) => [
		"--surface-raised",
		"--surface-sunken",
		"--surface-canvas"
	].includes(s.name));
	const seen = /* @__PURE__ */ new Set();
	for (const { settings } of tokenColors) {
		const value = settings?.foreground;
		if (!value || seen.has(value)) continue;
		seen.add(value);
		const c = colorOf(t, value);
		if (!c) {
			unreadable(theme, name, value, check);
			continue;
		}
		const ratio = Math.min(...plates.map((p) => contrast(composite(c.rgb, p.rgb, c.alpha), p.rgb)));
		check(theme, `${name} ${value} on code plates`, ratio, TEXT_MIN);
	}
}

//#endregion
//#region src/backend/themes/theme-preview.ts
const SYNTAX_SCOPES = {
	text: "source",
	keyword: "storage",
	control: "keyword.control",
	function: "entity.name.function",
	type: "entity.name.type",
	string: "string",
	number: "constant.numeric",
	variable: "variable",
	comment: "comment"
};
/** The theme in the form the contrast checks read: canonical colors, hex terminal and syntax. */
function contrastDefinition(theme) {
	return {
		id: theme.id,
		extends: theme.base,
		colors: theme.vars,
		...theme.terminal && { terminal: theme.terminal },
		...theme.syntax && { syntax: theme.syntax }
	};
}
/** The color the last rule naming exactly `scope` gives it, as a later rule wins in TextMate. */
function foregroundFor(rules, scope) {
	return rules?.filter((rule) => (typeof rule.scope === "string" ? [rule.scope] : rule.scope).includes(scope)).map((rule) => rule.settings.foreground).findLast((foreground) => foreground !== void 0);
}
/** `value` at its alpha over an opaque `under`, as an opaque `#rrggbb`. Throws on a value that is not a color. */
function flatten(tokens, value, under) {
	const { rgb, alpha } = resolveToken(tokens, value);
	return hex(composite(rgb, under, alpha));
}
function channels(color) {
	const { rgb } = resolveToken({}, color);
	return rgb;
}
function readable(tokens, value, under) {
	if (value === void 0) return void 0;
	try {
		return flatten(tokens, value, under);
	} catch {
		return;
	}
}
/**
* Derives a theme's preview from the same resolved tokens the contrast checks
* measure, so a page paints what Kepler paints. Never throws: a theme whose
* colors cannot be resolved has no preview.
*/
function deriveThemePreview(theme, palettes, keplerSyntax) {
	try {
		const [entry] = dataThemes([{ themes: [contrastDefinition(theme)] }], palettes, keplerSyntax);
		if (!entry) return void 0;
		const { tokens } = entry;
		const token = (name) => {
			const value = tokens[`--${name}`];
			if (value === void 0) throw new Error(`missing token: ${name}`);
			return value;
		};
		const canvasRgb = resolveToken(tokens, token("surface-canvas")).rgb;
		const canvas = hex(canvasRgb);
		const over = (name, under = canvasRgb) => flatten(tokens, token(name), under);
		const raised = over("surface-raised");
		const fill = over("brand-fill");
		const sunken = over("surface-sunken");
		const text = over("content");
		const terminalBackground = readable(tokens, theme.terminal?.background, canvasRgb) ?? sunken;
		const terminalRgb = channels(terminalBackground);
		const ansi = (theme.terminal?.ansi ?? BUILT_IN_TERMINAL_ANSI[theme.polarity]).map((color) => flatten(tokens, color, terminalRgb));
		if (ansi.length !== 16) return void 0;
		const own = theme.syntax?.tokenColors;
		const kepler = keplerSyntax[theme.polarity].tokenColors;
		const raisedRgb = channels(raised);
		const syntaxColor = (scope) => readable(tokens, foregroundFor(own, scope), raisedRgb) ?? readable(tokens, foregroundFor(kepler, scope), raisedRgb);
		const syntaxText = syntaxColor(SYNTAX_SCOPES.text) ?? text;
		const scoped = (scope) => syntaxColor(scope) ?? syntaxText;
		const syntax = {
			text: syntaxText,
			keyword: scoped(SYNTAX_SCOPES.keyword),
			control: scoped(SYNTAX_SCOPES.control),
			function: scoped(SYNTAX_SCOPES.function),
			type: scoped(SYNTAX_SCOPES.type),
			string: scoped(SYNTAX_SCOPES.string),
			number: scoped(SYNTAX_SCOPES.number),
			variable: scoped(SYNTAX_SCOPES.variable),
			comment: scoped(SYNTAX_SCOPES.comment)
		};
		return {
			polarity: theme.polarity,
			colors: {
				canvas,
				sunken,
				raised,
				ink: over("ink"),
				text,
				muted: over("content-muted"),
				edge: over("edge"),
				selected: over("selected-bg"),
				selectedInk: over("selected-ink"),
				brand: over("brand"),
				fill,
				onFill: over("content-on-brand", channels(fill))
			},
			terminal: {
				background: terminalBackground,
				foreground: readable(tokens, theme.terminal?.foreground, terminalRgb) ?? flatten(tokens, token("content"), terminalRgb),
				ansi
			},
			syntax
		};
	} catch {
		return;
	}
}

//#endregion
//#region \0kepler:palette-css
var _kepler_palette_css_default = "\n:root {\n  /* Neutral surfaces — monotonically lighter as elevation rises. */\n  --surface-sunken: 0.145 0.006 264; /* wells, inputs, code blocks   #090a0d */\n  --surface-canvas: 0.17 0.006 264; /* app background                #0e0f12 */\n  --surface-raised: 0.198 0.007 264; /* panels, cards, list surfaces #141619 */\n  --surface-overlay: 0.228 0.008 264; /* menus, popovers             #1b1c20 */\n\n  /* Ink — one color, four alpha steps. Worst-case ratios against the LIGHTEST\n     surface (overlay): strong 15.3 · content 11.4 · muted 7.2 · subtle 4.8. */\n  --ink: 0.965 0.004 264;\n  --content-strong: var(--ink);\n  --content: var(--ink) / 0.85;\n  --content-muted: var(--ink) / 0.65;\n  --content-subtle: var(--ink) / 0.5;\n  --content-on-accent: var(--surface-sunken);\n\n  /* Fills — ink at low alpha, so they tint whatever they sit on. */\n  --fill-subtle: var(--ink) / 0.04;\n  --fill-muted: var(--ink) / 0.07;\n  --fill-strong: var(--ink) / 0.11;\n\n  /* Edges — `edge-strong` is the 3:1 control boundary (measured 3.00). */\n  --edge-subtle: var(--ink) / 0.08;\n  --edge: var(--ink) / 0.14;\n  --edge-strong: var(--ink) / 0.35;\n  /* Decorative line, between `edge` and `edge-strong`: visible on the canvas\n     without borrowing the control boundary's contrast contract. */\n  --edge-decor: var(--ink) / 0.22;\n\n  /* A sash's own element thickness and its (larger) grab/hover zone. The\n     hit-zone value is shared with the `Sash` primitive's panel-library\n     configuration — see the RESIZE HANDLES block below for why the two\n     must agree. */\n  --dock-tab-drop-line-size: 3px;\n  --sash-size: 5px;\n  --sash-hit: 12px;\n  /* How long the pointer rests on a sash before it lights up. A sash sits\n     between two surfaces the pointer crosses constantly, and lighting up on\n     every pass reads as flicker; the delay is what makes the highlight mean\n     \"you could drag this\". */\n  --sash-hover-delay: 250ms;\n\n  /* Brand teal. Lighter than the previous #1f8f7c and paired with near-black\n     ink rather than white: white on the old teal measured 4.02:1, under the\n     AA floor, and no single teal can satisfy both \"readable as text on the\n     canvas\" (wants lighter) and \"readable under white ink\" (wants darker).\n     Dark ink resolves the conflict with one color instead of two.\n     ink-on-brand 6.68 · brand-on-canvas 6.47 · on its badge tint 4.59 */\n  --brand: 0.66 0.099 178.8; /*                                     #3fa693 */\n  --brand-hover: 0.71 0.106 178.8;\n  --brand-active: 0.61 0.092 178.8;\n  /* Solid brand surfaces and the ink on them. Raw aliases resolved at the point\n     of use, so Dark and Light follow their own `--brand`/`--content-on-accent`;\n     a custom theme overrides them when its text-safe brand cannot carry text. */\n  --brand-fill: var(--brand);\n  --brand-fill-hover: var(--brand-hover);\n  --brand-fill-active: var(--brand-active);\n  --content-on-brand: var(--content-on-accent);\n\n  /* AI purple. Higher chroma than the status ramp, and 15° off status-merged,\n     so the system's only two purples stay separable.\n     ai-on-canvas 6.11 · ink-on-ai 7.11 */\n  --ai: 0.7 0.185 285; /*                                           #968dfe */\n  --ai-hover: 0.75 0.175 285;\n\n  /* Selection & focus — brand-tinted. The ink is text on the wash: a step\n     lighter than brand, because a segmented control lays the wash over its own\n     track, and brand there falls under 4.5:1 over an overlay.\n     on the wash, worst over the track 4.67 */\n  --selected-bg: var(--brand) / 0.14;\n  --selected-border: var(--brand) / 0.45;\n  --selected-ink: 0.69 0.099 178.8; /*                              #4aaf9c */\n  --focus-ring: var(--brand) / 0.9;\n\n  /* Status ramp — identical L and C, hue only. Worst ratio in the set: 6.39. */\n  --status-success: 0.72 0.155 150; /* running, open, passing       #4fbf6e */\n  --status-info: 0.72 0.155 230; /* building, in progress, info   #04b4ec */\n  --status-warning: 0.72 0.155 82; /* review, spawning, degraded    #d29a08 */\n  --status-attention: 0.72 0.155 50; /* BLOCKED ON YOU              #f08440 */\n  --status-danger: 0.72 0.155 22; /* errored, closed, failed        #f67878 */\n  --status-merged: 0.72 0.155 300; /* merged PR, finished issue, done task #b48cf6 */\n  --status-dormant: 0.58 0.01 264; /* disconnected-session ring — see @theme */\n\n  /* Host identity — six hues spread around the wheel at ~0.125-0.165 chroma\n     (raised from a muted 0.09 that read as six near-identical pastels), each\n     placed and measured to clear an OKLab distance from brand/ai/every status\n     hue (checked by a dedicated test) rather than eyeballed. Amber sits in\n     the narrow gap between status-attention and status-warning, and violet in\n     the narrow gap between ai and status-merged; both borrow extra separation\n     from lightness (off the shared 0.72) where hue alone can't clear the\n     floor, which is also what keeps all six apart under red-green color\n     vision deficiency. Dark inherits these unchanged (same reasoning as the\n     status ramp): both dark themes solve the same contrast problem at the\n     same amplitude, so a second set of numbers here would only be Midnight's\n     copied by hand. */\n  --host-rose: 0.72 0.16 355; /*                                       #f075aa */\n  --host-amber: 0.78 0.125 66; /*                                      #eda65a */\n  --host-lime: 0.72 0.155 118; /*                                      #9db128 */\n  --host-cyan: 0.72 0.155 204; /*                                      #0fbac7 */\n  --host-blue: 0.72 0.155 258; /*                                      #69a5fe */\n  --host-violet: 0.75 0.165 328; /*                                    #e585e2 */\n\n  /* Agent account identity, in two sets of the same six hues. The bold\n     `--account-*` set tints a ~14px glyph and the picker swatch: it needs\n     enough chroma to read against muted-gray neighbours and only 3:1 as a\n     non-text mark. The `--account-ink-*` set colors the small account name and\n     address in the session hover card, which needs 4.5:1 on every surface,\n     the overlay included; in light that forces a darker ink, so the two sets\n     diverge there and are identical here.\n     Chroma is pushed to what sRGB holds at each lightness (hues differ, so\n     cyan stays quieter than violet) and hues are moved off the status ramp,\n     brand and ai (rose leans pink, away from danger) because an account\n     color must never read as state. Dark inherits both sets unchanged. */\n  --account-rose: 0.72 0.2 352;\n  --account-amber: 0.8 0.16 72;\n  --account-lime: 0.8 0.19 125;\n  --account-cyan: 0.78 0.125 210;\n  --account-blue: 0.67 0.175 258;\n  --account-violet: 0.7 0.23 320;\n  --account-ink-rose: 0.72 0.2 352;\n  --account-ink-amber: 0.8 0.16 72;\n  --account-ink-lime: 0.8 0.19 125;\n  --account-ink-cyan: 0.78 0.125 210;\n  --account-ink-blue: 0.67 0.175 258;\n  --account-ink-violet: 0.7 0.23 320;\n\n  /* Channel badge/mark — mirrors the channel icon tints (shared table in\n     scripts/_channel-tints.mjs): staging blue, dev purple, source rust.\n     The ink is the icon's PILL color, its brightest element, which is what a\n     small dark-surface badge wants; the mark trio recolors the title-bar\n     mark's own gradient stops (both its highlights to `-mark-hi`, both its\n     deep stops to `-mark-deep`) and is repeated verbatim in light below,\n     since it is brand artwork rather than a themed surface. */\n  --channel-staging: 0.674 0.172 264; /* pill  #5F91FF */\n  --channel-staging-mark-hi: 0.958 0.021 246; /* #E6F3FF */\n  --channel-staging-mark-mid: 0.66 0.17 265; /* #5E8CF9 */\n  --channel-staging-mark-deep: 0.561 0.15 265; /* #486FCC */\n  --channel-dev: 0.728 0.168 301; /* pill  #B98BFF */\n  --channel-dev-mark-hi: 0.961 0.024 309; /* #F7EEFF */\n  --channel-dev-mark-mid: 0.66 0.169 300; /* #A376E9 */\n  --channel-dev-mark-deep: 0.56 0.15 300; /* #835CBE */\n  --channel-source: 0.779 0.127 63; /* pill  #F0A45A */\n  --channel-source-mark-hi: 0.955 0.032 69; /* #FFEDDA */\n  --channel-source-mark-mid: 0.66 0.167 53; /* #DE6F00 */\n  --channel-source-mark-deep: 0.56 0.145 52; /* #B45600 */\n\n  /* Modal scrim — darkens toward the canvas hue rather than to neutral black,\n     so a dialog's backdrop stays part of the same world. */\n  --scrim: 0.08 0.008 264 / 0.72;\n\n  /* Diff washes — low-alpha line backgrounds, hue-matched to the status ramp. */\n  --diff-added: 0.72 0.155 150 / 0.14;\n  --diff-removed: 0.72 0.155 22 / 0.14;\n\n  /* Code-view highlights — opaque so the measured contrast is the real one. Teal\n     for selection (the brand hue), amber for find, orange for the current match;\n     the ink is white because the highlights are mid-tone and light grey ink\n     cannot be 4.5:1 on a background that is also 3:1 from the plate. */\n  --code-selection: 0.525 0.09 178.8;\n  --code-find: 0.535 0.12 95;\n  --code-find-current: 0.55 0.15 40;\n  --code-highlight-ink: 1 0 264;\n\n  /* Commit-graph lanes — 8 hues, 45° apart, one L and C. */\n  --lane-1: 0.74 0.15 150;\n  --lane-2: 0.74 0.15 195;\n  --lane-3: 0.74 0.15 240;\n  --lane-4: 0.74 0.15 285;\n  --lane-5: 0.74 0.15 330;\n  --lane-6: 0.74 0.15 15;\n  --lane-7: 0.74 0.15 60;\n  --lane-8: 0.74 0.15 105;\n\n  /* Providers — external brand colors, lifted to readable lightness on the\n     dark themes. */\n  --provider-github: 0.857 0.014 248;\n  --provider-gitlab: 0.753 0.145 37;\n  --provider-jira: 0.73 0.116 258;\n  --provider-linear: 0.772 0.115 294;\n\n  /* Usage gauge — consumed is the BRIGHTER of the pair on the dark themes. */\n  --usage-track: 0.464 0.019 264;\n  --usage-consumed: 0.825 0.126 180;\n  /* Track for bars filled with a status tone. The neutral track is too light for\n     a status fill to clear 3:1 against it on the dark themes, so this one is\n     darker; Dark inherits it, and it clears 3:1 for all three tones on both. */\n  --usage-track-toned: 0.42 0.019 264;\n\n  /* Type stacks. The system stack is the right voice for a desktop tool: it is\n     the reader's own UI face, it needs no network, and it renders at the\n     platform's own hinting. */\n  --sans-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  --mono-font: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;\n\n  /* Elevation — the dark themes lift by lightness, so shadows only anchor true\n     overlays. */\n  --elevation-raised: 0 0 #0000;\n  --elevation-overlay: 0 8px 24px -8px oklch(0 0 0 / 0.7), 0 2px 6px -2px oklch(0 0 0 / 0.5);\n\n  /* The selected segment's fill. A separate token from the overlay surface so\n     a theme can lift its controls without also lifting every menu and popover;\n     by default it is the overlay, resolved where it is used, so Dark, Light and\n     every data theme inherit their own overlay. */\n  --control-thumb: var(--surface-overlay);\n\n  /* Control track and thumb (segmented control). The track is a well: an inset\n     shadow on the sunken surface. The thumb is raised by a 1px top highlight,\n     a drop shadow and a hairline of black that keeps its edge on the track.\n     Dark inherits these, and so does every data theme by its base's polarity. */\n  --control-track-shadow: inset 0 1px 2px oklch(0 0 0 / 0.45);\n  --control-thumb-shadow:\n    inset 0 1px 0 oklch(var(--ink) / 0.1), 0 1px 2px oklch(0 0 0 / 0.55),\n    0 0 0 1px oklch(0 0 0 / 0.35);\n\n  color-scheme: dark;\n}\n\n:root.dark {\n  /* Midnight's ramp lifted bodily — same hue, same chroma, same step sizes. */\n  --surface-sunken: 0.205 0.006 264; /* wells, inputs, code blocks   #16171a */\n  --surface-canvas: 0.232 0.006 264; /* app background               #1c1d20 */\n  --surface-raised: 0.262 0.007 264; /* panels, cards, list surfaces #232528 */\n  --surface-overlay: 0.295 0.008 264; /* menus, popovers             #2a2d31 */\n\n  /* Ink drops with the surfaces rather than holding at Midnight's near-white, which\n     is what keeps this a softer theme instead of merely a greyer one. Worst-case\n     ratios against the LIGHTEST surface (overlay): strong 10.9 · content 8.6 ·\n     muted 6.3 · subtle 4.7. `--content-strong` and `--content-on-accent` are\n     inherited: both are written against tokens this block overrides. */\n  --ink: 0.92 0.004 264;\n  --content: var(--ink) / 0.87;\n  --content-muted: var(--ink) / 0.71;\n  --content-subtle: var(--ink) / 0.58;\n\n  /* Fills — alphas raised to hold Midnight's composited lightness delta (0.039 /\n     0.065 / 0.101), not Midnight's alphas, which would read thinner up here. */\n  --fill-subtle: var(--ink) / 0.05;\n  --fill-muted: var(--ink) / 0.085;\n  --fill-strong: var(--ink) / 0.13;\n\n  /* Edges — same treatment. `edge-strong` keeps the 3:1 control boundary\n     (measured 3.24) and is the one value here tuned to a ratio rather than to\n     Midnight's appearance. */\n  --edge-subtle: var(--ink) / 0.1;\n  --edge: var(--ink) / 0.17;\n  --edge-strong: var(--ink) / 0.41;\n  --edge-decor: var(--ink) / 0.26;\n\n  /* Brand teal, lifted above Midnight's #3fa693, which would sit too close to\n     these lighter surfaces and to its own badge tint over them. Same hue and\n     the same near-black ink on top, so the action color is recognisably the\n     product's. brand-on-canvas 7.36 · ink-on-brand 7.83 · on its badge tint 4.58 */\n  --brand: 0.73 0.106 178.8; /*                                      #4ebda9 */\n  --brand-hover: 0.78 0.112 178.8;\n  --brand-active: 0.68 0.1 178.8;\n\n  /* AI purple, lifted so it still reads as text on its own badge tint over\n     these surfaces. ai-on-canvas 7.34 · ink-on-ai 7.81 · on its badge tint 4.57 */\n  --ai: 0.75 0.185 285; /*                                           #a6a1fe */\n  --ai-hover: 0.8 0.175 285;\n\n  /* Selection reads off a lighter brand, so the tint needs a touch more of it\n     to separate from a lighter row underneath. */\n  --selected-bg: var(--brand) / 0.16;\n  --selected-border: var(--brand) / 0.5;\n  /* on the wash, worst over the track 4.60 */\n  --selected-ink: 0.77 0.106 178.8; /*                              #5ccab5 */\n\n  /* The six status hues are Midnight's, unchanged (AI purple is lifted above):\n     all of them still clear their floors here (worst in the status set 5.19), and a\n     second ramp at a second lightness is exactly the duplication the system\n     exists to remove. The dormant ring is the one exception — it is tuned\n     AGAINST its surface by construction, so it has to move with it (3.94, beside\n     Midnight's 3.96). */\n  --status-dormant: 0.63 0.01 264;\n\n  /* Scrim lightens with the canvas it dims. Still a darkening wash — a scrim\n     that merely greys the page cannot push it back. */\n  --scrim: 0.12 0.008 264 / 0.7;\n\n  /* Diff washes — same hues, a little more of them, since a 14% tint over a\n     lighter line is a fainter stripe. */\n  --diff-added: 0.72 0.155 150 / 0.15;\n  --diff-removed: 0.72 0.155 22 / 0.15;\n\n  /* Code-view highlights — the plate is lighter here, so the highlights rise with\n     it and the window that satisfies both 3:1 from the plate and 4.5:1 under\n     white ink narrows to about 0.015 of lightness. */\n  --code-selection: 0.545 0.09 178.8;\n  --code-find: 0.555 0.12 95;\n  --code-find-current: 0.57 0.15 40;\n  --code-highlight-ink: 1 0 264;\n\n  /* Usage gauge — the track is an opaque grey read against the panel it sits\n     on, so it rises with the panel; consumed is Midnight's and still clears the\n     3:1 the pair owes each other. */\n  --usage-track: 0.5 0.019 264;\n\n  /* Overlay shadow, softened. Elevation is lightness here as on Midnight, so the\n     shadow only anchors true overlays — and Midnight's 0.7 black, dropped on a\n     canvas this much lighter, reads as a hole cut in the page rather than as a\n     lift. `--elevation-raised` stays the inherited no-op. */\n  --elevation-overlay: 0 8px 24px -8px oklch(0 0 0 / 0.5), 0 2px 6px -2px oklch(0 0 0 / 0.34);\n\n  color-scheme: dark;\n}\n\n:root.light {\n  --surface-sunken: 0.93 0.006 264; /*                              #e6e8ec */\n  --surface-canvas: 0.958 0.004 264; /*                             #f0f1f4 */\n  --surface-raised: 0.988 0.003 264; /*                             #fafbfd */\n  --surface-overlay: 0.997 0.002 264; /*                            #fefefe */\n\n  /* Worst-case ratios against the DARKEST surface (sunken):\n     strong 14.6 · content 11.4 · muted 7.1 · subtle 4.7. */\n  --ink: 0.205 0.014 264;\n  --content-strong: var(--ink);\n  --content: var(--ink) / 0.9;\n  --content-muted: var(--ink) / 0.75;\n  --content-subtle: var(--ink) / 0.62;\n  --content-on-accent: 0.999 0 0;\n\n  --fill-subtle: var(--ink) / 0.045;\n  --fill-muted: var(--ink) / 0.08;\n  --fill-strong: var(--ink) / 0.12;\n\n  --edge-subtle: var(--ink) / 0.1;\n  --edge: var(--ink) / 0.16;\n  --edge-strong: var(--ink) / 0.47; /* 3:1 control boundary (measured 3.02) */\n  --edge-decor: var(--ink) / 0.28;\n\n  /* Brand teal, deeper here so it carries white ink and still reads as text.\n     ink-on-brand 7.10 · brand-on-canvas 6.29 · on its badge tint 4.64 */\n  --brand: 0.45 0.098 178.2; /*                                     #026455 */\n  --brand-hover: 0.4 0.09 178.2;\n  --brand-active: 0.36 0.082 178.2;\n\n  --ai: 0.47 0.195 285; /*                                          #563dc1 */\n  --ai-hover: 0.42 0.185 285;\n\n  --selected-bg: var(--brand) / 0.12;\n  --selected-border: var(--brand) / 0.5;\n  /* on the wash, worst over the track 4.68 */\n  --selected-ink: 0.44 0.098 178.2; /*                              #036153 */\n  --focus-ring: var(--brand) / 0.9;\n\n  /* Same hues as dark at a lightness that clears AA on light surfaces.\n     Worst ratio in the set: 5.02. */\n  --status-success: 0.48 0.15 150; /*                               #007132 */\n  --status-info: 0.48 0.15 230; /*                                  #066788 */\n  --status-warning: 0.48 0.15 82; /*                                #795702 */\n  --status-attention: 0.48 0.15 50; /*                              #934302 */\n  --status-danger: 0.48 0.15 22; /*                                 #a12f35 */\n  --status-merged: 0.48 0.15 300; /*                                #6c44a4 */\n  --status-dormant: 0.54 0.015 264; /* darker than Midnight's — see @theme */\n\n  /* Host identity — same hues and chroma as Midnight, at a lower,\n     independently-tuned lightness, same reasoning as the rest of this\n     theme's restated blocks: light solves a different contrast problem, so\n     it gets its own numbers rather than Midnight's lifted bodily. Amber and\n     violet keep the same lightness offset off the shared 0.52 that they carry\n     in Midnight, for the same OKLab-separation reason. */\n  --host-rose: 0.52 0.16 355; /*                                       #ab366e */\n  --host-amber: 0.58 0.125 66; /*                                      #ab690e */\n  --host-lime: 0.52 0.155 118; /*                                      #637100 */\n  --host-cyan: 0.52 0.155 204; /*                                      #087780 */\n  --host-blue: 0.52 0.155 258; /*                                      #2766c0 */\n  --host-violet: 0.55 0.165 328; /*                                    #a247a1 */\n\n  /* Agent account identity — same hues as Midnight at a lower lightness. The\n     glyph set stays bold (3:1 is all a non-text mark needs). The ink set for\n     small text must reach 4.5:1 on the light surfaces, so amber, lime and cyan\n     go darker and shift a few degrees of hue to keep their distance from the\n     warning, success and brand colors at the lightness 4.5:1 needs. */\n  --account-rose: 0.55 0.22 352;\n  --account-amber: 0.58 0.124 72;\n  --account-lime: 0.55 0.13 125;\n  --account-cyan: 0.56 0.095 210;\n  --account-blue: 0.5 0.18 258;\n  --account-violet: 0.5 0.23 320;\n  --account-ink-rose: 0.545 0.22 352;\n  --account-ink-amber: 0.435 0.095 66;\n  --account-ink-lime: 0.51 0.122 121;\n  --account-ink-cyan: 0.5 0.075 218;\n  --account-ink-blue: 0.5 0.18 258;\n  --account-ink-violet: 0.5 0.23 320;\n\n  /* Channel ink flips to the icon's FRAME color, for dark-on-light legibility;\n     the mark trio repeats Midnight's values verbatim (brand artwork, not\n     themed). */\n  --channel-staging: 0.501 0.209 265;\n  --channel-staging-mark-hi: 0.958 0.021 246;\n  --channel-staging-mark-mid: 0.66 0.17 265;\n  --channel-staging-mark-deep: 0.561 0.15 265;\n  --channel-dev: 0.508 0.204 300;\n  --channel-dev-mark-hi: 0.961 0.024 309;\n  --channel-dev-mark-mid: 0.66 0.169 300;\n  --channel-dev-mark-deep: 0.56 0.15 300;\n  --channel-source: 0.346 0.079 45;\n  --channel-source-mark-hi: 0.955 0.032 69;\n  --channel-source-mark-mid: 0.66 0.167 53;\n  --channel-source-mark-deep: 0.56 0.145 52;\n\n  /* Lighter than the dark themes', and still a DARKENING wash: a scrim's job is\n     to push\n     the page back, which a pale overlay cannot do in either theme. */\n  --scrim: 0.2 0.012 264 / 0.5;\n\n  --diff-added: 0.48 0.15 150 / 0.12;\n  --diff-removed: 0.48 0.15 22 / 0.12;\n\n  /* Code-view highlights — mid-tones against the near-white plate, under\n     near-black ink. */\n  --code-selection: 0.605 0.09 178.8;\n  --code-find: 0.62 0.12 95;\n  --code-find-current: 0.63 0.15 40;\n  --code-highlight-ink: 0.15 0.012 264;\n\n  --lane-1: 0.52 0.15 150;\n  --lane-2: 0.52 0.15 195;\n  --lane-3: 0.52 0.15 240;\n  --lane-4: 0.52 0.15 285;\n  --lane-5: 0.52 0.15 330;\n  --lane-6: 0.52 0.15 15;\n  --lane-7: 0.52 0.15 60;\n  --lane-8: 0.52 0.15 105;\n\n  --provider-github: 0.278 0.012 248;\n  --provider-gitlab: 0.5 0.166 37;\n  --provider-jira: 0.45 0.171 263;\n  --provider-linear: 0.45 0.217 284;\n\n  /* Usage gauge — consumed is the DARKER of the pair on light. */\n  --usage-track: 0.788 0.017 264;\n  --usage-consumed: 0.424 0.073 180;\n  /* The neutral track already clears 3:1 for every status tone on light. */\n  --usage-track-toned: 0.788 0.017 264;\n\n  /* Light lifts by shadow, since the surface ramp runs out of headroom. */\n  --elevation-raised: 0 1px 2px oklch(0.2 0.02 264 / 0.06);\n  --elevation-overlay:\n    0 8px 24px -8px oklch(0.2 0.02 264 / 0.18), 0 2px 6px -2px oklch(0.2 0.02 264 / 0.1);\n\n  /* Control track and thumb: lighter shadows, and an ink hairline in place of\n     black so the thumb's edge stays soft on the light track. */\n  --control-track-shadow: inset 0 1px 2px oklch(0 0 0 / 0.08);\n  --control-thumb-shadow: 0 1px 2px oklch(0 0 0 / 0.14), 0 0 0 1px oklch(var(--ink) / 0.08);\n\n  color-scheme: light;\n}\n";

//#endregion
//#region src/ui/themes/kepler-syntax.json
var kepler_syntax_default = {
	dark: {
		"base": "dark-plus",
		"tokenColors": [
			{
				"name": "Default text, operators, punctuation",
				"scope": [
					"source",
					"text",
					"meta.embedded",
					"source.groovy.embedded",
					"string meta.image.inline.markdown",
					"variable.legacy.builtin.python",
					"meta.template.expression",
					"keyword.operator",
					"storage.modifier.import.java",
					"variable.language.wildcard.java",
					"storage.modifier.package.java",
					"entity.name.label"
				],
				"settings": { "foreground": "#c1c4c9" }
			},
			{
				"name": "Keywords, storage, this, language constants, tags",
				"scope": [
					"header",
					"constant.language",
					"entity.name.tag",
					"markup.bold",
					"markup.heading",
					"markup.changed",
					"punctuation.definition.list.begin.markdown",
					"meta.preprocessor",
					"entity.name.function.preprocessor",
					"meta.diff.header",
					"storage",
					"storage.type",
					"storage.modifier",
					"keyword.operator.noexcept",
					"punctuation.definition.template-expression.begin",
					"punctuation.definition.template-expression.end",
					"punctuation.section.embedded",
					"keyword",
					"keyword.operator.new",
					"keyword.operator.expression",
					"keyword.operator.cast",
					"keyword.operator.sizeof",
					"keyword.operator.alignof",
					"keyword.operator.typeid",
					"keyword.operator.alignas",
					"keyword.operator.instanceof",
					"keyword.operator.logical.python",
					"keyword.operator.wordlike",
					"punctuation.section.embedded.begin.php",
					"punctuation.section.embedded.end.php",
					"variable.language",
					"constant.character",
					"constant.other.option"
				],
				"settings": { "foreground": "#70a6f5" }
			},
			{
				"name": "Comments",
				"scope": ["comment", "punctuation.definition.quote.begin.markdown"],
				"settings": {
					"foreground": "#98a6b8",
					"fontStyle": "italic"
				}
			},
			{
				"name": "Numbers, enum values, units",
				"scope": [
					"constant.numeric",
					"keyword.operator.plus.exponent",
					"keyword.operator.minus.exponent",
					"markup.inserted",
					"meta.preprocessor.numeric",
					"keyword.other.unit",
					"constant.sha.git-rebase"
				],
				"settings": { "foreground": "#96c07f" }
			},
			{
				"name": "Regex, escapes, CSS selectors, invalid",
				"scope": [
					"constant.regexp",
					"entity.name.tag.css",
					"entity.name.tag.less",
					"entity.other.attribute-name.class.css",
					"source.css entity.other.attribute-name.class",
					"entity.other.attribute-name.id.css",
					"entity.other.attribute-name.parent-selector.css",
					"entity.other.attribute-name.parent.less",
					"source.css entity.other.attribute-name.pseudo-class",
					"entity.other.attribute-name.pseudo-element.css",
					"source.css.less entity.other.attribute-name.id",
					"entity.other.attribute-name.scss",
					"invalid",
					"string.regexp",
					"constant.character.character-class.regexp",
					"constant.other.character-class.set.regexp",
					"constant.other.character-class.regexp",
					"constant.character.set.regexp",
					"keyword.operator.quantifier.regexp",
					"constant.character.escape"
				],
				"settings": { "foreground": "#eb8987" }
			},
			{
				"name": "Variables, parameters, properties, attributes",
				"scope": [
					"entity.other.attribute-name",
					"meta.structure.dictionary.key.python",
					"support.type.vendored.property-name",
					"support.type.property-name",
					"source.css variable",
					"source.coffee.embedded",
					"support.function.git-rebase",
					"variable",
					"meta.definition.variable.name",
					"support.variable",
					"entity.name.variable",
					"constant.other.placeholder",
					"meta.object-literal.key"
				],
				"settings": { "foreground": "#b4e7fc" }
			},
			{
				"name": "Strings",
				"scope": [
					"markup.deleted",
					"markup.inline.raw",
					"meta.preprocessor.string",
					"string",
					"meta.embedded.assembly",
					"string.tag",
					"string.value",
					"support.constant.property-value",
					"support.constant.font-name",
					"support.constant.media-type",
					"support.constant.media",
					"constant.other.color.rgb-value",
					"constant.other.rgb-value",
					"support.constant.color",
					"punctuation.definition.group.regexp",
					"punctuation.definition.group.assertion.regexp",
					"punctuation.definition.character-class.regexp",
					"punctuation.character.set.begin.regexp",
					"punctuation.character.set.end.regexp",
					"keyword.operator.negation.regexp",
					"support.other.parenthesis.regexp"
				],
				"settings": { "foreground": "#e4ad84" }
			},
			{
				"name": "Tag brackets",
				"scope": ["punctuation.definition.tag"],
				"settings": { "foreground": "#98a6b8" }
			},
			{
				"name": "Functions",
				"scope": [
					"entity.name.function",
					"support.function",
					"support.constant.handlebars",
					"source.powershell variable.other.member",
					"entity.name.operator.custom-literal",
					"keyword.operator.or.regexp",
					"keyword.control.anchor.regexp"
				],
				"settings": { "foreground": "#e5d494" }
			},
			{
				"name": "Types, classes, namespaces",
				"scope": [
					"support.class",
					"support.type",
					"entity.name.type",
					"entity.name.namespace",
					"entity.other.attribute",
					"entity.name.scope-resolution",
					"entity.name.class",
					"storage.type.numeric.go",
					"storage.type.byte.go",
					"storage.type.boolean.go",
					"storage.type.string.go",
					"storage.type.uintptr.go",
					"storage.type.error.go",
					"storage.type.rune.go",
					"storage.type.cs",
					"storage.type.generic.cs",
					"storage.type.modifier.cs",
					"storage.type.variable.cs",
					"storage.type.annotation.java",
					"storage.type.generic.java",
					"storage.type.java",
					"storage.type.object.array.java",
					"storage.type.primitive.array.java",
					"storage.type.primitive.java",
					"storage.type.token.java",
					"storage.type.groovy",
					"storage.type.annotation.groovy",
					"storage.type.parameters.groovy",
					"storage.type.generic.groovy",
					"storage.type.object.array.groovy",
					"storage.type.primitive.array.groovy",
					"storage.type.primitive.groovy",
					"meta.type.cast.expr",
					"meta.type.new.expr",
					"support.constant.math",
					"support.constant.dom",
					"support.constant.json",
					"entity.other.inherited-class",
					"punctuation.separator.namespace.ruby"
				],
				"settings": { "foreground": "#7cd3cd" }
			},
			{
				"name": "Control flow, import/export",
				"scope": [
					"keyword.control",
					"source.cpp keyword.operator.new",
					"keyword.operator.delete",
					"keyword.other.using",
					"keyword.other.directive.using",
					"keyword.other.operator",
					"entity.name.operator"
				],
				"settings": { "foreground": "#d192ce" }
			},
			{
				"name": "Constants, enum members",
				"scope": ["variable.other.constant", "variable.other.enummember"],
				"settings": { "foreground": "#95cefe" }
			}
		]
	},
	light: {
		"base": "light-plus",
		"tokenColors": [
			{
				"name": "Default text, operators, punctuation",
				"scope": [
					"source",
					"text",
					"meta.embedded",
					"source.groovy.embedded",
					"string meta.image.inline.markdown",
					"variable.legacy.builtin.python",
					"meta.template.expression",
					"keyword.operator",
					"storage.modifier.import.java",
					"variable.language.wildcard.java",
					"storage.modifier.package.java",
					"keyword.operator.quantifier.regexp",
					"entity.name.label"
				],
				"settings": { "foreground": "#21242a" }
			},
			{
				"name": "Variables, parameters, properties",
				"scope": [
					"meta.diff.header",
					"markup.bold",
					"variable",
					"meta.definition.variable.name",
					"support.variable",
					"entity.name.variable",
					"constant.other.placeholder",
					"meta.object-literal.key"
				],
				"settings": { "foreground": "#102e6a" }
			},
			{
				"name": "Comments",
				"scope": ["comment"],
				"settings": {
					"foreground": "#636575",
					"fontStyle": "italic"
				}
			},
			{
				"name": "Keywords, storage, this, language constants",
				"scope": [
					"constant.language",
					"meta.preprocessor",
					"entity.name.function.preprocessor",
					"storage",
					"storage.type",
					"storage.modifier",
					"keyword.operator.noexcept",
					"string.comment.buffered.block.pug",
					"string.quoted.pug",
					"string.interpolated.pug",
					"string.unquoted.plain.in.yaml",
					"string.unquoted.plain.out.yaml",
					"string.unquoted.block.yaml",
					"string.quoted.single.yaml",
					"string.quoted.double.xml",
					"string.quoted.single.xml",
					"string.unquoted.cdata.xml",
					"string.quoted.double.html",
					"string.quoted.single.html",
					"string.unquoted.html",
					"string.quoted.single.handlebars",
					"string.quoted.double.handlebars",
					"punctuation.definition.template-expression.begin",
					"punctuation.definition.template-expression.end",
					"punctuation.section.embedded",
					"keyword",
					"keyword.operator.new",
					"keyword.operator.expression",
					"keyword.operator.cast",
					"keyword.operator.sizeof",
					"keyword.operator.alignof",
					"keyword.operator.typeid",
					"keyword.operator.alignas",
					"keyword.operator.instanceof",
					"keyword.operator.logical.python",
					"keyword.operator.wordlike",
					"variable.language",
					"constant.character",
					"constant.other.option"
				],
				"settings": { "foreground": "#254cba" }
			},
			{
				"name": "Numbers, enum values, units",
				"scope": [
					"constant.numeric",
					"keyword.operator.plus.exponent",
					"keyword.operator.minus.exponent",
					"markup.inserted",
					"meta.preprocessor.numeric",
					"keyword.other.unit",
					"constant.sha.git-rebase"
				],
				"settings": { "foreground": "#3a7234" }
			},
			{
				"name": "Tags, regex, CSS selectors",
				"scope": [
					"constant.regexp",
					"entity.name.tag",
					"entity.name.selector",
					"entity.other.attribute-name.class.css",
					"source.css entity.other.attribute-name.class",
					"entity.other.attribute-name.id.css",
					"entity.other.attribute-name.parent-selector.css",
					"entity.other.attribute-name.parent.less",
					"source.css entity.other.attribute-name.pseudo-class",
					"entity.other.attribute-name.pseudo-element.css",
					"source.css.less entity.other.attribute-name.id",
					"entity.other.attribute-name.scss",
					"markup.heading",
					"markup.inline.raw",
					"punctuation.definition.tag",
					"string.regexp",
					"punctuation.section.embedded.begin.php",
					"punctuation.section.embedded.end.php",
					"constant.character.character-class.regexp",
					"constant.other.character-class.set.regexp",
					"constant.other.character-class.regexp",
					"constant.character.set.regexp"
				],
				"settings": { "foreground": "#85253a" }
			},
			{
				"name": "Attributes, CSS properties, escapes, invalid",
				"scope": [
					"entity.other.attribute-name",
					"invalid",
					"support.type.vendored.property-name",
					"support.type.property-name",
					"source.css variable",
					"source.coffee.embedded",
					"keyword.operator.or.regexp",
					"keyword.control.anchor.regexp",
					"constant.character.escape"
				],
				"settings": { "foreground": "#be2e31" }
			},
			{
				"name": "Strings, regex groups",
				"scope": [
					"markup.deleted",
					"meta.preprocessor.string",
					"string",
					"meta.embedded.assembly",
					"punctuation.definition.group.regexp",
					"punctuation.definition.group.assertion.regexp",
					"punctuation.definition.character-class.regexp",
					"punctuation.character.set.begin.regexp",
					"punctuation.character.set.end.regexp",
					"keyword.operator.negation.regexp",
					"support.other.parenthesis.regexp"
				],
				"settings": { "foreground": "#8b3f03" }
			},
			{
				"name": "Constants, enum members, JSON keys, CSS values",
				"scope": [
					"markup.changed",
					"punctuation.definition.quote.begin.markdown",
					"punctuation.definition.list.begin.markdown",
					"meta.structure.dictionary.key.python",
					"support.type.property-name.json",
					"support.function.git-rebase",
					"variable.other.constant",
					"variable.other.enummember",
					"support.constant.property-value",
					"support.constant.font-name",
					"support.constant.media-type",
					"support.constant.media",
					"constant.other.color.rgb-value",
					"constant.other.rgb-value",
					"support.constant.color"
				],
				"settings": { "foreground": "#005078" }
			},
			{
				"name": "Functions",
				"scope": [
					"entity.name.function",
					"support.function",
					"support.constant.handlebars",
					"source.powershell variable.other.member",
					"entity.name.operator.custom-literal"
				],
				"settings": { "foreground": "#6f5c01" }
			},
			{
				"name": "Types, classes, namespaces",
				"scope": [
					"support.class",
					"support.type",
					"entity.name.type",
					"entity.name.namespace",
					"entity.other.attribute",
					"entity.name.scope-resolution",
					"entity.name.class",
					"storage.type.numeric.go",
					"storage.type.byte.go",
					"storage.type.boolean.go",
					"storage.type.string.go",
					"storage.type.uintptr.go",
					"storage.type.error.go",
					"storage.type.rune.go",
					"storage.type.cs",
					"storage.type.generic.cs",
					"storage.type.modifier.cs",
					"storage.type.variable.cs",
					"storage.type.annotation.java",
					"storage.type.generic.java",
					"storage.type.java",
					"storage.type.object.array.java",
					"storage.type.primitive.array.java",
					"storage.type.primitive.java",
					"storage.type.token.java",
					"storage.type.groovy",
					"storage.type.annotation.groovy",
					"storage.type.parameters.groovy",
					"storage.type.generic.groovy",
					"storage.type.object.array.groovy",
					"storage.type.primitive.array.groovy",
					"storage.type.primitive.groovy",
					"meta.type.cast.expr",
					"meta.type.new.expr",
					"support.constant.math",
					"support.constant.dom",
					"support.constant.json",
					"entity.other.inherited-class",
					"punctuation.separator.namespace.ruby"
				],
				"settings": { "foreground": "#047079" }
			},
			{
				"name": "Control flow, import/export",
				"scope": [
					"keyword.control",
					"source.cpp keyword.operator.new",
					"source.cpp keyword.operator.delete",
					"keyword.other.using",
					"keyword.other.directive.using",
					"keyword.other.operator",
					"entity.name.operator"
				],
				"settings": { "foreground": "#953490" }
			}
		]
	}
};

//#endregion
//#region src/backend/themes/theme-sources.ts
const BUNDLED_FAMILIES = Object.values([]);
/** Kepler's own syntax palette, which a theme naming no Shiki theme draws code in. */
const KEPLER_SYNTAX = kepler_syntax_default;
let palettes;
/** The built-in palettes as the stylesheet declares them, parsed on first use. */
function builtInThemePalettes() {
	palettes ??= builtInPalettes(_kepler_palette_css_default);
	return palettes;
}
let bundledIds;
/** The ids of the themes that ship with Kepler as family files. */
function bundledThemeIds() {
	bundledIds ??= new Set(BUNDLED_FAMILIES.flatMap((raw) => parseThemeFamily(raw).family?.themes.map((t) => t.id) ?? []));
	return bundledIds;
}

//#endregion
//#region src/shared/theme/token-guide.ts
/**
* Every themeable token by role, for anyone writing a theme without reading
* the design system first. A test holds each token to exactly one group, so a
* new token cannot ship without a role here.
*/
const TOKEN_GUIDE = [
	{
		id: "surfaces",
		title: "Surfaces",
		description: "A four-step elevation ladder: sunken for wells, inputs, code blocks and the terminal; canvas for the app background; raised for panels and cards; overlay for menus and popovers. On a dark theme each step is lighter than the one below; on a light theme the steps run toward white.",
		tokens: [
			"surface-sunken",
			"surface-canvas",
			"surface-raised",
			"surface-overlay"
		]
	},
	{
		id: "content",
		title: "Content",
		description: "Text is one ink at four emphasis steps, strong to subtle, and every step must read at 4.5:1 on every surface. content, content-muted and content-subtle are usually alphas over ink. content-on-accent is the text on a saturated accent fill.",
		tokens: [
			"ink",
			"content-strong",
			"content",
			"content-muted",
			"content-subtle",
			"content-on-accent"
		]
	},
	{
		id: "fills-edges",
		title: "Fills and edges",
		description: "Fills are hover and pressed tints and edges are borders, all alphas over ink so they sit on any surface. edge-subtle divides, edge bounds a panel, edge-strong bounds an interactive control and must reach 3:1; edge-decor decorates and carries no contract.",
		tokens: [
			"fill-subtle",
			"fill-muted",
			"fill-strong",
			"edge-subtle",
			"edge",
			"edge-strong",
			"edge-decor"
		]
	},
	{
		id: "brand",
		title: "Brand, AI and selection",
		description: "brand is the action color for text, icons and focus; brand-fill (with hover and active) is the solid button surface and content-on-brand the text on it. ai marks AI-driven surfaces only. selected-bg and selected-border tint a selected row in the brand and selected-ink is the text on it (set it with brand: it is a plain color, not derived), focus-ring is the keyboard focus outline, and control-thumb is the raised selected segment of a segmented control.",
		tokens: [
			"brand",
			"brand-hover",
			"brand-active",
			"brand-fill",
			"brand-fill-hover",
			"brand-fill-active",
			"content-on-brand",
			"ai",
			"ai-hover",
			"selected-bg",
			"selected-border",
			"selected-ink",
			"focus-ring",
			"control-thumb"
		]
	},
	{
		id: "status",
		title: "Status",
		description: "Six signals that differ by hue alone, at one lightness and chroma, each read as text at 4.5:1. attention means blocked on the user and must stand apart from danger and warning. status-dormant is the thin ring of a disconnected session and needs 3:1.",
		tokens: [
			"status-success",
			"status-info",
			"status-warning",
			"status-attention",
			"status-danger",
			"status-merged",
			"status-dormant"
		]
	},
	{
		id: "code",
		title: "Scrim, diffs and code highlights",
		description: "scrim is the wash behind a modal. diff-added and diff-removed are line washes behind changed code, given as a hue with an alpha; a changed row is that wash laid over the code plate (surface-raised) at its own alpha, up to 0.5, so a strongly tinted plate needs a stronger alpha before the row reads as green or red. The change marks in a diff and the line numbers of its changed rows take status-success and status-danger, which need 4.5:1 on those washes. code-selection, code-find and code-find-current are opaque highlight fills 3:1 apart from the raised surface, each carrying code-highlight-ink at 4.5:1.",
		tokens: [
			"scrim",
			"diff-added",
			"diff-removed",
			"code-selection",
			"code-find",
			"code-find-current",
			"code-highlight-ink"
		]
	},
	{
		id: "lanes",
		title: "Commit graph lanes",
		description: "Eight lane strokes at one lightness with hues spread around the wheel, so neighbouring lanes stay apart; each needs 3:1 on every surface.",
		tokens: [
			"lane-1",
			"lane-2",
			"lane-3",
			"lane-4",
			"lane-5",
			"lane-6",
			"lane-7",
			"lane-8"
		]
	},
	{
		id: "providers",
		title: "Providers",
		description: "The brand colors of GitHub, GitLab, Jira and Linear on their chips; change them only to keep a glyph at 3:1 on your surfaces.",
		tokens: [
			"provider-github",
			"provider-gitlab",
			"provider-jira",
			"provider-linear"
		]
	},
	{
		id: "usage",
		title: "Usage gauges",
		description: "usage-track and usage-consumed are a pair that must stay 3:1 apart. usage-track-toned is the track under a status-colored bar and must stay 3:1 from the success, warning and danger colors.",
		tokens: [
			"usage-track",
			"usage-consumed",
			"usage-track-toned"
		]
	},
	{
		id: "identity",
		title: "Remote and account identity",
		description: "Six identity hues the user picks for a remote environment (host-*) and for an agent account (account-* for glyphs, account-ink-* for small text). They are identity, never state, so keep them distinct from the brand, ai and status hues.",
		tokens: [
			"host-rose",
			"host-amber",
			"host-lime",
			"host-cyan",
			"host-blue",
			"host-violet",
			"account-rose",
			"account-amber",
			"account-lime",
			"account-cyan",
			"account-blue",
			"account-violet",
			"account-ink-rose",
			"account-ink-amber",
			"account-ink-lime",
			"account-ink-cyan",
			"account-ink-blue",
			"account-ink-violet"
		]
	},
	{
		id: "channel",
		title: "Release channel marks",
		description: "The badge text and title-bar mark gradient of the staging, dev and source builds. Most themes leave them alone; the badge colors are read as text at 4.5:1.",
		tokens: [
			"channel-staging",
			"channel-staging-mark-hi",
			"channel-staging-mark-mid",
			"channel-staging-mark-deep",
			"channel-dev",
			"channel-dev-mark-hi",
			"channel-dev-mark-mid",
			"channel-dev-mark-deep",
			"channel-source",
			"channel-source-mark-hi",
			"channel-source-mark-mid",
			"channel-source-mark-deep"
		]
	}
];

//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/scanner.js
/**
* Creates a JSON scanner on the given text.
* If ignoreTrivia is set, whitespaces or comments are ignored.
*/
function createScanner(text, ignoreTrivia = false) {
	const len = text.length;
	let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
	function scanHexDigits(count, exact) {
		let digits = 0;
		let value = 0;
		while (digits < count || !exact) {
			let ch = text.charCodeAt(pos);
			if (ch >= 48 && ch <= 57) value = value * 16 + ch - 48;
			else if (ch >= 65 && ch <= 70) value = value * 16 + ch - 65 + 10;
			else if (ch >= 97 && ch <= 102) value = value * 16 + ch - 97 + 10;
			else break;
			pos++;
			digits++;
		}
		if (digits < count) value = -1;
		return value;
	}
	function setPosition(newPosition) {
		pos = newPosition;
		value = "";
		tokenOffset = 0;
		token = 16;
		scanError = 0;
	}
	function scanNumber() {
		let start = pos;
		if (text.charCodeAt(pos) === 48) pos++;
		else {
			pos++;
			while (pos < text.length && isDigit(text.charCodeAt(pos))) pos++;
		}
		if (pos < text.length && text.charCodeAt(pos) === 46) {
			pos++;
			if (pos < text.length && isDigit(text.charCodeAt(pos))) {
				pos++;
				while (pos < text.length && isDigit(text.charCodeAt(pos))) pos++;
			} else {
				scanError = 3;
				return text.substring(start, pos);
			}
		}
		let end = pos;
		if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
			pos++;
			if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) pos++;
			if (pos < text.length && isDigit(text.charCodeAt(pos))) {
				pos++;
				while (pos < text.length && isDigit(text.charCodeAt(pos))) pos++;
				end = pos;
			} else scanError = 3;
		}
		return text.substring(start, end);
	}
	function scanString() {
		let result = "", start = pos;
		while (true) {
			if (pos >= len) {
				result += text.substring(start, pos);
				scanError = 2;
				break;
			}
			const ch = text.charCodeAt(pos);
			if (ch === 34) {
				result += text.substring(start, pos);
				pos++;
				break;
			}
			if (ch === 92) {
				result += text.substring(start, pos);
				pos++;
				if (pos >= len) {
					scanError = 2;
					break;
				}
				switch (text.charCodeAt(pos++)) {
					case 34:
						result += "\"";
						break;
					case 92:
						result += "\\";
						break;
					case 47:
						result += "/";
						break;
					case 98:
						result += "\b";
						break;
					case 102:
						result += "\f";
						break;
					case 110:
						result += "\n";
						break;
					case 114:
						result += "\r";
						break;
					case 116:
						result += "	";
						break;
					case 117:
						const ch3 = scanHexDigits(4, true);
						if (ch3 >= 0) result += String.fromCharCode(ch3);
						else scanError = 4;
						break;
					default: scanError = 5;
				}
				start = pos;
				continue;
			}
			if (ch >= 0 && ch <= 31) {
				if (isLineBreak(ch)) {
					result += text.substring(start, pos);
					scanError = 2;
					break;
				} else scanError = 6;
			}
			pos++;
		}
		return result;
	}
	function scanNext() {
		value = "";
		scanError = 0;
		tokenOffset = pos;
		lineStartOffset = lineNumber;
		prevTokenLineStartOffset = tokenLineStartOffset;
		if (pos >= len) {
			tokenOffset = len;
			return token = 17;
		}
		let code = text.charCodeAt(pos);
		if (isWhiteSpace(code)) {
			do {
				pos++;
				value += String.fromCharCode(code);
				code = text.charCodeAt(pos);
			} while (isWhiteSpace(code));
			return token = 15;
		}
		if (isLineBreak(code)) {
			pos++;
			value += String.fromCharCode(code);
			if (code === 13 && text.charCodeAt(pos) === 10) {
				pos++;
				value += "\n";
			}
			lineNumber++;
			tokenLineStartOffset = pos;
			return token = 14;
		}
		switch (code) {
			case 123:
				pos++;
				return token = 1;
			case 125:
				pos++;
				return token = 2;
			case 91:
				pos++;
				return token = 3;
			case 93:
				pos++;
				return token = 4;
			case 58:
				pos++;
				return token = 6;
			case 44:
				pos++;
				return token = 5;
			case 34:
				pos++;
				value = scanString();
				return token = 10;
			case 47:
				const start = pos - 1;
				if (text.charCodeAt(pos + 1) === 47) {
					pos += 2;
					while (pos < len) {
						if (isLineBreak(text.charCodeAt(pos))) break;
						pos++;
					}
					value = text.substring(start, pos);
					return token = 12;
				}
				if (text.charCodeAt(pos + 1) === 42) {
					pos += 2;
					const safeLength = len - 1;
					let commentClosed = false;
					while (pos < safeLength) {
						const ch = text.charCodeAt(pos);
						if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
							pos += 2;
							commentClosed = true;
							break;
						}
						pos++;
						if (isLineBreak(ch)) {
							if (ch === 13 && text.charCodeAt(pos) === 10) pos++;
							lineNumber++;
							tokenLineStartOffset = pos;
						}
					}
					if (!commentClosed) {
						pos++;
						scanError = 1;
					}
					value = text.substring(start, pos);
					return token = 13;
				}
				value += String.fromCharCode(code);
				pos++;
				return token = 16;
			case 45:
				value += String.fromCharCode(code);
				pos++;
				if (pos === len || !isDigit(text.charCodeAt(pos))) return token = 16;
			case 48:
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
				value += scanNumber();
				return token = 11;
			default:
				while (pos < len && isUnknownContentCharacter(code)) {
					pos++;
					code = text.charCodeAt(pos);
				}
				if (tokenOffset !== pos) {
					value = text.substring(tokenOffset, pos);
					switch (value) {
						case "true": return token = 8;
						case "false": return token = 9;
						case "null": return token = 7;
					}
					return token = 16;
				}
				value += String.fromCharCode(code);
				pos++;
				return token = 16;
		}
	}
	function isUnknownContentCharacter(code) {
		if (isWhiteSpace(code) || isLineBreak(code)) return false;
		switch (code) {
			case 125:
			case 93:
			case 123:
			case 91:
			case 34:
			case 58:
			case 44:
			case 47: return false;
		}
		return true;
	}
	function scanNextNonTrivia() {
		let result;
		do
			result = scanNext();
		while (result >= 12 && result <= 15);
		return result;
	}
	return {
		setPosition,
		getPosition: () => pos,
		scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
		getToken: () => token,
		getTokenValue: () => value,
		getTokenOffset: () => tokenOffset,
		getTokenLength: () => pos - tokenOffset,
		getTokenStartLine: () => lineStartOffset,
		getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
		getTokenError: () => scanError
	};
}
function isWhiteSpace(ch) {
	return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
	return ch === 10 || ch === 13;
}
function isDigit(ch) {
	return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes) {
	CharacterCodes[CharacterCodes["lineFeed"] = 10] = "lineFeed";
	CharacterCodes[CharacterCodes["carriageReturn"] = 13] = "carriageReturn";
	CharacterCodes[CharacterCodes["space"] = 32] = "space";
	CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
	CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
	CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
	CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
	CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
	CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
	CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
	CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
	CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
	CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
	CharacterCodes[CharacterCodes["a"] = 97] = "a";
	CharacterCodes[CharacterCodes["b"] = 98] = "b";
	CharacterCodes[CharacterCodes["c"] = 99] = "c";
	CharacterCodes[CharacterCodes["d"] = 100] = "d";
	CharacterCodes[CharacterCodes["e"] = 101] = "e";
	CharacterCodes[CharacterCodes["f"] = 102] = "f";
	CharacterCodes[CharacterCodes["g"] = 103] = "g";
	CharacterCodes[CharacterCodes["h"] = 104] = "h";
	CharacterCodes[CharacterCodes["i"] = 105] = "i";
	CharacterCodes[CharacterCodes["j"] = 106] = "j";
	CharacterCodes[CharacterCodes["k"] = 107] = "k";
	CharacterCodes[CharacterCodes["l"] = 108] = "l";
	CharacterCodes[CharacterCodes["m"] = 109] = "m";
	CharacterCodes[CharacterCodes["n"] = 110] = "n";
	CharacterCodes[CharacterCodes["o"] = 111] = "o";
	CharacterCodes[CharacterCodes["p"] = 112] = "p";
	CharacterCodes[CharacterCodes["q"] = 113] = "q";
	CharacterCodes[CharacterCodes["r"] = 114] = "r";
	CharacterCodes[CharacterCodes["s"] = 115] = "s";
	CharacterCodes[CharacterCodes["t"] = 116] = "t";
	CharacterCodes[CharacterCodes["u"] = 117] = "u";
	CharacterCodes[CharacterCodes["v"] = 118] = "v";
	CharacterCodes[CharacterCodes["w"] = 119] = "w";
	CharacterCodes[CharacterCodes["x"] = 120] = "x";
	CharacterCodes[CharacterCodes["y"] = 121] = "y";
	CharacterCodes[CharacterCodes["z"] = 122] = "z";
	CharacterCodes[CharacterCodes["A"] = 65] = "A";
	CharacterCodes[CharacterCodes["B"] = 66] = "B";
	CharacterCodes[CharacterCodes["C"] = 67] = "C";
	CharacterCodes[CharacterCodes["D"] = 68] = "D";
	CharacterCodes[CharacterCodes["E"] = 69] = "E";
	CharacterCodes[CharacterCodes["F"] = 70] = "F";
	CharacterCodes[CharacterCodes["G"] = 71] = "G";
	CharacterCodes[CharacterCodes["H"] = 72] = "H";
	CharacterCodes[CharacterCodes["I"] = 73] = "I";
	CharacterCodes[CharacterCodes["J"] = 74] = "J";
	CharacterCodes[CharacterCodes["K"] = 75] = "K";
	CharacterCodes[CharacterCodes["L"] = 76] = "L";
	CharacterCodes[CharacterCodes["M"] = 77] = "M";
	CharacterCodes[CharacterCodes["N"] = 78] = "N";
	CharacterCodes[CharacterCodes["O"] = 79] = "O";
	CharacterCodes[CharacterCodes["P"] = 80] = "P";
	CharacterCodes[CharacterCodes["Q"] = 81] = "Q";
	CharacterCodes[CharacterCodes["R"] = 82] = "R";
	CharacterCodes[CharacterCodes["S"] = 83] = "S";
	CharacterCodes[CharacterCodes["T"] = 84] = "T";
	CharacterCodes[CharacterCodes["U"] = 85] = "U";
	CharacterCodes[CharacterCodes["V"] = 86] = "V";
	CharacterCodes[CharacterCodes["W"] = 87] = "W";
	CharacterCodes[CharacterCodes["X"] = 88] = "X";
	CharacterCodes[CharacterCodes["Y"] = 89] = "Y";
	CharacterCodes[CharacterCodes["Z"] = 90] = "Z";
	CharacterCodes[CharacterCodes["asterisk"] = 42] = "asterisk";
	CharacterCodes[CharacterCodes["backslash"] = 92] = "backslash";
	CharacterCodes[CharacterCodes["closeBrace"] = 125] = "closeBrace";
	CharacterCodes[CharacterCodes["closeBracket"] = 93] = "closeBracket";
	CharacterCodes[CharacterCodes["colon"] = 58] = "colon";
	CharacterCodes[CharacterCodes["comma"] = 44] = "comma";
	CharacterCodes[CharacterCodes["dot"] = 46] = "dot";
	CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
	CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
	CharacterCodes[CharacterCodes["openBrace"] = 123] = "openBrace";
	CharacterCodes[CharacterCodes["openBracket"] = 91] = "openBracket";
	CharacterCodes[CharacterCodes["plus"] = 43] = "plus";
	CharacterCodes[CharacterCodes["slash"] = 47] = "slash";
	CharacterCodes[CharacterCodes["formFeed"] = 12] = "formFeed";
	CharacterCodes[CharacterCodes["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/string-intern.js
const cachedSpaces = new Array(20).fill(0).map((_, index) => {
	return " ".repeat(index);
});
const maxCachedValues = 200;
const cachedBreakLinesWithSpaces = {
	" ": {
		"\n": new Array(maxCachedValues).fill(0).map((_, index) => {
			return "\n" + " ".repeat(index);
		}),
		"\r": new Array(maxCachedValues).fill(0).map((_, index) => {
			return "\r" + " ".repeat(index);
		}),
		"\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
			return "\r\n" + " ".repeat(index);
		})
	},
	"	": {
		"\n": new Array(maxCachedValues).fill(0).map((_, index) => {
			return "\n" + "	".repeat(index);
		}),
		"\r": new Array(maxCachedValues).fill(0).map((_, index) => {
			return "\r" + "	".repeat(index);
		}),
		"\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
			return "\r\n" + "	".repeat(index);
		})
	}
};

//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions) {
	ParseOptions.DEFAULT = { allowTrailingComma: false };
})(ParseOptions || (ParseOptions = {}));
/**
* Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
* Therefore always check the errors list to find out if the input was valid.
*/
function parse$1(text, errors = [], options = ParseOptions.DEFAULT) {
	let currentProperty = null;
	let currentParent = [];
	const previousParents = [];
	function onValue(value) {
		if (Array.isArray(currentParent)) currentParent.push(value);
		else if (currentProperty !== null) currentParent[currentProperty] = value;
	}
	visit(text, {
		onObjectBegin: () => {
			const object = {};
			onValue(object);
			previousParents.push(currentParent);
			currentParent = object;
			currentProperty = null;
		},
		onObjectProperty: (name) => {
			currentProperty = name;
		},
		onObjectEnd: () => {
			currentParent = previousParents.pop();
		},
		onArrayBegin: () => {
			const array = [];
			onValue(array);
			previousParents.push(currentParent);
			currentParent = array;
			currentProperty = null;
		},
		onArrayEnd: () => {
			currentParent = previousParents.pop();
		},
		onLiteralValue: onValue,
		onError: (error, offset, length) => {
			errors.push({
				error,
				offset,
				length
			});
		}
	}, options);
	return currentParent[0];
}
/**
* Parses the given text and invokes the visitor functions for each object, array and literal reached.
*/
function visit(text, visitor, options = ParseOptions.DEFAULT) {
	const _scanner = createScanner(text, false);
	const _jsonPath = [];
	let suppressedCallbacks = 0;
	function toNoArgVisit(visitFunction) {
		return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
	}
	function toOneArgVisit(visitFunction) {
		return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
	}
	function toOneArgVisitWithPath(visitFunction) {
		return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
	}
	function toBeginVisit(visitFunction) {
		return visitFunction ? () => {
			if (suppressedCallbacks > 0) suppressedCallbacks++;
			else if (visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) === false) suppressedCallbacks = 1;
		} : () => true;
	}
	function toEndVisit(visitFunction) {
		return visitFunction ? () => {
			if (suppressedCallbacks > 0) suppressedCallbacks--;
			if (suppressedCallbacks === 0) visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
		} : () => true;
	}
	const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
	const disallowComments = options && options.disallowComments;
	const allowTrailingComma = options && options.allowTrailingComma;
	function scanNext() {
		while (true) {
			const token = _scanner.scan();
			switch (_scanner.getTokenError()) {
				case 4:
					handleError(14);
					break;
				case 5:
					handleError(15);
					break;
				case 3:
					handleError(13);
					break;
				case 1:
					if (!disallowComments) handleError(11);
					break;
				case 2:
					handleError(12);
					break;
				case 6: handleError(16);
			}
			switch (token) {
				case 12:
				case 13:
					if (disallowComments) handleError(10);
					else onComment();
					break;
				case 16:
					handleError(1);
					break;
				case 15:
				case 14: break;
				default: return token;
			}
		}
	}
	function handleError(error, skipUntilAfter = [], skipUntil = []) {
		onError(error);
		if (skipUntilAfter.length + skipUntil.length > 0) {
			let token = _scanner.getToken();
			while (token !== 17) {
				if (skipUntilAfter.indexOf(token) !== -1) {
					scanNext();
					break;
				} else if (skipUntil.indexOf(token) !== -1) break;
				token = scanNext();
			}
		}
	}
	function parseString(isValue) {
		const value = _scanner.getTokenValue();
		if (isValue) onLiteralValue(value);
		else {
			onObjectProperty(value);
			_jsonPath.push(value);
		}
		scanNext();
		return true;
	}
	function parseLiteral() {
		switch (_scanner.getToken()) {
			case 11:
				const tokenValue = _scanner.getTokenValue();
				let value = Number(tokenValue);
				if (isNaN(value)) {
					handleError(2);
					value = 0;
				}
				onLiteralValue(value);
				break;
			case 7:
				onLiteralValue(null);
				break;
			case 8:
				onLiteralValue(true);
				break;
			case 9:
				onLiteralValue(false);
				break;
			default: return false;
		}
		scanNext();
		return true;
	}
	function parseProperty() {
		if (_scanner.getToken() !== 10) {
			handleError(3, [], [2, 5]);
			return false;
		}
		parseString(false);
		if (_scanner.getToken() === 6) {
			onSeparator(":");
			scanNext();
			if (!parseValue()) handleError(4, [], [2, 5]);
		} else handleError(5, [], [2, 5]);
		_jsonPath.pop();
		return true;
	}
	function parseObject() {
		onObjectBegin();
		scanNext();
		let needsComma = false;
		while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
			if (_scanner.getToken() === 5) {
				if (!needsComma) handleError(4, [], []);
				onSeparator(",");
				scanNext();
				if (_scanner.getToken() === 2 && allowTrailingComma) break;
			} else if (needsComma) handleError(6, [], []);
			if (!parseProperty()) handleError(4, [], [2, 5]);
			needsComma = true;
		}
		onObjectEnd();
		if (_scanner.getToken() !== 2) handleError(7, [2], []);
		else scanNext();
		return true;
	}
	function parseArray() {
		onArrayBegin();
		scanNext();
		let isFirstElement = true;
		let needsComma = false;
		while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
			if (_scanner.getToken() === 5) {
				if (!needsComma) handleError(4, [], []);
				onSeparator(",");
				scanNext();
				if (_scanner.getToken() === 4 && allowTrailingComma) break;
			} else if (needsComma) handleError(6, [], []);
			if (isFirstElement) {
				_jsonPath.push(0);
				isFirstElement = false;
			} else _jsonPath[_jsonPath.length - 1]++;
			if (!parseValue()) handleError(4, [], [4, 5]);
			needsComma = true;
		}
		onArrayEnd();
		if (!isFirstElement) _jsonPath.pop();
		if (_scanner.getToken() !== 4) handleError(8, [4], []);
		else scanNext();
		return true;
	}
	function parseValue() {
		switch (_scanner.getToken()) {
			case 3: return parseArray();
			case 1: return parseObject();
			case 10: return parseString(true);
			default: return parseLiteral();
		}
	}
	scanNext();
	if (_scanner.getToken() === 17) {
		if (options.allowEmptyContent) return true;
		handleError(4, [], []);
		return false;
	}
	if (!parseValue()) {
		handleError(4, [], []);
		return false;
	}
	if (_scanner.getToken() !== 17) handleError(9, [], []);
	return true;
}

//#endregion
//#region node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError) {
	ScanError[ScanError["None"] = 0] = "None";
	ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
	ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
	ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
	ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
	ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
	ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind) {
	SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
	SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
	SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
	SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
	SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
	SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
	SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
	SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
	SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
	SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
	SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
	SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
	SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
	SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
	SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
	SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
	SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
/**
* Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
* Therefore, always check the errors list to find out if the input was valid.
*/
const parse = parse$1;
var ParseErrorCode;
(function(ParseErrorCode) {
	ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
	ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
	ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
	ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
	ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
	ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
	ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
	ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
	ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
	ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
	ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
	ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
	ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
	ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
	ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
	ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function printParseErrorCode(code) {
	switch (code) {
		case 1: return "InvalidSymbol";
		case 2: return "InvalidNumberFormat";
		case 3: return "PropertyNameExpected";
		case 4: return "ValueExpected";
		case 5: return "ColonExpected";
		case 6: return "CommaExpected";
		case 7: return "CloseBraceExpected";
		case 8: return "CloseBracketExpected";
		case 9: return "EndOfFileExpected";
		case 10: return "InvalidCommentToken";
		case 11: return "UnexpectedEndOfComment";
		case 12: return "UnexpectedEndOfString";
		case 13: return "UnexpectedEndOfNumber";
		case 14: return "InvalidUnicode";
		case 15: return "InvalidEscapeCharacter";
		case 16: return "InvalidCharacter";
	}
	return "<unknown ParseErrorCode>";
}

//#endregion
//#region src/backend/themes/load-user-themes.ts
const BUILT_IN_IDS = new Set(BASE_THEMES);
const PARSE_ERROR_WORDS = {
	InvalidSymbol: "Unexpected character",
	InvalidNumberFormat: "Invalid number",
	PropertyNameExpected: "Expected a property name",
	ValueExpected: "Expected a value",
	ColonExpected: "Expected a colon",
	CommaExpected: "Expected a comma",
	CloseBraceExpected: "Expected a closing brace",
	CloseBracketExpected: "Expected a closing bracket",
	EndOfFileExpected: "Expected the end of the file",
	InvalidCommentToken: "Invalid comment",
	UnexpectedEndOfComment: "Unterminated comment",
	UnexpectedEndOfString: "Unterminated string",
	UnexpectedEndOfNumber: "Unterminated number",
	InvalidUnicode: "Invalid unicode escape",
	InvalidEscapeCharacter: "Invalid escape character",
	InvalidCharacter: "Invalid character"
};
/**
* The first syntax problem in `text` as one user-facing error, or undefined
* when it parses. Comments and trailing commas are accepted in every theme
* file, as editors accept them in their own settings files.
*/
function syntaxError(text, errors) {
	const first = errors[0];
	if (!first) return void 0;
	const before = text.slice(0, first.offset);
	const line = before.split("\n").length;
	const column = first.offset - before.lastIndexOf("\n");
	const atEnd = first.offset >= text.trimEnd().length;
	const words = PARSE_ERROR_WORDS[printParseErrorCode(first.error)] ?? "Syntax error";
	return {
		message: `Not valid JSON: ${atEnd ? "Unexpected end of file" : words}`,
		line,
		column
	};
}
/** What one file yielded: the family when its envelope is valid, and everything to tell the user. */
function parseFamily(file, text) {
	const syntaxErrors = [];
	const json = parse(text, syntaxErrors, {
		allowTrailingComma: true,
		disallowComments: false,
		allowEmptyContent: false
	});
	const syntax = syntaxError(text, syntaxErrors);
	if (syntax) return {
		errors: [{
			file,
			...syntax
		}],
		notices: []
	};
	const parsed = parseThemeFamily(json);
	return {
		...parsed.family && {
			family: parsed.family,
			json
		},
		errors: parsed.errors.map(({ message, themeId }) => ({
			file,
			message,
			...themeId !== void 0 && { themeId }
		})),
		notices: parsed.notices.map((notice) => ({
			file,
			...notice
		}))
	};
}

//#endregion
//#region src/backend/themes/validate-theme.ts
function noticeMessage(notice) {
	switch (notice.kind) {
		case "newer-version": return `The file says it is a newer format than ${1}; fields this version does not know are ignored. Use schemaVersion ${1}.`;
		case "unknown-key": return `Unknown key "${notice.key}" was ignored. Remove it or check its spelling.`;
		case "renamed-token": return `Color token "${notice.from}" was renamed to "${notice.to}". Use the new name.`;
	}
}
const GROUP_BY_TOKEN = new Map(TOKEN_GUIDE.flatMap((group) => group.tokens.map((token) => [token, group])));
/** A token's role in a line: its group's title and the first sentence of what the group does. */
function tokenRole(token) {
	const group = GROUP_BY_TOKEN.get(token);
	if (!group) return void 0;
	const [first = group.description] = group.description.split(/(?<=\.)\s/);
	return `${token} is in ${group.title}: ${first}`;
}
/** The role of the token a schema error's path or a notice's wording names. */
function problemHint(message) {
	const token = /\bcolors\.([a-z0-9-]+)|[Cc]olor token "([a-z0-9-]+)"/.exec(message)?.slice(1).find(Boolean);
	return token === void 0 ? void 0 : tokenRole(token);
}
function contrastHint(label, min) {
	const floor = `Must reach ${min}:1.`;
	for (const [, token] of label.matchAll(/--([a-z0-9-]+)/g)) {
		const role = token === void 0 ? void 0 : tokenRole(token);
		if (role !== void 0) return `${floor} ${role}`;
	}
	return floor;
}
function roundRatio(ratio) {
	return Math.round(ratio * 100) / 100;
}
/** Every contrast check of the theme against this build's palettes, and how far the thumb stands from its track. */
function measureThemeContrast(theme, palettes = builtInThemePalettes()) {
	const [entry] = dataThemes([{ themes: [contrastDefinition(theme)] }], palettes, KEPLER_SYNTAX);
	const rows = entry ? runChecks([entry]) : [];
	const [thumb] = entry ? thumbSeparation([entry]) : [];
	return {
		rows,
		...thumb !== void 0 && Number.isFinite(thumb.ratio) && { thumbSeparation: roundRatio(thumb.ratio) }
	};
}
/**
* `validateThemeFamily` with the themes it resolved, for a caller that reads
* more of them than the result's DTO carries. `themes` holds the same themes as
* the result's, in its order.
*/
function inspectThemeFamily(text, { file = "theme.json", takenIds }) {
	const parsed = parseFamily(file, text.replace(/^\uFEFF/, ""));
	const errors = parsed.errors.map(({ message, line, column, themeId }) => {
		const hint = problemHint(message);
		return {
			message,
			...line !== void 0 && { line },
			...column !== void 0 && { column },
			...themeId !== void 0 && { themeId },
			...hint !== void 0 && { hint }
		};
	});
	const notices = parsed.notices.map((notice) => ({
		kind: notice.kind,
		message: noticeMessage(notice)
	}));
	const idClashes = [];
	const themes = [];
	const builtIn = /* @__PURE__ */ new Set([...BASE_THEMES, ...bundledThemeIds()]);
	const resolved = (parsed.family?.themes ?? []).map((def) => resolveTheme(def));
	for (const theme of resolved) {
		if (builtIn.has(theme.id)) idClashes.push({
			themeId: theme.id,
			owner: BUILT_IN_THEME_OWNER
		});
		else {
			const owner = takenIds.get(theme.id);
			if (owner !== void 0) idClashes.push({
				themeId: theme.id,
				owner
			});
		}
		for (const { from, to } of theme.renamedTokens ?? []) notices.push({
			kind: "renamed-token",
			themeId: theme.id,
			message: noticeMessage({
				file,
				kind: "renamed-token",
				from,
				to
			})
		});
		for (const warning of theme.warnings) {
			const hint = problemHint(warning);
			notices.push({
				kind: "ignored-value",
				themeId: theme.id,
				message: warning,
				...hint !== void 0 && { hint }
			});
		}
	}
	const palettes = builtInThemePalettes();
	for (const theme of resolved) {
		const { rows, thumbSeparation: thumb } = measureThemeContrast(theme, palettes);
		themes.push({
			id: theme.id,
			name: theme.name,
			polarity: theme.polarity,
			contrast: {
				checked: rows.length,
				failures: rows.filter((row) => !row.pass).map(({ label, ratio, min }) => ({
					label,
					ratio: roundRatio(ratio),
					min,
					hint: contrastHint(label, min)
				}))
			},
			...thumb !== void 0 && { thumbSeparation: thumb }
		});
	}
	return {
		result: {
			ok: errors.length === 0 && idClashes.length === 0 && themes.every((theme) => theme.contrast.failures.length === 0),
			formatVersion: 1,
			errors,
			notices,
			themes,
			idClashes
		},
		themes: resolved
	};
}

//#endregion
//#region src/backend/themes/theme-check-entry.ts
const version = "0.13.0";
function checkThemeFamily(text) {
	const { result, themes: resolved } = inspectThemeFamily(text, { takenIds: /* @__PURE__ */ new Map() });
	const palettes = builtInThemePalettes();
	const errors = result.errors.map(({ message }) => ({ message }));
	const notices = result.notices.map(({ message }) => ({ message }));
	const themes = result.themes.map((theme) => {
		const source = resolved.find(({ id }) => id === theme.id);
		const preview = source && deriveThemePreview(source, palettes, KEPLER_SYNTAX);
		return {
			id: theme.id,
			contrastFailures: theme.contrast.failures.map(({ label, ratio, min }) => ({
				label,
				ratio,
				min
			})),
			...preview && { preview }
		};
	});
	const reservedIds = result.idClashes.filter((clash) => clash.owner === BUILT_IN_THEME_OWNER).map((clash) => clash.themeId);
	return {
		ok: errors.length === 0 && notices.length === 0 && reservedIds.length === 0 && themes.every((theme) => theme.contrastFailures.length === 0),
		errors,
		notices,
		themes,
		reservedIds
	};
}

//#endregion
export { checkThemeFamily, version };