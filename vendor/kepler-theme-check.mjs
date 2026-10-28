/*!
 * Kepler theme check 0.15.0
 *
 * Generated from Kepler 0.15.0. Do not edit by hand: it is rebuilt from
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

// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};

// src/shared/theme/id.ts
/**
* The shape every theme id takes. Imported on its own by the settings
* validators, which Electron main also loads, so it carries no dependencies.
*/
const THEME_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// src/shared/theme/color.ts
const HEX_RE$1 = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;
const SHORT_HEX_RE$1 = /^#[0-9a-f]{3,4}$/i;
const NUM$1 = String.raw`(\d*\.?\d+)`;
const OKLCH_RE$1 = new RegExp(String.raw`^oklch\(\s*${NUM$1}\s+${NUM$1}\s+${NUM$1}(?:\s*\/\s*${NUM$1})?\s*\)$`, "i");
const P3_RE$1 = new RegExp(String.raw`^color\(\s*display-p3\s+${NUM$1}\s+${NUM$1}\s+${NUM$1}(?:\s*\/\s*${NUM$1})?\s*\)$`, "i");
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
/** Linear Display-P3 to linear sRGB, D65 both; the result may leave the sRGB gamut. */
function linearP3ToLinearSrgb(r, g, b) {
	return [
		1.2249401763 * r - .2249401763 * g,
		-.0420569547 * r + 1.0420569547 * g,
		-.0196375546 * r - .0786360456 * g + 1.0982736001 * b
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
/** `#rgb` and `#rgba` doubled out to `#rrggbb` and `#rrggbbaa`, as CSS reads them; any other text unchanged. */
function expandHex(value) {
	if (!SHORT_HEX_RE$1.test(value)) return value;
	return `#${value.slice(1).replace(/./g, "$&$&")}`;
}
function hexToOklch(input) {
	const hex = expandHex(input);
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
/** `color(display-p3 r g b [/ a])`, channels clamped to 0..1; its out-of-sRGB-gamut chroma is reduced on output like any OKLCH color. */
function displayP3ToOklch(input) {
	const m = P3_RE$1.exec(input.trim());
	if (!m) return null;
	const unit = (text) => Math.min(1, Math.max(0, Number(text)));
	const [r, g, b] = linearP3ToLinearSrgb(srgbToLinear$1(unit(m[1])), srgbToLinear$1(unit(m[2])), srgbToLinear$1(unit(m[3])));
	const [L, A, B] = linearSrgbToOklab(r, g, b);
	const c = Math.hypot(A, B);
	const achromatic = c < ACHROMATIC_CHROMA;
	return {
		l: Math.min(1, Math.max(0, L)),
		c: achromatic ? 0 : Math.min(MAX_CHROMA, c),
		h: achromatic ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360,
		a: m[4] === void 0 ? 1 : unit(m[4])
	};
}
/** Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `oklch(L C H[ / a])` or `color(display-p3 r g b[ / a])`; null when invalid or out of range. */
function parseColor(input) {
	const hex = hexToOklch(input);
	if (hex) return hex;
	const p3 = displayP3ToOklch(input);
	if (p3) return p3;
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

// node_modules/zod/v4/core/util.js
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
/** The leading size checks of `defChecks` that set an upper bound, each paired with it. */
function sizeCaps(defChecks) {
	const caps = [];
	for (const ch of defChecks ?? []) {
		const d = ch._zod.def;
		if (!/_(length|size)$|_equals$/.test(d.check)) break;
		const max = d.maximum ?? d.length ?? d.size;
		if (max >= 0) caps.push([max, ch]);
	}
	return caps;
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
/* @__NO_SIDE_EFFECTS__ */
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

// node_modules/zod/v4/core/core.js
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
/* @__NO_SIDE_EFFECTS__ */
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

// node_modules/zod/v4/core/errors.js
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
const $ZodError = /* @__PURE__ */ $constructor("$ZodError", initializer$1);
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

// node_modules/zod/v4/core/parse.js
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

// node_modules/zod/v4/core/regexes.js
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

// node_modules/zod/v4/core/checks.js
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

// node_modules/zod/v4/core/doc.js
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

// node_modules/zod/v4/core/versions.js
const version$1 = {
	major: 4,
	minor: 6,
	patch: 7
};

// node_modules/zod/v4/core/schemas.js
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
function capSize(inst, size) {
	const caps = sizeCaps(inst._zod.def.checks);
	if (!caps.length) return;
	const cap = Math.min(...caps.map((c) => c[0]));
	const parse = inst._zod.parse;
	inst._zod.parse = (payload, ctx) => {
		const n = size(payload.value);
		if (n > cap && !ctx?.skipChecks && ctx?.direction !== "backward") {
			for (const [max, ch] of sizeCaps(inst._zod.def.checks)) if (n > max && ch._zod.def.when(payload)) {
				const start = payload.issues.length;
				ch._zod.check(payload);
				payload.issues[start].continue = false;
				attachSchema(payload.issues, start, inst);
				return payload;
			}
		}
		return parse(payload, ctx);
	};
}
const arraySize = (input) => Array.isArray(input) ? input.length : -1;
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
	capSize(inst, arraySize);
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
	const isObject$1 = isObject;
	const catchall = def.catchall;
	let value;
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
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
	const isObject$2 = isObject;
	const jit = !globalConfig.jitless;
	const allowsEval$1 = allowsEval;
	const fastEnabled = jit && allowsEval$1.value;
	const catchall = def.catchall;
	let value;
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

// node_modules/zod/v4/core/memoizer.js
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

// node_modules/zod/v4/locales/en.js
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

// node_modules/zod/v4/core/registries.js
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

// node_modules/zod/v4/core/api.js
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

// node_modules/zod/v4/core/to-json-schema.js
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

// node_modules/zod/v4/core/json-schema-processors.js
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

// node_modules/zod/v4/classic/errors.js
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

// node_modules/zod/v4/classic/parse.js
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

// node_modules/zod/v4/classic/schemas.js
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
function partialRecord(keyType, valueType, params) {
	return new ZodRecord({
		type: "record",
		keyType,
		valueType,
		...normalizeParams(params),
		partial: true
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

// src/shared/util/record.ts
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

// src/shared/theme/format.ts
/**
* The format of a theme family file. A file without a `schemaVersion` is version 1,
* so the first format never needs to be stamped and stays valid forever.
*/
const THEME_FORMAT_VERSION = 2;
const VERSION_MESSAGE = "Must be a positive whole number";
const themeFormatVersionSchema = number({ error: VERSION_MESSAGE }).int(VERSION_MESSAGE).positive(VERSION_MESSAGE);
/**
* Format 2 keys syntax by highlighter slot instead of TextMate scope. Scope
* rules do not map reliably onto slots, so a format 1 theme's
* `syntax.tokenColors` are dropped rather than guessed at: its app colors,
* `base` and any `tokens` it already gives still load, and its code falls back
* to the app's syntax palette.
*/
const DROP_TEXTMATE_SYNTAX = {
	from: 1,
	migrate(raw, report) {
		if (!Array.isArray(raw["themes"])) return raw;
		let dropped = false;
		const themes = raw["themes"].map((theme) => {
			if (!isRecord(theme) || !isRecord(theme["syntax"]) || !("tokenColors" in theme["syntax"])) return theme;
			dropped = true;
			const syntax = { ...theme["syntax"] };
			delete syntax["tokenColors"];
			return {
				...theme,
				syntax
			};
		});
		if (dropped) report({ kind: "dropped-syntax" });
		return {
			...raw,
			themes
		};
	}
};
/**
* One step per released format change, in memory only: a file on disk is never
* rewritten. Bumping `THEME_FORMAT_VERSION` without adding the step for the
* previous version fails the format tests.
*/
const THEME_MIGRATIONS = [DROP_TEXTMATE_SYNTAX];
/**
* Runs the steps from `version` up to `target`, each one on the previous one's
* output, and stamps the version it reached. A file already at or past
* `target` comes back untouched. A missing step is a bug in the step list, not
* in the file, so it throws. What a step reports about the file goes to `report`.
*/
function migrateThemeFamily(raw, version, steps = THEME_MIGRATIONS, target = 2, report = () => {}) {
	let current = raw;
	for (let from = version; from < target; from++) {
		const step = steps.find((candidate) => candidate.from === from);
		if (!step) throw new Error(`No theme format migration from version ${from}`);
		current = {
			...step.migrate(current, report),
			schemaVersion: from + 1
		};
	}
	return current;
}

// src/shared/theme/syntax-slots.ts
/**
* The token slots `@pierre/highlights` colors code by, in its own order. A
* theme's `syntax.tokens` is keyed by these names, as a Zed theme's
* `style.syntax` is. `background` is not a slot here: the code plate is always
* the theme's `surface-raised`.
*/
const SYNTAX_SLOTS = [
	"attribute",
	"attribute.jsx",
	"boolean",
	"comment",
	"comment.doc",
	"constant",
	"constant.builtin",
	"constructor",
	"diff.minus",
	"diff.plus",
	"embedded",
	"emphasis",
	"emphasis.strong",
	"function",
	"function.definition",
	"function.method",
	"keyword",
	"keyword.control",
	"keyword.declaration",
	"keyword.import",
	"keyword.operator",
	"label",
	"namespace",
	"number",
	"operator",
	"predictive",
	"preproc",
	"primary",
	"property",
	"property.json_key",
	"punctuation",
	"punctuation.bracket",
	"punctuation.bracket.html",
	"punctuation.bracket.jsx",
	"punctuation.delimiter",
	"punctuation.delimiter.html",
	"punctuation.delimiter.jsx",
	"punctuation.list_marker",
	"punctuation.markup",
	"punctuation.special",
	"selector",
	"selector.class",
	"selector.id",
	"string",
	"string.escape",
	"string.regex",
	"string.special",
	"string.special.symbol",
	"tag",
	"tag.doctype",
	"tag.jsx",
	"text.jsx",
	"text.literal",
	"title",
	"type",
	"type.builtin",
	"type.class",
	"variable",
	"variable.parameter",
	"variable.special",
	"enum",
	"hint",
	"keyword.jsdoc",
	"link_text",
	"link_uri",
	"selector.pseudo",
	"tag.component.jsx",
	"type.jsdoc",
	"variable.jsdoc",
	"variant",
	"foreground"
];
/**
* A slot that was renamed, by its old name. A theme file written against the
* old name keeps its colour and its user is told the name changed. Dropping a
* slot without an entry here fails the contract test, so a removal is a
* decision and not an accident.
*/
const SYNTAX_SLOT_ALIASES = {};
const SLOT_SET = new Set(SYNTAX_SLOTS);
function isSyntaxSlot(name) {
	return SLOT_SET.has(name);
}
/** Font weights the highlighter tells apart: it rounds any other to the nearest hundred. */
function isSyntaxFontWeight(weight) {
	return typeof weight === "number" && Number.isInteger(weight) && weight >= 100 && weight <= 900 && weight % 100 === 0;
}
const NORMAL_WEIGHT = 400;
/** `keyword.control` then `keyword`: the slot and each dotted parent that is itself a slot. */
function lineage(slot) {
	const chain = [];
	for (let name = slot; name !== "";) {
		if (isSyntaxSlot(name)) chain.push(name);
		const dot = name.lastIndexOf(".");
		name = dot < 0 ? "" : name.slice(0, dot);
	}
	return chain;
}
/**
* Every slot's color and font, from layers in increasing precedence. A slot
* takes each part from the topmost layer that sets it on the slot or on one of
* its dotted parents, nearest first within that layer. A layer therefore wins
* as a whole over those below it: a theme that sets `keyword` colors every
* keyword, `keyword.control` included, unless the theme sets `keyword.control`
* itself, even where the palette or base under it is more specific. Color and
* font inherit independently: `comment.doc` given only a color keeps
* `comment`'s italic. Zed's own walk drops the parent's font once a child sets
* anything, so a pasted Zed theme can differ in that one case. A color no layer
* sets is the `foreground` slot's; the first layer must set `foreground`.
*/
function resolveSyntaxTable(layers) {
	const pick = (slot, key) => {
		const chain = lineage(slot);
		for (let i = layers.length - 1; i >= 0; i--) for (const name of chain) {
			const value = layers[i]?.[name]?.[key];
			if (value !== void 0) return value;
		}
	};
	const foreground = pick("foreground", "color");
	if (foreground === void 0) throw new Error("A syntax table needs a foreground color");
	const table = {};
	for (const slot of SYNTAX_SLOTS) table[slot] = {
		color: pick(slot, "color") ?? foreground,
		italic: pick(slot, "italic") ?? false,
		weight: pick(slot, "weight") ?? NORMAL_WEIGHT
	};
	return table;
}
/**
* A layer from Zed-shaped entries: each slot a color, or
* `{ color?, font_style?, font_weight? }` with `font_style` `italic` or
* `normal` and `font_weight` a multiple of 100 from 100 to 900. Colors are normalized to hex. Anything
* it cannot take is skipped and handed to `onIssue`.
*/
function syntaxLayerFrom(entries, onIssue = () => {}) {
	const layer = {};
	for (const [slot, value] of Object.entries(entries)) {
		if (!isSyntaxSlot(slot)) {
			onIssue({
				slot,
				problem: "unknown-slot"
			});
			continue;
		}
		const style = {};
		const raw = typeof value === "string" ? { color: value } : isRecord(value) ? value : {};
		if (raw.color !== void 0) {
			const hex = typeof raw.color === "string" ? toHexColor(raw.color) : null;
			if (hex === null) onIssue({
				slot,
				problem: "invalid-color"
			});
			else style.color = hex;
		}
		if (raw.font_style !== void 0) {
			if (raw.font_style === "italic" || raw.font_style === "normal") style.italic = raw.font_style === "italic";
			else onIssue({
				slot,
				problem: "invalid-font"
			});
		}
		if (raw.font_weight !== void 0) {
			if (isSyntaxFontWeight(raw.font_weight)) style.weight = raw.font_weight;
			else onIssue({
				slot,
				problem: "invalid-font"
			});
		}
		if (Object.keys(style).length > 0) layer[slot] = style;
	}
	return layer;
}
/** A bundled theme's syntax as a layer, foreground from its editor text as the highlighter reads it. */
function syntaxLayerFromBase(style) {
	const foreground = [
		style["editor.foreground"],
		style.text,
		style.foreground
	].find((value) => typeof value === "string");
	return syntaxLayerFrom({
		...style.syntax,
		...foreground !== void 0 && { foreground }
	});
}

// src/shared/theme/schema.ts
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
const colorText = string().max(128);
const terminalSchema = strictObject({
	background: colorText.optional(),
	foreground: colorText.optional(),
	cursor: colorText.optional(),
	selection: colorText.optional(),
	ansi: array(colorText).length(16).optional()
});
const FONT_WEIGHT_MESSAGE = "Must be a multiple of 100 from 100 to 900";
/** A slot's color alone, or with its font, as a Zed theme's `style.syntax` writes it. */
const syntaxTokenSchema = union([colorText, strictObject({
	color: colorText.optional(),
	font_style: _enum(["italic", "normal"]).optional(),
	font_weight: number().int(FONT_WEIGHT_MESSAGE).min(100, FONT_WEIGHT_MESSAGE).max(900, FONT_WEIGHT_MESSAGE).multipleOf(100, FONT_WEIGHT_MESSAGE).optional()
})]);
const syntaxSchema = strictObject({
	base: string().max(64).regex(/^[a-z0-9-]+$/).optional(),
	tokens: partialRecord(_enum(SYNTAX_SLOTS), syntaxTokenSchema).optional()
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

// src/shared/theme/tokens.ts
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
	"field",
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
	"control-thumb",
	"control-track",
	"scrollbar-thumb",
	"scrollbar-thumb-hover",
	"scrollbar-track"
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
	if (token.startsWith("scrollbar-")) return "ink";
	if (token === "selected-bg" || token === "selected-border" || token === "focus-ring") return "brand";
	return null;
}

// src/shared/theme/resolve.ts
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
const SYNTAX_ISSUE_WORDS = {
	"invalid-color": "an invalid color",
	"invalid-font": "an invalid font"
};
function resolveSyntax(syntax, warnings) {
	if (!syntax) return void 0;
	const out = {};
	if (syntax.base !== void 0) out.base = syntax.base;
	if (syntax.tokens) {
		const tokens = syntaxLayerFrom(syntax.tokens, ({ slot, problem }) => {
			if (problem === "unknown-slot") return;
			warnings.push(`syntax.tokens.${slot} has ${SYNTAX_ISSUE_WORDS[problem]} and was ignored`);
		});
		if (Object.keys(tokens).length > 0) out.tokens = tokens;
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
* A theme with its `syntax.tokens` keys written under an old slot name renamed
* to the current one, before the schema would drop them as unknown. A file
* that also sets the current name keeps that one.
*/
function renameSyntaxSlots(rawTheme, aliases) {
	const renamed = [];
	if (!isRecord(rawTheme)) return {
		theme: rawTheme,
		renamed
	};
	const syntax = rawTheme["syntax"];
	const tokens = isRecord(syntax) ? syntax["tokens"] : void 0;
	if (!isRecord(syntax) || !isRecord(tokens)) return {
		theme: rawTheme,
		renamed
	};
	const entries = [];
	for (const [written, value] of Object.entries(tokens)) {
		const alias = Object.hasOwn(aliases, written) ? aliases[written] : void 0;
		if (alias === void 0) {
			entries.push([written, value]);
			continue;
		}
		if (alias in tokens) continue;
		renamed.push({
			from: `syntax.tokens.${written}`,
			to: `syntax.tokens.${alias}`
		});
		entries.push([alias, value]);
	}
	if (renamed.length === 0 && entries.length === Object.keys(tokens).length) return {
		theme: rawTheme,
		renamed
	};
	return {
		theme: {
			...rawTheme,
			syntax: {
				...syntax,
				tokens: Object.fromEntries(entries)
			}
		},
		renamed
	};
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
function parseThemeFamily(json, slotAliases = SYNTAX_SLOT_ALIASES) {
	let raw = json;
	let newer = false;
	const upgradeNotices = [];
	if (isRecord(json)) {
		const written = json["schemaVersion"];
		const version = themeFormatVersionSchema.safeParse(written === void 0 ? 1 : written);
		if (!version.success) return {
			errors: version.error.issues.map((issue) => ({ message: lineFor(["schemaVersion"], issue.message) })),
			notices: []
		};
		newer = version.data > 2;
		if (version.data < 2) try {
			raw = migrateThemeFamily(json, version.data, void 0, void 0, (notice) => upgradeNotices.push(notice));
		} catch {
			return {
				errors: [{ message: "Unable to upgrade this file to the current format" }],
				notices: []
			};
		}
	}
	const notices = newer ? [{ kind: "newer-version" }] : [...upgradeNotices];
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
		const { theme: renamedTheme, renamed } = renameSyntaxSlots(rawTheme, slotAliases);
		for (const { from, to } of renamed) notices.push({
			kind: "renamed-token",
			from,
			to
		});
		const parsed = parseDroppingUnknownKeys(themeDefinitionSchema, renamedTheme);
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

// src/shared/theme/terminal-ansi.ts
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

// src/shared/theme/validation.ts
/** The owner of an id taken by a theme that ships with Kepler. */
const BUILT_IN_THEME_OWNER = "built-in";

// scripts/design/color.mjs
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
const SHORT_HEX_RE = /^#[0-9a-f]{3,4}$/i;
const NUM = String.raw`(\d*\.?\d+)`;
const OKLCH_RE = new RegExp(String.raw`^oklch\(\s*${NUM}\s+${NUM}\s+${NUM}(?:\s*\/\s*${NUM})?\s*\)$`, "i");
const P3_RE = new RegExp(String.raw`^color\(\s*display-p3\s+${NUM}\s+${NUM}\s+${NUM}(?:\s*\/\s*${NUM})?\s*\)$`, "i");
function oklabLinear(L, a, b) {
	const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
	const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
	const s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
		-.0041960863 * l - .7034186147 * m + 1.707614701 * s
	];
}
/**
* `color(display-p3 r g b)` to sRGB 0..255, reducing out-of-gamut chroma at a
* fixed lightness and hue step for step as the app's color parser does, so a
* vibrant base reads the same here as in the app.
*/
function displayP3ToRgb(r, g, b) {
	const [lr, lg, lb] = [
		r,
		g,
		b
	].map((v) => srgbToLinear(clamp01(v)));
	const sr = 1.2249401763 * lr - .2249401763 * lg;
	const sg = -.0420569547 * lr + 1.0420569547 * lg;
	const sb = -.0196375546 * lr - .0786360456 * lg + 1.0982736001 * lb;
	const l = Math.cbrt(.4122214708 * sr + .5363325363 * sg + .0514459929 * sb);
	const m = Math.cbrt(.2119034982 * sr + .6806995451 * sg + .1073969566 * sb);
	const s = Math.cbrt(.0883024619 * sr + .2817188376 * sg + .6299787005 * sb);
	const L = clamp01(.2104542553 * l + .793617785 * m - .0040720468 * s);
	const A = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
	const B = .0259040371 * l + .7827717662 * m - .808675766 * s;
	let C = Math.hypot(A, B);
	const achromatic = C < 1e-4;
	const hue = achromatic ? 0 : Math.atan2(B, A);
	if (achromatic) C = 0;
	const at = (c) => oklabLinear(L, c * Math.cos(hue), c * Math.sin(hue));
	const inGamut = (v) => v.every((x) => x >= -1e-6 && x <= 1 + 1e-6);
	let rgb = at(C);
	if (!inGamut(rgb)) {
		let lo = 0;
		let hi = C;
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2;
			if (inGamut(at(mid))) lo = mid;
			else hi = mid;
		}
		rgb = at(lo);
	}
	return rgb.map((v) => Math.round(clamp01(linearToSrgb(clamp01(v))) * 255));
}
/**
* Parse a data-theme literal (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `oklch(L C H)`,
* `oklch(L C H / a)`, `color(display-p3 r g b[ / a])`) to `{ rgb, alpha }`, or null for any other form. Mirrors
* `parseColor` in `src/shared/theme/color.ts`, which Node cannot import because
* its sibling imports are extensionless.
*/
function parseColorLiteral(value) {
	const hex = SHORT_HEX_RE.test(value) ? `#${value.slice(1).replace(/./g, "$&$&")}` : value;
	const hexMatch = HEX_RE.exec(hex);
	if (hexMatch) return {
		rgb: [
			0,
			2,
			4
		].map((i) => parseInt(hexMatch[1].slice(i, i + 2), 16)),
		alpha: hexMatch[2] ? parseInt(hexMatch[2], 16) / 255 : 1
	};
	const p3 = P3_RE.exec(value.trim());
	if (p3) return {
		rgb: displayP3ToRgb(Number(p3[1]), Number(p3[2]), Number(p3[3])),
		alpha: p3[4] === void 0 ? 1 : clamp01(Number(p3[4]))
	};
	const m = OKLCH_RE.exec(value);
	if (!m) return null;
	return {
		rgb: oklchToRgb(Number(m[1]), Number(m[2]), Number(m[3])),
		alpha: m[4] === void 0 ? 1 : Number(m[4])
	};
}

// scripts/design/contrast-core.mjs
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
const EDITOR_SELECTION_ALPHA = .18;
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
	if (token.startsWith("scrollbar-")) return "ink";
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
* through `onInvalid`, so a caller decides whether that is fatal. `baseSyntax`
* maps the highlights theme a theme names as its `syntax.base` to that theme's
* syntax layer, or to undefined for a name it does not know.
*/
function dataThemes(families, palettes, keplerSyntax, onInvalid = () => {}, baseSyntax = () => void 0) {
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
		const base = def.syntax?.base === void 0 ? void 0 : baseSyntax(def.syntax.base);
		const kepler = keplerSyntax[polarity];
		themes.push({
			theme: def.id,
			tokens,
			polarity,
			terminal: def.terminal,
			syntax: def.syntax,
			keplerSyntax: base === void 0 ? kepler : { foreground: kepler.foreground },
			baseSyntax: base
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
/** A lift token's share (`--control-thumb-lift` or `--control-thumb-lift-overlay`) as a 0..1 fraction; a theme without one lifts nothing. */
function thumbLift(t, key) {
	const raw = String(t[key] ?? "").trim();
	const pct = Number.parseFloat(raw);
	return raw.endsWith("%") && Number.isFinite(pct) ? pct / 100 : 0;
}
/** The selected segment as drawn: `--control-thumb` with the named lift's share of `--ink` mixed in. */
function liftedThumb(t, key) {
	const thumb = resolveToken(t, t["--control-thumb"]).rgb;
	const ink = resolveToken(t, t["--ink"]).rgb;
	return composite(ink, thumb, thumbLift(t, key));
}
/**
* Informational rows, never gated: how far each theme's selected segment stands
* off its recessed track. Two tracks exist, so the ratio is the lower of the
* thumb lifted by `--control-thumb-lift` against the field fill and the thumb
* lifted by `--control-thumb-lift-overlay` against the overlay shade over
* `--surface-overlay`. It is a shape cue beside the shadow and the
* brand label, not a WCAG floor.
*/
function thumbSeparation(themes) {
	return themes.map(({ theme, tokens: t }) => {
		try {
			const field = resolveToken(t, t["--field"]).rgb;
			const shade = resolveToken(t, t["--control-track"]);
			const overlay = resolveToken(t, t["--surface-overlay"]).rgb;
			return {
				theme,
				ratio: Math.min(contrast(liftedThumb(t, "--control-thumb-lift"), field), contrast(liftedThumb(t, "--control-thumb-lift-overlay"), composite(shade.rgb, overlay, shade.alpha)))
			};
		} catch {
			return {
				theme,
				ratio: NaN
			};
		}
	});
}
function checkTheme({ theme, tokens: t, polarity, terminal, syntax, keplerSyntax, baseSyntax, builtIn }, check) {
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
	check(theme, "--scrollbar-thumb at rest", Math.min(...surfaces.slice(1, 3).map((s) => {
		const track = resolveToken(t, t["--scrollbar-track"]);
		const trackOnSurface = composite(track.rgb, s.rgb, track.alpha);
		const thumb = resolveToken(t, t["--scrollbar-thumb"]);
		return contrast(composite(thumb.rgb, trackOnSurface, thumb.alpha), trackOnSurface);
	})), 3);
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
	const segTrack = resolveToken(t, t["--control-track"]);
	const fieldFill = resolveToken(t, t["--field"]).rgb;
	const overlayRgb = resolveToken(t, t["--surface-overlay"]).rgb;
	const shadeTrack = composite(segTrack.rgb, overlayRgb, segTrack.alpha);
	const thumb = liftedThumb(t, "--control-thumb-lift");
	const popoverThumb = liftedThumb(t, "--control-thumb-lift-overlay");
	check(theme, "--brand on --control-thumb", contrast(composite(brandInk.rgb, thumb, brandInk.alpha), thumb), TEXT_MIN);
	check(theme, "--brand on the popover thumb", contrast(composite(brandInk.rgb, popoverThumb, brandInk.alpha), popoverThumb), TEXT_MIN);
	const mutedInk = resolveToken(t, t["--content-muted"]);
	check(theme, "--content-muted on the segmented track", Math.min(...[fieldFill, shadeTrack].map((bg) => contrast(composite(mutedInk.rgb, bg, mutedInk.alpha), bg))), TEXT_MIN);
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
	const badgeInk = resolveToken(t, t["--content"]);
	const barFill = resolveToken(t, t["--fill-muted"]);
	for (const account of Object.keys(t).filter((k) => /^--account-[a-z]+$/.test(k))) {
		const wash = resolveToken(t, t[account]);
		const onWash = Math.min(...surfaces.map((s) => {
			const bar = composite(barFill.rgb, s.rgb, barFill.alpha);
			const tint = composite(wash.rgb, bar, ACCENT_TINT_ALPHA);
			return contrast(composite(badgeInk.rgb, tint, badgeInk.alpha), tint);
		}));
		check(theme, `--content on the ${account} badge's 15% wash`, onWash, TEXT_MIN);
	}
	check(theme, "--content-muted on the status bar fill", Math.min(...surfaces.map((s) => {
		const bar = composite(barFill.rgb, s.rgb, barFill.alpha);
		return worstOnSurfaces("--content-muted", [{
			name: s.name,
			rgb: bar
		}]);
	})), TEXT_MIN);
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
	const syntaxInks = syntaxColors(keplerSyntax, baseSyntax, syntax?.tokens);
	const codeInk = syntaxInks.foreground ? colorOf(t, syntaxInks.foreground.value) : null;
	const subtleInk = resolveToken(t, t["--content-subtle"]);
	const mutedSepInk = resolveToken(t, t["--content-muted"]);
	const plateInk = resolveToken(t, t["--ink"]).rgb;
	const onBg = (ink, bg) => contrast(composite(ink.rgb, bg, ink.alpha), bg);
	const selection = resolveToken(t, t["--code-selection"]);
	const selectedOver = (under) => composite(selection.rgb, under, selection.alpha * EDITOR_SELECTION_ALPHA);
	const band = composite(plateInk, codePlate, SEPARATOR_BAND_ALPHA);
	const cell = composite(plateInk, codePlate, SEPARATOR_CELL_ALPHA);
	const hoverFill = resolveToken(t, t["--fill-subtle"]);
	const hovered = (under) => composite(plateInk, composite(hoverFill.rgb, codePlate, hoverFill.alpha), under);
	check(theme, "diff line number on the code plate", onBg(subtleInk, codePlate), TEXT_MIN);
	check(theme, "diff separator label on its band", onBg(subtleInk, band), TEXT_MIN);
	check(theme, "diff separator chevron on its cell", onBg(subtleInk, cell), TEXT_MIN);
	check(theme, "diff separator label on its hovered band", onBg(mutedSepInk, hovered(SEPARATOR_BAND_ALPHA)), TEXT_MIN);
	check(theme, "diff separator chevron on its hovered cell", onBg(mutedSepInk, hovered(SEPARATOR_CELL_ALPHA)), TEXT_MIN);
	const selectedNumberCell = mixLab(selection.rgb, codePlate, SELECTED_NUMBER_SHARE[polarity]);
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
			if (builtIn) {
				const selectedRow = selectedOver(bg);
				check(theme, `editor selection on the ${row} row under the default code text`, Math.min(onBg(codeInk, selectedRow), onBg(codeInk, composite(fill.rgb, selectedRow, fill.alpha)), onBg(codeInk, selectedOver(emphasis))), TEXT_MIN);
			}
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
	const selectedPlate = builtIn ? selectedOver(codePlate) : null;
	const syntaxNames = {
		own: "syntax",
		kepler: "kepler syntax",
		base: "base syntax"
	};
	for (const owner of [
		"own",
		"kepler",
		"base"
	]) {
		/** @type {Map<string, string[]>} each color, and the slots it is the final color of */
		const slotsByColor = /* @__PURE__ */ new Map();
		for (const [slot, ink] of Object.entries(syntaxInks)) {
			if (ink.owner !== owner) continue;
			slotsByColor.set(ink.value, [...slotsByColor.get(ink.value) ?? [], slot]);
		}
		checkSyntax(theme, t, slotsByColor, surfaces, selectedPlate, check, syntaxNames[owner]);
	}
}
/** A slot's color as a file writes it (a string, or an object's `color`) or as a resolved layer holds it. */
function slotColor(value) {
	if (typeof value === "string") return value;
	return typeof value?.color === "string" ? value.color : void 0;
}
/**
* Slots no code view draws: the editor's inlay-hint and edit-prediction text.
* Highlights lists them among its token names, but no grammar emits them and
* the app paints its own diagnostic hint with `--syntax-editor-hint`, so a
* color they hold is never read on a plate.
*/
const EDITOR_ONLY_SLOTS = /* @__PURE__ */ new Set(["hint", "predictive"]);
/**
* The color of every slot a layer colors, as the renderer draws it, and whose
* layer that is. This is `resolveSyntaxTable` (src/shared/theme/syntax-slots.ts)
* for color alone, which plain JS cannot import: layers are searched from the
* top, and within a layer the slot then each dotted parent, so a layer that
* colors `keyword` hides a lower layer's `keyword.control`. A slot no layer
* names takes a dotted parent's color or `foreground`'s, which some layer
* names, so these are every color the resolved table holds; `foreground` among
* them is the color plain code is drawn in. Under a highlights `base` the
* Kepler layer is only its foreground, and the base's colors count like the
* theme's own.
*/
function syntaxColors(keplerLayer, baseLayer, ownLayer) {
	const layers = [
		["kepler", keplerLayer],
		["base", baseLayer],
		["own", ownLayer]
	];
	const lineage = (slot) => {
		const chain = [];
		for (let name = slot; name !== "";) {
			chain.push(name);
			const dot = name.lastIndexOf(".");
			name = dot < 0 ? "" : name.slice(0, dot);
		}
		return chain;
	};
	const inks = {};
	for (const [, layer] of layers) for (const slot of Object.keys(layer ?? {})) {
		if (EDITOR_ONLY_SLOTS.has(slot) || slotColor(layer[slot]) === void 0) continue;
		const chain = lineage(slot);
		for (let i = layers.length - 1; i >= 0 && inks[slot] === void 0; i--) {
			const [owner, above] = layers[i];
			for (const name of chain) {
				const color = slotColor(above?.[name]);
				if (color !== void 0) {
					inks[slot] = {
						owner,
						value: color
					};
					break;
				}
			}
		}
	}
	return inks;
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
const SLOTS_NAMED = 3;
function slotList(slots) {
	const shown = slots.slice(0, SLOTS_NAMED).join(", ");
	return slots.length > SLOTS_NAMED ? `${shown} and ${slots.length - SLOTS_NAMED} more` : shown;
}
/** 1.4.3 — code is read on the raised, sunken and canvas surfaces (code plate, diffs, editor wells). */
function checkSyntax(theme, t, slotsByColor, surfaces, selectedPlate, check, name) {
	const plates = surfaces.filter((s) => [
		"--surface-raised",
		"--surface-sunken",
		"--surface-canvas"
	].includes(s.name));
	for (const [value, slots] of slotsByColor) {
		const c = colorOf(t, value);
		if (!c) {
			unreadable(theme, name, value, check);
			continue;
		}
		const ratio = Math.min(...plates.map((p) => contrast(composite(c.rgb, p.rgb, c.alpha), p.rgb)));
		const label = name === "base syntax" ? `${name} ${value} (${slotList(slots)})` : `${name} ${value}`;
		check(theme, `${label} on code plates`, ratio, TEXT_MIN);
		if (selectedPlate) check(theme, `${label} on the editor selection`, contrast(composite(c.rgb, selectedPlate, c.alpha), selectedPlate), TEXT_MIN);
	}
}

// node_modules/@pierre/highlights/dist/token-types.js
const tokenTypes = [
	"none",
	"attribute",
	"attribute.jsx",
	"boolean",
	"comment",
	"comment.doc",
	"constant",
	"constant.builtin",
	"constructor",
	"diff.minus",
	"diff.plus",
	"embedded",
	"emphasis",
	"emphasis.strong",
	"function",
	"function.definition",
	"function.method",
	"keyword",
	"keyword.control",
	"keyword.declaration",
	"keyword.import",
	"keyword.operator",
	"label",
	"namespace",
	"number",
	"operator",
	"predictive",
	"preproc",
	"primary",
	"property",
	"property.json_key",
	"punctuation",
	"punctuation.bracket",
	"punctuation.bracket.html",
	"punctuation.bracket.jsx",
	"punctuation.delimiter",
	"punctuation.delimiter.html",
	"punctuation.delimiter.jsx",
	"punctuation.list_marker",
	"punctuation.markup",
	"punctuation.special",
	"selector",
	"selector.class",
	"selector.id",
	"string",
	"string.escape",
	"string.regex",
	"string.special",
	"string.special.symbol",
	"tag",
	"tag.doctype",
	"tag.jsx",
	"text.jsx",
	"text.literal",
	"title",
	"type",
	"type.builtin",
	"type.class",
	"variable",
	"variable.parameter",
	"variable.special",
	"enum",
	"hint",
	"keyword.jsdoc",
	"link_text",
	"link_uri",
	"selector.pseudo",
	"tag.component.jsx",
	"type.jsdoc",
	"variable.jsdoc",
	"variant",
	"background",
	"foreground"
];

// node_modules/@pierre/highlights/dist/themes.js
var themes_exports = /* @__PURE__ */ __exportAll({
	andromeeda: () => andromeeda,
	auroraX: () => auroraX,
	ayuDark: () => ayuDark,
	ayuLight: () => ayuLight,
	ayuMirage: () => ayuMirage,
	catppuccinFrappe: () => catppuccinFrappe,
	catppuccinLatte: () => catppuccinLatte,
	catppuccinMacchiato: () => catppuccinMacchiato,
	catppuccinMocha: () => catppuccinMocha,
	cssVariables: () => cssVariables,
	darkPlus: () => darkPlus,
	dracula: () => dracula,
	draculaSoft: () => draculaSoft,
	everforestDark: () => everforestDark,
	everforestLight: () => everforestLight,
	githubDark: () => githubDark,
	githubDarkDefault: () => githubDarkDefault,
	githubDarkDimmed: () => githubDarkDimmed,
	githubDarkHighContrast: () => githubDarkHighContrast,
	githubLight: () => githubLight,
	githubLightDefault: () => githubLightDefault,
	githubLightHighContrast: () => githubLightHighContrast,
	gruvboxDarkHard: () => gruvboxDarkHard,
	gruvboxDarkMedium: () => gruvboxDarkMedium,
	gruvboxDarkSoft: () => gruvboxDarkSoft,
	gruvboxLightHard: () => gruvboxLightHard,
	gruvboxLightMedium: () => gruvboxLightMedium,
	gruvboxLightSoft: () => gruvboxLightSoft,
	horizon: () => horizon,
	horizonBright: () => horizonBright,
	houston: () => houston,
	kanagawaDragon: () => kanagawaDragon,
	kanagawaLotus: () => kanagawaLotus,
	kanagawaWave: () => kanagawaWave,
	laserwave: () => laserwave,
	lightPlus: () => lightPlus,
	materialTheme: () => materialTheme,
	materialThemeDarker: () => materialThemeDarker,
	materialThemeLighter: () => materialThemeLighter,
	materialThemeOcean: () => materialThemeOcean,
	materialThemePalenight: () => materialThemePalenight,
	minDark: () => minDark,
	minLight: () => minLight,
	monokai: () => monokai,
	nightOwl: () => nightOwl,
	nightOwlLight: () => nightOwlLight,
	nord: () => nord,
	oneDarkPro: () => oneDarkPro,
	oneLight: () => oneLight,
	pierreDark: () => pierreDark,
	pierreDarkProtanopiaDeuteranopia: () => pierreDarkProtanopiaDeuteranopia,
	pierreDarkSoft: () => pierreDarkSoft,
	pierreDarkTritanopia: () => pierreDarkTritanopia,
	pierreDarkVibrant: () => pierreDarkVibrant,
	pierreLight: () => pierreLight,
	pierreLightProtanopiaDeuteranopia: () => pierreLightProtanopiaDeuteranopia,
	pierreLightSoft: () => pierreLightSoft,
	pierreLightTritanopia: () => pierreLightTritanopia,
	pierreLightVibrant: () => pierreLightVibrant,
	plastic: () => plastic,
	poimandres: () => poimandres,
	red: () => red,
	rosePine: () => rosePine,
	rosePineDawn: () => rosePineDawn,
	rosePineMoon: () => rosePineMoon,
	slackDark: () => slackDark,
	slackOchin: () => slackOchin,
	snazzyLight: () => snazzyLight,
	solarizedDark: () => solarizedDark,
	solarizedLight: () => solarizedLight,
	synthwave84: () => synthwave84,
	toCSS: () => toCSS,
	tokyoNight: () => tokyoNight,
	vesper: () => vesper,
	vitesseBlack: () => vitesseBlack,
	vitesseDark: () => vitesseDark,
	vitesseLight: () => vitesseLight
});
const defaultCssVariablePrefix = "--hls-";
new TextEncoder();
const colorReg = /^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i;
const displayP3Reg = /^color\(display-p3\s+[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s+[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s+[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?\s*\)$/i;
/**
* Accept hex and numeric Display P3 colors that cannot escape a CSS declaration.
* Named colors, variables, and arbitrary CSS fragments are rejected.
*/
function isThemeColor(value) {
	return typeof value === "string" && (colorReg.test(value.trim()) || displayP3Reg.test(value.trim()));
}
/** A theme's default text color: `editor.foreground`, `text`, then `foreground`. */
function themeForeground(style) {
	return style["editor.foreground"] ?? style.text ?? style.foreground;
}
/** A theme's editor background: `editor.background`, then `background`. */
function themeBackground(style) {
	return style["editor.background"] ?? style.background;
}
/** Keep the nearest scope's font settings while finding an inherited color. */
function resolveThemeSyntax(syntax, name) {
	let settings;
	for (let k = name; k !== "";) {
		const v = syntax[k];
		if (typeof v === "string") return {
			...settings,
			color: v
		};
		if (v != null && typeof v === "object") {
			settings ??= v;
			if (v.color != null) return {
				...settings,
				color: v.color
			};
		}
		const dot = k.lastIndexOf(".");
		k = dot < 0 ? "" : k.slice(0, dot);
	}
	return settings;
}
var andromeeda_default = {
	name: "Andromeeda",
	appearance: "dark",
	style: {
		"background": "#23262E",
		"text": "#e1dde4",
		"editor.background": "#23262E",
		"editor.foreground": "#D5CED9",
		"editor.active_line.background": "#2e323d",
		"editor.document_highlight.bracket_background": "#4F5666",
		"search.match_background": "#f39d1256",
		"players": [
			{
				"cursor": "#D5CED9",
				"background": "#3D4352",
				"selection": "#3D4352"
			},
			{
				"cursor": "#FFB8B8",
				"background": "#2F3646",
				"selection": "#4A3A4A"
			},
			{
				"cursor": "#A5FFD6",
				"background": "#3A424F",
				"selection": "#2D4A4A"
			},
			{
				"cursor": "#FFD6A5",
				"background": "#353D4A",
				"selection": "#4A3D2D"
			},
			{
				"cursor": "#C6B8FF",
				"background": "#2D3542",
				"selection": "#3D2D4A"
			}
		],
		"error": "#FC644D",
		"warning": "#FF9F2E",
		"info": "#969696ff",
		"hint": "#969696ff",
		"terminal.ansi.green": "#96E072",
		"terminal.ansi.red": "#ee5d43",
		"terminal.ansi.blue": "#7cb7ff",
		"syntax": {
			"attribute": { "color": "#FFE66D" },
			"comment": { "color": "#81898f" },
			"comment.doc": { "color": "#A0A1A7cc" },
			"comment.documentation": { "color": "#A0A1A7cc" },
			"diff.plus": { "color": "#9BC53D40" },
			"diff.minus": { "color": "#FC644D40" },
			"constant": { "color": "#74c7ec" },
			"constant.macro": { "color": "#c74ded" },
			"constant.builtin": { "color": "#ee7843" },
			"constructor": { "color": "#f92672" },
			"emphasis": { "color": "#c74ded" },
			"emphasis.strong": { "color": "#f39c12" },
			"function": { "color": "#FFE66D" },
			"include": { "color": "#c74ded" },
			"keyword": { "color": "#c74ded" },
			"keyword.modifier": { "color": "#c74ded" },
			"keyword.type": { "color": "#c74ded" },
			"keyword.coroutine": { "color": "#c74ded" },
			"keyword.function": { "color": "#c74ded" },
			"keyword.operator": { "color": "#c74ded" },
			"keyword.import": { "color": "#c74ded" },
			"keyword.repeat": { "color": "#c74ded" },
			"keyword.return": { "color": "#c74ded" },
			"keyword.debug": { "color": "#c74ded" },
			"keyword.exception": { "color": "#c74ded" },
			"keyword.conditional": { "color": "#c74ded" },
			"keyword.conditional.ternary": { "color": "#ee5d43" },
			"repeat": { "color": "#c74ded" },
			"conditional": { "color": "#c74ded" },
			"exception": { "color": "#ee5d43" },
			"module": { "color": "#FFE66D" },
			"field": { "color": "#00e8c6" },
			"variable.member": { "color": "#00e8c6" },
			"property": { "color": "#00e8c6" },
			"punctuation": { "color": "#D5CED9" },
			"punctuation.bracket": { "color": "#D5CED9" },
			"punctuation.delimiter": { "color": "#D5CED9" },
			"punctuation.special": { "color": "#D5CED9" },
			"punctuation.list_marker": { "color": "#FFE66D" },
			"number": { "color": "#f39c12" },
			"operator": { "color": "#ee5d43" },
			"boolean": { "color": "#f92672" },
			"string": { "color": "#96E072" },
			"string.escape": { "color": "#96E072" },
			"string.regex": { "color": "#7cb7ff" },
			"regex": { "color": "#7cb7ff" },
			"string.special": { "color": "#7cb7ff" },
			"string.special.symbol": { "color": "#96E072" },
			"string.special.url": { "color": "#96E072" },
			"tag": { "color": "#f92672" },
			"tag.delimiter": { "color": "#D5CED9" },
			"tag.attribute": { "color": "#FFE66D" },
			"tag.punctuation.bracket": { "color": "#D5CED9" },
			"tag.punctuation.special": { "color": "#D5CED9" },
			"tag.punctuation.delimiter": { "color": "#D5CED9" },
			"text.literal": { "color": "#96E072" },
			"text.title": { "color": "#fe00aa" },
			"title": {
				"color": "#fe00aa",
				"font_weight": 400
			},
			"link_text": { "color": "#ee5d43" },
			"link_uri": { "color": "#c74ded" },
			"namespace": { "color": "#FFE66D" },
			"type": { "color": "#FFE66D" },
			"type.builtin": { "color": "#c74ded" },
			"type.definition": { "color": "#FFE66D" },
			"type.interface": { "color": "#FFE66D" },
			"type.super": { "color": "#FFE66D" },
			"variable": { "color": "#00e8c6" },
			"variable.special": { "color": "#00e8c6" },
			"embedded": { "color": "#D5CED9" },
			"label": { "color": "#00e8c6" },
			"predictive": { "color": "#81898f" },
			"preproc": { "color": "#c74ded" },
			"primary": { "color": "#D5CED9" },
			"selector": { "color": "#F92672" },
			"enum": { "color": "#FFE66D" },
			"hint": { "color": "#969696ff" },
			"variant": { "color": "#00E8C6" },
			"selector.class": { "color": "#FFE66D" },
			"selector.id": { "color": "#EE5D43" },
			"selector.pseudo": { "color": "#FFE66D" }
		}
	}
};
var aurora_x_default = {
	name: "Aurora X",
	appearance: "dark",
	style: {
		"background": "#131318",
		"text": "#ebece6",
		"editor.background": "#131318",
		"editor.foreground": "#ebece6",
		"editor.active_line.background": "#1e1e2640",
		"search.match_background": "#f0fb8c40",
		"players": [
			{
				"cursor": "#49baff",
				"background": "#49baff",
				"selection": "#49baff30"
			},
			{
				"cursor": "#50fb7b",
				"background": "#50fb7b",
				"selection": "#50fb7b30"
			},
			{
				"cursor": "#fc4cb4",
				"background": "#fc4cb4",
				"selection": "#fc4cb430"
			},
			{
				"cursor": "#f0fb8c",
				"background": "#f0fb8c",
				"selection": "#f0fb8c30"
			},
			{
				"cursor": "#8be9fd",
				"background": "#8be9fd",
				"selection": "#8be9fd30"
			},
			{
				"cursor": "#fc4346",
				"background": "#fc4346",
				"selection": "#fc434630"
			}
		],
		"error": "#fc4346",
		"warning": "#f0fb8c",
		"info": "#49baff",
		"hint": "#8be9fd",
		"created": "#64d389fd",
		"deleted": "#dd5074",
		"modified": "#c778db",
		"terminal.ansi.green": "#63eb90",
		"terminal.ansi.red": "#dd5073",
		"syntax": {
			"attribute": { "color": "#50fb7b" },
			"boolean": { "color": "#fc4cb4" },
			"comment": {
				"color": "#6a6a72",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#7a7a82",
				"font_style": "italic"
			},
			"constant": { "color": "#fc4cb4" },
			"constructor": { "color": "#8be9fd" },
			"emphasis": {
				"color": "#f0fb8c",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#f0fb8c",
				"font_weight": 700
			},
			"enum": { "color": "#8be9fd" },
			"function": { "color": "#50fb7b" },
			"function.builtin": { "color": "#50fb7b" },
			"function.call": { "color": "#50fb7b" },
			"function.definition": { "color": "#50fb7b" },
			"function.method": { "color": "#50fb7b" },
			"function.special.definition": { "color": "#50fb7b" },
			"hint": {
				"color": "#6a6a72",
				"font_style": "italic"
			},
			"keyword": { "color": "#49baff" },
			"label": { "color": "#49baff" },
			"link_text": { "color": "#49baff" },
			"link_uri": { "color": "#8be9fd" },
			"namespace": { "color": "#ffb86c" },
			"module": { "color": "#ffb86c" },
			"identifier": { "color": "#ffb86c" },
			"include": { "color": "#ffb86c" },
			"number": { "color": "#fc4cb4" },
			"operator": { "color": "#ebece6" },
			"parameter": {
				"color": "#8be9fd",
				"font_style": "italic"
			},
			"predictive": {
				"color": "#5a5a64",
				"font_style": "italic"
			},
			"preproc": { "color": "#49baff" },
			"primary": { "color": "#ebece6" },
			"property": { "color": "#8be9fd" },
			"punctuation": { "color": "#9a9a9e" },
			"punctuation.bracket": { "color": "#9a9a9e" },
			"punctuation.delimiter": { "color": "#9a9a9e" },
			"punctuation.list_marker": { "color": "#fc4346" },
			"punctuation.special": { "color": "#fc4cb4" },
			"string": { "color": "#f0fb8c" },
			"string.escape": { "color": "#fc4cb4" },
			"string.regex": { "color": "#fc4346" },
			"string.special": { "color": "#fc4cb4" },
			"string.special.symbol": { "color": "#8be9fd" },
			"tag": { "color": "#fc4346" },
			"text.literal": { "color": "#f0fb8c" },
			"title": {
				"color": "#50fb7b",
				"font_weight": 700
			},
			"type": { "color": "#8be9fd" },
			"type.builtin": { "color": "#8be9fd" },
			"type.class": { "color": "#8be9fd" },
			"type.interface": {
				"color": "#8be9fd",
				"font_style": "italic"
			},
			"variable": { "color": "#ffb86c" },
			"variable.builtin": {
				"color": "#fc4cb4",
				"font_style": "italic"
			},
			"variable.member": { "color": "#8be9fd" },
			"variable.parameter": {
				"color": "#8be9fd",
				"font_style": "italic"
			},
			"variable.special": { "color": "#fc4cb4" },
			"variant": { "color": "#8be9fd" },
			"embedded": { "color": "#ebece6" },
			"selector": { "color": "#fc4346" },
			"diff.minus": { "color": "#dd5074" },
			"diff.plus": { "color": "#64d389fd" }
		}
	}
};
var ayu_dark_default = {
	name: "Ayu Dark",
	appearance: "dark",
	style: {
		"background": "#313337ff",
		"text": "#bfbdb6ff",
		"editor.background": "#0d1016ff",
		"editor.foreground": "#bfbdb6ff",
		"editor.active_line.background": "#1f2127bf",
		"search.match_background": "#5ac2fe66",
		"players": [
			{
				"cursor": "#5ac1feff",
				"background": "#5ac1feff",
				"selection": "#5ac1fe3d"
			},
			{
				"cursor": "#39bae5ff",
				"background": "#39bae5ff",
				"selection": "#39bae53d"
			},
			{
				"cursor": "#fe8f40ff",
				"background": "#fe8f40ff",
				"selection": "#fe8f403d"
			},
			{
				"cursor": "#d2a6feff",
				"background": "#d2a6feff",
				"selection": "#d2a6fe3d"
			},
			{
				"cursor": "#95e5cbff",
				"background": "#95e5cbff",
				"selection": "#95e5cb3d"
			},
			{
				"cursor": "#ef7177ff",
				"background": "#ef7177ff",
				"selection": "#ef71773d"
			},
			{
				"cursor": "#feb454ff",
				"background": "#feb454ff",
				"selection": "#feb4543d"
			},
			{
				"cursor": "#aad84cff",
				"background": "#aad84cff",
				"selection": "#aad84c3d"
			}
		],
		"error": "#ef7177ff",
		"warning": "#feb454ff",
		"info": "#5ac1feff",
		"hint": "#628b80ff",
		"deleted": "#f26d78",
		"modified": "#73b8ff",
		"terminal.ansi.green": "#70bf56",
		"terminal.ansi.red": "#f06b73",
		"terminal.ansi.blue": "#4fbfff",
		"syntax": {
			"attribute": { "color": "#5ac1feff" },
			"boolean": { "color": "#d2a6ffff" },
			"comment": { "color": "#5c6773ff" },
			"comment.doc": { "color": "#8c8b88ff" },
			"constant": { "color": "#d2a6ffff" },
			"constructor": { "color": "#5ac1feff" },
			"embedded": { "color": "#bfbdb6ff" },
			"emphasis": { "color": "#5ac1feff" },
			"emphasis.strong": {
				"color": "#5ac1feff",
				"font_weight": 700
			},
			"enum": { "color": "#fe8f40ff" },
			"function": { "color": "#ffb353ff" },
			"hint": { "color": "#628b80ff" },
			"keyword": { "color": "#ff8f3fff" },
			"label": { "color": "#5ac1feff" },
			"link_text": {
				"color": "#fe8f40ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#aad84cff" },
			"namespace": { "color": "#bfbdb6ff" },
			"number": { "color": "#d2a6ffff" },
			"operator": { "color": "#f29668ff" },
			"predictive": {
				"color": "#5a728bff",
				"font_style": "italic"
			},
			"preproc": { "color": "#ff8f3fff" },
			"primary": { "color": "#bfbdb6ff" },
			"property": { "color": "#5ac1feff" },
			"punctuation": { "color": "#a6a5a0ff" },
			"punctuation.bracket": { "color": "#a6a5a0ff" },
			"punctuation.delimiter": { "color": "#a6a5a0ff" },
			"punctuation.list_marker": { "color": "#a6a5a0ff" },
			"punctuation.markup": { "color": "#a6a5a0ff" },
			"punctuation.special": { "color": "#d2a6ffff" },
			"selector": { "color": "#d2a6ffff" },
			"selector.pseudo": { "color": "#5ac1feff" },
			"string": { "color": "#a9d94bff" },
			"string.escape": { "color": "#8c8b88ff" },
			"string.regex": { "color": "#95e6cbff" },
			"string.special": { "color": "#e5b572ff" },
			"string.special.symbol": { "color": "#fe8f40ff" },
			"tag": { "color": "#5ac1feff" },
			"text.literal": { "color": "#fe8f40ff" },
			"title": {
				"color": "#bfbdb6ff",
				"font_weight": 700
			},
			"type": { "color": "#59c2ffff" },
			"variable": { "color": "#bfbdb6ff" },
			"variable.parameter": { "color": "#d2a6ffff" },
			"variant": { "color": "#5ac1feff" },
			"diff.plus": { "color": "#aad94cff" },
			"diff.minus": { "color": "#f07178ff" }
		}
	}
};
var ayu_light_default = {
	name: "Ayu Light",
	appearance: "light",
	style: {
		"background": "#dcdddeff",
		"text": "#5c6166ff",
		"editor.background": "#fcfcfcff",
		"editor.foreground": "#5c6166ff",
		"editor.active_line.background": "#ececedbf",
		"search.match_background": "#3b9ee566",
		"players": [
			{
				"cursor": "#3b9ee5ff",
				"background": "#3b9ee5ff",
				"selection": "#3b9ee53d"
			},
			{
				"cursor": "#55b4d3ff",
				"background": "#55b4d3ff",
				"selection": "#55b4d33d"
			},
			{
				"cursor": "#f98d3fff",
				"background": "#f98d3fff",
				"selection": "#f98d3f3d"
			},
			{
				"cursor": "#a37accff",
				"background": "#a37accff",
				"selection": "#a37acc3d"
			},
			{
				"cursor": "#4dbf99ff",
				"background": "#4dbf99ff",
				"selection": "#4dbf993d"
			},
			{
				"cursor": "#ef7271ff",
				"background": "#ef7271ff",
				"selection": "#ef72713d"
			},
			{
				"cursor": "#f1ad49ff",
				"background": "#f1ad49ff",
				"selection": "#f1ad493d"
			},
			{
				"cursor": "#85b304ff",
				"background": "#85b304ff",
				"selection": "#85b3043d"
			}
		],
		"error": "#ef7271ff",
		"warning": "#f1ad49ff",
		"info": "#3b9ee5ff",
		"hint": "#8ca7c2ff",
		"deleted": "#ff7383",
		"modified": "#478acc",
		"terminal.ansi.green": "#6cbf43",
		"terminal.ansi.red": "#f06b6c",
		"terminal.ansi.blue": "#21a1e2",
		"syntax": {
			"attribute": { "color": "#3b9ee5ff" },
			"boolean": { "color": "#a37accff" },
			"comment": { "color": "#abb0b6ff" },
			"comment.doc": { "color": "#898d90ff" },
			"constant": { "color": "#a37accff" },
			"constructor": { "color": "#3b9ee5ff" },
			"embedded": { "color": "#5c6166ff" },
			"emphasis": { "color": "#3b9ee5ff" },
			"emphasis.strong": {
				"color": "#3b9ee5ff",
				"font_weight": 700
			},
			"enum": { "color": "#f98d3fff" },
			"function": { "color": "#f2ad48ff" },
			"hint": { "color": "#8ca7c2ff" },
			"keyword": { "color": "#fa8d3eff" },
			"label": { "color": "#3b9ee5ff" },
			"link_text": {
				"color": "#f98d3fff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#85b304ff" },
			"namespace": { "color": "#5c6166ff" },
			"number": { "color": "#a37accff" },
			"operator": { "color": "#ed9365ff" },
			"predictive": {
				"color": "#9eb9d3ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#fa8d3eff" },
			"primary": { "color": "#5c6166ff" },
			"property": { "color": "#3b9ee5ff" },
			"punctuation": { "color": "#73777bff" },
			"punctuation.bracket": { "color": "#73777bff" },
			"punctuation.delimiter": { "color": "#73777bff" },
			"punctuation.list_marker": { "color": "#73777bff" },
			"punctuation.markup": { "color": "#73777bff" },
			"punctuation.special": { "color": "#a37accff" },
			"selector": { "color": "#a37accff" },
			"selector.pseudo": { "color": "#3b9ee5ff" },
			"string": { "color": "#86b300ff" },
			"string.escape": { "color": "#898d90ff" },
			"string.regex": { "color": "#4bbf98ff" },
			"string.special": { "color": "#e6ba7eff" },
			"string.special.symbol": { "color": "#f98d3fff" },
			"tag": { "color": "#3b9ee5ff" },
			"text.literal": { "color": "#f98d3fff" },
			"title": {
				"color": "#5c6166ff",
				"font_weight": 700
			},
			"type": { "color": "#389ee6ff" },
			"variable": { "color": "#5c6166ff" },
			"variable.parameter": { "color": "#a37accff" },
			"variant": { "color": "#3b9ee5ff" },
			"diff.plus": { "color": "#6cbf43ff" },
			"diff.minus": { "color": "#ff6666ff" }
		}
	}
};
var ayu_mirage_default = {
	name: "Ayu Mirage",
	appearance: "dark",
	style: {
		"background": "#464a52ff",
		"text": "#cccac2ff",
		"editor.background": "#242835ff",
		"editor.foreground": "#cccac2ff",
		"editor.active_line.background": "#353944bf",
		"search.match_background": "#73cffe66",
		"players": [
			{
				"cursor": "#72cffeff",
				"background": "#72cffeff",
				"selection": "#72cffe3d"
			},
			{
				"cursor": "#5bcde5ff",
				"background": "#5bcde5ff",
				"selection": "#5bcde53d"
			},
			{
				"cursor": "#fead66ff",
				"background": "#fead66ff",
				"selection": "#fead663d"
			},
			{
				"cursor": "#debffeff",
				"background": "#debffeff",
				"selection": "#debffe3d"
			},
			{
				"cursor": "#95e5cbff",
				"background": "#95e5cbff",
				"selection": "#95e5cb3d"
			},
			{
				"cursor": "#f18779ff",
				"background": "#f18779ff",
				"selection": "#f187793d"
			},
			{
				"cursor": "#fecf72ff",
				"background": "#fecf72ff",
				"selection": "#fecf723d"
			},
			{
				"cursor": "#d5fe80ff",
				"background": "#d5fe80ff",
				"selection": "#d5fe803d"
			}
		],
		"error": "#f18779ff",
		"warning": "#fecf72ff",
		"info": "#72cffeff",
		"hint": "#7399a3ff",
		"deleted": "#f27983",
		"modified": "#80bfff",
		"terminal.ansi.green": "#87d96c",
		"terminal.ansi.red": "#f28273",
		"terminal.ansi.blue": "#6acdff",
		"syntax": {
			"attribute": { "color": "#72cffeff" },
			"boolean": { "color": "#dfbfffff" },
			"comment": { "color": "#5c6773ff" },
			"comment.doc": { "color": "#9b9b99ff" },
			"constant": { "color": "#dfbfffff" },
			"constructor": { "color": "#72cffeff" },
			"embedded": { "color": "#cccac2ff" },
			"emphasis": { "color": "#72cffeff" },
			"emphasis.strong": {
				"color": "#72cffeff",
				"font_weight": 700
			},
			"enum": { "color": "#fead66ff" },
			"function": { "color": "#ffd173ff" },
			"hint": { "color": "#7399a3ff" },
			"keyword": { "color": "#ffad65ff" },
			"label": { "color": "#72cffeff" },
			"link_text": {
				"color": "#fead66ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#d5fe80ff" },
			"namespace": { "color": "#cccac2ff" },
			"number": { "color": "#dfbfffff" },
			"operator": { "color": "#f29e74ff" },
			"predictive": {
				"color": "#6d839bff",
				"font_style": "italic"
			},
			"preproc": { "color": "#ffad65ff" },
			"primary": { "color": "#cccac2ff" },
			"property": { "color": "#72cffeff" },
			"punctuation": { "color": "#b4b3aeff" },
			"punctuation.bracket": { "color": "#b4b3aeff" },
			"punctuation.delimiter": { "color": "#b4b3aeff" },
			"punctuation.list_marker": { "color": "#b4b3aeff" },
			"punctuation.markup": { "color": "#b4b3aeff" },
			"punctuation.special": { "color": "#dfbfffff" },
			"selector": { "color": "#dfbfffff" },
			"selector.pseudo": { "color": "#72cffeff" },
			"string": { "color": "#d4fe7fff" },
			"string.escape": { "color": "#9b9b99ff" },
			"string.regex": { "color": "#95e6cbff" },
			"string.special": { "color": "#ffdfb3ff" },
			"string.special.symbol": { "color": "#fead66ff" },
			"tag": { "color": "#72cffeff" },
			"text.literal": { "color": "#fead66ff" },
			"title": {
				"color": "#cccac2ff",
				"font_weight": 700
			},
			"type": { "color": "#73cfffff" },
			"variable": { "color": "#cccac2ff" },
			"variable.parameter": { "color": "#dfbfffff" },
			"variant": { "color": "#72cffeff" },
			"diff.plus": { "color": "#aad94cff" },
			"diff.minus": { "color": "#f07178ff" }
		}
	}
};
var catppuccin_frappe_default = {
	name: "Catppuccin Frappé",
	appearance: "dark",
	style: {
		"background": "#383c52",
		"text": "#c6d0f5",
		"editor.background": "#303446",
		"editor.foreground": "#c6d0f5",
		"editor.active_line.background": "#c6d0f512",
		"editor.document_highlight.bracket_background": "#ca9ee617",
		"search.match_background": "#81c8be4d",
		"players": [
			{
				"cursor": "#f2d5cf",
				"selection": "#949cbb40",
				"background": "#f2d5cf"
			},
			{
				"cursor": "#ca9ee6",
				"selection": "#ca9ee640",
				"background": "#ca9ee6"
			},
			{
				"cursor": "#babbf1",
				"selection": "#babbf140",
				"background": "#babbf1"
			},
			{
				"cursor": "#85c1dc",
				"selection": "#85c1dc40",
				"background": "#85c1dc"
			},
			{
				"cursor": "#a6d189",
				"selection": "#a6d18940",
				"background": "#a6d189"
			},
			{
				"cursor": "#e5c890",
				"selection": "#e5c89040",
				"background": "#e5c890"
			},
			{
				"cursor": "#ef9f76",
				"selection": "#ef9f7640",
				"background": "#ef9f76"
			},
			{
				"cursor": "#e78284",
				"selection": "#e7828440",
				"background": "#e78284"
			}
		],
		"error": "#e78284",
		"warning": "#e5c890",
		"info": "#81c8be",
		"hint": "#626880",
		"created": "#a6d189",
		"deleted": "#e78284",
		"modified": "#e5c890",
		"terminal.ansi.green": "#a6d189",
		"terminal.ansi.red": "#e78284",
		"terminal.ansi.blue": "#8caaee",
		"syntax": {
			"variable": { "color": "#c6d0f5" },
			"variable.builtin": { "color": "#e78284" },
			"variable.parameter": { "color": "#ea999c" },
			"variable.member": { "color": "#8caaee" },
			"variable.special": {
				"color": "#e78284",
				"font_style": "italic"
			},
			"constant": { "color": "#ef9f76" },
			"constant.builtin": { "color": "#ef9f76" },
			"constant.macro": { "color": "#ca9ee6" },
			"module": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"label": { "color": "#85c1dc" },
			"string": { "color": "#a6d189" },
			"string.documentation": { "color": "#81c8be" },
			"string.regexp": { "color": "#ef9f76" },
			"string.escape": { "color": "#f4b8e4" },
			"string.special": { "color": "#f4b8e4" },
			"string.special.path": { "color": "#f4b8e4" },
			"string.special.symbol": { "color": "#eebebe" },
			"string.special.url": {
				"color": "#f2d5cf",
				"font_style": "italic"
			},
			"character": { "color": "#81c8be" },
			"character.special": { "color": "#f4b8e4" },
			"boolean": { "color": "#ef9f76" },
			"number": { "color": "#ef9f76" },
			"number.float": { "color": "#ef9f76" },
			"tag": { "color": "#8caaee" },
			"tag.attribute": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"tag.delimiter": { "color": "#81c8be" },
			"type": { "color": "#e5c890" },
			"type.builtin": {
				"color": "#ca9ee6",
				"font_style": "italic"
			},
			"type.definition": { "color": "#e5c890" },
			"type.interface": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"type.super": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"attribute": { "color": "#ef9f76" },
			"property": { "color": "#8caaee" },
			"function": { "color": "#8caaee" },
			"function.builtin": { "color": "#ef9f76" },
			"function.call": { "color": "#8caaee" },
			"function.macro": { "color": "#81c8be" },
			"function.method": { "color": "#8caaee" },
			"function.method.call": { "color": "#8caaee" },
			"constructor": { "color": "#eebebe" },
			"operator": { "color": "#99d1db" },
			"keyword": { "color": "#ca9ee6" },
			"keyword.modifier": { "color": "#ca9ee6" },
			"keyword.type": { "color": "#ca9ee6" },
			"keyword.coroutine": { "color": "#ca9ee6" },
			"keyword.function": { "color": "#ca9ee6" },
			"keyword.operator": { "color": "#ca9ee6" },
			"keyword.import": { "color": "#ca9ee6" },
			"keyword.repeat": { "color": "#ca9ee6" },
			"keyword.return": { "color": "#ca9ee6" },
			"keyword.debug": { "color": "#ca9ee6" },
			"keyword.exception": { "color": "#ca9ee6" },
			"keyword.conditional": { "color": "#ca9ee6" },
			"keyword.conditional.ternary": { "color": "#ca9ee6" },
			"keyword.directive": { "color": "#f4b8e4" },
			"keyword.directive.define": { "color": "#f4b8e4" },
			"keyword.export": { "color": "#99d1db" },
			"punctuation": { "color": "#949cbb" },
			"punctuation.delimiter": { "color": "#949cbb" },
			"punctuation.bracket": { "color": "#949cbb" },
			"punctuation.special": { "color": "#f4b8e4" },
			"punctuation.special.symbol": { "color": "#eebebe" },
			"punctuation.list_marker": { "color": "#81c8be" },
			"comment": {
				"color": "#949cbb",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#949cbb",
				"font_style": "italic"
			},
			"comment.documentation": {
				"color": "#949cbb",
				"font_style": "italic"
			},
			"comment.info": {
				"color": "#81c8be",
				"font_style": "italic"
			},
			"comment.error": {
				"color": "#e78284",
				"font_style": "italic"
			},
			"comment.warning": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"comment.warn": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"comment.hint": {
				"color": "#8caaee",
				"font_style": "italic"
			},
			"comment.todo": {
				"color": "#eebebe",
				"font_style": "italic"
			},
			"comment.note": {
				"color": "#f2d5cf",
				"font_style": "italic"
			},
			"diff.plus": { "color": "#a6d189" },
			"diff.minus": { "color": "#e78284" },
			"parameter": { "color": "#ea999c" },
			"field": { "color": "#babbf1" },
			"namespace": {
				"color": "#e5c890",
				"font_style": "italic"
			},
			"float": { "color": "#ef9f76" },
			"symbol": { "color": "#f4b8e4" },
			"string.regex": { "color": "#ef9f76" },
			"text": { "color": "#c6d0f5" },
			"emphasis.strong": {
				"color": "#ea999c",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#ea999c",
				"font_style": "italic"
			},
			"embedded": { "color": "#ea999c" },
			"text.literal": { "color": "#a6d189" },
			"concept": { "color": "#85c1dc" },
			"enum": {
				"color": "#81c8be",
				"font_weight": 700
			},
			"function.decorator": { "color": "#ef9f76" },
			"type.class.definition": {
				"color": "#e5c890",
				"font_weight": 700
			},
			"hint": {
				"color": "#838ba7",
				"font_style": "italic"
			},
			"link_text": { "color": "#babbf1" },
			"link_uri": {
				"color": "#8caaee",
				"font_style": "italic"
			},
			"parent": { "color": "#ef9f76" },
			"predictive": { "color": "#737994" },
			"predoc": { "color": "#e78284" },
			"primary": { "color": "#ea999c" },
			"tag.doctype": { "color": "#ca9ee6" },
			"string.doc": {
				"color": "#81c8be",
				"font_style": "italic"
			},
			"title": {
				"color": "#c6d0f5",
				"font_weight": 800
			},
			"variant": { "color": "#e78284" },
			"preproc": { "color": "#f4b8e4" },
			"selector": { "color": "#8CAAEE" },
			"selector.class": { "color": "#E5C890" },
			"selector.id": { "color": "#E5C890" },
			"selector.pseudo": { "color": "#81C8BE" }
		}
	}
};
var catppuccin_latte_default = {
	name: "Catppuccin Latte",
	appearance: "light",
	style: {
		"background": "#d7dce5",
		"text": "#4c4f69",
		"editor.background": "#eff1f5",
		"editor.foreground": "#4c4f69",
		"editor.active_line.background": "#4c4f6912",
		"editor.document_highlight.bracket_background": "#8839ef17",
		"search.match_background": "#1792994d",
		"players": [
			{
				"cursor": "#dc8a78",
				"selection": "#7c7f934d",
				"background": "#dc8a78"
			},
			{
				"cursor": "#8839ef",
				"selection": "#8839ef4d",
				"background": "#8839ef"
			},
			{
				"cursor": "#7287fd",
				"selection": "#7287fd4d",
				"background": "#7287fd"
			},
			{
				"cursor": "#209fb5",
				"selection": "#209fb54d",
				"background": "#209fb5"
			},
			{
				"cursor": "#40a02b",
				"selection": "#40a02b4d",
				"background": "#40a02b"
			},
			{
				"cursor": "#df8e1d",
				"selection": "#df8e1d4d",
				"background": "#df8e1d"
			},
			{
				"cursor": "#fe640b",
				"selection": "#fe640b4d",
				"background": "#fe640b"
			},
			{
				"cursor": "#d20f39",
				"selection": "#d20f394d",
				"background": "#d20f39"
			}
		],
		"error": "#d20f39",
		"warning": "#df8e1d",
		"info": "#179299",
		"hint": "#acb0be",
		"created": "#40a02b",
		"deleted": "#d20f39",
		"modified": "#df8e1d",
		"terminal.ansi.green": "#40a02b",
		"terminal.ansi.red": "#d20f39",
		"terminal.ansi.blue": "#1e66f5",
		"syntax": {
			"variable": { "color": "#4c4f69" },
			"variable.builtin": { "color": "#d20f39" },
			"variable.parameter": { "color": "#e64553" },
			"variable.member": { "color": "#1e66f5" },
			"variable.special": {
				"color": "#d20f39",
				"font_style": "italic"
			},
			"constant": { "color": "#fe640b" },
			"constant.builtin": { "color": "#fe640b" },
			"constant.macro": { "color": "#8839ef" },
			"module": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"label": { "color": "#209fb5" },
			"string": { "color": "#40a02b" },
			"string.documentation": { "color": "#179299" },
			"string.regexp": { "color": "#fe640b" },
			"string.escape": { "color": "#ea76cb" },
			"string.special": { "color": "#ea76cb" },
			"string.special.path": { "color": "#ea76cb" },
			"string.special.symbol": { "color": "#dd7878" },
			"string.special.url": {
				"color": "#dc8a78",
				"font_style": "italic"
			},
			"character": { "color": "#179299" },
			"character.special": { "color": "#ea76cb" },
			"boolean": { "color": "#fe640b" },
			"number": { "color": "#fe640b" },
			"number.float": { "color": "#fe640b" },
			"tag": { "color": "#1e66f5" },
			"tag.attribute": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"tag.delimiter": { "color": "#179299" },
			"type": { "color": "#df8e1d" },
			"type.builtin": {
				"color": "#8839ef",
				"font_style": "italic"
			},
			"type.definition": { "color": "#df8e1d" },
			"type.interface": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"type.super": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"attribute": { "color": "#fe640b" },
			"property": { "color": "#1e66f5" },
			"function": { "color": "#1e66f5" },
			"function.builtin": { "color": "#fe640b" },
			"function.call": { "color": "#1e66f5" },
			"function.macro": { "color": "#179299" },
			"function.method": { "color": "#1e66f5" },
			"function.method.call": { "color": "#1e66f5" },
			"constructor": { "color": "#dd7878" },
			"operator": { "color": "#04a5e5" },
			"keyword": { "color": "#8839ef" },
			"keyword.modifier": { "color": "#8839ef" },
			"keyword.type": { "color": "#8839ef" },
			"keyword.coroutine": { "color": "#8839ef" },
			"keyword.function": { "color": "#8839ef" },
			"keyword.operator": { "color": "#8839ef" },
			"keyword.import": { "color": "#8839ef" },
			"keyword.repeat": { "color": "#8839ef" },
			"keyword.return": { "color": "#8839ef" },
			"keyword.debug": { "color": "#8839ef" },
			"keyword.exception": { "color": "#8839ef" },
			"keyword.conditional": { "color": "#8839ef" },
			"keyword.conditional.ternary": { "color": "#8839ef" },
			"keyword.directive": { "color": "#ea76cb" },
			"keyword.directive.define": { "color": "#ea76cb" },
			"keyword.export": { "color": "#04a5e5" },
			"punctuation": { "color": "#7c7f93" },
			"punctuation.delimiter": { "color": "#7c7f93" },
			"punctuation.bracket": { "color": "#7c7f93" },
			"punctuation.special": { "color": "#ea76cb" },
			"punctuation.special.symbol": { "color": "#dd7878" },
			"punctuation.list_marker": { "color": "#179299" },
			"comment": {
				"color": "#7c7f93",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#7c7f93",
				"font_style": "italic"
			},
			"comment.documentation": {
				"color": "#7c7f93",
				"font_style": "italic"
			},
			"comment.info": {
				"color": "#179299",
				"font_style": "italic"
			},
			"comment.error": {
				"color": "#d20f39",
				"font_style": "italic"
			},
			"comment.warning": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"comment.warn": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"comment.hint": {
				"color": "#1e66f5",
				"font_style": "italic"
			},
			"comment.todo": {
				"color": "#dd7878",
				"font_style": "italic"
			},
			"comment.note": {
				"color": "#dc8a78",
				"font_style": "italic"
			},
			"diff.plus": { "color": "#40a02b" },
			"diff.minus": { "color": "#d20f39" },
			"parameter": { "color": "#e64553" },
			"field": { "color": "#7287fd" },
			"namespace": {
				"color": "#df8e1d",
				"font_style": "italic"
			},
			"float": { "color": "#fe640b" },
			"symbol": { "color": "#ea76cb" },
			"string.regex": { "color": "#fe640b" },
			"text": { "color": "#4c4f69" },
			"emphasis.strong": {
				"color": "#e64553",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#e64553",
				"font_style": "italic"
			},
			"embedded": { "color": "#e64553" },
			"text.literal": { "color": "#40a02b" },
			"concept": { "color": "#209fb5" },
			"enum": {
				"color": "#179299",
				"font_weight": 700
			},
			"function.decorator": { "color": "#fe640b" },
			"type.class.definition": {
				"color": "#df8e1d",
				"font_weight": 700
			},
			"hint": {
				"color": "#8c8fa1",
				"font_style": "italic"
			},
			"link_text": { "color": "#7287fd" },
			"link_uri": {
				"color": "#1e66f5",
				"font_style": "italic"
			},
			"parent": { "color": "#fe640b" },
			"predictive": { "color": "#9ca0b0" },
			"predoc": { "color": "#d20f39" },
			"primary": { "color": "#e64553" },
			"tag.doctype": { "color": "#8839ef" },
			"string.doc": {
				"color": "#179299",
				"font_style": "italic"
			},
			"title": {
				"color": "#4c4f69",
				"font_weight": 800
			},
			"variant": { "color": "#d20f39" },
			"preproc": { "color": "#ea76cb" },
			"selector": { "color": "#1E66F5" },
			"selector.class": { "color": "#DF8E1D" },
			"selector.id": { "color": "#DF8E1D" },
			"selector.pseudo": { "color": "#179299" }
		}
	}
};
var catppuccin_macchiato_default = {
	name: "Catppuccin Macchiato",
	appearance: "dark",
	style: {
		"background": "#2c2f46",
		"text": "#cad3f5",
		"editor.background": "#24273a",
		"editor.foreground": "#cad3f5",
		"editor.active_line.background": "#cad3f512",
		"editor.document_highlight.bracket_background": "#c6a0f617",
		"search.match_background": "#8bd5ca4d",
		"players": [
			{
				"cursor": "#f4dbd6",
				"selection": "#939ab740",
				"background": "#f4dbd6"
			},
			{
				"cursor": "#c6a0f6",
				"selection": "#c6a0f640",
				"background": "#c6a0f6"
			},
			{
				"cursor": "#b7bdf8",
				"selection": "#b7bdf840",
				"background": "#b7bdf8"
			},
			{
				"cursor": "#7dc4e4",
				"selection": "#7dc4e440",
				"background": "#7dc4e4"
			},
			{
				"cursor": "#a6da95",
				"selection": "#a6da9540",
				"background": "#a6da95"
			},
			{
				"cursor": "#eed49f",
				"selection": "#eed49f40",
				"background": "#eed49f"
			},
			{
				"cursor": "#f5a97f",
				"selection": "#f5a97f40",
				"background": "#f5a97f"
			},
			{
				"cursor": "#ed8796",
				"selection": "#ed879640",
				"background": "#ed8796"
			}
		],
		"error": "#ed8796",
		"warning": "#eed49f",
		"info": "#8bd5ca",
		"hint": "#5b6078",
		"created": "#a6da95",
		"deleted": "#ed8796",
		"modified": "#eed49f",
		"terminal.ansi.green": "#a6da95",
		"terminal.ansi.red": "#ed8796",
		"terminal.ansi.blue": "#8aadf4",
		"syntax": {
			"variable": { "color": "#cad3f5" },
			"variable.builtin": { "color": "#ed8796" },
			"variable.parameter": { "color": "#ee99a0" },
			"variable.member": { "color": "#8aadf4" },
			"variable.special": {
				"color": "#ed8796",
				"font_style": "italic"
			},
			"constant": { "color": "#f5a97f" },
			"constant.builtin": { "color": "#f5a97f" },
			"constant.macro": { "color": "#c6a0f6" },
			"module": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"label": { "color": "#7dc4e4" },
			"string": { "color": "#a6da95" },
			"string.documentation": { "color": "#8bd5ca" },
			"string.regexp": { "color": "#f5a97f" },
			"string.escape": { "color": "#f5bde6" },
			"string.special": { "color": "#f5bde6" },
			"string.special.path": { "color": "#f5bde6" },
			"string.special.symbol": { "color": "#f0c6c6" },
			"string.special.url": {
				"color": "#f4dbd6",
				"font_style": "italic"
			},
			"character": { "color": "#8bd5ca" },
			"character.special": { "color": "#f5bde6" },
			"boolean": { "color": "#f5a97f" },
			"number": { "color": "#f5a97f" },
			"number.float": { "color": "#f5a97f" },
			"tag": { "color": "#8aadf4" },
			"tag.attribute": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"tag.delimiter": { "color": "#8bd5ca" },
			"type": { "color": "#eed49f" },
			"type.builtin": {
				"color": "#c6a0f6",
				"font_style": "italic"
			},
			"type.definition": { "color": "#eed49f" },
			"type.interface": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"type.super": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"attribute": { "color": "#f5a97f" },
			"property": { "color": "#8aadf4" },
			"function": { "color": "#8aadf4" },
			"function.builtin": { "color": "#f5a97f" },
			"function.call": { "color": "#8aadf4" },
			"function.macro": { "color": "#8bd5ca" },
			"function.method": { "color": "#8aadf4" },
			"function.method.call": { "color": "#8aadf4" },
			"constructor": { "color": "#f0c6c6" },
			"operator": { "color": "#91d7e3" },
			"keyword": { "color": "#c6a0f6" },
			"keyword.modifier": { "color": "#c6a0f6" },
			"keyword.type": { "color": "#c6a0f6" },
			"keyword.coroutine": { "color": "#c6a0f6" },
			"keyword.function": { "color": "#c6a0f6" },
			"keyword.operator": { "color": "#c6a0f6" },
			"keyword.import": { "color": "#c6a0f6" },
			"keyword.repeat": { "color": "#c6a0f6" },
			"keyword.return": { "color": "#c6a0f6" },
			"keyword.debug": { "color": "#c6a0f6" },
			"keyword.exception": { "color": "#c6a0f6" },
			"keyword.conditional": { "color": "#c6a0f6" },
			"keyword.conditional.ternary": { "color": "#c6a0f6" },
			"keyword.directive": { "color": "#f5bde6" },
			"keyword.directive.define": { "color": "#f5bde6" },
			"keyword.export": { "color": "#91d7e3" },
			"punctuation": { "color": "#939ab7" },
			"punctuation.delimiter": { "color": "#939ab7" },
			"punctuation.bracket": { "color": "#939ab7" },
			"punctuation.special": { "color": "#f5bde6" },
			"punctuation.special.symbol": { "color": "#f0c6c6" },
			"punctuation.list_marker": { "color": "#8bd5ca" },
			"comment": {
				"color": "#939ab7",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#939ab7",
				"font_style": "italic"
			},
			"comment.documentation": {
				"color": "#939ab7",
				"font_style": "italic"
			},
			"comment.info": {
				"color": "#8bd5ca",
				"font_style": "italic"
			},
			"comment.error": {
				"color": "#ed8796",
				"font_style": "italic"
			},
			"comment.warning": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"comment.warn": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"comment.hint": {
				"color": "#8aadf4",
				"font_style": "italic"
			},
			"comment.todo": {
				"color": "#f0c6c6",
				"font_style": "italic"
			},
			"comment.note": {
				"color": "#f4dbd6",
				"font_style": "italic"
			},
			"diff.plus": { "color": "#a6da95" },
			"diff.minus": { "color": "#ed8796" },
			"parameter": { "color": "#ee99a0" },
			"field": { "color": "#b7bdf8" },
			"namespace": {
				"color": "#eed49f",
				"font_style": "italic"
			},
			"float": { "color": "#f5a97f" },
			"symbol": { "color": "#f5bde6" },
			"string.regex": { "color": "#f5a97f" },
			"text": { "color": "#cad3f5" },
			"emphasis.strong": {
				"color": "#ee99a0",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#ee99a0",
				"font_style": "italic"
			},
			"embedded": { "color": "#ee99a0" },
			"text.literal": { "color": "#a6da95" },
			"concept": { "color": "#7dc4e4" },
			"enum": {
				"color": "#8bd5ca",
				"font_weight": 700
			},
			"function.decorator": { "color": "#f5a97f" },
			"type.class.definition": {
				"color": "#eed49f",
				"font_weight": 700
			},
			"hint": {
				"color": "#8087a2",
				"font_style": "italic"
			},
			"link_text": { "color": "#b7bdf8" },
			"link_uri": {
				"color": "#8aadf4",
				"font_style": "italic"
			},
			"parent": { "color": "#f5a97f" },
			"predictive": { "color": "#6e738d" },
			"predoc": { "color": "#ed8796" },
			"primary": { "color": "#ee99a0" },
			"tag.doctype": { "color": "#c6a0f6" },
			"string.doc": {
				"color": "#8bd5ca",
				"font_style": "italic"
			},
			"title": {
				"color": "#cad3f5",
				"font_weight": 800
			},
			"variant": { "color": "#ed8796" },
			"preproc": { "color": "#f5bde6" },
			"selector": { "color": "#8AADF4" },
			"selector.class": { "color": "#EED49F" },
			"selector.id": { "color": "#EED49F" },
			"selector.pseudo": { "color": "#8BD5CA" }
		}
	}
};
var catppuccin_mocha_default = {
	name: "Catppuccin Mocha",
	appearance: "dark",
	style: {
		"background": "#27273b",
		"text": "#cdd6f4",
		"editor.background": "#1e1e2e",
		"editor.foreground": "#cdd6f4",
		"editor.active_line.background": "#cdd6f412",
		"editor.document_highlight.bracket_background": "#cba6f717",
		"search.match_background": "#94e2d54d",
		"players": [
			{
				"cursor": "#f5e0dc",
				"selection": "#9399b240",
				"background": "#f5e0dc"
			},
			{
				"cursor": "#cba6f7",
				"selection": "#cba6f740",
				"background": "#cba6f7"
			},
			{
				"cursor": "#b4befe",
				"selection": "#b4befe40",
				"background": "#b4befe"
			},
			{
				"cursor": "#74c7ec",
				"selection": "#74c7ec40",
				"background": "#74c7ec"
			},
			{
				"cursor": "#a6e3a1",
				"selection": "#a6e3a140",
				"background": "#a6e3a1"
			},
			{
				"cursor": "#f9e2af",
				"selection": "#f9e2af40",
				"background": "#f9e2af"
			},
			{
				"cursor": "#fab387",
				"selection": "#fab38740",
				"background": "#fab387"
			},
			{
				"cursor": "#f38ba8",
				"selection": "#f38ba840",
				"background": "#f38ba8"
			}
		],
		"error": "#f38ba8",
		"warning": "#f9e2af",
		"info": "#94e2d5",
		"hint": "#585b70",
		"created": "#a6e3a1",
		"deleted": "#f38ba8",
		"modified": "#f9e2af",
		"terminal.ansi.green": "#a6e3a1",
		"terminal.ansi.red": "#f38ba8",
		"terminal.ansi.blue": "#89b4fa",
		"syntax": {
			"variable": { "color": "#cdd6f4" },
			"variable.builtin": { "color": "#f38ba8" },
			"variable.parameter": { "color": "#eba0ac" },
			"variable.member": { "color": "#89b4fa" },
			"variable.special": {
				"color": "#f38ba8",
				"font_style": "italic"
			},
			"constant": { "color": "#fab387" },
			"constant.builtin": { "color": "#fab387" },
			"constant.macro": { "color": "#cba6f7" },
			"module": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"label": { "color": "#74c7ec" },
			"string": { "color": "#a6e3a1" },
			"string.documentation": { "color": "#94e2d5" },
			"string.regexp": { "color": "#fab387" },
			"string.escape": { "color": "#f5c2e7" },
			"string.special": { "color": "#f5c2e7" },
			"string.special.path": { "color": "#f5c2e7" },
			"string.special.symbol": { "color": "#f2cdcd" },
			"string.special.url": {
				"color": "#f5e0dc",
				"font_style": "italic"
			},
			"character": { "color": "#94e2d5" },
			"character.special": { "color": "#f5c2e7" },
			"boolean": { "color": "#fab387" },
			"number": { "color": "#fab387" },
			"number.float": { "color": "#fab387" },
			"tag": { "color": "#89b4fa" },
			"tag.attribute": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"tag.delimiter": { "color": "#94e2d5" },
			"type": { "color": "#f9e2af" },
			"type.builtin": {
				"color": "#cba6f7",
				"font_style": "italic"
			},
			"type.definition": { "color": "#f9e2af" },
			"type.interface": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"type.super": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"attribute": { "color": "#fab387" },
			"property": { "color": "#89b4fa" },
			"function": { "color": "#89b4fa" },
			"function.builtin": { "color": "#fab387" },
			"function.call": { "color": "#89b4fa" },
			"function.macro": { "color": "#94e2d5" },
			"function.method": { "color": "#89b4fa" },
			"function.method.call": { "color": "#89b4fa" },
			"constructor": { "color": "#f2cdcd" },
			"operator": { "color": "#89dceb" },
			"keyword": { "color": "#cba6f7" },
			"keyword.modifier": { "color": "#cba6f7" },
			"keyword.type": { "color": "#cba6f7" },
			"keyword.coroutine": { "color": "#cba6f7" },
			"keyword.function": { "color": "#cba6f7" },
			"keyword.operator": { "color": "#cba6f7" },
			"keyword.import": { "color": "#cba6f7" },
			"keyword.repeat": { "color": "#cba6f7" },
			"keyword.return": { "color": "#cba6f7" },
			"keyword.debug": { "color": "#cba6f7" },
			"keyword.exception": { "color": "#cba6f7" },
			"keyword.conditional": { "color": "#cba6f7" },
			"keyword.conditional.ternary": { "color": "#cba6f7" },
			"keyword.directive": { "color": "#f5c2e7" },
			"keyword.directive.define": { "color": "#f5c2e7" },
			"keyword.export": { "color": "#89dceb" },
			"punctuation": { "color": "#9399b2" },
			"punctuation.delimiter": { "color": "#9399b2" },
			"punctuation.bracket": { "color": "#9399b2" },
			"punctuation.special": { "color": "#f5c2e7" },
			"punctuation.special.symbol": { "color": "#f2cdcd" },
			"punctuation.list_marker": { "color": "#94e2d5" },
			"comment": {
				"color": "#9399b2",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#9399b2",
				"font_style": "italic"
			},
			"comment.documentation": {
				"color": "#9399b2",
				"font_style": "italic"
			},
			"comment.info": {
				"color": "#94e2d5",
				"font_style": "italic"
			},
			"comment.error": {
				"color": "#f38ba8",
				"font_style": "italic"
			},
			"comment.warning": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"comment.warn": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"comment.hint": {
				"color": "#89b4fa",
				"font_style": "italic"
			},
			"comment.todo": {
				"color": "#f2cdcd",
				"font_style": "italic"
			},
			"comment.note": {
				"color": "#f5e0dc",
				"font_style": "italic"
			},
			"diff.plus": { "color": "#a6e3a1" },
			"diff.minus": { "color": "#f38ba8" },
			"parameter": { "color": "#eba0ac" },
			"field": { "color": "#b4befe" },
			"namespace": {
				"color": "#f9e2af",
				"font_style": "italic"
			},
			"float": { "color": "#fab387" },
			"symbol": { "color": "#f5c2e7" },
			"string.regex": { "color": "#fab387" },
			"text": { "color": "#cdd6f4" },
			"emphasis.strong": {
				"color": "#eba0ac",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#eba0ac",
				"font_style": "italic"
			},
			"embedded": { "color": "#eba0ac" },
			"text.literal": { "color": "#a6e3a1" },
			"concept": { "color": "#74c7ec" },
			"enum": {
				"color": "#94e2d5",
				"font_weight": 700
			},
			"function.decorator": { "color": "#fab387" },
			"type.class.definition": {
				"color": "#f9e2af",
				"font_weight": 700
			},
			"hint": {
				"color": "#7f849c",
				"font_style": "italic"
			},
			"link_text": { "color": "#b4befe" },
			"link_uri": {
				"color": "#89b4fa",
				"font_style": "italic"
			},
			"parent": { "color": "#fab387" },
			"predictive": { "color": "#6c7086" },
			"predoc": { "color": "#f38ba8" },
			"primary": { "color": "#eba0ac" },
			"tag.doctype": { "color": "#cba6f7" },
			"string.doc": {
				"color": "#94e2d5",
				"font_style": "italic"
			},
			"title": {
				"color": "#cdd6f4",
				"font_weight": 800
			},
			"variant": { "color": "#f38ba8" },
			"preproc": { "color": "#f5c2e7" },
			"selector": { "color": "#89B4FA" },
			"selector.class": { "color": "#F9E2AF" },
			"selector.id": { "color": "#F9E2AF" },
			"selector.pseudo": { "color": "#94E2D5" }
		}
	}
};
var dark_plus_default = {
	name: "Dark Plus",
	appearance: "dark",
	style: {
		"background": "#1e1e1eff",
		"text": "#d4d4d4ff",
		"editor.background": "#1e1e1eff",
		"editor.foreground": "#d4d4d4ff",
		"editor.active_line.background": "#d4d4d40a",
		"editor.document_highlight.bracket_background": "#d4d4d41a",
		"search.match_background": "#d4d4d433",
		"players": [
			{
				"cursor": "#d4d4d4ff",
				"background": "#d4d4d426",
				"selection": "#d4d4d433"
			},
			{
				"cursor": "#d4b455ff",
				"background": "#d4b45526",
				"selection": "#d4b4554d"
			},
			{
				"cursor": "#94d455ff",
				"background": "#94d45526",
				"selection": "#94d4554d"
			},
			{
				"cursor": "#55d475ff",
				"background": "#55d47526",
				"selection": "#55d4754d"
			},
			{
				"cursor": "#55d4d4ff",
				"background": "#55d4d426",
				"selection": "#55d4d44d"
			},
			{
				"cursor": "#5575d4ff",
				"background": "#5575d426",
				"selection": "#5575d44d"
			},
			{
				"cursor": "#9455d4ff",
				"background": "#9455d426",
				"selection": "#9455d44d"
			},
			{
				"cursor": "#d455b4ff",
				"background": "#d455b426",
				"selection": "#d455b44d"
			}
		],
		"error": "#f44747ff",
		"warning": "#cca700ff",
		"info": "#3794ffff",
		"hint": "#969696ff",
		"syntax": {
			"comment": { "color": "#6a9955ff" },
			"comment.doc": { "color": "#6a9955ff" },
			"string": { "color": "#ce9178ff" },
			"string.regex": { "color": "#d16969ff" },
			"string.escape": { "color": "#d7ba7dff" },
			"link_text": { "color": "#ce9178ff" },
			"number": { "color": "#b5cea8ff" },
			"boolean": { "color": "#569cd6ff" },
			"constant.builtin": { "color": "#569cd6ff" },
			"constant": { "color": "#4FC1FF" },
			"variable": { "color": "#9cdcfeff" },
			"variable.special": { "color": "#569cd6ff" },
			"variable.parameter": { "color": "#9cdcfeff" },
			"keyword": { "color": "#569cd6ff" },
			"operator": { "color": "#d4d4d4ff" },
			"type": { "color": "#4ec9b0ff" },
			"type.builtin": { "color": "#4ec9b0ff" },
			"function": { "color": "#dcdcaaff" },
			"function.builtin": { "color": "#dcdcaaff" },
			"tag": { "color": "#569cd6ff" },
			"attribute": { "color": "#9cdcfeff" },
			"punctuation.special": { "color": "#569cd6ff" },
			"punctuation.bracket": { "color": "#d4d4d4ff" },
			"punctuation.delimiter": { "color": "#d4d4d4ff" },
			"punctuation.list_marker": { "color": "#6796e6ff" },
			"punctuation": { "color": "#d4d4d4ff" },
			"preproc": { "color": "#569cd6ff" },
			"title": {
				"color": "#569cd6ff",
				"font_weight": 700
			},
			"emphasis.strong": {
				"color": "#569cd6ff",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#c586c0ff",
				"font_style": "italic"
			},
			"text.literal": { "color": "#ce9178ff" },
			"enum": { "color": "#4ec9b0ff" },
			"property": { "color": "#9cdcfeff" },
			"label": { "color": "#C8C8C8" },
			"constructor": { "color": "#dcdcaaff" },
			"namespace": { "color": "#4ec9b0ff" },
			"diff.minus": { "color": "#ce9178ff" },
			"diff.plus": { "color": "#b5cea8ff" },
			"embedded": { "color": "#d4d4d4ff" },
			"selector": { "color": "#d7ba7dff" },
			"selector.pseudo": { "color": "#D7BA7D" },
			"variant": { "color": "#4fc1ffff" },
			"string.special": { "color": "#ce9178ff" },
			"punctuation.markup": { "color": "#d4d4d4ff" },
			"primary": { "color": "#d4d4d4ff" },
			"link_uri": { "color": "#d4d4d4ff" },
			"hint": { "color": "#d4d4d466" },
			"predictive": { "color": "#d4d4d466" },
			"string.special.symbol": { "color": "#d4d4d4ff" },
			"keyword.control": { "color": "#C586C0" },
			"keyword.import": { "color": "#C586C0" },
			"tag.doctype": { "color": "#d4d4d4ff" },
			"punctuation.bracket.html": { "color": "#808080" },
			"punctuation.bracket.jsx": { "color": "#808080" },
			"punctuation.delimiter.html": { "color": "#808080" },
			"punctuation.delimiter.jsx": { "color": "#808080" },
			"tag.component.jsx": { "color": "#4EC9B0" }
		},
		"created": "#81b88b",
		"deleted": "#c74e39",
		"modified": "#E2C08D"
	}
};
var dracula_soft_default = {
	name: "Dracula Theme Soft",
	appearance: "dark",
	style: {
		"background": "#282A36",
		"editor.background": "#282A36",
		"text": "#f6f6f4",
		"editor.foreground": "#f6f6f4",
		"search.match_background": "#FFB86C80",
		"error": "#ee6666",
		"warning": "#97e1f1",
		"players": [{
			"cursor": "#f6f6f4",
			"selection": "#44475A"
		}],
		"deleted": "#ee6666",
		"modified": "#97e1f1",
		"terminal.ansi.green": "#62e884",
		"terminal.ansi.red": "#ee6666",
		"terminal.ansi.blue": "#bf9eee",
		"syntax": {
			"attribute": {
				"color": "#62e884",
				"font_style": "italic"
			},
			"comment": { "color": "#7b7f8b" },
			"comment.doc": { "color": "#7b7f8b" },
			"constant": { "color": "#bf9eee" },
			"constructor": { "color": "#f286c4" },
			"emphasis": {
				"color": "#e7ee98",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#FFB86C",
				"font_weight": 700
			},
			"function": { "color": "#62e884" },
			"keyword": { "color": "#f286c4" },
			"link_text": { "color": "#97e1f1" },
			"link_uri": { "color": "#97e1f1" },
			"number": { "color": "#bf9eee" },
			"string": { "color": "#e7ee98" },
			"string.escape": { "color": "#e7ee98" },
			"string.regex": { "color": "#e7ee98" },
			"string.special": { "color": "#e7ee98" },
			"string.special.symbol": { "color": "#e7ee98" },
			"tag": { "color": "#f286c4" },
			"text.literal": { "color": "#e7ee98" },
			"type": {
				"color": "#97e1f1",
				"font_style": "italic"
			},
			"variable": { "color": "#f6f6f4" },
			"variable.special": {
				"color": "#bf9eee",
				"font_style": "italic"
			},
			"boolean": { "color": "#BF9EEE" },
			"embedded": { "color": "#f6f6f4" },
			"label": { "color": "#f6f6f4" },
			"namespace": {
				"color": "#97e1f1",
				"font_style": "italic"
			},
			"operator": { "color": "#F286C4" },
			"predictive": { "color": "#7b7f8b" },
			"preproc": { "color": "#f286c4" },
			"primary": { "color": "#f6f6f4" },
			"property": { "color": "#F6F6F4" },
			"punctuation": { "color": "#f6f6f4" },
			"selector": { "color": "#F286C4" },
			"title": {
				"color": "#BF9EEE",
				"font_weight": 700
			},
			"enum": {
				"color": "#97E1F1",
				"font_style": "italic"
			},
			"hint": { "color": "#7b7f8b" },
			"variant": { "color": "#F6F6F4" },
			"diff.minus": { "color": "#EE6666" },
			"diff.plus": { "color": "#62E884" },
			"property.json_key": { "color": "#97E1F1" },
			"selector.class": {
				"color": "#62E884",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#62E884",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#62E884",
				"font_style": "italic"
			}
		}
	}
};
var dracula_default = {
	name: "Dracula Theme",
	appearance: "dark",
	style: {
		"background": "#b597e033",
		"text": "#f8f8f2ff",
		"editor.background": "#282a36ff",
		"editor.foreground": "#f8f8f2ff",
		"editor.active_line.background": "#C9A8F933",
		"editor.document_highlight.bracket_background": "#bd93f935",
		"search.match_background": "#50fa7b50",
		"players": [
			{
				"cursor": "#bd93f9ff",
				"background": "#bd93f9ff",
				"selection": "#bd93f933"
			},
			{
				"cursor": "#50fa7bff",
				"background": "#50fa7bff",
				"selection": "#50fa7b33"
			},
			{
				"cursor": "#ff79c6ff",
				"background": "#ff79c6ff",
				"selection": "#ff79c633"
			},
			{
				"cursor": "#f1fa8cff",
				"background": "#f1fa8cff",
				"selection": "#f1fa8c33"
			},
			{
				"cursor": "#8be9fdff",
				"background": "#8be9fdff",
				"selection": "#8be9fd33"
			},
			{
				"cursor": "#ffb86cff",
				"background": "#ffb86cff",
				"selection": "#ffb86c33"
			},
			{
				"cursor": "#ff5555ff",
				"background": "#ff5555ff",
				"selection": "#ff555533"
			}
		],
		"error": "#e67373ff",
		"warning": "#e6e373ff",
		"info": "#73ece5ff",
		"hint": "#6272a4ff",
		"deleted": "#FF5555",
		"modified": "#8BE9FD",
		"terminal.ansi.green": "#50FA7B",
		"terminal.ansi.red": "#FF5555",
		"terminal.ansi.blue": "#BD93F9",
		"syntax": {
			"attribute": { "color": "#8be9fdff" },
			"boolean": { "color": "#ff79c6ff" },
			"comment": { "color": "#6272a4ff" },
			"comment.doc": { "color": "#ff79c6ff" },
			"constant": { "color": "#bd93f9ff" },
			"constructor": { "color": "#ff79c6ff" },
			"embedded": { "color": "#f8f8f2ff" },
			"emphasis": {
				"color": "#f1fa8cff",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#ffb86cff",
				"font_weight": 700
			},
			"enum": { "color": "#bd93f9ff" },
			"function": { "color": "#50fa7bff" },
			"hint": {
				"color": "#6272a4ff",
				"font_style": "italic"
			},
			"keyword": { "color": "#ff79c6ff" },
			"label": { "color": "#f8f8f2ff" },
			"link_text": {
				"color": "#ff79c6ff",
				"font_style": "normal"
			},
			"link_uri": { "color": "#8be9fdff" },
			"number": { "color": "#bd93f9ff" },
			"operator": { "color": "#ff79c6ff" },
			"predictive": {
				"color": "#c6c6c2ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#6272a4ff" },
			"primary": { "color": "#f8f8f2ff" },
			"property": { "color": "#8be9fdff" },
			"punctuation": { "color": "#ff79c6ff" },
			"punctuation.bracket": { "color": "#f8f8f2ff" },
			"punctuation.delimiter": { "color": "#ff79c6ff" },
			"punctuation.list_marker": { "color": "#8be9fdff" },
			"punctuation.special": { "color": "#ff79c6ff" },
			"string": { "color": "#f1fa8cff" },
			"string.escape": { "color": "#ff79c6ff" },
			"string.regex": { "color": "#ff5555ff" },
			"string.special": { "color": "#ff79c6ff" },
			"string.special.symbol": { "color": "#bd93f9ff" },
			"tag": { "color": "#ff79c6ff" },
			"text.literal": { "color": "#50fa7bff" },
			"title": {
				"color": "#bd93f9ff",
				"font_weight": 600
			},
			"type": { "color": "#8be9fdff" },
			"type.interface": {
				"color": "#8be9fdff",
				"font_style": "italic"
			},
			"type.super": {
				"color": "#8be9fdff",
				"font_style": "italic"
			},
			"variable": { "color": "#f8f8f2ff" },
			"variable.member": { "color": "#f8f8f2ff" },
			"variable.parameter": {
				"color": "#ffb86cff",
				"font_style": "italic"
			},
			"variable.special": {
				"color": "#bd93f9ff",
				"font_style": "italic"
			},
			"variant": { "color": "#bd93f9ff" },
			"namespace": { "color": "#8be9fdff" },
			"selector": { "color": "#FF79C6" },
			"diff.minus": { "color": "#FF5555" },
			"diff.plus": { "color": "#50FA7B" },
			"selector.class": {
				"color": "#50FA7B",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#50FA7B",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#50FA7B",
				"font_style": "italic"
			}
		}
	}
};
var everforest_dark_default = {
	name: "Everforest Dark",
	appearance: "dark",
	style: {
		"background": "#3d484d",
		"text": "#d3c6aa",
		"editor.background": "#2d353b",
		"editor.foreground": "#d3c6aa",
		"editor.active_line.background": "#343f44",
		"editor.document_highlight.bracket_background": "#475258",
		"search.match_background": "#475258",
		"players": [{
			"background": "#e67e80",
			"cursor": "#e67e80",
			"selection": "#543a48"
		}],
		"error": "#e67e80",
		"warning": "#dbbc7f",
		"info": "#a7c080",
		"hint": "#d699b6",
		"created": "#a7c080a0",
		"deleted": "#e67e80a0",
		"modified": "#7fbbb3a0",
		"terminal.ansi.green": "#a7c080",
		"terminal.ansi.red": "#e67e80",
		"terminal.ansi.blue": "#7fbbb3",
		"syntax": {
			"attribute": { "color": "#d699b6" },
			"boolean": { "color": "#d699b6" },
			"comment": { "color": "#859289" },
			"comment.doc": { "color": "#9da9a0" },
			"constant": { "color": "#d3c6aa" },
			"constant.builtin": { "color": "#83c092" },
			"constructor": { "color": "#a7c080" },
			"embedded": { "color": "#a7c080" },
			"emphasis": {
				"color": "#83c092",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#83c092",
				"font_weight": 600
			},
			"enum": { "color": "#dbbc7f" },
			"function": { "color": "#a7c080" },
			"function.builtin": { "color": "#a7c080" },
			"hint": { "color": "#d699b6" },
			"keyword": { "color": "#e67e80" },
			"label": { "color": "#e69875" },
			"link_text": { "color": "#dbbc7f" },
			"link_uri": { "color": "#7fbbb3" },
			"namespace": { "color": "#dbbc7f" },
			"number": { "color": "#d699b6" },
			"operator": { "color": "#e69875" },
			"predictive": { "color": "#859289" },
			"preproc": { "color": "#d699b6" },
			"primary": { "color": "#d3c6aa" },
			"property": { "color": "#7fbbb3" },
			"punctuation": { "color": "#859289" },
			"punctuation.bracket": { "color": "#d3c6aa" },
			"punctuation.delimiter": { "color": "#859289" },
			"punctuation.list_marker": { "color": "#7fbbb3" },
			"punctuation.markup": { "color": "#859289" },
			"punctuation.special": { "color": "#7fbbb3" },
			"selector": { "color": "#e67e80" },
			"selector.pseudo": { "color": "#d699b6" },
			"string": { "color": "#83c092" },
			"string.escape": { "color": "#a7c080" },
			"string.regex": { "color": "#a7c080" },
			"string.special": { "color": "#dbbc7f" },
			"string.special.symbol": { "color": "#d3c6aa" },
			"tag": { "color": "#e69875" },
			"tag.doctype": { "color": "#d699b6" },
			"text.literal": { "color": "#a7c080" },
			"title": { "color": "#e69875" },
			"type": { "color": "#dbbc7f" },
			"variable": { "color": "#d3c6aa" },
			"variable.special": { "color": "#d699b6" },
			"variant": { "color": "#d3c6aa" },
			"diff.minus": { "color": "#e67e80a0" },
			"diff.plus": { "color": "#a7c080a0" }
		}
	}
};
var everforest_light_default = {
	name: "Everforest Light",
	appearance: "light",
	style: {
		"background": "#efebd4",
		"text": "#5c6a72",
		"editor.background": "#fdf6e3",
		"editor.foreground": "#5c6a72",
		"editor.active_line.background": "#f4f0d9",
		"editor.document_highlight.bracket_background": "#e6e2cc",
		"search.match_background": "#e6e2cc",
		"players": [{
			"background": "#e66868",
			"cursor": "#e66868",
			"selection": "#eaedc8"
		}],
		"error": "#f85552",
		"warning": "#dfa000",
		"info": "#8da101",
		"hint": "#df69ba",
		"created": "#8da101a0",
		"deleted": "#f85552a0",
		"modified": "#3a94c5a0",
		"terminal.ansi.green": "#8da101",
		"terminal.ansi.red": "#f85552",
		"terminal.ansi.blue": "#3a94c5",
		"syntax": {
			"attribute": { "color": "#df69ba" },
			"boolean": { "color": "#df69ba" },
			"comment": { "color": "#939f91" },
			"comment.doc": { "color": "#829181" },
			"constant": { "color": "#5c6a72" },
			"constant.builtin": { "color": "#35a77c" },
			"constructor": { "color": "#8da101" },
			"embedded": { "color": "#8da101" },
			"emphasis": {
				"color": "#35a77c",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#35a77c",
				"font_weight": 600
			},
			"enum": { "color": "#dfa000" },
			"function": { "color": "#8da101" },
			"function.builtin": { "color": "#8da101" },
			"hint": { "color": "#df69ba" },
			"keyword": { "color": "#f85552" },
			"label": { "color": "#f57d26" },
			"link_text": { "color": "#dfa000" },
			"link_uri": { "color": "#3a94c5" },
			"namespace": { "color": "#dfa000" },
			"number": { "color": "#df69ba" },
			"operator": { "color": "#f57d26" },
			"predictive": { "color": "#939f91" },
			"preproc": { "color": "#df69ba" },
			"primary": { "color": "#5c6a72" },
			"property": { "color": "#3a94c5" },
			"punctuation": { "color": "#939f91" },
			"punctuation.bracket": { "color": "#5c6a72" },
			"punctuation.delimiter": { "color": "#939f91" },
			"punctuation.list_marker": { "color": "#3a94c5" },
			"punctuation.markup": { "color": "#939f91" },
			"punctuation.special": { "color": "#3a94c5" },
			"selector": { "color": "#f85552" },
			"selector.pseudo": { "color": "#df69ba" },
			"string": { "color": "#35a77c" },
			"string.escape": { "color": "#8da101" },
			"string.regex": { "color": "#8da101" },
			"string.special": { "color": "#dfa000" },
			"string.special.symbol": { "color": "#5c6a72" },
			"tag": { "color": "#f57d26" },
			"tag.doctype": { "color": "#df69ba" },
			"text.literal": { "color": "#8da101" },
			"title": { "color": "#f57d26" },
			"type": { "color": "#dfa000" },
			"variable": { "color": "#5c6a72" },
			"variable.special": { "color": "#df69ba" },
			"variant": { "color": "#5c6a72" },
			"diff.minus": { "color": "#f85552a0" },
			"diff.plus": { "color": "#8da101a0" }
		}
	}
};
var github_dark_default_default = {
	name: "GitHub Dark Default",
	appearance: "dark",
	style: {
		"background": "#0d1117",
		"text": "#e6edf3",
		"editor.background": "#0d1117",
		"editor.foreground": "#e6edf3",
		"editor.active_line.background": "#6e76811a",
		"players": [],
		"warning": "#fbe557",
		"hint": "#7d8590",
		"created": "#3fb950",
		"deleted": "#f85149",
		"modified": "#d29922",
		"terminal.ansi.green": "#3fb950",
		"terminal.ansi.red": "#ff7b72",
		"terminal.ansi.blue": "#58a6ff",
		"syntax": {
			"boolean": { "color": "#79c0ff" },
			"comment": { "color": "#8b949e" },
			"comment.doc": { "color": "#8b949e" },
			"constant": { "color": "#79c0ff" },
			"constructor": { "color": "#7ee787" },
			"emphasis": {
				"color": "#e6edf3",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#e6edf3",
				"font_weight": 700
			},
			"function": { "color": "#d2a8ff" },
			"keyword": { "color": "#ff7b72" },
			"label": { "color": "#ffa657" },
			"link_text": { "color": "#a5d6ff" },
			"link_uri": { "color": "#a5d6ff" },
			"number": { "color": "#79c0ff" },
			"string": { "color": "#a5d6ff" },
			"string.escape": { "color": "#ff7b72" },
			"string.regex": { "color": "#a5d6ff" },
			"string.special": { "color": "#a5d6ff" },
			"string.special.symbol": { "color": "#a5d6ff" },
			"tag": { "color": "#7ee787" },
			"text.literal": { "color": "#a5d6ff" },
			"title": { "color": "#ffa657" },
			"variable": { "color": "#e6edf3" },
			"type": { "color": "#79c0ff" },
			"variable.special": { "color": "#79c0ff" },
			"attribute": { "color": "#79C0FF" },
			"embedded": { "color": "#e6edf3" },
			"namespace": { "color": "#FFA657" },
			"operator": { "color": "#FF7B72" },
			"predictive": { "color": "#8b949e" },
			"preproc": { "color": "#ff7b72" },
			"primary": { "color": "#e6edf3" },
			"property": { "color": "#e6edf3" },
			"punctuation": { "color": "#e6edf3" },
			"selector": { "color": "#7EE787" },
			"enum": { "color": "#FFA657" },
			"hint": { "color": "#7d8590" },
			"variant": { "color": "#79C0FF" },
			"diff.minus": { "color": "#FFA198" },
			"diff.plus": { "color": "#7EE787" },
			"property.json_key": { "color": "#7EE787" },
			"punctuation.list_marker": { "color": "#FFA657" },
			"punctuation.special": { "color": "#FF7B72" },
			"selector.class": { "color": "#79C0FF" },
			"selector.id": { "color": "#79C0FF" },
			"selector.pseudo": { "color": "#79C0FF" },
			"punctuation.delimiter.jsx": { "color": "#FF7B72" },
			"variable.parameter": { "color": "#FFA657" }
		}
	}
};
var github_dark_dimmed_default = {
	name: "GitHub Dark Dimmed",
	appearance: "dark",
	style: {
		"background": "#212830ff",
		"text": "#d1d7e0ff",
		"editor.background": "#212830ff",
		"editor.foreground": "#d1d7e0ff",
		"editor.active_line.background": "#262c36ff",
		"search.match_background": "#eac55f4d",
		"players": [
			{
				"cursor": "#0576ffff",
				"background": "#0576ffff",
				"selection": "#0576ff66"
			},
			{
				"cursor": "#2f6f37ff",
				"background": "#2f6f37ff",
				"selection": "#2f6f3766"
			},
			{
				"cursor": "#895906ff",
				"background": "#895906ff",
				"selection": "#89590666"
			},
			{
				"cursor": "#eb3342ff",
				"background": "#eb3342ff",
				"selection": "#eb334266"
			},
			{
				"cursor": "#d34591ff",
				"background": "#d34591ff",
				"selection": "#d3459166"
			},
			{
				"cursor": "#975bf1ff",
				"background": "#975bf1ff",
				"selection": "#975bf166"
			}
		],
		"error": "#e5534bff",
		"warning": "#c69026ff",
		"info": "#c69026ff",
		"hint": "#9198a1ff",
		"created": "#57ab5a",
		"deleted": "#e5534b",
		"modified": "#c69026",
		"terminal.ansi.green": "#57ab5a",
		"terminal.ansi.red": "#f47067",
		"terminal.ansi.blue": "#539bf5",
		"syntax": {
			"attribute": { "color": "#6cb6ffff" },
			"boolean": { "color": "#6cb6ffff" },
			"comment": { "color": "#9198a1ff" },
			"comment.doc": { "color": "#9198a1ff" },
			"constant": { "color": "#6cb6ffff" },
			"constructor": { "color": "#f47067ff" },
			"embedded": { "color": "#f47067ff" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"enum": { "color": "#f69d50ff" },
			"function": { "color": "#dcbdfbff" },
			"function.method": { "color": "#dcbdfbff" },
			"function.special.definition": { "color": "#dcbdfbff" },
			"hint": {
				"color": "#9198a1ff",
				"font_weight": 700
			},
			"keyword": { "color": "#f47067ff" },
			"keyword.operator": { "color": "#f47067ff" },
			"label": { "color": "#6cb6ffff" },
			"link_text": {
				"color": "#96d0ffff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#6cb6ffff" },
			"number": { "color": "#6cb6ffff" },
			"operator": { "color": "#f47067ff" },
			"predictive": {
				"color": "#9198a1ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#f47067ff" },
			"primary": { "color": "#d1d7e0ff" },
			"property": { "color": "#d1d7e0ff" },
			"property.json_key": { "color": "#8ddb8cff" },
			"punctuation": { "color": "#f47067ff" },
			"punctuation.bracket": { "color": "#d1d7e0ff" },
			"punctuation.delimiter": { "color": "#d1d7e0ff" },
			"punctuation.delimiter.jsx": { "color": "#f47067ff" },
			"punctuation.list_marker": { "color": "#f69d50ff" },
			"punctuation.special": { "color": "#f47067ff" },
			"string": { "color": "#96d0ffff" },
			"string.escape": { "color": "#f47067ff" },
			"string.regex": { "color": "#96d0ffff" },
			"string.special": { "color": "#6cb6ffff" },
			"string.special.symbol": { "color": "#6cb6ffff" },
			"tag": { "color": "#8ddb8cff" },
			"text.literal": { "color": "#6cb6ffff" },
			"title": {
				"color": "#6cb6ffff",
				"font_weight": 700
			},
			"type": { "color": "#f69d50ff" },
			"type.builtin": { "color": "#6cb6ffff" },
			"variable": { "color": "#d1d7e0ff" },
			"variable.builtin": { "color": "#6cb6ffff" },
			"variable.parameter": { "color": "#f69d50ff" },
			"variable.special": { "color": "#6cb6ffff" },
			"variant": { "color": "#f69d50ff" },
			"namespace": { "color": "#F69D50" },
			"selector": { "color": "#8DDB8C" },
			"diff.minus": { "color": "#FF938A" },
			"diff.plus": { "color": "#8DDB8C" },
			"selector.class": { "color": "#6CB6FF" },
			"selector.id": { "color": "#6CB6FF" },
			"selector.pseudo": { "color": "#6CB6FF" }
		}
	}
};
var github_dark_high_contrast_default = {
	name: "GitHub Dark High Contrast",
	appearance: "dark",
	style: {
		"background": "#010409ff",
		"text": "#ffffffff",
		"editor.background": "#010409ff",
		"editor.foreground": "#ffffffff",
		"editor.active_line.background": "#151b23ff",
		"search.match_background": "#fbd6694d",
		"players": [
			{
				"cursor": "#0576ffff",
				"background": "#0576ffff",
				"selection": "#0576ff66"
			},
			{
				"cursor": "#2f6f37ff",
				"background": "#2f6f37ff",
				"selection": "#2f6f3766"
			},
			{
				"cursor": "#895906ff",
				"background": "#895906ff",
				"selection": "#89590666"
			},
			{
				"cursor": "#eb3342ff",
				"background": "#eb3342ff",
				"selection": "#eb334266"
			},
			{
				"cursor": "#d34591ff",
				"background": "#d34591ff",
				"selection": "#d3459166"
			},
			{
				"cursor": "#975bf1ff",
				"background": "#975bf1ff",
				"selection": "#975bf166"
			}
		],
		"error": "#ff9492ff",
		"warning": "#f0b72fff",
		"info": "#f0b72fff",
		"hint": "#b7bdc8ff",
		"created": "#26cd4d",
		"deleted": "#ff6a69",
		"modified": "#f0b72f",
		"terminal.ansi.green": "#26cd4d",
		"terminal.ansi.red": "#ff9492",
		"terminal.ansi.blue": "#71b7ff",
		"syntax": {
			"attribute": { "color": "#91cbffff" },
			"boolean": { "color": "#91cbffff" },
			"comment": { "color": "#9198a1ff" },
			"comment.doc": { "color": "#9198a1ff" },
			"constant": { "color": "#91cbffff" },
			"constructor": { "color": "#ff9492ff" },
			"embedded": { "color": "#ff9492ff" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"enum": { "color": "#ffb757ff" },
			"function": { "color": "#dbb7ffff" },
			"function.method": { "color": "#dbb7ffff" },
			"function.special.definition": { "color": "#dbb7ffff" },
			"hint": {
				"color": "#b7bdc8ff",
				"font_weight": 700
			},
			"keyword": { "color": "#ff9492ff" },
			"keyword.operator": { "color": "#ff9492ff" },
			"label": { "color": "#91cbffff" },
			"link_text": {
				"color": "#addcffff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#91cbffff" },
			"number": { "color": "#91cbffff" },
			"operator": { "color": "#ff9492ff" },
			"predictive": {
				"color": "#b7bdc8ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#ff9492ff" },
			"primary": { "color": "#ffffffff" },
			"property": { "color": "#ffffffff" },
			"property.json_key": { "color": "#72f088ff" },
			"punctuation": { "color": "#ff9492ff" },
			"punctuation.bracket": { "color": "#ffffffff" },
			"punctuation.delimiter": { "color": "#ffffffff" },
			"punctuation.delimiter.jsx": { "color": "#ff9492ff" },
			"punctuation.list_marker": { "color": "#ffb757ff" },
			"punctuation.special": { "color": "#ff9492ff" },
			"string": { "color": "#addcffff" },
			"string.escape": { "color": "#ff9492ff" },
			"string.regex": { "color": "#addcffff" },
			"string.special": { "color": "#91cbffff" },
			"string.special.symbol": { "color": "#91cbffff" },
			"tag": { "color": "#72f088ff" },
			"text.literal": { "color": "#91cbffff" },
			"title": {
				"color": "#91cbffff",
				"font_weight": 700
			},
			"type": { "color": "#ffb757ff" },
			"type.builtin": { "color": "#91cbffff" },
			"variable": { "color": "#ffffffff" },
			"variable.builtin": { "color": "#91cbffff" },
			"variable.parameter": { "color": "#ffb757ff" },
			"variable.special": { "color": "#91cbffff" },
			"variant": { "color": "#ffb757ff" },
			"namespace": { "color": "#FFB757" },
			"selector": { "color": "#72F088" },
			"diff.minus": { "color": "#FFB1AF" },
			"diff.plus": { "color": "#72F088" },
			"selector.class": { "color": "#91CBFF" },
			"selector.id": { "color": "#91CBFF" },
			"selector.pseudo": { "color": "#91CBFF" }
		}
	}
};
var github_dark_default = {
	name: "GitHub Dark",
	appearance: "dark",
	style: {
		"background": "#24292e",
		"text": "#d1d5da",
		"editor.background": "#24292e",
		"editor.foreground": "#e1e4e8",
		"editor.active_line.background": "#2b3036",
		"editor.document_highlight.bracket_background": "#17E5E611",
		"search.match_background": "#ffd33d1a",
		"players": [
			{
				"cursor": "#79b8ff",
				"selection": "#04428933",
				"background": "#79b8ff"
			},
			{
				"cursor": "#d1d5da",
				"selection": "#444d5633",
				"background": "#d1d5da"
			},
			{
				"cursor": "#85e89d",
				"selection": "#176f2c33",
				"background": "#85e89d"
			},
			{
				"cursor": "#ffab70",
				"selection": "#d1570433",
				"background": "#ffab70"
			},
			{
				"cursor": "#f692ce",
				"selection": "#b93a8633",
				"background": "#f692ce"
			},
			{
				"cursor": "#b392f0",
				"selection": "#4c288933",
				"background": "#b392f0"
			},
			{
				"cursor": "#f97583",
				"selection": "#b31d2833",
				"background": "#f97583"
			},
			{
				"cursor": "#ffea7f",
				"selection": "#dbab0933",
				"background": "#ffea7f"
			}
		],
		"error": "#f97583",
		"warning": "#ffea7f",
		"info": "#79b8ff",
		"hint": "#848d97",
		"created": "#34d058",
		"deleted": "#ea4a5a",
		"modified": "#79b8ff",
		"terminal.ansi.green": "#34d058",
		"terminal.ansi.red": "#ea4a5a",
		"terminal.ansi.blue": "#2188ff",
		"syntax": {
			"boolean": { "color": "#79b8ff" },
			"comment": { "color": "#6a737d" },
			"comment.doc": { "color": "#6a737d" },
			"comment.documentation": { "color": "#6a737d" },
			"constant": { "color": "#79b8ff" },
			"constant.builtin": { "color": "#79b8ff" },
			"constructor": { "color": "#85e89d" },
			"emphasis": {
				"color": "#e1e4e8",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#e1e4e8",
				"font_weight": 700
			},
			"enum": { "color": "#79b8ff" },
			"function": { "color": "#b392f0" },
			"function.builtin": { "color": "#b392f0" },
			"function.method": { "color": "#b392f0" },
			"function.method.call": { "color": "#b392f0" },
			"keyword": { "color": "#f97583" },
			"keyword.operator": { "color": "#f97583" },
			"label": { "color": "#b392f0" },
			"link_text": { "color": "#dbedff" },
			"link_uri": { "color": "#dbedff" },
			"number": { "color": "#79b8ff" },
			"operator": { "color": "#f97583" },
			"property": { "color": "#79b8ff" },
			"punctuation.bracket": { "color": "#79b8ff" },
			"punctuation.delimiter": { "color": "#f97583" },
			"string": { "color": "#9ecbff" },
			"string.escape": { "color": "#9ecbff" },
			"string.regex": { "color": "#9ecbff" },
			"string.regexp": { "color": "#9ecbff" },
			"string.special": { "color": "#9ecbff" },
			"string.special.symbol": { "color": "#9ecbff" },
			"tag": { "color": "#85e89d" },
			"text.literal": { "color": "#9ecbff" },
			"title": { "color": "#b392f0" },
			"type": { "color": "#b392f0" },
			"type.builtin": { "color": "#b392f0" },
			"type.class.definition": { "color": "#b392f0" },
			"variable": { "color": "#e1e4e8" },
			"variable.member": { "color": "#ffab70" },
			"attribute": { "color": "#B392F0" },
			"embedded": { "color": "#e1e4e8" },
			"namespace": { "color": "#B392F0" },
			"predictive": { "color": "#6a737d" },
			"preproc": { "color": "#f97583" },
			"primary": { "color": "#e1e4e8" },
			"punctuation": { "color": "#e1e4e8" },
			"selector": { "color": "#85E89D" },
			"hint": { "color": "#848d97" },
			"variant": { "color": "#79B8FF" },
			"diff.minus": { "color": "#FDAEB7" },
			"diff.plus": { "color": "#85E89D" },
			"punctuation.list_marker": { "color": "#FFAB70" },
			"selector.class": { "color": "#B392F0" },
			"selector.id": { "color": "#B392F0" },
			"selector.pseudo": { "color": "#B392F0" }
		}
	}
};
var github_light_default_default = {
	name: "GitHub Light Default",
	appearance: "light",
	style: {
		"background": "#ffffffff",
		"text": "#1f2328ff",
		"editor.background": "#ffffffff",
		"editor.foreground": "#1f2328ff",
		"editor.active_line.background": "#f6f8faff",
		"search.match_background": "#fae17d4d",
		"players": [
			{
				"cursor": "#006edbff",
				"background": "#006edbff",
				"selection": "#006edb66"
			},
			{
				"cursor": "#30a147ff",
				"background": "#30a147ff",
				"selection": "#30a14766"
			},
			{
				"cursor": "#b88700ff",
				"background": "#b88700ff",
				"selection": "#b8870066"
			},
			{
				"cursor": "#df0c24ff",
				"background": "#df0c24ff",
				"selection": "#df0c2466"
			},
			{
				"cursor": "#ce2c85ff",
				"background": "#ce2c85ff",
				"selection": "#ce2c8566"
			},
			{
				"cursor": "#894cebff",
				"background": "#894cebff",
				"selection": "#894ceb66"
			}
		],
		"error": "#d1242fff",
		"warning": "#9a6700ff",
		"info": "#9a6700ff",
		"hint": "#59636eff",
		"created": "#1a7f37",
		"deleted": "#cf222e",
		"modified": "#9a6700",
		"terminal.ansi.green": "#116329",
		"terminal.ansi.red": "#cf222e",
		"terminal.ansi.blue": "#0969da",
		"syntax": {
			"attribute": { "color": "#0550aeff" },
			"boolean": { "color": "#0550aeff" },
			"comment": { "color": "#59636eff" },
			"comment.doc": { "color": "#59636eff" },
			"constant": { "color": "#0550aeff" },
			"constructor": { "color": "#cf222eff" },
			"embedded": { "color": "#cf222eff" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"enum": { "color": "#953800ff" },
			"function": { "color": "#8250dfff" },
			"function.method": { "color": "#8250dfff" },
			"function.special.definition": { "color": "#8250dfff" },
			"hint": {
				"color": "#59636eff",
				"font_weight": 700
			},
			"keyword": { "color": "#cf222eff" },
			"keyword.operator": { "color": "#cf222eff" },
			"label": { "color": "#0550aeff" },
			"link_text": {
				"color": "#0a3069ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#0550aeff" },
			"number": { "color": "#0550aeff" },
			"operator": { "color": "#cf222eff" },
			"predictive": {
				"color": "#59636eff",
				"font_style": "italic"
			},
			"preproc": { "color": "#cf222eff" },
			"primary": { "color": "#1f2328ff" },
			"property": { "color": "#1f2328ff" },
			"property.json_key": { "color": "#116329ff" },
			"punctuation": { "color": "#cf222eff" },
			"punctuation.bracket": { "color": "#1f2328ff" },
			"punctuation.delimiter": { "color": "#1f2328ff" },
			"punctuation.delimiter.jsx": { "color": "#cf222eff" },
			"punctuation.list_marker": { "color": "#953800ff" },
			"punctuation.special": { "color": "#cf222eff" },
			"string": { "color": "#0a3069ff" },
			"string.escape": { "color": "#cf222eff" },
			"string.regex": { "color": "#0a3069ff" },
			"string.special": { "color": "#0550aeff" },
			"string.special.symbol": { "color": "#0550aeff" },
			"tag": { "color": "#116329ff" },
			"text.literal": { "color": "#0550aeff" },
			"title": {
				"color": "#0550aeff",
				"font_weight": 700
			},
			"type": { "color": "#953800ff" },
			"type.builtin": { "color": "#0550aeff" },
			"variable": { "color": "#1f2328ff" },
			"variable.builtin": { "color": "#0550aeff" },
			"variable.parameter": { "color": "#953800ff" },
			"variable.special": { "color": "#0550aeff" },
			"variant": { "color": "#953800ff" },
			"namespace": { "color": "#953800" },
			"selector": { "color": "#116329" },
			"diff.minus": { "color": "#82071E" },
			"diff.plus": { "color": "#116329" },
			"selector.class": { "color": "#0550AE" },
			"selector.id": { "color": "#0550AE" },
			"selector.pseudo": { "color": "#0550AE" }
		}
	}
};
var github_light_high_contrast_default = {
	name: "GitHub Light High Contrast",
	appearance: "light",
	style: {
		"background": "#ffffffff",
		"text": "#010409ff",
		"editor.background": "#ffffffff",
		"editor.foreground": "#010409ff",
		"editor.active_line.background": "#e6eaefff",
		"search.match_background": "#f0ce534d",
		"players": [
			{
				"cursor": "#006edbff",
				"background": "#006edbff",
				"selection": "#006edb66"
			},
			{
				"cursor": "#30a147ff",
				"background": "#30a147ff",
				"selection": "#30a14766"
			},
			{
				"cursor": "#b88700ff",
				"background": "#b88700ff",
				"selection": "#b8870066"
			},
			{
				"cursor": "#df0c24ff",
				"background": "#df0c24ff",
				"selection": "#df0c2466"
			},
			{
				"cursor": "#ce2c85ff",
				"background": "#ce2c85ff",
				"selection": "#ce2c8566"
			},
			{
				"cursor": "#894cebff",
				"background": "#894cebff",
				"selection": "#894ceb66"
			}
		],
		"error": "#86061dff",
		"warning": "#603700ff",
		"info": "#603700ff",
		"hint": "#454c54ff",
		"created": "#055d20",
		"deleted": "#a0111f",
		"modified": "#744500",
		"terminal.ansi.green": "#024c1a",
		"terminal.ansi.red": "#a0111f",
		"terminal.ansi.blue": "#0349b4",
		"syntax": {
			"attribute": { "color": "#023b95ff" },
			"boolean": { "color": "#023b95ff" },
			"comment": { "color": "#59636eff" },
			"comment.doc": { "color": "#59636eff" },
			"constant": { "color": "#023b95ff" },
			"constructor": { "color": "#a0111fff" },
			"embedded": { "color": "#a0111fff" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"enum": { "color": "#702c00ff" },
			"function": { "color": "#622cbcff" },
			"function.method": { "color": "#622cbcff" },
			"function.special.definition": { "color": "#622cbcff" },
			"hint": {
				"color": "#454c54ff",
				"font_weight": 700
			},
			"keyword": { "color": "#a0111fff" },
			"keyword.operator": { "color": "#a0111fff" },
			"label": { "color": "#023b95ff" },
			"link_text": {
				"color": "#032563ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#023b95ff" },
			"number": { "color": "#023b95ff" },
			"operator": { "color": "#a0111fff" },
			"predictive": {
				"color": "#454c54ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#a0111fff" },
			"primary": { "color": "#010409ff" },
			"property": { "color": "#010409ff" },
			"property.json_key": { "color": "#024c1aff" },
			"punctuation": { "color": "#a0111fff" },
			"punctuation.bracket": { "color": "#010409ff" },
			"punctuation.delimiter": { "color": "#010409ff" },
			"punctuation.delimiter.jsx": { "color": "#a0111fff" },
			"punctuation.list_marker": { "color": "#702c00ff" },
			"punctuation.special": { "color": "#a0111fff" },
			"string": { "color": "#032563ff" },
			"string.escape": { "color": "#a0111fff" },
			"string.regex": { "color": "#032563ff" },
			"string.special": { "color": "#023b95ff" },
			"string.special.symbol": { "color": "#023b95ff" },
			"tag": { "color": "#024c1aff" },
			"text.literal": { "color": "#023b95ff" },
			"title": {
				"color": "#023b95ff",
				"font_weight": 700
			},
			"type": { "color": "#702c00ff" },
			"type.builtin": { "color": "#023b95ff" },
			"variable": { "color": "#010409ff" },
			"variable.builtin": { "color": "#023b95ff" },
			"variable.parameter": { "color": "#702c00ff" },
			"variable.special": { "color": "#023b95ff" },
			"variant": { "color": "#702c00ff" },
			"namespace": { "color": "#702C00" },
			"selector": { "color": "#024C1A" },
			"diff.minus": { "color": "#6E011A" },
			"diff.plus": { "color": "#024C1A" },
			"selector.class": { "color": "#023B95" },
			"selector.id": { "color": "#023B95" },
			"selector.pseudo": { "color": "#023B95" }
		}
	}
};
var github_light_default = {
	name: "GitHub Light",
	appearance: "light",
	style: {
		"background": "#ffffff",
		"text": "#444d56",
		"editor.background": "#ffffff",
		"editor.foreground": "#24292e",
		"editor.active_line.background": "#f6f8fa",
		"editor.document_highlight.bracket_background": "#34d05840",
		"search.match_background": "#ffdf5d",
		"players": [
			{
				"cursor": "#005cc5",
				"selection": "#79b8ff33",
				"background": "#005cc5"
			},
			{
				"cursor": "#586069",
				"selection": "#e1e4e833",
				"background": "#586069"
			},
			{
				"cursor": "#22863a",
				"selection": "#bef5cb33",
				"background": "#22863a"
			},
			{
				"cursor": "#e36209",
				"selection": "#ffd1ac33",
				"background": "#e36209"
			},
			{
				"cursor": "#d03592",
				"selection": "#f9b3dd33",
				"background": "#d03592"
			},
			{
				"cursor": "#5a32a3",
				"selection": "#d1bcf933",
				"background": "#5a32a3"
			},
			{
				"cursor": "#cb2431",
				"selection": "#fdaeb733",
				"background": "#cb2431"
			},
			{
				"cursor": "#f9c513",
				"selection": "#fff5b133",
				"background": "#f9c513"
			}
		],
		"error": "#cb2431",
		"warning": "#f9c513",
		"info": "#005cc5",
		"hint": "#848d97",
		"created": "#28a745",
		"deleted": "#d73a49",
		"modified": "#005cc5",
		"terminal.ansi.green": "#28a745",
		"terminal.ansi.red": "#d73a49",
		"terminal.ansi.blue": "#0366d6",
		"syntax": {
			"boolean": { "color": "#005cc5" },
			"comment": { "color": "#6a737d" },
			"comment.doc": { "color": "#6a737d" },
			"comment.documentation": { "color": "#6a737d" },
			"constant": { "color": "#005cc5" },
			"constant.builtin": { "color": "#005cc5" },
			"constructor": { "color": "#22863a" },
			"emphasis": {
				"color": "#24292e",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#24292e",
				"font_weight": 700
			},
			"enum": { "color": "#005cc5" },
			"function": { "color": "#6f42c1" },
			"function.builtin": { "color": "#6f42c1" },
			"function.method": { "color": "#6f42c1" },
			"function.method.call": { "color": "#6f42c1" },
			"keyword": { "color": "#d73a49" },
			"keyword.operator": { "color": "#d73a49" },
			"label": { "color": "#6f42c1" },
			"link_text": { "color": "#032f62" },
			"link_uri": { "color": "#032f62" },
			"number": { "color": "#005cc5" },
			"operator": { "color": "#d73a49" },
			"property": { "color": "#005cc5" },
			"punctuation.bracket": { "color": "#005cc5" },
			"punctuation.delimiter": { "color": "#d73a49" },
			"string": { "color": "#032f62" },
			"string.escape": { "color": "#032f62" },
			"string.regex": { "color": "#032f62" },
			"string.regexp": { "color": "#032f62" },
			"string.special": { "color": "#032f62" },
			"string.special.symbol": { "color": "#032f62" },
			"tag": { "color": "#22863a" },
			"text.literal": { "color": "#032f62" },
			"title": { "color": "#6f42c1" },
			"type": { "color": "#6f42c1" },
			"type.builtin": { "color": "#6f42c1" },
			"type.class.definition": { "color": "#6f42c1" },
			"variable": { "color": "#24292e" },
			"variable.member": { "color": "#e36209" },
			"attribute": { "color": "#6F42C1" },
			"embedded": { "color": "#24292e" },
			"namespace": { "color": "#6F42C1" },
			"predictive": { "color": "#6a737d" },
			"preproc": { "color": "#d73a49" },
			"primary": { "color": "#24292e" },
			"punctuation": { "color": "#24292e" },
			"selector": { "color": "#22863A" },
			"hint": { "color": "#848d97" },
			"variant": { "color": "#005CC5" },
			"diff.minus": { "color": "#B31D28" },
			"diff.plus": { "color": "#22863A" },
			"punctuation.list_marker": { "color": "#E36209" },
			"selector.class": { "color": "#6F42C1" },
			"selector.id": { "color": "#6F42C1" },
			"selector.pseudo": { "color": "#6F42C1" }
		}
	}
};
var gruvbox_dark_hard_default = {
	name: "Gruvbox Dark Hard",
	appearance: "dark",
	style: {
		"background": "#4c4642ff",
		"text": "#fbf1c7ff",
		"editor.background": "#1d2021ff",
		"editor.foreground": "#ebdbb2ff",
		"editor.active_line.background": "#393634bf",
		"search.match_background": "#83a59866",
		"players": [
			{
				"cursor": "#83a598ff",
				"background": "#83a598ff",
				"selection": "#83a5983d"
			},
			{
				"cursor": "#a89984ff",
				"background": "#a89984ff",
				"selection": "#a899843d"
			},
			{
				"cursor": "#fd801bff",
				"background": "#fd801bff",
				"selection": "#fd801b3d"
			},
			{
				"cursor": "#d3869bff",
				"background": "#d3869bff",
				"selection": "#d3869b3d"
			},
			{
				"cursor": "#8ec07cff",
				"background": "#8ec07cff",
				"selection": "#8ec07c3d"
			},
			{
				"cursor": "#fb4a35ff",
				"background": "#fb4a35ff",
				"selection": "#fb4a353d"
			},
			{
				"cursor": "#f9bd2fff",
				"background": "#f9bd2fff",
				"selection": "#f9bd2f3d"
			},
			{
				"cursor": "#b7bb26ff",
				"background": "#b7bb26ff",
				"selection": "#b7bb263d"
			}
		],
		"error": "#fb4a35ff",
		"warning": "#f9bd2fff",
		"info": "#83a598ff",
		"hint": "#6a695bff",
		"created": "#ebdbb2",
		"deleted": "#cc241d",
		"modified": "#d79921",
		"terminal.ansi.green": "#98971a",
		"terminal.ansi.red": "#cc241d",
		"terminal.ansi.blue": "#458588",
		"syntax": {
			"attribute": { "color": "#83a598ff" },
			"boolean": { "color": "#d3869bff" },
			"comment": { "color": "#a89984ff" },
			"comment.doc": { "color": "#c6b697ff" },
			"constant": { "color": "#fabd2eff" },
			"constructor": { "color": "#83a598ff" },
			"embedded": { "color": "#8ec07cff" },
			"emphasis": { "color": "#83a598ff" },
			"emphasis.strong": {
				"color": "#83a598ff",
				"font_weight": 700
			},
			"enum": { "color": "#fe7f18ff" },
			"function": { "color": "#b8bb25ff" },
			"function.builtin": { "color": "#fb4833ff" },
			"hint": { "color": "#8c957dff" },
			"keyword": { "color": "#fb4833ff" },
			"label": { "color": "#83a598ff" },
			"link_text": {
				"color": "#8ec07cff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#d3869bff" },
			"namespace": { "color": "#83a598ff" },
			"number": { "color": "#d3869bff" },
			"operator": { "color": "#8ec07cff" },
			"predictive": {
				"color": "#717363ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#fb4833ff" },
			"primary": { "color": "#ebdbb2ff" },
			"property": { "color": "#ebdbb2ff" },
			"punctuation": { "color": "#d5c4a1ff" },
			"punctuation.bracket": { "color": "#a89984ff" },
			"punctuation.delimiter": { "color": "#e5d5adff" },
			"punctuation.list_marker": { "color": "#ebdbb2ff" },
			"punctuation.markup": { "color": "#83a598ff" },
			"punctuation.special": { "color": "#e5d5adff" },
			"selector": { "color": "#fabd2eff" },
			"selector.pseudo": { "color": "#83a598ff" },
			"string": { "color": "#b8bb25ff" },
			"string.escape": { "color": "#c6b697ff" },
			"string.regex": { "color": "#fe7f18ff" },
			"string.special": { "color": "#d3869bff" },
			"string.special.symbol": { "color": "#8ec07cff" },
			"tag": { "color": "#8ec07cff" },
			"text.literal": { "color": "#83a598ff" },
			"title": {
				"color": "#b8bb25ff",
				"font_weight": 700
			},
			"type": { "color": "#fabd2eff" },
			"variable": { "color": "#ebdbb2ff" },
			"variable.parameter": { "color": "#ebdbb2ff" },
			"variable.special": { "color": "#83a598ff" },
			"variant": { "color": "#83a598ff" },
			"diff.plus": { "color": "#b8bb26ff" },
			"diff.minus": { "color": "#fb4934ff" }
		}
	}
};
var gruvbox_dark_medium_default = {
	name: "Gruvbox Dark Medium",
	appearance: "dark",
	style: {
		"background": "#4c4642ff",
		"text": "#fbf1c7ff",
		"editor.background": "#282828ff",
		"editor.foreground": "#ebdbb2ff",
		"editor.active_line.background": "#3a3735bf",
		"search.match_background": "#83a59866",
		"players": [
			{
				"cursor": "#83a598ff",
				"background": "#83a598ff",
				"selection": "#83a5983d"
			},
			{
				"cursor": "#a89984ff",
				"background": "#a89984ff",
				"selection": "#a899843d"
			},
			{
				"cursor": "#fd801bff",
				"background": "#fd801bff",
				"selection": "#fd801b3d"
			},
			{
				"cursor": "#d3869bff",
				"background": "#d3869bff",
				"selection": "#d3869b3d"
			},
			{
				"cursor": "#8ec07cff",
				"background": "#8ec07cff",
				"selection": "#8ec07c3d"
			},
			{
				"cursor": "#fb4a35ff",
				"background": "#fb4a35ff",
				"selection": "#fb4a353d"
			},
			{
				"cursor": "#f9bd2fff",
				"background": "#f9bd2fff",
				"selection": "#f9bd2f3d"
			},
			{
				"cursor": "#b7bb26ff",
				"background": "#b7bb26ff",
				"selection": "#b7bb263d"
			}
		],
		"error": "#fb4a35ff",
		"warning": "#f9bd2fff",
		"info": "#83a598ff",
		"hint": "#8c957dff",
		"created": "#ebdbb2",
		"deleted": "#cc241d",
		"modified": "#d79921",
		"terminal.ansi.green": "#98971a",
		"terminal.ansi.red": "#cc241d",
		"terminal.ansi.blue": "#458588",
		"syntax": {
			"attribute": { "color": "#83a598ff" },
			"boolean": { "color": "#d3869bff" },
			"comment": { "color": "#a89984ff" },
			"comment.doc": { "color": "#c6b697ff" },
			"constant": { "color": "#fabd2eff" },
			"constructor": { "color": "#83a598ff" },
			"embedded": { "color": "#8ec07cff" },
			"emphasis": { "color": "#83a598ff" },
			"emphasis.strong": {
				"color": "#83a598ff",
				"font_weight": 700
			},
			"enum": { "color": "#fe7f18ff" },
			"function": { "color": "#b8bb25ff" },
			"function.builtin": { "color": "#fb4833ff" },
			"hint": { "color": "#8c957dff" },
			"keyword": { "color": "#fb4833ff" },
			"label": { "color": "#83a598ff" },
			"link_text": {
				"color": "#8ec07cff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#d3869bff" },
			"namespace": { "color": "#83a598ff" },
			"number": { "color": "#d3869bff" },
			"operator": { "color": "#8ec07cff" },
			"predictive": {
				"color": "#717363ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#fb4833ff" },
			"primary": { "color": "#ebdbb2ff" },
			"property": { "color": "#ebdbb2ff" },
			"punctuation": { "color": "#d5c4a1ff" },
			"punctuation.bracket": { "color": "#a89984ff" },
			"punctuation.delimiter": { "color": "#e5d5adff" },
			"punctuation.list_marker": { "color": "#ebdbb2ff" },
			"punctuation.markup": { "color": "#83a598ff" },
			"punctuation.special": { "color": "#e5d5adff" },
			"selector": { "color": "#fabd2eff" },
			"selector.pseudo": { "color": "#83a598ff" },
			"string": { "color": "#b8bb25ff" },
			"string.escape": { "color": "#c6b697ff" },
			"string.regex": { "color": "#fe7f18ff" },
			"string.special": { "color": "#d3869bff" },
			"string.special.symbol": { "color": "#8ec07cff" },
			"tag": { "color": "#8ec07cff" },
			"text.literal": { "color": "#83a598ff" },
			"title": {
				"color": "#b8bb25ff",
				"font_weight": 700
			},
			"type": { "color": "#fabd2eff" },
			"variable": { "color": "#ebdbb2ff" },
			"variable.parameter": { "color": "#ebdbb2ff" },
			"variable.special": { "color": "#83a598ff" },
			"variant": { "color": "#83a598ff" },
			"diff.plus": { "color": "#b8bb26ff" },
			"diff.minus": { "color": "#fb4934ff" }
		}
	}
};
var gruvbox_dark_soft_default = {
	name: "Gruvbox Dark Soft",
	appearance: "dark",
	style: {
		"background": "#4c4642ff",
		"text": "#fbf1c7ff",
		"editor.background": "#32302fff",
		"editor.foreground": "#ebdbb2ff",
		"editor.active_line.background": "#3b3735bf",
		"search.match_background": "#83a59866",
		"players": [
			{
				"cursor": "#83a598ff",
				"background": "#83a598ff",
				"selection": "#83a5983d"
			},
			{
				"cursor": "#a89984ff",
				"background": "#a89984ff",
				"selection": "#a899843d"
			},
			{
				"cursor": "#fd801bff",
				"background": "#fd801bff",
				"selection": "#fd801b3d"
			},
			{
				"cursor": "#d3869bff",
				"background": "#d3869bff",
				"selection": "#d3869b3d"
			},
			{
				"cursor": "#8ec07cff",
				"background": "#8ec07cff",
				"selection": "#8ec07c3d"
			},
			{
				"cursor": "#fb4a35ff",
				"background": "#fb4a35ff",
				"selection": "#fb4a353d"
			},
			{
				"cursor": "#f9bd2fff",
				"background": "#f9bd2fff",
				"selection": "#f9bd2f3d"
			},
			{
				"cursor": "#b7bb26ff",
				"background": "#b7bb26ff",
				"selection": "#b7bb263d"
			}
		],
		"error": "#fb4a35ff",
		"warning": "#f9bd2fff",
		"info": "#83a598ff",
		"hint": "#8c957dff",
		"created": "#ebdbb2",
		"deleted": "#cc241d",
		"modified": "#d79921",
		"terminal.ansi.green": "#98971a",
		"terminal.ansi.red": "#cc241d",
		"terminal.ansi.blue": "#458588",
		"syntax": {
			"attribute": { "color": "#83a598ff" },
			"boolean": { "color": "#d3869bff" },
			"comment": { "color": "#a89984ff" },
			"comment.doc": { "color": "#c6b697ff" },
			"constant": { "color": "#fabd2eff" },
			"constructor": { "color": "#83a598ff" },
			"embedded": { "color": "#8ec07cff" },
			"emphasis": { "color": "#83a598ff" },
			"emphasis.strong": {
				"color": "#83a598ff",
				"font_weight": 700
			},
			"enum": { "color": "#fe7f18ff" },
			"function": { "color": "#b8bb25ff" },
			"function.builtin": { "color": "#fb4833ff" },
			"hint": { "color": "#8c957dff" },
			"keyword": { "color": "#fb4833ff" },
			"label": { "color": "#83a598ff" },
			"link_text": {
				"color": "#8ec07cff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#d3869bff" },
			"namespace": { "color": "#83a598ff" },
			"number": { "color": "#d3869bff" },
			"operator": { "color": "#8ec07cff" },
			"predictive": {
				"color": "#717363ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#fb4833ff" },
			"primary": { "color": "#ebdbb2ff" },
			"property": { "color": "#ebdbb2ff" },
			"punctuation": { "color": "#d5c4a1ff" },
			"punctuation.bracket": { "color": "#a89984ff" },
			"punctuation.delimiter": { "color": "#e5d5adff" },
			"punctuation.list_marker": { "color": "#ebdbb2ff" },
			"punctuation.markup": { "color": "#83a598ff" },
			"punctuation.special": { "color": "#e5d5adff" },
			"selector": { "color": "#fabd2eff" },
			"selector.pseudo": { "color": "#83a598ff" },
			"string": { "color": "#b8bb25ff" },
			"string.escape": { "color": "#c6b697ff" },
			"string.regex": { "color": "#fe7f18ff" },
			"string.special": { "color": "#d3869bff" },
			"string.special.symbol": { "color": "#8ec07cff" },
			"tag": { "color": "#8ec07cff" },
			"text.literal": { "color": "#83a598ff" },
			"title": {
				"color": "#b8bb25ff",
				"font_weight": 700
			},
			"type": { "color": "#fabd2eff" },
			"variable": { "color": "#ebdbb2ff" },
			"variable.parameter": { "color": "#ebdbb2ff" },
			"variable.special": { "color": "#83a598ff" },
			"variant": { "color": "#83a598ff" },
			"diff.plus": { "color": "#b8bb26ff" },
			"diff.minus": { "color": "#fb4934ff" }
		}
	}
};
var gruvbox_light_hard_default = {
	name: "Gruvbox Light Hard",
	appearance: "light",
	style: {
		"background": "#d9c8a4ff",
		"text": "#282828ff",
		"editor.background": "#f9f5d7ff",
		"editor.foreground": "#282828ff",
		"editor.active_line.background": "#ecddb5bf",
		"search.match_background": "#0b667866",
		"players": [
			{
				"cursor": "#0b6678ff",
				"background": "#0b6678ff",
				"selection": "#0b66783d"
			},
			{
				"cursor": "#7c6f64ff",
				"background": "#7c6f64ff",
				"selection": "#7c6f643d"
			},
			{
				"cursor": "#af3a04ff",
				"background": "#af3a04ff",
				"selection": "#af3a043d"
			},
			{
				"cursor": "#8f3f70ff",
				"background": "#8f3f70ff",
				"selection": "#8f3f703d"
			},
			{
				"cursor": "#437b59ff",
				"background": "#437b59ff",
				"selection": "#437b593d"
			},
			{
				"cursor": "#9d0308ff",
				"background": "#9d0308ff",
				"selection": "#9d03083d"
			},
			{
				"cursor": "#b57615ff",
				"background": "#b57615ff",
				"selection": "#b576153d"
			},
			{
				"cursor": "#797410ff",
				"background": "#797410ff",
				"selection": "#7974103d"
			}
		],
		"error": "#9d0308ff",
		"warning": "#b57615ff",
		"info": "#0b6678ff",
		"hint": "#677562ff",
		"created": "#3c3836",
		"deleted": "#cc241d",
		"modified": "#d79921",
		"terminal.ansi.green": "#98971a",
		"terminal.ansi.red": "#cc241d",
		"terminal.ansi.blue": "#458588",
		"syntax": {
			"attribute": { "color": "#0b6678ff" },
			"boolean": { "color": "#8f3e71ff" },
			"comment": { "color": "#7c6f64ff" },
			"comment.doc": { "color": "#5d544eff" },
			"constant": { "color": "#b57613ff" },
			"constructor": { "color": "#0b6678ff" },
			"embedded": { "color": "#427b58ff" },
			"emphasis": { "color": "#0b6678ff" },
			"emphasis.strong": {
				"color": "#0b6678ff",
				"font_weight": 700
			},
			"enum": { "color": "#af3a02ff" },
			"function": { "color": "#79740eff" },
			"function.builtin": { "color": "#9d0006ff" },
			"hint": { "color": "#677562ff" },
			"keyword": { "color": "#9d0006ff" },
			"label": { "color": "#0b6678ff" },
			"link_text": {
				"color": "#427b58ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#8f3e71ff" },
			"namespace": { "color": "#066578ff" },
			"number": { "color": "#8f3e71ff" },
			"operator": { "color": "#427b58ff" },
			"predictive": {
				"color": "#7c9780ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#9d0006ff" },
			"primary": { "color": "#282828ff" },
			"property": { "color": "#282828ff" },
			"punctuation": { "color": "#3c3836ff" },
			"punctuation.bracket": { "color": "#665c54ff" },
			"punctuation.delimiter": { "color": "#413d3aff" },
			"punctuation.list_marker": { "color": "#282828ff" },
			"punctuation.markup": { "color": "#066578ff" },
			"punctuation.special": { "color": "#413d3aff" },
			"selector": { "color": "#b57613ff" },
			"selector.pseudo": { "color": "#0b6678ff" },
			"string": { "color": "#79740eff" },
			"string.escape": { "color": "#5d544eff" },
			"string.regex": { "color": "#af3a02ff" },
			"string.special": { "color": "#8f3e71ff" },
			"string.special.symbol": { "color": "#427b58ff" },
			"tag": { "color": "#427b58ff" },
			"text.literal": { "color": "#066578ff" },
			"title": {
				"color": "#79740eff",
				"font_weight": 700
			},
			"type": { "color": "#b57613ff" },
			"variable": { "color": "#282828ff" },
			"variable.parameter": { "color": "#282828ff" },
			"variable.special": { "color": "#066578ff" },
			"variant": { "color": "#0b6678ff" },
			"diff.plus": { "color": "#79740eff" },
			"diff.minus": { "color": "#9d0006ff" }
		}
	}
};
var gruvbox_light_medium_default = {
	name: "Gruvbox Light Medium",
	appearance: "light",
	style: {
		"background": "#d9c8a4ff",
		"text": "#282828ff",
		"editor.background": "#fbf1c7ff",
		"editor.foreground": "#282828ff",
		"editor.active_line.background": "#ecddb4bf",
		"search.match_background": "#0b667866",
		"players": [
			{
				"cursor": "#0b6678ff",
				"background": "#0b6678ff",
				"selection": "#0b66783d"
			},
			{
				"cursor": "#7c6f64ff",
				"background": "#7c6f64ff",
				"selection": "#7c6f643d"
			},
			{
				"cursor": "#af3a04ff",
				"background": "#af3a04ff",
				"selection": "#af3a043d"
			},
			{
				"cursor": "#8f3f70ff",
				"background": "#8f3f70ff",
				"selection": "#8f3f703d"
			},
			{
				"cursor": "#437b59ff",
				"background": "#437b59ff",
				"selection": "#437b593d"
			},
			{
				"cursor": "#9d0308ff",
				"background": "#9d0308ff",
				"selection": "#9d03083d"
			},
			{
				"cursor": "#b57615ff",
				"background": "#b57615ff",
				"selection": "#b576153d"
			},
			{
				"cursor": "#797410ff",
				"background": "#797410ff",
				"selection": "#7974103d"
			}
		],
		"error": "#9d0308ff",
		"warning": "#b57615ff",
		"info": "#0b6678ff",
		"hint": "#677562ff",
		"created": "#3c3836",
		"deleted": "#cc241d",
		"modified": "#d79921",
		"terminal.ansi.green": "#98971a",
		"terminal.ansi.red": "#cc241d",
		"terminal.ansi.blue": "#458588",
		"syntax": {
			"attribute": { "color": "#0b6678ff" },
			"boolean": { "color": "#8f3e71ff" },
			"comment": { "color": "#7c6f64ff" },
			"comment.doc": { "color": "#5d544eff" },
			"constant": { "color": "#b57613ff" },
			"constructor": { "color": "#0b6678ff" },
			"embedded": { "color": "#427b58ff" },
			"emphasis": { "color": "#0b6678ff" },
			"emphasis.strong": {
				"color": "#0b6678ff",
				"font_weight": 700
			},
			"enum": { "color": "#af3a02ff" },
			"function": { "color": "#79740eff" },
			"function.builtin": { "color": "#9d0006ff" },
			"hint": { "color": "#677562ff" },
			"keyword": { "color": "#9d0006ff" },
			"label": { "color": "#0b6678ff" },
			"link_text": {
				"color": "#427b58ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#8f3e71ff" },
			"namespace": { "color": "#066578ff" },
			"number": { "color": "#8f3e71ff" },
			"operator": { "color": "#427b58ff" },
			"predictive": {
				"color": "#7c9780ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#9d0006ff" },
			"primary": { "color": "#282828ff" },
			"property": { "color": "#282828ff" },
			"punctuation": { "color": "#3c3836ff" },
			"punctuation.bracket": { "color": "#665c54ff" },
			"punctuation.delimiter": { "color": "#413d3aff" },
			"punctuation.list_marker": { "color": "#282828ff" },
			"punctuation.markup": { "color": "#066578ff" },
			"punctuation.special": { "color": "#413d3aff" },
			"selector": { "color": "#b57613ff" },
			"selector.pseudo": { "color": "#0b6678ff" },
			"string": { "color": "#79740eff" },
			"string.escape": { "color": "#5d544eff" },
			"string.regex": { "color": "#af3a02ff" },
			"string.special": { "color": "#8f3e71ff" },
			"string.special.symbol": { "color": "#427b58ff" },
			"tag": { "color": "#427b58ff" },
			"text.literal": { "color": "#066578ff" },
			"title": {
				"color": "#79740eff",
				"font_weight": 700
			},
			"type": { "color": "#b57613ff" },
			"variable": { "color": "#282828ff" },
			"variable.parameter": { "color": "#282828ff" },
			"variable.special": { "color": "#066578ff" },
			"variant": { "color": "#0b6678ff" },
			"diff.plus": { "color": "#79740eff" },
			"diff.minus": { "color": "#9d0006ff" }
		}
	}
};
var gruvbox_light_soft_default = {
	name: "Gruvbox Light Soft",
	appearance: "light",
	style: {
		"background": "#d9c8a4ff",
		"text": "#282828ff",
		"editor.background": "#f2e5bcff",
		"editor.foreground": "#282828ff",
		"editor.active_line.background": "#ecdcb3bf",
		"search.match_background": "#0b667866",
		"players": [
			{
				"cursor": "#0b6678ff",
				"background": "#0b6678ff",
				"selection": "#0b66783d"
			},
			{
				"cursor": "#7c6f64ff",
				"background": "#7c6f64ff",
				"selection": "#7c6f643d"
			},
			{
				"cursor": "#af3a04ff",
				"background": "#af3a04ff",
				"selection": "#af3a043d"
			},
			{
				"cursor": "#8f3f70ff",
				"background": "#8f3f70ff",
				"selection": "#8f3f703d"
			},
			{
				"cursor": "#437b59ff",
				"background": "#437b59ff",
				"selection": "#437b593d"
			},
			{
				"cursor": "#9d0308ff",
				"background": "#9d0308ff",
				"selection": "#9d03083d"
			},
			{
				"cursor": "#b57615ff",
				"background": "#b57615ff",
				"selection": "#b576153d"
			},
			{
				"cursor": "#797410ff",
				"background": "#797410ff",
				"selection": "#7974103d"
			}
		],
		"error": "#9d0308ff",
		"warning": "#b57615ff",
		"info": "#0b6678ff",
		"hint": "#677562ff",
		"created": "#3c3836",
		"deleted": "#cc241d",
		"modified": "#d79921",
		"terminal.ansi.green": "#98971a",
		"terminal.ansi.red": "#cc241d",
		"terminal.ansi.blue": "#458588",
		"syntax": {
			"attribute": { "color": "#0b6678ff" },
			"boolean": { "color": "#8f3e71ff" },
			"comment": { "color": "#7c6f64ff" },
			"comment.doc": { "color": "#5d544eff" },
			"constant": { "color": "#b57613ff" },
			"constructor": { "color": "#0b6678ff" },
			"embedded": { "color": "#427b58ff" },
			"emphasis": { "color": "#0b6678ff" },
			"emphasis.strong": {
				"color": "#0b6678ff",
				"font_weight": 700
			},
			"enum": { "color": "#af3a02ff" },
			"function": { "color": "#79740eff" },
			"function.builtin": { "color": "#9d0006ff" },
			"hint": { "color": "#677562ff" },
			"keyword": { "color": "#9d0006ff" },
			"label": { "color": "#0b6678ff" },
			"link_text": {
				"color": "#427b58ff",
				"font_style": "italic"
			},
			"link_uri": { "color": "#8f3e71ff" },
			"namespace": { "color": "#066578ff" },
			"number": { "color": "#8f3e71ff" },
			"operator": { "color": "#427b58ff" },
			"predictive": {
				"color": "#7c9780ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#9d0006ff" },
			"primary": { "color": "#282828ff" },
			"property": { "color": "#282828ff" },
			"punctuation": { "color": "#3c3836ff" },
			"punctuation.bracket": { "color": "#665c54ff" },
			"punctuation.delimiter": { "color": "#413d3aff" },
			"punctuation.list_marker": { "color": "#282828ff" },
			"punctuation.markup": { "color": "#066578ff" },
			"punctuation.special": { "color": "#413d3aff" },
			"selector": { "color": "#b57613ff" },
			"selector.pseudo": { "color": "#0b6678ff" },
			"string": { "color": "#79740eff" },
			"string.escape": { "color": "#5d544eff" },
			"string.regex": { "color": "#af3a02ff" },
			"string.special": { "color": "#8f3e71ff" },
			"string.special.symbol": { "color": "#427b58ff" },
			"tag": { "color": "#427b58ff" },
			"text.literal": { "color": "#066578ff" },
			"title": {
				"color": "#79740eff",
				"font_weight": 700
			},
			"type": { "color": "#b57613ff" },
			"variable": { "color": "#282828ff" },
			"variable.parameter": { "color": "#282828ff" },
			"variable.special": { "color": "#066578ff" },
			"variant": { "color": "#0b6678ff" },
			"diff.plus": { "color": "#79740eff" },
			"diff.minus": { "color": "#9d0006ff" }
		}
	}
};
var horizon_bright_default = {
	name: "Horizon Bright",
	appearance: "light",
	style: {
		"background": "#FDF0ED",
		"text": "#06060C",
		"editor.background": "#FDF0ED",
		"editor.active_line.background": "#F9CBBE4D",
		"players": [],
		"error": "#F43E5C",
		"warning": "#1EB980B3",
		"hint": "#969696ff",
		"created": "#1EB980B3",
		"deleted": "#F43E5C",
		"modified": "#AF5427",
		"terminal.ansi.green": "#29D398",
		"terminal.ansi.red": "#E95678",
		"terminal.ansi.blue": "#26BBD9",
		"syntax": {
			"attribute": { "color": "#DC3318" },
			"comment": {
				"color": "#33333380",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#33333380",
				"font_style": "italic"
			},
			"constant": { "color": "#DC3318" },
			"constructor": { "color": "#DA103F" },
			"emphasis": {
				"color": "#1D8991",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#8A31B9",
				"font_weight": 700
			},
			"function": { "color": "#1D8991" },
			"keyword": { "color": "#8A31B9" },
			"label": { "color": "#F77D26" },
			"link_text": { "color": "#F6661E" },
			"link_uri": { "color": "#F6661E" },
			"number": { "color": "#DC3318" },
			"operator": { "color": "#333333" },
			"property": { "color": "#DA103F" },
			"punctuation": { "color": "#333333" },
			"punctuation.bracket": { "color": "#333333" },
			"punctuation.delimiter": { "color": "#333333" },
			"punctuation.list_marker": { "color": "#333333" },
			"punctuation.special": { "color": "#333333" },
			"tag": { "color": "#DA103F" },
			"title": { "color": "#F77D26" },
			"type": { "color": "#F77D26" },
			"variable": { "color": "#DA103F" },
			"variable.special": {
				"color": "#F77D26",
				"font_style": "italic"
			},
			"boolean": { "color": "#DC3318" },
			"embedded": { "color": "#06060C" },
			"namespace": { "color": "#F77D26" },
			"predictive": { "color": "#33333380" },
			"preproc": { "color": "#8A31B9" },
			"primary": { "color": "#06060C" },
			"selector": { "color": "#DA103F" },
			"string": { "color": "#F6661E" },
			"enum": { "color": "#F77D26" },
			"hint": { "color": "#969696ff" },
			"variant": { "color": "#DA103F" },
			"diff.minus": { "color": "#F43E5C" },
			"diff.plus": { "color": "#1EB980B3" },
			"selector.class": { "color": "#DC3318" },
			"selector.id": { "color": "#1D8991" },
			"string.escape": { "color": "#1D8991" },
			"string.regex": { "color": "#DC3318" },
			"text.literal": { "color": "#DC3318" },
			"selector.pseudo": { "color": "#F6661E" },
			"string.special.symbol": { "color": "#DC3318" }
		}
	}
};
var horizon_default = {
	name: "Horizon",
	appearance: "dark",
	style: {
		"background": "#1C1E26",
		"text": "#D5D8DA",
		"editor.background": "#1C1E26",
		"editor.active_line.background": "#2E303E4D",
		"players": [],
		"error": "#F43E5C",
		"warning": "#27D797B3",
		"hint": "#969696ff",
		"created": "#27D797B3",
		"deleted": "#F43E5C",
		"modified": "#FAB38E",
		"terminal.ansi.green": "#29D398",
		"terminal.ansi.red": "#E95678",
		"terminal.ansi.blue": "#26BBD9",
		"syntax": {
			"attribute": { "color": "#F09483E6" },
			"comment": {
				"color": "#BBBBBB4D",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#BBBBBB4D",
				"font_style": "italic"
			},
			"constant": { "color": "#F09483E6" },
			"constructor": { "color": "#E95678E6" },
			"emphasis": {
				"color": "#25B0BCE6",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#B877DBE6",
				"font_weight": 700
			},
			"function": { "color": "#25B0BCE6" },
			"keyword": { "color": "#B877DBE6" },
			"label": { "color": "#FAC29AE6" },
			"link_text": { "color": "#FAB795E6" },
			"link_uri": { "color": "#FAB795E6" },
			"number": { "color": "#F09483E6" },
			"operator": { "color": "#BBBBBB" },
			"property": { "color": "#E95678E6" },
			"punctuation": { "color": "#BBBBBB" },
			"punctuation.bracket": { "color": "#BBBBBB" },
			"punctuation.delimiter": { "color": "#BBBBBB" },
			"punctuation.list_marker": { "color": "#BBBBBB" },
			"punctuation.special": { "color": "#BBBBBB" },
			"tag": { "color": "#E95678E6" },
			"title": { "color": "#FAC29AE6" },
			"type": { "color": "#FAC29AE6" },
			"variable": { "color": "#E95678E6" },
			"variable.special": {
				"color": "#FAC29AE6",
				"font_style": "italic"
			},
			"boolean": { "color": "#F09483E6" },
			"embedded": { "color": "#D5D8DA" },
			"namespace": { "color": "#FAC29AE6" },
			"predictive": { "color": "#BBBBBB4D" },
			"preproc": { "color": "#B877DBE6" },
			"primary": { "color": "#D5D8DA" },
			"selector": { "color": "#E95678E6" },
			"string": { "color": "#FAB795E6" },
			"enum": { "color": "#FAC29AE6" },
			"hint": { "color": "#969696ff" },
			"variant": { "color": "#E95678E6" },
			"diff.minus": { "color": "#F43E5C" },
			"diff.plus": { "color": "#27D797B3" },
			"selector.class": { "color": "#F09483E6" },
			"selector.id": { "color": "#25B0BCE6" },
			"string.escape": { "color": "#25B0BCE6" },
			"string.regex": { "color": "#F09483E6" },
			"text.literal": { "color": "#F09483E6" },
			"selector.pseudo": { "color": "#FAB795E6" },
			"string.special.symbol": { "color": "#F09483E6" }
		}
	}
};
var houston_default = {
	name: "Houston",
	appearance: "dark",
	style: {
		"background": "#17191e",
		"text": "#cccccc",
		"editor.background": "#17191e",
		"editor.foreground": "#eef0f9",
		"editor.active_line.background": "#23262d",
		"editor.document_highlight.bracket_background": "#545864",
		"search.match_background": "#ea5c0054",
		"players": [
			{
				"cursor": "#ffffff",
				"background": "#ffffff",
				"selection": "#ad5dca44"
			},
			{
				"cursor": "#4bf3c8",
				"background": "#4bf3c8",
				"selection": "#4bf3c840"
			},
			{
				"cursor": "#54b9ff",
				"background": "#54b9ff",
				"selection": "#54b9ff40"
			},
			{
				"cursor": "#acafff",
				"background": "#acafff",
				"selection": "#acafff40"
			},
			{
				"cursor": "#ffd493",
				"background": "#ffd493",
				"selection": "#ffd49340"
			},
			{
				"cursor": "#00daef",
				"background": "#00daef",
				"selection": "#00daef40"
			},
			{
				"cursor": "#ad5dca",
				"background": "#ad5dca",
				"selection": "#ad5dca40"
			},
			{
				"cursor": "#f06788",
				"background": "#f06788",
				"selection": "#f0678840"
			}
		],
		"error": "#f4587e",
		"warning": "#fbc23b",
		"info": "#54b9ff",
		"hint": "#00daef",
		"created": "#4bf3c8",
		"deleted": "#f4587e",
		"modified": "#ffd493",
		"terminal.ansi.green": "#23d18b",
		"terminal.ansi.red": "#dc3657",
		"terminal.ansi.blue": "#2b7eca",
		"syntax": {
			"comment": {
				"color": "#eef0f98f",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#eef0f98f",
				"font_style": "italic"
			},
			"comment.documentation": {
				"color": "#eef0f98f",
				"font_style": "italic"
			},
			"comment.note": { "color": "#00daef" },
			"comment.warning": { "color": "#fbc23b" },
			"comment.error": { "color": "#f4587e" },
			"punctuation": { "color": "#eef0f9" },
			"punctuation.bracket": { "color": "#eef0f9" },
			"punctuation.delimiter": { "color": "#eef0f9" },
			"punctuation.list_marker": { "color": "#4bf3c8" },
			"punctuation.special": { "color": "#54b9ff" },
			"keyword": { "color": "#54b9ff" },
			"keyword.conditional": { "color": "#54b9ff" },
			"keyword.conditional.ternary": { "color": "#54b9ff" },
			"keyword.return": { "color": "#54b9ff" },
			"keyword.repeat": { "color": "#54b9ff" },
			"keyword.exception": { "color": "#54b9ff" },
			"keyword.import": { "color": "#00daef" },
			"keyword.export": { "color": "#00daef" },
			"keyword.type": { "color": "#acafff" },
			"keyword.function": { "color": "#54b9ff" },
			"keyword.modifier": { "color": "#54b9ff" },
			"keyword.operator": { "color": "#54b9ff" },
			"keyword.directive": { "color": "#acafff" },
			"keyword.directive.define": { "color": "#acafff" },
			"keyword.coroutine": { "color": "#54b9ff" },
			"keyword.debug": { "color": "#fbc23b" },
			"string": { "color": "#ffd493" },
			"string.escape": { "color": "#eef0f9" },
			"string.regex": { "color": "#eef0f9" },
			"string.regexp": { "color": "#eef0f9" },
			"string.special": { "color": "#acafff" },
			"string.special.symbol": { "color": "#acafff" },
			"string.special.path": { "color": "#00daef" },
			"string.special.url": {
				"color": "#00daef",
				"font_style": "italic"
			},
			"string.doc": { "color": "#ffd493" },
			"string.documentation": { "color": "#ffd493" },
			"boolean": { "color": "#ffd493" },
			"character": { "color": "#ffd493" },
			"character.special": { "color": "#eef0f9" },
			"variable": { "color": "#4bf3c8" },
			"variable.builtin": { "color": "#acafff" },
			"variable.parameter": { "color": "#eef0f9" },
			"variable.member": { "color": "#4bf3c8" },
			"variable.special": { "color": "#acafff" },
			"constant": { "color": "#ffd493" },
			"constant.builtin": { "color": "#ffd493" },
			"number": { "color": "#ffd493" },
			"number.float": { "color": "#ffd493" },
			"type": { "color": "#acafff" },
			"type.builtin": { "color": "#acafff" },
			"type.definition": { "color": "#acafff" },
			"type.interface": { "color": "#acafff" },
			"type.class.definition": { "color": "#acafff" },
			"type.super": { "color": "#acafff" },
			"enum": { "color": "#acafff" },
			"variant": { "color": "#eef0f9" },
			"function": { "color": "#00daef" },
			"function.builtin": { "color": "#00daef" },
			"function.call": { "color": "#00daef" },
			"function.method": { "color": "#00daef" },
			"function.method.call": { "color": "#00daef" },
			"function.macro": { "color": "#00daef" },
			"function.decorator": { "color": "#acafff" },
			"constructor": { "color": "#00daef" },
			"namespace": { "color": "#acafff" },
			"module": { "color": "#acafff" },
			"operator": { "color": "#eef0f9" },
			"parameter": { "color": "#eef0f9" },
			"field": { "color": "#eef0f9" },
			"label": { "color": "#fbc23b" },
			"title": {
				"color": "#4bf3c8",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#54b9ff",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#ffd493",
				"font_weight": 700
			},
			"text.literal": { "color": "#ffd493" },
			"link_text": {
				"color": "#00daef",
				"font_style": "italic"
			},
			"link_uri": {
				"color": "#00daef",
				"font_style": "italic"
			},
			"tag": { "color": "#54b9ff" },
			"attribute": { "color": "#4bf3c8" },
			"tag.attribute": { "color": "#acafff" },
			"tag.delimiter": { "color": "#eef0f9" },
			"tag.doctype": { "color": "#858b98" },
			"diff.plus": { "color": "#4bf3c8" },
			"diff.minus": { "color": "#f06788" },
			"preproc": { "color": "#acafff" },
			"predoc": { "color": "#acafff" },
			"embedded": { "color": "#eef0f9" },
			"primary": { "color": "#eef0f9" },
			"parent": { "color": "#eef0f9" },
			"concept": { "color": "#acafff" },
			"symbol": { "color": "#acafff" },
			"predictive": { "color": "#eef0f98f" },
			"property": { "color": "#4BF3C8" },
			"selector": { "color": "#54B9FF" },
			"hint": { "color": "#00daef" },
			"selector.class": { "color": "#4BF3C8" },
			"selector.id": { "color": "#00DAEF" },
			"selector.pseudo": { "color": "#EEF0F9" }
		}
	}
};
var kanagawa_dragon_default = {
	name: "Kanagawa Dragon",
	appearance: "dark",
	style: {
		"background": "#181616",
		"text": "#c5c9c5",
		"editor.background": "#181616",
		"editor.foreground": "#c5c9c5",
		"editor.active_line.background": "#c5c9c50d",
		"search.match_background": "#8ea4a233",
		"players": [
			{
				"cursor": "#c5c9c5",
				"selection": "#625e5a80",
				"background": "#c5c9c5"
			},
			{
				"cursor": "#8ba4b0",
				"selection": "#8ba4b033",
				"background": "#8ba4b0"
			},
			{
				"cursor": "#8992a7",
				"selection": "#8992a733",
				"background": "#8992a7"
			},
			{
				"cursor": "#7fb4ca",
				"selection": "#7fb4ca33",
				"background": "#7fb4ca"
			},
			{
				"cursor": "#a292a3",
				"selection": "#a292a333",
				"background": "#a292a3"
			},
			{
				"cursor": "#a6a69c",
				"selection": "#a6a69c33",
				"background": "#a6a69c"
			},
			{
				"cursor": "#8ea4a2",
				"selection": "#8ea4a233",
				"background": "#8ea4a2"
			},
			{
				"cursor": "#8a9a7b",
				"selection": "#8a9a7b33",
				"background": "#8a9a7b"
			}
		],
		"error": "#e82424",
		"warning": "#ff9e3b",
		"info": "#8ba4b0",
		"hint": "#8ea4a2",
		"terminal.ansi.green": "#8A9A7B",
		"terminal.ansi.red": "#C4746E",
		"terminal.ansi.blue": "#8BA4B0",
		"syntax": {
			"attribute": { "color": "#c4b28a" },
			"boolean": { "color": "#ff9e3b" },
			"comment": {
				"color": "#7a8382",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#7a8382",
				"font_style": "italic"
			},
			"constant": { "color": "#b98d7b" },
			"constructor": { "color": "#8ba4b0" },
			"embedded": { "color": "#e82424" },
			"emphasis": {
				"color": "#e82424",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#e82424",
				"font_weight": 700
			},
			"enum": {
				"color": "#8ea4a2",
				"font_weight": 700
			},
			"function": {
				"color": "#8ba4b0",
				"font_style": "italic"
			},
			"hint": {
				"color": "#8ea4a2",
				"font_style": "italic"
			},
			"keyword": { "color": "#E46876" },
			"link_text": { "color": "#8ba4b0" },
			"link_uri": { "color": "#8ba4b0" },
			"number": { "color": "#a292a3" },
			"operator": { "color": "#b6927b" },
			"predictive": { "color": "#625e5a" },
			"predoc": { "color": "#e82424" },
			"primary": { "color": "#e46876" },
			"property": { "color": "#E7BD6E" },
			"punctuation": { "color": "#8ea4a2" },
			"punctuation.bracket": { "color": "#8ea4a2" },
			"punctuation.delimiter": { "color": "#625e5a" },
			"punctuation.list_marker": { "color": "#8ea4a2" },
			"punctuation.special": { "color": "#8ea4a2" },
			"punctuation.special.symbol": { "color": "#e82424" },
			"string": { "color": "#8A9A7B" },
			"string.escape": { "color": "#e46876" },
			"string.regex": { "color": "#e46876" },
			"string.special": { "color": "#e46876" },
			"string.special.symbol": { "color": "#ff5d62" },
			"tag": { "color": "#8ba4b0" },
			"text.literal": { "color": "#87a987" },
			"title": {
				"color": "#c5c9c5",
				"font_weight": 800
			},
			"type": { "color": "#8ea4a2" },
			"type.interface": { "color": "#8ea4a2" },
			"type.super": { "color": "#8ea4a2" },
			"variable": { "color": "#c5c9c5" },
			"variable.member": { "color": "#c5c9c5" },
			"variable.parameter": {
				"color": "#9e9b93",
				"font_style": "italic"
			},
			"variable.special": {
				"color": "#a292a3",
				"font_style": "italic"
			},
			"variant": { "color": "#e82424" },
			"label": { "color": "#8EA4A2" },
			"namespace": { "color": "#C4B28A" },
			"preproc": { "color": "#E46876" },
			"selector": { "color": "#C4B28A" },
			"diff.minus": { "color": "#C34043" },
			"diff.plus": { "color": "#76946A" },
			"selector.id": { "color": "#8992A7" },
			"selector.pseudo": { "color": "#8992A7" }
		}
	}
};
var kanagawa_lotus_default = {
	name: "Kanagawa Lotus",
	appearance: "light",
	style: {
		"background": "#f2ecbc",
		"text": "#545464",
		"editor.background": "#f2ecbc",
		"editor.foreground": "#545464",
		"editor.active_line.background": "#5454640d",
		"search.match_background": "#597b7533",
		"players": [
			{
				"cursor": "#545464",
				"selection": "#8a898080",
				"background": "#545464"
			},
			{
				"cursor": "#5d57a3",
				"selection": "#5d57a333",
				"background": "#5d57a3"
			},
			{
				"cursor": "#766b90",
				"selection": "#766b9033",
				"background": "#766b90"
			},
			{
				"cursor": "#9fb5c9",
				"selection": "#9fb5c933",
				"background": "#9fb5c9"
			},
			{
				"cursor": "#766b90",
				"selection": "#766b9033",
				"background": "#766b90"
			},
			{
				"cursor": "#8a8980",
				"selection": "#8a898033",
				"background": "#8a8980"
			},
			{
				"cursor": "#597b75",
				"selection": "#597b7533",
				"background": "#597b75"
			},
			{
				"cursor": "#6e915f",
				"selection": "#6e915f33",
				"background": "#6e915f"
			}
		],
		"error": "#e82424",
		"warning": "#cc6d00",
		"info": "#5a7785",
		"hint": "#5e857a",
		"terminal.ansi.green": "#6F894E",
		"terminal.ansi.red": "#C84053",
		"terminal.ansi.blue": "#4D699B",
		"syntax": {
			"attribute": { "color": "#de9800" },
			"boolean": { "color": "#cc6d00" },
			"comment": {
				"color": "#8a8980",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#8a8980",
				"font_style": "italic"
			},
			"constant": { "color": "#cc6d00" },
			"constructor": { "color": "#4d699b" },
			"embedded": { "color": "#e82424" },
			"emphasis": {
				"color": "#e82424",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#e82424",
				"font_weight": 700
			},
			"enum": {
				"color": "#5e857a",
				"font_weight": 700
			},
			"function": {
				"color": "#4d699b",
				"font_style": "italic"
			},
			"hint": {
				"color": "#5e857a",
				"font_style": "italic"
			},
			"keyword": { "color": "#766b90" },
			"link_text": { "color": "#4d699b" },
			"link_uri": { "color": "#4d699b" },
			"number": { "color": "#b35b79" },
			"operator": { "color": "#836f4a" },
			"predictive": { "color": "#8a8980" },
			"predoc": { "color": "#e82424" },
			"primary": { "color": "#c84053" },
			"property": { "color": "#4d699b" },
			"punctuation": { "color": "#5e857a" },
			"punctuation.bracket": { "color": "#5e857a" },
			"punctuation.delimiter": { "color": "#8a8980" },
			"punctuation.list_marker": { "color": "#5e857a" },
			"punctuation.special": { "color": "#5e857a" },
			"punctuation.special.symbol": { "color": "#e82424" },
			"string": { "color": "#6f894e" },
			"string.escape": { "color": "#c84053" },
			"string.regex": { "color": "#c84053" },
			"string.special": { "color": "#c84053" },
			"string.special.symbol": { "color": "#d7474b" },
			"tag": { "color": "#4d699b" },
			"text.literal": { "color": "#6f894e" },
			"title": {
				"color": "#545464",
				"font_weight": 800
			},
			"type": { "color": "#5e857a" },
			"type.interface": { "color": "#5e857a" },
			"type.super": { "color": "#5e857a" },
			"variable": { "color": "#545464" },
			"variable.member": { "color": "#545464" },
			"variable.parameter": {
				"color": "#766b90",
				"font_style": "italic"
			},
			"variable.special": {
				"color": "#b35b79",
				"font_style": "italic"
			},
			"variant": { "color": "#e82424" },
			"label": { "color": "#597B75" },
			"namespace": { "color": "#77713F" },
			"preproc": { "color": "#766b90" },
			"selector": { "color": "#77713F" },
			"diff.minus": { "color": "#D7474B" },
			"diff.plus": { "color": "#6E915F" },
			"selector.id": { "color": "#624C83" },
			"selector.pseudo": { "color": "#624C83" }
		}
	}
};
var kanagawa_wave_default = {
	name: "Kanagawa Wave",
	appearance: "dark",
	style: {
		"background": "#1F1F28",
		"text": "#DCD7BA",
		"editor.background": "#1F1F28",
		"editor.foreground": "#DCD7BA",
		"editor.active_line.background": "#DCD7BA0d",
		"search.match_background": "#6A958933",
		"players": [
			{
				"cursor": "#DCD7BA",
				"selection": "#4F4F6680",
				"background": "#DCD7BA"
			},
			{
				"cursor": "#7E9CD8",
				"selection": "#7E9CD833",
				"background": "#7E9CD8"
			},
			{
				"cursor": "#9CABCA",
				"selection": "#9CABCA33",
				"background": "#9CABCA"
			},
			{
				"cursor": "#7FB4CA",
				"selection": "#7FB4CA33",
				"background": "#7FB4CA"
			},
			{
				"cursor": "#957FB8",
				"selection": "#957FB833",
				"background": "#957FB8"
			},
			{
				"cursor": "#727169",
				"selection": "#72716933",
				"background": "#727169"
			},
			{
				"cursor": "#6A9589",
				"selection": "#6A958933",
				"background": "#6A9589"
			},
			{
				"cursor": "#76946A",
				"selection": "#76946A33",
				"background": "#76946A"
			}
		],
		"error": "#E82424",
		"warning": "#FF9E3B",
		"info": "#7E9CD8",
		"hint": "#6A9589",
		"terminal.ansi.green": "#76946A",
		"terminal.ansi.red": "#C34043",
		"terminal.ansi.blue": "#7E9CD8",
		"syntax": {
			"attribute": { "color": "#DCA561" },
			"boolean": { "color": "#FF9E3B" },
			"comment": {
				"color": "#727169",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#727169",
				"font_style": "italic"
			},
			"constant": { "color": "#FFA066" },
			"constructor": { "color": "#7E9CD8" },
			"embedded": { "color": "#E82424" },
			"emphasis": {
				"color": "#E82424",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#E82424",
				"font_weight": 700
			},
			"enum": {
				"color": "#6A9589",
				"font_weight": 700
			},
			"function": {
				"color": "#7E9CD8",
				"font_style": "italic"
			},
			"hint": {
				"color": "#6A9589",
				"font_style": "italic"
			},
			"keyword": { "color": "#957FB8" },
			"link_text": { "color": "#7E9CD8" },
			"link_uri": { "color": "#7E9CD8" },
			"number": { "color": "#D27E99" },
			"operator": { "color": "#C0A36E" },
			"predictive": { "color": "#4F4F66" },
			"predoc": { "color": "#E82424" },
			"primary": { "color": "#E46876" },
			"property": { "color": "#7E9CD8" },
			"punctuation": { "color": "#6A9589" },
			"punctuation.bracket": { "color": "#6A9589" },
			"punctuation.delimiter": { "color": "#4F4F66" },
			"punctuation.list_marker": { "color": "#6A9589" },
			"punctuation.special": { "color": "#6A9589" },
			"punctuation.special.symbol": { "color": "#E82424" },
			"string": { "color": "#98BB6C" },
			"string.escape": { "color": "#E46876" },
			"string.regex": { "color": "#E46876" },
			"string.special": { "color": "#E46876" },
			"string.special.symbol": { "color": "#FF5D62" },
			"tag": { "color": "#7E9CD8" },
			"text.literal": { "color": "#98BB6C" },
			"title": {
				"color": "#DCD7BA",
				"font_weight": 800
			},
			"type": { "color": "#6A9589" },
			"type.interface": { "color": "#6A9589" },
			"type.super": { "color": "#6A9589" },
			"variable": { "color": "#DCD7BA" },
			"variable.member": { "color": "#DCD7BA" },
			"variable.parameter": {
				"color": "#b8b4d0",
				"font_style": "italic"
			},
			"variable.special": {
				"color": "#957FB8",
				"font_style": "italic"
			},
			"variant": { "color": "#E82424" },
			"label": { "color": "#7AA89F" },
			"namespace": { "color": "#E6C384" },
			"preproc": { "color": "#957FB8" },
			"selector": { "color": "#E6C384" },
			"diff.minus": { "color": "#C34043" },
			"diff.plus": { "color": "#76946A" },
			"selector.id": { "color": "#957FB8" },
			"selector.pseudo": { "color": "#957FB8" }
		}
	}
};
var laserwave_default = {
	name: "LaserWave",
	appearance: "dark",
	style: {
		"background": "#27212e",
		"editor.background": "#27212e",
		"text": "#ffffff",
		"editor.foreground": "#ffffff",
		"search.match_background": "#40b4c48c",
		"error": "#ff3e7b",
		"players": [{
			"cursor": "#ffffff",
			"selection": "#eb64b927"
		}],
		"deleted": "#b381c5",
		"modified": "#74dfc4",
		"terminal.ansi.green": "#74dfc4",
		"terminal.ansi.red": "#EB64B9",
		"terminal.ansi.blue": "#40b4c4",
		"syntax": {
			"attribute": { "color": "#EB64B9" },
			"boolean": { "color": "#ffe261" },
			"comment": { "color": "#91889b" },
			"comment.doc": { "color": "#91889b" },
			"constant": { "color": "#ffe261" },
			"constructor": { "color": "#74dfc4" },
			"emphasis": { "color": "#EB64B9" },
			"emphasis.strong": { "color": "#EB64B9" },
			"function": { "color": "#EB64B9" },
			"keyword": { "color": "#40b4c4" },
			"number": { "color": "#b381c5" },
			"operator": { "color": "#74dfc4" },
			"punctuation": { "color": "#7b6995" },
			"punctuation.bracket": { "color": "#7b6995" },
			"punctuation.delimiter": { "color": "#7b6995" },
			"punctuation.list_marker": { "color": "#7b6995" },
			"punctuation.special": { "color": "#7b6995" },
			"string": { "color": "#b4dce7" },
			"string.escape": { "color": "#b4dce7" },
			"string.regex": { "color": "#b4dce7" },
			"string.special": { "color": "#b4dce7" },
			"string.special.symbol": { "color": "#b4dce7" },
			"tag": { "color": "#74dfc4" },
			"text.literal": { "color": "#b4dce7" },
			"type": { "color": "#a96bc0" },
			"embedded": { "color": "#ffffff" },
			"label": { "color": "#ffffff" },
			"namespace": { "color": "#a96bc0" },
			"predictive": { "color": "#91889b" },
			"preproc": { "color": "#40b4c4" },
			"primary": { "color": "#ffffff" },
			"property": { "color": "#ffffff" },
			"selector": { "color": "#74DFC4" },
			"title": { "color": "#40B4C4" },
			"variable": { "color": "#FFF" },
			"enum": { "color": "#A96BC0" },
			"hint": { "color": "#91889b" },
			"link_text": { "color": "#B4DCE7" },
			"link_uri": { "color": "#b4dce7" },
			"variant": { "color": "#EB64B9" },
			"diff.minus": { "color": "#EB64B9" },
			"diff.plus": { "color": "#74DFC4" },
			"property.json_key": { "color": "#40B4C4" },
			"selector.class": { "color": "#EB64B9" },
			"selector.id": { "color": "#EB64B9" },
			"selector.pseudo": { "color": "#EB64B9" }
		}
	}
};
var light_plus_default = {
	name: "Light Plus",
	appearance: "light",
	style: {
		"background": "#ffffffff",
		"text": "#000000ff",
		"editor.background": "#ffffffff",
		"editor.foreground": "#000000ff",
		"editor.active_line.background": "#0000000a",
		"editor.document_highlight.bracket_background": "#0000001a",
		"search.match_background": "#00000033",
		"players": [
			{
				"cursor": "#000000ff",
				"background": "#00000026",
				"selection": "#00000033"
			},
			{
				"cursor": "#806c33ff",
				"background": "#806c3326",
				"selection": "#806c334d"
			},
			{
				"cursor": "#598033ff",
				"background": "#59803326",
				"selection": "#5980334d"
			},
			{
				"cursor": "#338046ff",
				"background": "#33804626",
				"selection": "#3380464d"
			},
			{
				"cursor": "#338080ff",
				"background": "#33808026",
				"selection": "#3380804d"
			},
			{
				"cursor": "#334680ff",
				"background": "#33468026",
				"selection": "#3346804d"
			},
			{
				"cursor": "#593380ff",
				"background": "#59338026",
				"selection": "#5933804d"
			},
			{
				"cursor": "#80336cff",
				"background": "#80336c26",
				"selection": "#80336c4d"
			}
		],
		"error": "#f44747ff",
		"warning": "#cca700ff",
		"info": "#3794ffff",
		"hint": "#969696ff",
		"syntax": {
			"comment": { "color": "#008000ff" },
			"comment.doc": { "color": "#008000ff" },
			"string": { "color": "#a31515ff" },
			"string.regex": { "color": "#811f3fff" },
			"string.escape": { "color": "#ee0000ff" },
			"link_text": { "color": "#a31515ff" },
			"number": { "color": "#098658ff" },
			"boolean": { "color": "#0000ffff" },
			"constant.builtin": { "color": "#0000ffff" },
			"constant": { "color": "#0070C1" },
			"variable": { "color": "#001080ff" },
			"variable.special": { "color": "#0000ffff" },
			"variable.parameter": { "color": "#001080ff" },
			"keyword": { "color": "#0000ffff" },
			"operator": { "color": "#000000ff" },
			"type": { "color": "#267f99ff" },
			"type.builtin": { "color": "#267f99ff" },
			"function": { "color": "#795e26ff" },
			"function.builtin": { "color": "#795e26ff" },
			"tag": { "color": "#800000ff" },
			"attribute": { "color": "#e50000ff" },
			"punctuation.special": { "color": "#0000ffff" },
			"punctuation.bracket": { "color": "#000000ff" },
			"punctuation.delimiter": { "color": "#000000ff" },
			"punctuation.list_marker": { "color": "#0451a5ff" },
			"punctuation": { "color": "#000000ff" },
			"preproc": { "color": "#0000ffff" },
			"title": {
				"color": "#800000ff",
				"font_weight": 700
			},
			"emphasis.strong": {
				"color": "#000080ff",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#800080ff",
				"font_style": "italic"
			},
			"text.literal": { "color": "#800000ff" },
			"enum": { "color": "#267f99ff" },
			"property": { "color": "#001080ff" },
			"label": { "color": "#000000" },
			"constructor": { "color": "#795e26ff" },
			"namespace": { "color": "#267f99ff" },
			"diff.minus": { "color": "#a31515ff" },
			"diff.plus": { "color": "#098658ff" },
			"embedded": { "color": "#000000ff" },
			"selector": { "color": "#800000ff" },
			"selector.pseudo": { "color": "#800000" },
			"variant": { "color": "#0070c1ff" },
			"string.special": { "color": "#a31515ff" },
			"punctuation.markup": { "color": "#000000ff" },
			"property.json_key": { "color": "#0451a5ff" },
			"primary": { "color": "#000000ff" },
			"link_uri": { "color": "#000000ff" },
			"hint": { "color": "#00000066" },
			"predictive": { "color": "#00000066" },
			"string.special.symbol": { "color": "#000000ff" },
			"keyword.control": { "color": "#AF00DB" },
			"keyword.import": { "color": "#AF00DB" },
			"tag.doctype": { "color": "#000000ff" },
			"punctuation.bracket.html": { "color": "#800000" },
			"punctuation.bracket.jsx": { "color": "#800000" },
			"punctuation.delimiter.html": { "color": "#800000" },
			"punctuation.delimiter.jsx": { "color": "#800000" },
			"tag.component.jsx": { "color": "#267F99" }
		},
		"created": "#587c0c",
		"deleted": "#ad0707",
		"modified": "#895503"
	}
};
var material_theme_darker_default = {
	name: "Material Theme Darker",
	appearance: "dark",
	style: {
		"background": "#212121",
		"text": "#EEFFFF",
		"editor.background": "#212121",
		"editor.foreground": "#EEFFFF",
		"editor.active_line.background": "#00000050",
		"players": [],
		"error": "#f0717870",
		"warning": "#FFCB6B70",
		"info": "#82AAFF70",
		"hint": "#969696ff",
		"deleted": "#f0717890",
		"modified": "#82AAFF90",
		"terminal.ansi.green": "#C3E88D",
		"terminal.ansi.red": "#f07178",
		"terminal.ansi.blue": "#82AAFF",
		"syntax": {
			"attribute": { "color": "#C792EA" },
			"comment": {
				"color": "#545454",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#545454",
				"font_style": "italic"
			},
			"constructor": { "color": "#f07178" },
			"emphasis": {
				"color": "#f07178",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#f07178",
				"font_weight": 700
			},
			"function": { "color": "#82AAFF" },
			"keyword": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"number": { "color": "#F78C6C" },
			"punctuation": { "color": "#89DDFF" },
			"punctuation.bracket": { "color": "#89DDFF" },
			"punctuation.delimiter": { "color": "#89DDFF" },
			"punctuation.list_marker": { "color": "#89DDFF" },
			"punctuation.special": { "color": "#89DDFF" },
			"string": { "color": "#C3E88D" },
			"string.escape": { "color": "#C3E88D" },
			"string.regex": { "color": "#C3E88D" },
			"string.special": { "color": "#C3E88D" },
			"string.special.symbol": { "color": "#C3E88D" },
			"tag": { "color": "#f07178" },
			"text.literal": { "color": "#C3E88D" },
			"boolean": { "color": "#FF9CAC" },
			"constant": { "color": "#EEFFFF" },
			"embedded": { "color": "#EEFFFF" },
			"label": { "color": "#FFCB6B" },
			"namespace": { "color": "#FFCB6B" },
			"operator": { "color": "#89DDFF" },
			"predictive": { "color": "#545454" },
			"preproc": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"primary": { "color": "#EEFFFF" },
			"property": { "color": "#F07178" },
			"selector": { "color": "#FFCB6B" },
			"title": { "color": "#89DDFF" },
			"type": { "color": "#FFCB6B" },
			"variable": { "color": "#EEFFFF" },
			"enum": { "color": "#FFCB6B" },
			"hint": { "color": "#969696ff" },
			"link_text": { "color": "#C3E88D" },
			"link_uri": { "color": "#EEFFFF" },
			"variant": { "color": "#EEFFFF" },
			"constant.builtin": { "color": "#89DDFF" },
			"diff.minus": { "color": "#F07178" },
			"diff.plus": { "color": "#C3E88D" },
			"selector.id": { "color": "#F78C6C" },
			"variable.parameter": {
				"color": "#EEFFFF",
				"font_style": "italic"
			},
			"selector.pseudo": { "color": "#C792EA" }
		}
	}
};
var material_theme_lighter_default = {
	name: "Material Theme Lighter",
	appearance: "light",
	style: {
		"background": "#FAFAFA",
		"text": "#90A4AE",
		"editor.background": "#FAFAFA",
		"editor.foreground": "#90A4AE",
		"editor.active_line.background": "#CCD7DA50",
		"players": [],
		"error": "#E5393570",
		"warning": "#E2931D70",
		"info": "#6182B870",
		"hint": "#969696ff",
		"deleted": "#E5393590",
		"modified": "#6182B890",
		"terminal.ansi.green": "#91B859",
		"terminal.ansi.red": "#E53935",
		"terminal.ansi.blue": "#6182B8",
		"syntax": {
			"attribute": { "color": "#9C3EDA" },
			"comment": {
				"color": "#90A4AE",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#90A4AE",
				"font_style": "italic"
			},
			"constructor": { "color": "#E53935" },
			"emphasis": {
				"color": "#E53935",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#E53935",
				"font_weight": 700
			},
			"function": { "color": "#6182B8" },
			"keyword": {
				"color": "#39ADB5",
				"font_style": "italic"
			},
			"number": { "color": "#F76D47" },
			"punctuation": { "color": "#39ADB5" },
			"punctuation.bracket": { "color": "#39ADB5" },
			"punctuation.delimiter": { "color": "#39ADB5" },
			"punctuation.list_marker": { "color": "#39ADB5" },
			"punctuation.special": { "color": "#39ADB5" },
			"string": { "color": "#91B859" },
			"string.escape": { "color": "#91B859" },
			"string.regex": { "color": "#91B859" },
			"string.special": { "color": "#91B859" },
			"string.special.symbol": { "color": "#91B859" },
			"tag": { "color": "#E53935" },
			"text.literal": { "color": "#91B859" },
			"boolean": { "color": "#FF5370" },
			"constant": { "color": "#90A4AE" },
			"embedded": { "color": "#90A4AE" },
			"label": { "color": "#E2931D" },
			"namespace": { "color": "#E2931D" },
			"operator": { "color": "#39ADB5" },
			"predictive": { "color": "#90A4AE" },
			"preproc": {
				"color": "#39ADB5",
				"font_style": "italic"
			},
			"primary": { "color": "#90A4AE" },
			"property": { "color": "#E53935" },
			"selector": { "color": "#E2931D" },
			"title": { "color": "#39ADB5" },
			"type": { "color": "#E2931D" },
			"variable": { "color": "#90A4AE" },
			"enum": { "color": "#E2931D" },
			"hint": { "color": "#969696ff" },
			"link_text": { "color": "#91B859" },
			"link_uri": { "color": "#90A4AE" },
			"variant": { "color": "#90A4AE" },
			"constant.builtin": { "color": "#39ADB5" },
			"diff.minus": { "color": "#E53935" },
			"diff.plus": { "color": "#91B859" },
			"selector.id": { "color": "#F76D47" },
			"variable.parameter": {
				"color": "#90A4AE",
				"font_style": "italic"
			},
			"selector.pseudo": { "color": "#9C3EDA" }
		}
	}
};
var material_theme_ocean_default = {
	name: "Material Theme Ocean",
	appearance: "dark",
	style: {
		"background": "#0F111A",
		"text": "#babed8",
		"editor.background": "#0F111A",
		"editor.foreground": "#babed8",
		"editor.active_line.background": "#00000050",
		"players": [],
		"error": "#f0717870",
		"warning": "#FFCB6B70",
		"info": "#82AAFF70",
		"hint": "#969696ff",
		"deleted": "#f0717890",
		"modified": "#82AAFF90",
		"terminal.ansi.green": "#C3E88D",
		"terminal.ansi.red": "#f07178",
		"terminal.ansi.blue": "#82AAFF",
		"syntax": {
			"attribute": { "color": "#C792EA" },
			"comment": {
				"color": "#464B5D",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#464B5D",
				"font_style": "italic"
			},
			"constructor": { "color": "#f07178" },
			"emphasis": {
				"color": "#f07178",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#f07178",
				"font_weight": 700
			},
			"function": { "color": "#82AAFF" },
			"keyword": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"number": { "color": "#F78C6C" },
			"punctuation": { "color": "#89DDFF" },
			"punctuation.bracket": { "color": "#89DDFF" },
			"punctuation.delimiter": { "color": "#89DDFF" },
			"punctuation.list_marker": { "color": "#89DDFF" },
			"punctuation.special": { "color": "#89DDFF" },
			"string": { "color": "#C3E88D" },
			"string.escape": { "color": "#C3E88D" },
			"string.regex": { "color": "#C3E88D" },
			"string.special": { "color": "#C3E88D" },
			"string.special.symbol": { "color": "#C3E88D" },
			"tag": { "color": "#f07178" },
			"text.literal": { "color": "#C3E88D" },
			"boolean": { "color": "#FF9CAC" },
			"constant": { "color": "#BABED8" },
			"embedded": { "color": "#BABED8" },
			"label": { "color": "#FFCB6B" },
			"namespace": { "color": "#FFCB6B" },
			"operator": { "color": "#89DDFF" },
			"predictive": { "color": "#464B5D" },
			"preproc": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"primary": { "color": "#babed8" },
			"property": { "color": "#F07178" },
			"selector": { "color": "#FFCB6B" },
			"title": { "color": "#89DDFF" },
			"type": { "color": "#FFCB6B" },
			"variable": { "color": "#BABED8" },
			"enum": { "color": "#FFCB6B" },
			"hint": { "color": "#969696ff" },
			"link_text": { "color": "#C3E88D" },
			"link_uri": { "color": "#babed8" },
			"variant": { "color": "#BABED8" },
			"constant.builtin": { "color": "#89DDFF" },
			"diff.minus": { "color": "#F07178" },
			"diff.plus": { "color": "#C3E88D" },
			"selector.id": { "color": "#F78C6C" },
			"variable.parameter": {
				"color": "#BABED8",
				"font_style": "italic"
			},
			"selector.pseudo": { "color": "#C792EA" }
		}
	}
};
var material_theme_palenight_default = {
	name: "Material Theme Palenight",
	appearance: "dark",
	style: {
		"background": "#292D3E",
		"text": "#babed8",
		"editor.background": "#292D3E",
		"editor.foreground": "#babed8",
		"editor.active_line.background": "#00000050",
		"players": [],
		"error": "#f0717870",
		"warning": "#FFCB6B70",
		"info": "#82AAFF70",
		"hint": "#969696ff",
		"deleted": "#f0717890",
		"modified": "#82AAFF90",
		"terminal.ansi.green": "#C3E88D",
		"terminal.ansi.red": "#f07178",
		"terminal.ansi.blue": "#82AAFF",
		"syntax": {
			"attribute": { "color": "#C792EA" },
			"comment": {
				"color": "#676E95",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#676E95",
				"font_style": "italic"
			},
			"constructor": { "color": "#f07178" },
			"emphasis": {
				"color": "#f07178",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#f07178",
				"font_weight": 700
			},
			"function": { "color": "#82AAFF" },
			"keyword": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"number": { "color": "#F78C6C" },
			"punctuation": { "color": "#89DDFF" },
			"punctuation.bracket": { "color": "#89DDFF" },
			"punctuation.delimiter": { "color": "#89DDFF" },
			"punctuation.list_marker": { "color": "#89DDFF" },
			"punctuation.special": { "color": "#89DDFF" },
			"string": { "color": "#C3E88D" },
			"string.escape": { "color": "#C3E88D" },
			"string.regex": { "color": "#C3E88D" },
			"string.special": { "color": "#C3E88D" },
			"string.special.symbol": { "color": "#C3E88D" },
			"tag": { "color": "#f07178" },
			"text.literal": { "color": "#C3E88D" },
			"boolean": { "color": "#FF9CAC" },
			"constant": { "color": "#BABED8" },
			"embedded": { "color": "#BABED8" },
			"label": { "color": "#FFCB6B" },
			"namespace": { "color": "#FFCB6B" },
			"operator": { "color": "#89DDFF" },
			"predictive": { "color": "#676E95" },
			"preproc": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"primary": { "color": "#babed8" },
			"property": { "color": "#F07178" },
			"selector": { "color": "#FFCB6B" },
			"title": { "color": "#89DDFF" },
			"type": { "color": "#FFCB6B" },
			"variable": { "color": "#BABED8" },
			"enum": { "color": "#FFCB6B" },
			"hint": { "color": "#969696ff" },
			"link_text": { "color": "#C3E88D" },
			"link_uri": { "color": "#babed8" },
			"variant": { "color": "#BABED8" },
			"constant.builtin": { "color": "#89DDFF" },
			"diff.minus": { "color": "#F07178" },
			"diff.plus": { "color": "#C3E88D" },
			"selector.id": { "color": "#F78C6C" },
			"variable.parameter": {
				"color": "#BABED8",
				"font_style": "italic"
			},
			"selector.pseudo": { "color": "#C792EA" }
		}
	}
};
var material_theme_default = {
	name: "Material Theme",
	appearance: "dark",
	style: {
		"background": "#263238",
		"text": "#EEFFFF",
		"editor.background": "#263238",
		"editor.foreground": "#EEFFFF",
		"editor.active_line.background": "#00000050",
		"players": [],
		"error": "#f0717870",
		"warning": "#FFCB6B70",
		"info": "#82AAFF70",
		"hint": "#969696ff",
		"deleted": "#f0717890",
		"modified": "#82AAFF90",
		"terminal.ansi.green": "#C3E88D",
		"terminal.ansi.red": "#f07178",
		"terminal.ansi.blue": "#82AAFF",
		"syntax": {
			"attribute": { "color": "#C792EA" },
			"comment": {
				"color": "#546E7A",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#546E7A",
				"font_style": "italic"
			},
			"constructor": { "color": "#f07178" },
			"emphasis": {
				"color": "#f07178",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#f07178",
				"font_weight": 700
			},
			"function": { "color": "#82AAFF" },
			"keyword": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"number": { "color": "#F78C6C" },
			"punctuation": { "color": "#89DDFF" },
			"punctuation.bracket": { "color": "#89DDFF" },
			"punctuation.delimiter": { "color": "#89DDFF" },
			"punctuation.list_marker": { "color": "#89DDFF" },
			"punctuation.special": { "color": "#89DDFF" },
			"string": { "color": "#C3E88D" },
			"string.escape": { "color": "#C3E88D" },
			"string.regex": { "color": "#C3E88D" },
			"string.special": { "color": "#C3E88D" },
			"string.special.symbol": { "color": "#C3E88D" },
			"tag": { "color": "#f07178" },
			"text.literal": { "color": "#C3E88D" },
			"boolean": { "color": "#FF9CAC" },
			"constant": { "color": "#EEFFFF" },
			"embedded": { "color": "#EEFFFF" },
			"label": { "color": "#FFCB6B" },
			"namespace": { "color": "#FFCB6B" },
			"operator": { "color": "#89DDFF" },
			"predictive": { "color": "#546E7A" },
			"preproc": {
				"color": "#89DDFF",
				"font_style": "italic"
			},
			"primary": { "color": "#EEFFFF" },
			"property": { "color": "#F07178" },
			"selector": { "color": "#FFCB6B" },
			"title": { "color": "#89DDFF" },
			"type": { "color": "#FFCB6B" },
			"variable": { "color": "#EEFFFF" },
			"enum": { "color": "#FFCB6B" },
			"hint": { "color": "#969696ff" },
			"link_text": { "color": "#C3E88D" },
			"link_uri": { "color": "#EEFFFF" },
			"variant": { "color": "#EEFFFF" },
			"constant.builtin": { "color": "#89DDFF" },
			"diff.minus": { "color": "#F07178" },
			"diff.plus": { "color": "#C3E88D" },
			"selector.id": { "color": "#F78C6C" },
			"variable.parameter": {
				"color": "#EEFFFF",
				"font_style": "italic"
			},
			"selector.pseudo": { "color": "#C792EA" }
		}
	}
};
var min_dark_default = {
	name: "Min Dark",
	appearance: "dark",
	style: {
		"background": "#141414",
		"text": "#999999",
		"editor.background": "#1A1A1A",
		"editor.foreground": "#BBBBBB",
		"search.match_background": "#FFAB7064",
		"players": [],
		"error": "#F97583",
		"warning": "#FFE62A",
		"hint": "#969696ff",
		"syntax": {
			"attribute": { "color": "#B392F1" },
			"boolean": { "color": "#79B8FF" },
			"comment": { "color": "#888888" },
			"comment.doc": { "color": "#888888" },
			"constant": { "color": "#79B8FF" },
			"enum": { "color": "#B392F1" },
			"function": { "color": "#B392F1" },
			"keyword": { "color": "#FA7584" },
			"number": { "color": "#F8F8F8" },
			"operator": { "color": "#FA7584" },
			"property": { "color": "#BBBBBB" },
			"punctuation": { "color": "#D1D1D1" },
			"string": { "color": "#FFAB70" },
			"string.escape": {
				"color": "#FA7584",
				"font_style": "normal",
				"font_weight": 400
			},
			"tag": {
				"color": "#FFAB70",
				"font_style": "normal",
				"font_weight": 400
			},
			"text.literal": {
				"color": "#E394DC",
				"font_style": "normal",
				"font_weight": 400
			},
			"type": {
				"color": "#79B8FF",
				"font_style": "normal",
				"font_weight": 400
			},
			"type.builtin": {
				"color": "#79B8FF",
				"font_style": "normal",
				"font_weight": 400
			},
			"variable": {
				"color": "#bbbbbb",
				"font_style": "normal",
				"font_weight": 400
			},
			"variable.special": {
				"color": "#79B8FF",
				"font_style": "normal",
				"font_weight": 400
			},
			"constructor": { "color": "#B392F0" },
			"embedded": { "color": "#BBBBBB" },
			"emphasis": {
				"color": "#BBBBBB",
				"font_style": "italic"
			},
			"label": {
				"color": "#bbbbbb",
				"font_style": "normal",
				"font_weight": 400
			},
			"namespace": {
				"color": "#79B8FF",
				"font_style": "normal",
				"font_weight": 400
			},
			"predictive": { "color": "#888888" },
			"preproc": { "color": "#FA7584" },
			"primary": { "color": "#BBBBBB" },
			"selector": { "color": "#FFAB70" },
			"title": {
				"color": "#79B8FF",
				"font_style": "normal",
				"font_weight": 400
			},
			"hint": { "color": "#969696ff" },
			"link_text": { "color": "#79B8FF" },
			"link_uri": { "color": "#FFAB70" },
			"variant": { "color": "#79B8FF" },
			"diff.minus": { "color": "#BBBBBB" },
			"diff.plus": { "color": "#BBBBBB" },
			"emphasis.strong": {
				"color": "#BBBBBB",
				"font_style": "italic",
				"font_weight": 700
			},
			"selector.class": { "color": "#B392F0" },
			"selector.id": { "color": "#B392F0" },
			"selector.pseudo": { "color": "#B392F0" }
		},
		"created": "#81b88b",
		"deleted": "#c74e39",
		"modified": "#E2C08D"
	}
};
var min_light_default = {
	name: "Min Light",
	appearance: "light",
	style: {
		"background": "#FBFBFB",
		"text": "#606060",
		"editor.background": "#FFFFFF",
		"editor.foreground": "#212121",
		"search.match_background": "#E7C54764",
		"players": [],
		"error": "#D32F2F",
		"warning": "#FFE62A",
		"hint": "#757575",
		"terminal.ansi.green": "#77cc00",
		"terminal.ansi.red": "#D32F2F",
		"terminal.ansi.blue": "#e0e0e0",
		"syntax": {
			"attribute": { "color": "#6F42C1" },
			"boolean": { "color": "#1976D2" },
			"comment": { "color": "#C2C3C5" },
			"comment.doc": { "color": "#C2C3C5" },
			"constant": { "color": "#1976D2" },
			"enum": { "color": "#6F42C1" },
			"function": { "color": "#6F42C1" },
			"keyword": { "color": "#D32F2F" },
			"number": { "color": "#212121" },
			"operator": { "color": "#D32F2F" },
			"property": { "color": "#212121" },
			"punctuation": { "color": "#424242" },
			"string": { "color": "#22863A" },
			"string.escape": {
				"color": "#D32F2F",
				"font_style": "normal",
				"font_weight": 400
			},
			"tag": {
				"color": "#22863A",
				"font_style": "normal",
				"font_weight": 400
			},
			"text.literal": {
				"color": "#C2185B",
				"font_style": "normal",
				"font_weight": 400
			},
			"type": {
				"color": "#1976D2",
				"font_style": "normal",
				"font_weight": 400
			},
			"type.builtin": {
				"color": "#1976D2",
				"font_style": "normal",
				"font_weight": 400
			},
			"variable": {
				"color": "#212121",
				"font_style": "normal",
				"font_weight": 400
			},
			"variable.special": {
				"color": "#1976D2",
				"font_style": "normal",
				"font_weight": 400
			},
			"constructor": { "color": "#6F42C1" },
			"embedded": { "color": "#212121" },
			"emphasis": {
				"color": "#212121",
				"font_style": "italic"
			},
			"label": {
				"color": "#212121",
				"font_style": "normal",
				"font_weight": 400
			},
			"namespace": {
				"color": "#1976D2",
				"font_style": "normal",
				"font_weight": 400
			},
			"predictive": { "color": "#C2C3C5" },
			"preproc": { "color": "#D32F2F" },
			"primary": { "color": "#212121" },
			"selector": { "color": "#22863A" },
			"title": {
				"color": "#1976D2",
				"font_style": "normal",
				"font_weight": 400
			},
			"hint": { "color": "#757575" },
			"link_text": { "color": "#D32F2F" },
			"link_uri": { "color": "#22863A" },
			"variant": { "color": "#1976D2" },
			"diff.minus": { "color": "#D32F2F" },
			"diff.plus": { "color": "#77cc00" },
			"emphasis.strong": {
				"color": "#212121",
				"font_style": "italic",
				"font_weight": 700
			},
			"selector.class": { "color": "#6F42C1" },
			"selector.id": { "color": "#6F42C1" },
			"selector.pseudo": { "color": "#6F42C1" }
		}
	}
};
var monokai_default = {
	name: "Monokai",
	appearance: "dark",
	style: {
		"background": "#272822ff",
		"text": "#f8f8f2ff",
		"editor.background": "#272822ff",
		"editor.foreground": "#f8f8f2ff",
		"editor.active_line.background": "#3e3d32ff",
		"editor.document_highlight.bracket_background": "#f8f8f21a",
		"search.match_background": "#f8f8f233",
		"players": [
			{
				"cursor": "#f8f8f0ff",
				"background": "#f8f8f026",
				"selection": "#878b9180"
			},
			{
				"cursor": "#88f863ff",
				"background": "#88f86326",
				"selection": "#88f8634d"
			},
			{
				"cursor": "#63f8aeff",
				"background": "#63f8ae26",
				"selection": "#63f8ae4d"
			},
			{
				"cursor": "#63d3f8ff",
				"background": "#63d3f826",
				"selection": "#63d3f84d"
			},
			{
				"cursor": "#6363f8ff",
				"background": "#6363f826",
				"selection": "#6363f84d"
			},
			{
				"cursor": "#d363f8ff",
				"background": "#d363f826",
				"selection": "#d363f84d"
			},
			{
				"cursor": "#f863aeff",
				"background": "#f863ae26",
				"selection": "#f863ae4d"
			},
			{
				"cursor": "#f88863ff",
				"background": "#f8886326",
				"selection": "#f888634d"
			}
		],
		"error": "#f44747ff",
		"warning": "#cca700ff",
		"info": "#3794ffff",
		"hint": "#969696ff",
		"terminal.ansi.green": "#86B42B",
		"terminal.ansi.red": "#C4265E",
		"terminal.ansi.blue": "#6A7EC8",
		"syntax": {
			"comment": { "color": "#88846fff" },
			"comment.doc": { "color": "#88846fff" },
			"string": { "color": "#e6db74ff" },
			"string.regex": { "color": "#e6db74ff" },
			"string.escape": { "color": "#ae81ffff" },
			"link_text": { "color": "#ae81ffff" },
			"link_uri": { "color": "#e6db74ff" },
			"number": { "color": "#ae81ffff" },
			"boolean": { "color": "#ae81ffff" },
			"constant.builtin": { "color": "#ae81ffff" },
			"constant": { "color": "#F8F8F2" },
			"variable": { "color": "#f8f8f2ff" },
			"variable.special": { "color": "#fd971fff" },
			"variable.parameter": {
				"color": "#fd971fff",
				"font_style": "italic"
			},
			"keyword": { "color": "#f92672ff" },
			"operator": { "color": "#f92672ff" },
			"type": { "color": "#a6e22eff" },
			"type.builtin": {
				"color": "#66d9efff",
				"font_style": "italic"
			},
			"function": { "color": "#a6e22eff" },
			"function.builtin": { "color": "#66d9efff" },
			"tag": { "color": "#f92672ff" },
			"attribute": { "color": "#a6e22eff" },
			"punctuation.special": { "color": "#f92672ff" },
			"punctuation.delimiter": { "color": "#f8f8f2ff" },
			"punctuation.list_marker": { "color": "#a6e22eff" },
			"punctuation": { "color": "#f8f8f2ff" },
			"preproc": { "color": "#f8f8f2ff" },
			"title": { "color": "#a6e22eff" },
			"emphasis.strong": {
				"color": "#66D9EF",
				"font_weight": 700
			},
			"emphasis": {
				"color": "#66D9EF",
				"font_style": "italic"
			},
			"text.literal": { "color": "#fd971fff" },
			"enum": { "color": "#a6e22eff" },
			"property": { "color": "#f8f8f2ff" },
			"label": { "color": "#f8f8f2ff" },
			"constructor": { "color": "#a6e22eff" },
			"namespace": { "color": "#a6e22eff" },
			"diff.minus": { "color": "#f92672ff" },
			"diff.plus": { "color": "#a6e22eff" },
			"embedded": { "color": "#f8f8f2ff" },
			"selector": { "color": "#f92672ff" },
			"selector.pseudo": { "color": "#a6e22eff" },
			"variant": { "color": "#f8f8f2ff" },
			"string.special": { "color": "#e6db74ff" },
			"string.special.symbol": { "color": "#ae81ffff" },
			"primary": { "color": "#f8f8f2ff" },
			"hint": { "color": "#f8f8f266" },
			"predictive": { "color": "#f8f8f266" },
			"punctuation.bracket": { "color": "#f8f8f2ff" },
			"punctuation.markup": { "color": "#f8f8f2ff" },
			"keyword.declaration": {
				"color": "#66D9EF",
				"font_style": "italic"
			},
			"property.json_key": {
				"color": "#66D9EF",
				"font_style": "italic"
			},
			"selector.class": { "color": "#A6E22E" },
			"selector.id": { "color": "#A6E22E" },
			"tag.doctype": { "color": "#f8f8f2ff" },
			"keyword.jsdoc": {
				"color": "#66D9EF",
				"font_style": "italic"
			},
			"tag.component.jsx": {
				"color": "#66D9EF",
				"font_style": "italic"
			}
		},
		"created": "#81b88b",
		"deleted": "#c74e39",
		"modified": "#E2C08D"
	}
};
var night_owl_light_default = {
	name: "Night Owl Light",
	appearance: "light",
	style: {
		"background": "#FBFBFB",
		"text": "#403f53",
		"editor.background": "#FBFBFB",
		"editor.foreground": "#403f53",
		"editor.active_line.background": "#F0F0F0",
		"editor.document_highlight.bracket_background": "#994cc333",
		"search.match_background": "#93A1A16c",
		"players": [
			{
				"cursor": "#2AA298",
				"background": "#2AA298",
				"selection": "#2AA29850"
			},
			{
				"cursor": "#994cc3",
				"background": "#994cc3",
				"selection": "#994cc33d"
			},
			{
				"cursor": "#4876d6",
				"background": "#4876d6",
				"selection": "#4876d63d"
			},
			{
				"cursor": "#0c969b",
				"background": "#0c969b",
				"selection": "#0c969b3d"
			},
			{
				"cursor": "#d6438a",
				"background": "#d6438a",
				"selection": "#d6438a3d"
			},
			{
				"cursor": "#de3d3b",
				"background": "#de3d3b",
				"selection": "#de3d3b3d"
			},
			{
				"cursor": "#daaa01",
				"background": "#daaa01",
				"selection": "#daaa013d"
			},
			{
				"cursor": "#49d0c5",
				"background": "#49d0c5",
				"selection": "#49d0c53d"
			}
		],
		"error": "#E64D49",
		"warning": "#daaa01",
		"info": "#288ed7",
		"hint": "#969696",
		"terminal.ansi.green": "#08916a",
		"terminal.ansi.red": "#de3d3b",
		"terminal.ansi.blue": "#288ed7",
		"syntax": {
			"attribute": {
				"color": "#4876d6",
				"font_style": "italic"
			},
			"boolean": { "color": "#bc5454" },
			"comment": {
				"color": "#989fb1",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#989fb1",
				"font_style": "italic"
			},
			"constant": { "color": "#4876d6" },
			"constant.builtin": { "color": "#bc5454" },
			"constructor": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"diff.minus": { "color": "#f76e6e" },
			"diff.plus": { "color": "#49d0c5" },
			"embedded": { "color": "#403f53" },
			"emphasis": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#4876d6",
				"font_weight": 700
			},
			"enum": { "color": "#4876d6" },
			"function": {
				"color": "#4876d6",
				"font_style": "italic"
			},
			"function.method": {
				"color": "#4876d6",
				"font_style": "italic"
			},
			"hint": { "color": "#969696" },
			"keyword": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"keyword.control": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"keyword.declaration": {
				"color": "#994cc3",
				"font_style": "normal"
			},
			"label": { "color": "#4876d6" },
			"link_text": {
				"color": "#403f53",
				"font_style": "normal"
			},
			"link_uri": { "color": "#ff869a" },
			"namespace": { "color": "#403f53" },
			"number": { "color": "#aa0982" },
			"operator": { "color": "#0c969b" },
			"predictive": {
				"color": "#93A1A1",
				"font_style": "italic"
			},
			"preproc": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"primary": { "color": "#403f53" },
			"property": { "color": "#0c969b" },
			"punctuation": {
				"color": "#403f53",
				"font_style": "normal"
			},
			"punctuation.bracket": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"punctuation.delimiter": {
				"color": "#403f53",
				"font_style": "normal"
			},
			"punctuation.list_marker": { "color": "#4876d6" },
			"punctuation.markup": { "color": "#4876d6" },
			"punctuation.special": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"selector": {
				"color": "#994cc3",
				"font_style": "italic"
			},
			"selector.pseudo": { "color": "#994cc3" },
			"string": { "color": "#c96765" },
			"string.escape": { "color": "#aa0982" },
			"string.regex": { "color": "#5ca7e4" },
			"string.special": { "color": "#c96765" },
			"string.special.symbol": { "color": "#c96765" },
			"tag": { "color": "#994cc3" },
			"text.literal": { "color": "#0c969b" },
			"title": {
				"color": "#4876d6",
				"font_weight": 700
			},
			"type": { "color": "#4876d6" },
			"type.builtin": { "color": "#bc5454" },
			"variable": { "color": "#403f53" },
			"variable.special": { "color": "#0c969b" },
			"variant": { "color": "#4876d6" }
		}
	}
};
var night_owl_default = {
	name: "Night Owl",
	appearance: "dark",
	style: {
		"background": "#011627",
		"text": "#d6deeb",
		"editor.background": "#011627",
		"editor.foreground": "#d6deeb",
		"editor.active_line.background": "#28707d29",
		"editor.document_highlight.bracket_background": "#f6bbe533",
		"search.match_background": "#1085bb5d",
		"players": [
			{
				"cursor": "#80a4c2",
				"background": "#80a4c2",
				"selection": "#4373c250"
			},
			{
				"cursor": "#7e57c2",
				"background": "#7e57c2",
				"selection": "#7e57c23d"
			},
			{
				"cursor": "#c792ea",
				"background": "#c792ea",
				"selection": "#c792ea3d"
			},
			{
				"cursor": "#7fdbca",
				"background": "#7fdbca",
				"selection": "#7fdbca3d"
			},
			{
				"cursor": "#F78C6C",
				"background": "#F78C6C",
				"selection": "#F78C6C3d"
			},
			{
				"cursor": "#EF5350",
				"background": "#EF5350",
				"selection": "#EF53503d"
			},
			{
				"cursor": "#ffcb8b",
				"background": "#ffcb8b",
				"selection": "#ffcb8b3d"
			},
			{
				"cursor": "#9CCC65",
				"background": "#9CCC65",
				"selection": "#9CCC653d"
			}
		],
		"error": "#EF5350",
		"warning": "#b39554",
		"info": "#82aaff",
		"hint": "#829D9D",
		"deleted": "#EF535090",
		"modified": "#a2bffc",
		"terminal.ansi.green": "#22da6e",
		"terminal.ansi.red": "#EF5350",
		"terminal.ansi.blue": "#82AAFF",
		"syntax": {
			"attribute": {
				"color": "#c5e478",
				"font_style": "italic"
			},
			"boolean": { "color": "#ff5874" },
			"comment": {
				"color": "#637777",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#637777",
				"font_style": "italic"
			},
			"constant": { "color": "#82AAFF" },
			"constant.builtin": { "color": "#ff5874" },
			"constructor": {
				"color": "#82aaff",
				"font_style": "normal"
			},
			"diff.minus": { "color": "#EF5350" },
			"diff.plus": { "color": "#9CCC65" },
			"embedded": { "color": "#d6deeb" },
			"emphasis": {
				"color": "#82aaff",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#ffcb8b",
				"font_weight": 700
			},
			"enum": { "color": "#ffcb8b" },
			"function": {
				"color": "#82aaff",
				"font_style": "italic"
			},
			"function.method": {
				"color": "#82aaff",
				"font_style": "italic"
			},
			"hint": { "color": "#829D9D" },
			"keyword": {
				"color": "#c792ea",
				"font_style": "italic"
			},
			"keyword.control": {
				"color": "#c792ea",
				"font_style": "italic"
			},
			"keyword.declaration": {
				"color": "#c792ea",
				"font_style": "normal"
			},
			"label": { "color": "#82aaff" },
			"link_text": {
				"color": "#82aaff",
				"font_style": "normal"
			},
			"link_uri": { "color": "#7fdbca" },
			"namespace": { "color": "#d6deeb" },
			"number": { "color": "#F78C6C" },
			"operator": { "color": "#c792ea" },
			"predictive": {
				"color": "#5f7e97",
				"font_style": "italic"
			},
			"preproc": {
				"color": "#c792ea",
				"font_style": "italic"
			},
			"primary": { "color": "#d6deeb" },
			"property": { "color": "#d6deeb" },
			"punctuation": {
				"color": "#d6deeb",
				"font_style": "normal"
			},
			"punctuation.bracket": {
				"color": "#ffd602",
				"font_style": "normal"
			},
			"punctuation.delimiter": {
				"color": "#d6deeb",
				"font_style": "normal"
			},
			"punctuation.list_marker": { "color": "#7fdbca" },
			"punctuation.markup": { "color": "#7fdbca" },
			"punctuation.special": {
				"color": "#82aaff",
				"font_style": "italic"
			},
			"selector": { "color": "#c5e478" },
			"selector.pseudo": { "color": "#82aaff" },
			"string": { "color": "#ecc48d" },
			"string.escape": { "color": "#F78C6C" },
			"string.regex": { "color": "#5ca7e4" },
			"string.special": { "color": "#ecc48d" },
			"string.special.symbol": { "color": "#ecc48d" },
			"tag": { "color": "#caece6" },
			"text.literal": { "color": "#ecc48d" },
			"title": {
				"color": "#82aaff",
				"font_weight": 700
			},
			"type": { "color": "#ffcb8b" },
			"type.builtin": { "color": "#c5e478" },
			"variable": { "color": "#d6deeb" },
			"variable.special": { "color": "#7fdbca" },
			"variant": { "color": "#ffcb8b" }
		}
	}
};
var nord_default = {
	name: "Nord",
	appearance: "dark",
	style: {
		"background": "#2e3440",
		"text": "#eceff4",
		"editor.background": "#2e3440",
		"editor.foreground": "#d8dee9",
		"editor.active_line.background": "#3b4252",
		"search.match_background": "#88c0d033",
		"players": [
			{
				"cursor": "#eceff4",
				"background": "#434c5e99",
				"selection": "#434c5e99"
			},
			{
				"cursor": "#eceff4",
				"background": "#eceff4",
				"selection": "#3b4252"
			},
			{
				"cursor": "#d08770",
				"background": "#d08770",
				"selection": "#d087703d"
			},
			{
				"cursor": "#a3be8c",
				"background": "#a3be8c",
				"selection": "#a3be8c3d"
			},
			{
				"cursor": "#b48ead",
				"background": "#b48ead",
				"selection": "#b48ead3d"
			},
			{
				"cursor": "#d08770",
				"background": "#d08770",
				"selection": "#d087703d"
			}
		],
		"error": "#bf616a",
		"warning": "#ebcb8b",
		"info": "#5e81ac",
		"hint": "#5e81ac",
		"deleted": "#bf616a",
		"modified": "#ebcb8b",
		"terminal.ansi.green": "#a3be8c",
		"terminal.ansi.red": "#bf616a",
		"terminal.ansi.blue": "#81a1c1",
		"syntax": {
			"attribute": { "color": "#8FBCBB" },
			"boolean": { "color": "#81A1C1" },
			"comment": {
				"color": "#4C566A",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#4C566A",
				"font_style": "italic"
			},
			"constant": { "color": "#D8DEE9" },
			"constructor": { "color": "#81A1C1" },
			"function": { "color": "#88c0d0" },
			"keyword": { "color": "#81A1C1" },
			"number": { "color": "#B48EAD" },
			"operator": { "color": "#81A1C1" },
			"preproc": { "color": "#5E81AC" },
			"punctuation": { "color": "#ECEFF4" },
			"punctuation.bracket": { "color": "#ECEFF4" },
			"punctuation.delimiter": { "color": "#81A1C1" },
			"punctuation.list_marker": { "color": "#ECEFF4" },
			"punctuation.special": { "color": "#ECEFF4" },
			"string": { "color": "#A3BE8C" },
			"string.escape": { "color": "#EBCB8B" },
			"string.regex": { "color": "#A3BE8C" },
			"string.special": { "color": "#A3BE8C" },
			"string.special.symbol": { "color": "#A3BE8C" },
			"tag": { "color": "#81A1C1" },
			"text.literal": { "color": "#A3BE8C" },
			"type": { "color": "#8FBCBB" },
			"variable": { "color": "#D8DEE9" },
			"variable.special": { "color": "#D8DEE9" },
			"property": { "color": "#88C0D0" },
			"embedded": { "color": "#d8dee9" },
			"emphasis": {
				"color": "#d8dee9",
				"font_style": "italic"
			},
			"label": { "color": "#D8DEE9" },
			"namespace": { "color": "#8FBCBB" },
			"predictive": { "color": "#4C566A" },
			"primary": { "color": "#d8dee9" },
			"selector": { "color": "#81A1C1" },
			"title": { "color": "#88C0D0" },
			"enum": { "color": "#8FBCBB" },
			"hint": { "color": "#5e81ac" },
			"link_text": { "color": "#A3BE8C" },
			"link_uri": { "color": "#A3BE8C" },
			"variant": { "color": "#D8DEE9" },
			"diff.minus": { "color": "#BF616A" },
			"diff.plus": { "color": "#A3BE8C" },
			"emphasis.strong": {
				"color": "#d8dee9",
				"font_weight": 700
			},
			"selector.class": { "color": "#8FBCBB" },
			"selector.id": { "color": "#8FBCBB" },
			"selector.pseudo": { "color": "#8FBCBB" }
		}
	}
};
var one_dark_pro_default = {
	name: "One Dark Pro",
	appearance: "dark",
	style: {
		"background": "#23272e",
		"text": "#cdd3e0",
		"editor.background": "#23272e",
		"editor.foreground": "#abb2bf",
		"editor.active_line.background": "#2c313c",
		"editor.document_highlight.bracket_background": "#abb2bf30",
		"search.match_background": "#d19a6644",
		"players": [
			{
				"cursor": "#74ade8ff",
				"background": "#74ade8ff",
				"selection": "#67769640"
			},
			{
				"cursor": "#be5046ff",
				"background": "#be5046ff",
				"selection": "#be504640"
			},
			{
				"cursor": "#bf956aff",
				"background": "#bf956aff",
				"selection": "#bf956a40"
			},
			{
				"cursor": "#b477cfff",
				"background": "#b477cfff",
				"selection": "#b477cf40"
			},
			{
				"cursor": "#6eb4bfff",
				"background": "#6eb4bfff",
				"selection": "#6eb4bf40"
			},
			{
				"cursor": "#d07277ff",
				"background": "#d07277ff",
				"selection": "#d0727740"
			},
			{
				"cursor": "#dec184ff",
				"background": "#dec184ff",
				"selection": "#dec18440"
			},
			{
				"cursor": "#a1c181ff",
				"background": "#a1c181ff",
				"selection": "#a1c18140"
			}
		],
		"error": "#c24038",
		"warning": "#d19a66",
		"hint": "#7a849c",
		"terminal.ansi.green": "#8cc265",
		"terminal.ansi.red": "#e05561",
		"terminal.ansi.blue": "#4aa5f0",
		"syntax": {
			"comment": { "color": "#7F838C" },
			"comment.doc": { "color": "#7f848e" },
			"attribute": { "color": "#d19a66" },
			"boolean": { "color": "#d19a66" },
			"constant": { "color": "#d19a66" },
			"constructor": { "color": "#e06c75" },
			"embedded": { "color": "#abb2bf" },
			"emphasis": { "color": "#c678dd" },
			"enum": { "color": "#56b6c2" },
			"function": { "color": "#61afef" },
			"keyword": { "color": "#c678dd" },
			"keyword.operator": { "color": "#c678dd" },
			"link_text": { "color": "#61afef" },
			"link_uri": { "color": "#61afef" },
			"number": { "color": "#d19a66" },
			"operator": { "color": "#abb2bf" },
			"predictive": {
				"color": "#4d5970",
				"font_style": "italic"
			},
			"property": { "color": "#e06c75" },
			"punctuation": { "color": "#abb2bf" },
			"punctuation.list_marker": { "color": "#d07277ff" },
			"string": { "color": "#98c379" },
			"string.escape": { "color": "#56b6c2" },
			"string.regex": { "color": "#e06c75" },
			"string.special": { "color": "#e06c75" },
			"string.special.symbol": { "color": "#e06c75" },
			"tag": { "color": "#e06c75" },
			"text.literal": { "color": "#98c379" },
			"title": { "color": "#d07277ff" },
			"type": { "color": "#e5c07b" },
			"variable": { "color": "#e06c75" },
			"variable.special": { "color": "#e5c07b" },
			"variant": { "color": "#61afef" },
			"label": { "color": "#E06C75" },
			"namespace": { "color": "#E5C07B" },
			"preproc": { "color": "#c678dd" },
			"primary": { "color": "#abb2bf" },
			"selector": { "color": "#E06C75" },
			"hint": { "color": "#7a849c" },
			"diff.minus": { "color": "#E06C75" },
			"diff.plus": { "color": "#98C379" },
			"selector.class": { "color": "#D19A66" },
			"selector.id": { "color": "#61AFEF" },
			"selector.pseudo": { "color": "#56B6C2" }
		}
	}
};
var one_light_default = {
	name: "One Light",
	appearance: "light",
	style: {
		"background": "#FAFAFA",
		"text": "#383A42",
		"editor.background": "#FAFAFA",
		"editor.foreground": "#383A42",
		"editor.active_line.background": "#383A420C",
		"editor.document_highlight.bracket_background": "#526FFF3D",
		"search.match_background": "#526FFF3D",
		"players": [
			{
				"cursor": "#526FFF",
				"background": "#526FFF",
				"selection": "#E5E5E6"
			},
			{
				"cursor": "#50A14F",
				"background": "#50A14F",
				"selection": "#50A14F26"
			},
			{
				"cursor": "#A626A4",
				"background": "#A626A4",
				"selection": "#A626A426"
			},
			{
				"cursor": "#986801",
				"background": "#986801",
				"selection": "#98680126"
			},
			{
				"cursor": "#E45649",
				"background": "#E45649",
				"selection": "#E4564926"
			},
			{
				"cursor": "#0184BC",
				"background": "#0184BC",
				"selection": "#0184BC26"
			},
			{
				"cursor": "#C18401",
				"background": "#C18401",
				"selection": "#C1840126"
			},
			{
				"cursor": "#4078F2",
				"background": "#4078F2",
				"selection": "#4078F226"
			}
		],
		"error": "#E45649",
		"warning": "#C18401",
		"info": "#4078F2",
		"hint": "#9D9D9F",
		"syntax": {
			"attribute": { "color": "#986801" },
			"boolean": { "color": "#986801" },
			"comment": {
				"color": "#A0A1A7",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#A0A1A7",
				"font_style": "italic"
			},
			"constant": { "color": "#986801" },
			"constructor": { "color": "#4078F2" },
			"embedded": { "color": "#383A42" },
			"emphasis": {
				"color": "#A626A4",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#986801",
				"font_weight": 700
			},
			"enum": { "color": "#C18401" },
			"function": { "color": "#4078F2" },
			"function.method": { "color": "#4078F2" },
			"function.special.definition": { "color": "#4078F2" },
			"hint": { "color": "#9D9D9F" },
			"keyword": { "color": "#A626A4" },
			"keyword.operator": { "color": "#A626A4" },
			"label": { "color": "#E45649" },
			"link_text": { "color": "#4078F2" },
			"link_uri": { "color": "#A626A4" },
			"number": { "color": "#986801" },
			"operator": { "color": "#0184BC" },
			"predictive": {
				"color": "#A0A1A7",
				"font_style": "italic"
			},
			"preproc": { "color": "#A626A4" },
			"primary": { "color": "#383A42" },
			"property": { "color": "#E45649" },
			"property.json_key": { "color": "#E45649" },
			"punctuation": { "color": "#383A42" },
			"punctuation.bracket": { "color": "#383A42" },
			"punctuation.delimiter": { "color": "#383A42" },
			"punctuation.list_marker": { "color": "#E45649" },
			"punctuation.special": { "color": "#CA1243" },
			"string": { "color": "#50A14F" },
			"string.escape": { "color": "#0184BC" },
			"string.regex": { "color": "#0184BC" },
			"string.special": { "color": "#0184BC" },
			"string.special.symbol": { "color": "#0184BC" },
			"tag": { "color": "#E45649" },
			"text.literal": { "color": "#50A14F" },
			"title": {
				"color": "#E45649",
				"font_weight": 700
			},
			"type": { "color": "#C18401" },
			"type.builtin": { "color": "#0184BC" },
			"variable": { "color": "#E45649" },
			"variable.builtin": { "color": "#E45649" },
			"variable.parameter": { "color": "#383A42" },
			"variable.special": { "color": "#E45649" },
			"variant": { "color": "#C18401" },
			"namespace": { "color": "#C18401" },
			"selector": { "color": "#E45649" },
			"diff.minus": { "color": "#E45649" },
			"diff.plus": { "color": "#50A14F" },
			"selector.class": { "color": "#986801" },
			"selector.id": { "color": "#4078F2" },
			"selector.pseudo": { "color": "#986801" }
		},
		"created": "#587c0c",
		"deleted": "#ad0707",
		"modified": "#895503"
	}
};
var pierre_dark_protanopia_deuteranopia_default = {
	name: "Pierre Dark Protanopia & Deuteranopia",
	appearance: "dark",
	style: {
		"background": "#171717",
		"text": "#fafafa",
		"editor.background": "#0a0a0a",
		"editor.foreground": "#fafafa",
		"editor.active_line.background": "#19283c8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff4d"
		}],
		"created": "#97c4ff",
		"deleted": "#fe8c2c",
		"modified": "#009fff",
		"terminal.ansi.green": "#69b1ff",
		"terminal.ansi.red": "#ffa359",
		"terminal.ansi.blue": "#009fff",
		"syntax": {
			"comment": { "color": "#737373" },
			"comment.doc": { "color": "#737373" },
			"string": { "color": "#97c4ff" },
			"string.escape": { "color": "#64d1db" },
			"string.regex": { "color": "#68cdf2" },
			"string.special": { "color": "#64d1db" },
			"string.special.symbol": { "color": "#ffcc81" },
			"number": { "color": "#96d9f6" },
			"constant": { "color": "#ffcc81" },
			"boolean": { "color": "#96d9f6" },
			"keyword": { "color": "#b969f3" },
			"keyword.operator": { "color": "#08c0ef" },
			"function": { "color": "#ba8ffd" },
			"function.method": { "color": "#ba8ffd" },
			"function.builtin": { "color": "#ba8ffd" },
			"function.special.definition": { "color": "#ba8ffd" },
			"function.call": { "color": "#ba8ffd" },
			"type": { "color": "#e290f0" },
			"type.builtin": { "color": "#e290f0" },
			"constructor": { "color": "#e290f0" },
			"variable": { "color": "#ffa359" },
			"variable.builtin": { "color": "#ffbc56" },
			"variable.member": { "color": "#ffa359" },
			"variable.parameter": { "color": "#a3a3a3" },
			"variable.special": { "color": "#ffbc56" },
			"property": { "color": "#ffa359" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#96d9f6" },
			"constant.css": { "color": "#ffcc81" },
			"string.plain": { "color": "#96d9f6" },
			"plain_value": { "color": "#96d9f6" },
			"tag.css": { "color": "#ffa359" },
			"tag_name": { "color": "#ffa359" },
			"class": { "color": "#ffbc56" },
			"class_name": { "color": "#ffbc56" },
			"selector.class": { "color": "#ffbc56" },
			"selector.id": { "color": "#ba8ffd" },
			"id_name": { "color": "#ba8ffd" },
			"selector.pseudo": { "color": "#08c0ef" },
			"pseudo_class_selector": { "color": "#08c0ef" },
			"pseudo_element_selector": { "color": "#08c0ef" },
			"keyword.directive": { "color": "#b969f3" },
			"keyword.control.at-rule": { "color": "#b969f3" },
			"at_keyword": { "color": "#b969f3" },
			"variable.scss": { "color": "#ffa359" },
			"variable.css": { "color": "#ffa359" },
			"property.custom": { "color": "#ffa359" },
			"unit": { "color": "#96d9f6" },
			"number.unit": { "color": "#96d9f6" },
			"color": { "color": "#ffcc81" },
			"constant.color": { "color": "#ffcc81" },
			"keyword.important": { "color": "#b969f3" },
			"variable.language": { "color": "#ffbc56" },
			"this": { "color": "#ffbc56" },
			"self": { "color": "#ffbc56" },
			"type.class": { "color": "#e290f0" },
			"property.object": { "color": "#ffa359" },
			"property_identifier": { "color": "#ffa359" },
			"shorthand_property_identifier": { "color": "#ffa359" },
			"shorthand_property_identifier_pattern": { "color": "#ffa359" },
			"method_definition": { "color": "#ba8ffd" },
			"function.method.call": { "color": "#ba8ffd" },
			"string.template": { "color": "#97c4ff" },
			"template_string": { "color": "#97c4ff" },
			"tag.jsx": { "color": "#ffa359" },
			"tag.component": { "color": "#e290f0" },
			"punctuation": { "color": "#636363" },
			"punctuation.bracket": { "color": "#636363" },
			"punctuation.delimiter": { "color": "#636363" },
			"punctuation.list_marker": { "color": "#636363" },
			"punctuation.special": { "color": "#b969f3" },
			"operator": { "color": "#08c0ef" },
			"tag": { "color": "#ffa359" },
			"attribute": { "color": "#ffbc56" },
			"label": { "color": "#ffbc56" },
			"namespace": { "color": "#ffbc56" },
			"decorator": { "color": "#69b1ff" },
			"attribute.builtin": { "color": "#69b1ff" },
			"embedded": { "color": "#fafafa" },
			"preproc": { "color": "#b969f3" },
			"text.literal": { "color": "#97c4ff" },
			"markup.heading": {
				"color": "#ffa359",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ffcc81",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#b969f3",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#737373" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#ba8ffd" },
			"markup.quote": {
				"color": "#737373",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ffa359" },
			"markup.list.numbered": { "color": "#ffa359" },
			"markup.list.unnumbered": { "color": "#ffa359" },
			"markup.raw": { "color": "#97c4ff" },
			"markup.raw.inline": { "color": "#97c4ff" },
			"markup.raw.block": { "color": "#97c4ff" },
			"diff.plus": { "color": "#97c4ff" },
			"diff.minus": { "color": "#fe8c2c" },
			"diff.delta": { "color": "#ffde80" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#b969f3" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#ffa359",
				"font_weight": 700
			},
			"predictive": {
				"color": "#636363",
				"font_style": "italic"
			},
			"selector": { "color": "#ffa359" },
			"enum": { "color": "#e290f0" },
			"hint": { "color": "#737373" },
			"variant": { "color": "#ffcc81" }
		}
	}
};
var pierre_dark_soft_default = {
	name: "Pierre Dark Soft",
	appearance: "dark",
	style: {
		"background": "#101010",
		"text": "#d4d4d4",
		"editor.background": "#171717",
		"editor.foreground": "#d4d4d4",
		"editor.active_line.background": "#1f3e5e8c",
		"players": [{
			"cursor": "#69b1ff",
			"selection": "#69b1ff4d"
		}],
		"created": "#60d199",
		"deleted": "#ff6762",
		"modified": "#69b1ff",
		"terminal.ansi.green": "#0dbe4e",
		"terminal.ansi.red": "#ff2e3f",
		"terminal.ansi.blue": "#009fff",
		"syntax": {
			"comment": { "color": "#636363" },
			"comment.doc": { "color": "#636363" },
			"string": { "color": "#8cda94" },
			"string.escape": { "color": "#8fe0d0" },
			"string.regex": { "color": "#92dde4" },
			"string.special": { "color": "#8fe0d0" },
			"string.special.symbol": { "color": "#ffde80" },
			"number": { "color": "#96d9f6" },
			"constant": { "color": "#ffde80" },
			"boolean": { "color": "#96d9f6" },
			"keyword": { "color": "#ff91a8" },
			"keyword.operator": { "color": "#68cdf2" },
			"function": { "color": "#ba8ffd" },
			"function.method": { "color": "#ba8ffd" },
			"function.builtin": { "color": "#ba8ffd" },
			"function.special.definition": { "color": "#ba8ffd" },
			"function.call": { "color": "#ba8ffd" },
			"type": { "color": "#e290f0" },
			"type.builtin": { "color": "#e290f0" },
			"constructor": { "color": "#e290f0" },
			"variable": { "color": "#ffba82" },
			"variable.builtin": { "color": "#ffbc56" },
			"variable.member": { "color": "#ffba82" },
			"variable.parameter": { "color": "#8a8a8a" },
			"variable.special": { "color": "#ffbc56" },
			"property": { "color": "#ffba82" },
			"property.css": { "color": "#69b1ff" },
			"property.definition": { "color": "#69b1ff" },
			"property_name": { "color": "#69b1ff" },
			"value": { "color": "#96d9f6" },
			"constant.css": { "color": "#ffde80" },
			"string.plain": { "color": "#96d9f6" },
			"plain_value": { "color": "#96d9f6" },
			"tag.css": { "color": "#ffa685" },
			"tag_name": { "color": "#ffa685" },
			"class": { "color": "#8eddb2" },
			"class_name": { "color": "#8eddb2" },
			"selector.class": { "color": "#8eddb2" },
			"selector.id": { "color": "#ba8ffd" },
			"id_name": { "color": "#ba8ffd" },
			"selector.pseudo": { "color": "#68cdf2" },
			"pseudo_class_selector": { "color": "#68cdf2" },
			"pseudo_element_selector": { "color": "#68cdf2" },
			"keyword.directive": { "color": "#ff91a8" },
			"keyword.control.at-rule": { "color": "#ff91a8" },
			"at_keyword": { "color": "#ff91a8" },
			"variable.scss": { "color": "#ffba82" },
			"variable.css": { "color": "#ffba82" },
			"property.custom": { "color": "#ffba82" },
			"unit": { "color": "#96d9f6" },
			"number.unit": { "color": "#96d9f6" },
			"color": { "color": "#ffde80" },
			"constant.color": { "color": "#ffde80" },
			"keyword.important": { "color": "#ff91a8" },
			"variable.language": { "color": "#ffbc56" },
			"this": { "color": "#ffbc56" },
			"self": { "color": "#ffbc56" },
			"type.class": { "color": "#e290f0" },
			"property.object": { "color": "#ffba82" },
			"property_identifier": { "color": "#ffba82" },
			"shorthand_property_identifier": { "color": "#ffba82" },
			"shorthand_property_identifier_pattern": { "color": "#ffba82" },
			"method_definition": { "color": "#ba8ffd" },
			"function.method.call": { "color": "#ba8ffd" },
			"string.template": { "color": "#8cda94" },
			"template_string": { "color": "#8cda94" },
			"tag.jsx": { "color": "#ffa685" },
			"tag.component": { "color": "#e290f0" },
			"punctuation": { "color": "#737373" },
			"punctuation.bracket": { "color": "#737373" },
			"punctuation.delimiter": { "color": "#737373" },
			"punctuation.list_marker": { "color": "#737373" },
			"punctuation.special": { "color": "#ff91a8" },
			"operator": { "color": "#68cdf2" },
			"tag": { "color": "#ffa685" },
			"attribute": { "color": "#8eddb2" },
			"label": { "color": "#ffbc56" },
			"namespace": { "color": "#ffbc56" },
			"decorator": { "color": "#97c4ff" },
			"attribute.builtin": { "color": "#97c4ff" },
			"embedded": { "color": "#d4d4d4" },
			"preproc": { "color": "#ff91a8" },
			"text.literal": { "color": "#8cda94" },
			"markup.heading": {
				"color": "#ffa685",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ffde80",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#ff91a8",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#636363" },
			"markup.link.url": { "color": "#69b1ff" },
			"markup.link.text": { "color": "#ba8ffd" },
			"markup.quote": {
				"color": "#636363",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ffa685" },
			"markup.list.numbered": { "color": "#ffa685" },
			"markup.list.unnumbered": { "color": "#ffa685" },
			"markup.raw": { "color": "#8cda94" },
			"markup.raw.inline": { "color": "#8cda94" },
			"markup.raw.block": { "color": "#8cda94" },
			"diff.plus": { "color": "#60d199" },
			"diff.minus": { "color": "#ff6762" },
			"diff.delta": { "color": "#ffd452" },
			"link_text": { "color": "#69b1ff" },
			"link_uri": { "color": "#ff91a8" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#69b1ff" },
			"title": {
				"color": "#ffa685",
				"font_weight": 700
			},
			"predictive": {
				"color": "#525252",
				"font_style": "italic"
			},
			"selector": { "color": "#ffa685" },
			"enum": { "color": "#e290f0" },
			"hint": { "color": "#636363" },
			"variant": { "color": "#ffde80" }
		}
	}
};
var pierre_dark_tritanopia_default = {
	name: "Pierre Dark Tritanopia",
	appearance: "dark",
	style: {
		"background": "#171717",
		"text": "#fafafa",
		"editor.background": "#0a0a0a",
		"editor.foreground": "#fafafa",
		"editor.active_line.background": "#19283c8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff4d"
		}],
		"created": "#92dde4",
		"deleted": "#ff855e",
		"modified": "#009fff",
		"terminal.ansi.green": "#64d1db",
		"terminal.ansi.red": "#ff855e",
		"terminal.ansi.blue": "#69b1ff",
		"syntax": {
			"comment": { "color": "#737373" },
			"comment.doc": { "color": "#737373" },
			"string": { "color": "#92dde4" },
			"string.escape": { "color": "#64d1db" },
			"string.regex": { "color": "#64d1db" },
			"string.special": { "color": "#64d1db" },
			"string.special.symbol": { "color": "#ffcc81" },
			"number": { "color": "#69b1ff" },
			"constant": { "color": "#ffcc81" },
			"boolean": { "color": "#69b1ff" },
			"keyword": { "color": "#d568ea" },
			"keyword.operator": { "color": "#00c5d2" },
			"function": { "color": "#97c4ff" },
			"function.method": { "color": "#97c4ff" },
			"function.builtin": { "color": "#97c4ff" },
			"function.special.definition": { "color": "#97c4ff" },
			"function.call": { "color": "#97c4ff" },
			"type": { "color": "#ea68bc" },
			"type.builtin": { "color": "#ea68bc" },
			"constructor": { "color": "#ea68bc" },
			"variable": { "color": "#ff855e" },
			"variable.builtin": { "color": "#ff855e" },
			"variable.member": { "color": "#ff855e" },
			"variable.parameter": { "color": "#a3a3a3" },
			"variable.special": { "color": "#ff855e" },
			"property": { "color": "#ff855e" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#69b1ff" },
			"constant.css": { "color": "#ffcc81" },
			"string.plain": { "color": "#69b1ff" },
			"plain_value": { "color": "#69b1ff" },
			"tag.css": { "color": "#ff855e" },
			"tag_name": { "color": "#ff855e" },
			"class": { "color": "#64d1db" },
			"class_name": { "color": "#64d1db" },
			"selector.class": { "color": "#64d1db" },
			"selector.id": { "color": "#97c4ff" },
			"id_name": { "color": "#97c4ff" },
			"selector.pseudo": { "color": "#00c5d2" },
			"pseudo_class_selector": { "color": "#00c5d2" },
			"pseudo_element_selector": { "color": "#00c5d2" },
			"keyword.directive": { "color": "#d568ea" },
			"keyword.control.at-rule": { "color": "#d568ea" },
			"at_keyword": { "color": "#d568ea" },
			"variable.scss": { "color": "#ff855e" },
			"variable.css": { "color": "#ff855e" },
			"property.custom": { "color": "#ff855e" },
			"unit": { "color": "#69b1ff" },
			"number.unit": { "color": "#69b1ff" },
			"color": { "color": "#ffcc81" },
			"constant.color": { "color": "#ffcc81" },
			"keyword.important": { "color": "#d568ea" },
			"variable.language": { "color": "#ff855e" },
			"this": { "color": "#ff855e" },
			"self": { "color": "#ff855e" },
			"type.class": { "color": "#ea68bc" },
			"property.object": { "color": "#ff855e" },
			"property_identifier": { "color": "#ff855e" },
			"shorthand_property_identifier": { "color": "#ff855e" },
			"shorthand_property_identifier_pattern": { "color": "#ff855e" },
			"method_definition": { "color": "#97c4ff" },
			"function.method.call": { "color": "#97c4ff" },
			"string.template": { "color": "#92dde4" },
			"template_string": { "color": "#92dde4" },
			"tag.jsx": { "color": "#ff855e" },
			"tag.component": { "color": "#ea68bc" },
			"punctuation": { "color": "#636363" },
			"punctuation.bracket": { "color": "#636363" },
			"punctuation.delimiter": { "color": "#636363" },
			"punctuation.list_marker": { "color": "#636363" },
			"punctuation.special": { "color": "#d568ea" },
			"operator": { "color": "#00c5d2" },
			"tag": { "color": "#ff855e" },
			"attribute": { "color": "#64d1db" },
			"label": { "color": "#ff855e" },
			"namespace": { "color": "#ff855e" },
			"decorator": { "color": "#69b1ff" },
			"attribute.builtin": { "color": "#69b1ff" },
			"embedded": { "color": "#fafafa" },
			"preproc": { "color": "#d568ea" },
			"text.literal": { "color": "#92dde4" },
			"markup.heading": {
				"color": "#ff855e",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ffcc81",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#d568ea",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#737373" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#97c4ff" },
			"markup.quote": {
				"color": "#737373",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ff855e" },
			"markup.list.numbered": { "color": "#ff855e" },
			"markup.list.unnumbered": { "color": "#ff855e" },
			"markup.raw": { "color": "#92dde4" },
			"markup.raw.inline": { "color": "#92dde4" },
			"markup.raw.block": { "color": "#92dde4" },
			"diff.plus": { "color": "#92dde4" },
			"diff.minus": { "color": "#ff855e" },
			"diff.delta": { "color": "#ffbc56" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#d568ea" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#ff855e",
				"font_weight": 700
			},
			"predictive": {
				"color": "#636363",
				"font_style": "italic"
			},
			"selector": { "color": "#ff855e" },
			"enum": { "color": "#ea68bc" },
			"hint": { "color": "#737373" },
			"variant": { "color": "#ffcc81" }
		}
	}
};
var pierre_dark_vibrant_default = {
	name: "Pierre Dark Vibrant",
	appearance: "dark",
	style: {
		"background": "color(display-p3 0.090196 0.090196 0.090196)",
		"text": "color(display-p3 0.980392 0.980392 0.980392)",
		"editor.background": "color(display-p3 0.039216 0.039216 0.039216)",
		"editor.foreground": "color(display-p3 0.980392 0.980392 0.980392)",
		"editor.active_line.background": "color(display-p3 0.098734 0.152326 0.240886 / 0.550000)",
		"players": [{
			"cursor": "color(display-p3 0.308664 0.645271 1.000000)",
			"selection": "color(display-p3 0.308664 0.645271 1.000000 / 0.250000)"
		}],
		"created": "color(display-p3 0.304148 0.801790 0.517191)",
		"deleted": "color(display-p3 1.000000 0.250216 0.262337)",
		"modified": "color(display-p3 0.308664 0.645271 1.000000)",
		"terminal.ansi.green": "color(display-p3 0.298067 0.776115 0.322484)",
		"terminal.ansi.red": "color(display-p3 1.000000 0.250216 0.262337)",
		"terminal.ansi.blue": "color(display-p3 0.308664 0.645271 1.000000)",
		"syntax": {
			"comment": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"comment.doc": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"string": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"string.escape": { "color": "color(display-p3 0.466798 0.860904 0.775090)" },
			"string.regex": { "color": "color(display-p3 0.520590 0.857139 0.902107)" },
			"string.special": { "color": "color(display-p3 0.466798 0.860904 0.775090)" },
			"string.special.symbol": { "color": "color(display-p3 1.000000 0.868456 0.454295)" },
			"number": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"constant": { "color": "color(display-p3 1.000000 0.868456 0.454295)" },
			"boolean": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"keyword": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"keyword.operator": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"function": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"function.method": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"function.builtin": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"function.special.definition": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"function.call": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"type": { "color": "color(display-p3 0.829375 0.434619 0.954315)" },
			"type.builtin": { "color": "color(display-p3 0.829375 0.434619 0.954315)" },
			"constructor": { "color": "color(display-p3 0.829375 0.434619 0.954315)" },
			"variable": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"variable.builtin": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"variable.member": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"variable.parameter": { "color": "color(display-p3 0.639216 0.639216 0.639216)" },
			"variable.special": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"property": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"property.css": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"property.definition": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"property_name": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"value": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"constant.css": { "color": "color(display-p3 1.000000 0.868456 0.454295)" },
			"string.plain": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"plain_value": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"tag.css": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"tag_name": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"class": { "color": "color(display-p3 0.460672 0.843934 0.608755)" },
			"class_name": { "color": "color(display-p3 0.460672 0.843934 0.608755)" },
			"selector.class": { "color": "color(display-p3 0.460672 0.843934 0.608755)" },
			"selector.id": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"id_name": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"selector.pseudo": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"pseudo_class_selector": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"pseudo_element_selector": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"keyword.directive": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"keyword.control.at-rule": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"at_keyword": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"variable.scss": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"variable.css": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"property.custom": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"unit": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"number.unit": { "color": "color(display-p3 0.452682 0.814110 0.989434)" },
			"color": { "color": "color(display-p3 1.000000 0.868456 0.454295)" },
			"constant.color": { "color": "color(display-p3 1.000000 0.868456 0.454295)" },
			"keyword.important": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"variable.language": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"this": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"self": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"type.class": { "color": "color(display-p3 0.829375 0.434619 0.954315)" },
			"property.object": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"property_identifier": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"shorthand_property_identifier": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"shorthand_property_identifier_pattern": { "color": "color(display-p3 1.000000 0.688063 0.418777)" },
			"method_definition": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"function.method.call": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"string.template": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"template_string": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"tag.jsx": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"tag.component": { "color": "color(display-p3 0.829375 0.434619 0.954315)" },
			"punctuation": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.bracket": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.delimiter": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.list_marker": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.special": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"operator": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"tag": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"attribute": { "color": "color(display-p3 0.460672 0.843934 0.608755)" },
			"label": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"namespace": { "color": "color(display-p3 1.000000 0.719280 0.270071)" },
			"decorator": { "color": "color(display-p3 0.453315 0.683106 1.000000)" },
			"attribute.builtin": { "color": "color(display-p3 0.453315 0.683106 1.000000)" },
			"embedded": { "color": "color(display-p3 0.980392 0.980392 0.980392)" },
			"preproc": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"text.literal": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"markup.heading": {
				"color": "color(display-p3 1.000000 0.566977 0.409224)",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "color(display-p3 1.000000 0.868456 0.454295)",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "color(display-p3 0.994741 0.445201 0.573499)",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"markup.link.url": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"markup.link.text": { "color": "color(display-p3 0.615613 0.445256 1.000000)" },
			"markup.quote": {
				"color": "color(display-p3 0.450980 0.450980 0.450980)",
				"font_style": "italic"
			},
			"markup.list": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"markup.list.numbered": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"markup.list.unnumbered": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"markup.raw": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"markup.raw.inline": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"markup.raw.block": { "color": "color(display-p3 0.451324 0.823458 0.446819)" },
			"diff.plus": { "color": "color(display-p3 0.304148 0.801790 0.517191)" },
			"diff.minus": { "color": "color(display-p3 1.000000 0.250216 0.262337)" },
			"diff.delta": { "color": "color(display-p3 1.000000 0.832068 0.300621)" },
			"link_text": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"link_uri": { "color": "color(display-p3 0.994741 0.445201 0.573499)" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"title": {
				"color": "color(display-p3 1.000000 0.566977 0.409224)",
				"font_weight": 700
			},
			"predictive": {
				"color": "color(display-p3 0.388235 0.388235 0.388235)",
				"font_style": "italic"
			},
			"selector": { "color": "color(display-p3 1.000000 0.566977 0.409224)" },
			"enum": { "color": "color(display-p3 0.829375 0.434619 0.954315)" },
			"hint": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"variant": { "color": "color(display-p3 1.000000 0.868456 0.454295)" }
		}
	}
};
var pierre_dark_default = {
	name: "Pierre Dark",
	appearance: "dark",
	style: {
		"background": "#171717",
		"text": "#fafafa",
		"editor.background": "#0a0a0a",
		"editor.foreground": "#fafafa",
		"editor.active_line.background": "#19283c8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff4d"
		}],
		"created": "#07c480",
		"deleted": "#ff2e3f",
		"modified": "#009fff",
		"terminal.ansi.green": "#0dbe4e",
		"terminal.ansi.red": "#ff2e3f",
		"terminal.ansi.blue": "#009fff",
		"syntax": {
			"comment": { "color": "#737373" },
			"comment.doc": { "color": "#737373" },
			"string": { "color": "#5ecc71" },
			"string.escape": { "color": "#61d5c0" },
			"string.regex": { "color": "#64d1db" },
			"string.special": { "color": "#61d5c0" },
			"string.special.symbol": { "color": "#ffd452" },
			"number": { "color": "#68cdf2" },
			"constant": { "color": "#ffd452" },
			"boolean": { "color": "#68cdf2" },
			"keyword": { "color": "#ff678d" },
			"keyword.operator": { "color": "#08c0ef" },
			"function": { "color": "#9d6afb" },
			"function.method": { "color": "#9d6afb" },
			"function.builtin": { "color": "#9d6afb" },
			"function.special.definition": { "color": "#9d6afb" },
			"function.call": { "color": "#9d6afb" },
			"type": { "color": "#d568ea" },
			"type.builtin": { "color": "#d568ea" },
			"constructor": { "color": "#d568ea" },
			"variable": { "color": "#ffa359" },
			"variable.builtin": { "color": "#ffab16" },
			"variable.member": { "color": "#ffa359" },
			"variable.parameter": { "color": "#a3a3a3" },
			"variable.special": { "color": "#ffab16" },
			"property": { "color": "#ffa359" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#68cdf2" },
			"constant.css": { "color": "#ffd452" },
			"string.plain": { "color": "#68cdf2" },
			"plain_value": { "color": "#68cdf2" },
			"tag.css": { "color": "#ff855e" },
			"tag_name": { "color": "#ff855e" },
			"class": { "color": "#60d199" },
			"class_name": { "color": "#60d199" },
			"selector.class": { "color": "#60d199" },
			"selector.id": { "color": "#9d6afb" },
			"id_name": { "color": "#9d6afb" },
			"selector.pseudo": { "color": "#08c0ef" },
			"pseudo_class_selector": { "color": "#08c0ef" },
			"pseudo_element_selector": { "color": "#08c0ef" },
			"keyword.directive": { "color": "#ff678d" },
			"keyword.control.at-rule": { "color": "#ff678d" },
			"at_keyword": { "color": "#ff678d" },
			"variable.scss": { "color": "#ffa359" },
			"variable.css": { "color": "#ffa359" },
			"property.custom": { "color": "#ffa359" },
			"unit": { "color": "#68cdf2" },
			"number.unit": { "color": "#68cdf2" },
			"color": { "color": "#ffd452" },
			"constant.color": { "color": "#ffd452" },
			"keyword.important": { "color": "#ff678d" },
			"variable.language": { "color": "#ffab16" },
			"this": { "color": "#ffab16" },
			"self": { "color": "#ffab16" },
			"type.class": { "color": "#d568ea" },
			"property.object": { "color": "#ffa359" },
			"property_identifier": { "color": "#ffa359" },
			"shorthand_property_identifier": { "color": "#ffa359" },
			"shorthand_property_identifier_pattern": { "color": "#ffa359" },
			"method_definition": { "color": "#9d6afb" },
			"function.method.call": { "color": "#9d6afb" },
			"string.template": { "color": "#5ecc71" },
			"template_string": { "color": "#5ecc71" },
			"tag.jsx": { "color": "#ff855e" },
			"tag.component": { "color": "#d568ea" },
			"punctuation": { "color": "#636363" },
			"punctuation.bracket": { "color": "#636363" },
			"punctuation.delimiter": { "color": "#636363" },
			"punctuation.list_marker": { "color": "#636363" },
			"punctuation.special": { "color": "#ff678d" },
			"operator": { "color": "#08c0ef" },
			"tag": { "color": "#ff855e" },
			"attribute": { "color": "#60d199" },
			"label": { "color": "#ffab16" },
			"namespace": { "color": "#ffab16" },
			"decorator": { "color": "#69b1ff" },
			"attribute.builtin": { "color": "#69b1ff" },
			"embedded": { "color": "#fafafa" },
			"preproc": { "color": "#ff678d" },
			"text.literal": { "color": "#5ecc71" },
			"markup.heading": {
				"color": "#ff855e",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ffd452",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#ff678d",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#737373" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#9d6afb" },
			"markup.quote": {
				"color": "#737373",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ff855e" },
			"markup.list.numbered": { "color": "#ff855e" },
			"markup.list.unnumbered": { "color": "#ff855e" },
			"markup.raw": { "color": "#5ecc71" },
			"markup.raw.inline": { "color": "#5ecc71" },
			"markup.raw.block": { "color": "#5ecc71" },
			"diff.plus": { "color": "#07c480" },
			"diff.minus": { "color": "#ff2e3f" },
			"diff.delta": { "color": "#ffca00" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#ff678d" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#ff855e",
				"font_weight": 700
			},
			"predictive": {
				"color": "#636363",
				"font_style": "italic"
			},
			"selector": { "color": "#ff855e" },
			"enum": { "color": "#d568ea" },
			"hint": { "color": "#737373" },
			"variant": { "color": "#ffd452" }
		}
	}
};
var pierre_light_protanopia_deuteranopia_default = {
	name: "Pierre Light Protanopia & Deuteranopia",
	appearance: "light",
	style: {
		"background": "#f5f5f5",
		"text": "#0a0a0a",
		"editor.background": "#ffffff",
		"editor.foreground": "#0a0a0a",
		"editor.active_line.background": "#dfebff8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff2e"
		}],
		"created": "#216cab",
		"deleted": "#ac6023",
		"modified": "#009fff",
		"terminal.ansi.green": "#216cab",
		"terminal.ansi.red": "#ac6023",
		"terminal.ansi.blue": "#1a85d4",
		"syntax": {
			"comment": { "color": "#737373" },
			"comment.doc": { "color": "#737373" },
			"string": { "color": "#215584" },
			"string.escape": { "color": "#1e858e" },
			"string.regex": { "color": "#2182a1" },
			"string.special": { "color": "#1e858e" },
			"string.special.symbol": { "color": "#ac741d" },
			"number": { "color": "#2182a1" },
			"constant": { "color": "#ac741d" },
			"boolean": { "color": "#2182a1" },
			"keyword": { "color": "#8836c7" },
			"keyword.operator": { "color": "#2182a1" },
			"function": { "color": "#5731a7" },
			"function.method": { "color": "#5731a7" },
			"function.builtin": { "color": "#5731a7" },
			"function.special.definition": { "color": "#5731a7" },
			"function.call": { "color": "#5731a7" },
			"type": { "color": "#a631be" },
			"type.builtin": { "color": "#a631be" },
			"constructor": { "color": "#a631be" },
			"variable": { "color": "#ac6023" },
			"variable.builtin": { "color": "#ac741d" },
			"variable.member": { "color": "#ac6023" },
			"variable.parameter": { "color": "#636363" },
			"variable.special": { "color": "#ac741d" },
			"property": { "color": "#ac6023" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#2182a1" },
			"constant.css": { "color": "#ac741d" },
			"string.plain": { "color": "#2182a1" },
			"plain_value": { "color": "#2182a1" },
			"tag.css": { "color": "#ac6023" },
			"tag_name": { "color": "#ac6023" },
			"class": { "color": "#ac741d" },
			"class_name": { "color": "#ac741d" },
			"selector.class": { "color": "#ac741d" },
			"selector.id": { "color": "#5731a7" },
			"id_name": { "color": "#5731a7" },
			"selector.pseudo": { "color": "#2182a1" },
			"pseudo_class_selector": { "color": "#2182a1" },
			"pseudo_element_selector": { "color": "#2182a1" },
			"keyword.directive": { "color": "#8836c7" },
			"keyword.control.at-rule": { "color": "#8836c7" },
			"at_keyword": { "color": "#8836c7" },
			"variable.scss": { "color": "#ac6023" },
			"variable.css": { "color": "#ac6023" },
			"property.custom": { "color": "#ac6023" },
			"unit": { "color": "#2182a1" },
			"number.unit": { "color": "#2182a1" },
			"color": { "color": "#ac741d" },
			"constant.color": { "color": "#ac741d" },
			"keyword.important": { "color": "#8836c7" },
			"variable.language": { "color": "#ac741d" },
			"this": { "color": "#ac741d" },
			"self": { "color": "#ac741d" },
			"type.class": { "color": "#a631be" },
			"property.object": { "color": "#ac6023" },
			"property_identifier": { "color": "#ac6023" },
			"shorthand_property_identifier": { "color": "#ac6023" },
			"shorthand_property_identifier_pattern": { "color": "#ac6023" },
			"method_definition": { "color": "#5731a7" },
			"function.method.call": { "color": "#5731a7" },
			"string.template": { "color": "#215584" },
			"template_string": { "color": "#215584" },
			"tag.jsx": { "color": "#ac6023" },
			"tag.component": { "color": "#a631be" },
			"punctuation": { "color": "#636363" },
			"punctuation.bracket": { "color": "#636363" },
			"punctuation.delimiter": { "color": "#636363" },
			"punctuation.list_marker": { "color": "#636363" },
			"punctuation.special": { "color": "#8836c7" },
			"operator": { "color": "#2182a1" },
			"tag": { "color": "#ac6023" },
			"attribute": { "color": "#ac741d" },
			"label": { "color": "#ac741d" },
			"namespace": { "color": "#ac741d" },
			"decorator": { "color": "#216cab" },
			"attribute.builtin": { "color": "#216cab" },
			"embedded": { "color": "#0a0a0a" },
			"preproc": { "color": "#8836c7" },
			"text.literal": { "color": "#215584" },
			"markup.heading": {
				"color": "#ac6023",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ac741d",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#8836c7",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#737373" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#5731a7" },
			"markup.quote": {
				"color": "#737373",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ac6023" },
			"markup.list.numbered": { "color": "#ac6023" },
			"markup.list.unnumbered": { "color": "#ac6023" },
			"markup.raw": { "color": "#215584" },
			"markup.raw.inline": { "color": "#215584" },
			"markup.raw.block": { "color": "#215584" },
			"diff.plus": { "color": "#216cab" },
			"diff.minus": { "color": "#ac6023" },
			"diff.delta": { "color": "#ffca00" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#8836c7" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#ac6023",
				"font_weight": 700
			},
			"predictive": {
				"color": "#8a8a8a",
				"font_style": "italic"
			},
			"selector": { "color": "#ac6023" },
			"enum": { "color": "#a631be" },
			"hint": { "color": "#737373" },
			"variant": { "color": "#ac741d" }
		}
	}
};
var pierre_light_soft_default = {
	name: "Pierre Light Soft",
	appearance: "light",
	style: {
		"background": "#f7f7f7",
		"text": "#525252",
		"editor.background": "#ffffff",
		"editor.foreground": "#525252",
		"editor.active_line.background": "#dfebff8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff2e"
		}],
		"created": "#07c480",
		"deleted": "#ff2e3f",
		"modified": "#009fff",
		"terminal.ansi.green": "#0dbe4e",
		"terminal.ansi.red": "#ff2e3f",
		"terminal.ansi.blue": "#009fff",
		"syntax": {
			"comment": { "color": "#8a8a8a" },
			"comment.doc": { "color": "#8a8a8a" },
			"string": { "color": "#0dbe4e" },
			"string.escape": { "color": "#00cab1" },
			"string.regex": { "color": "#00c5d2" },
			"string.special": { "color": "#00cab1" },
			"string.special.symbol": { "color": "#ffca00" },
			"number": { "color": "#08c0ef" },
			"constant": { "color": "#ffca00" },
			"boolean": { "color": "#08c0ef" },
			"keyword": { "color": "#ff678d" },
			"keyword.operator": { "color": "#68cdf2" },
			"function": { "color": "#9d6afb" },
			"function.method": { "color": "#9d6afb" },
			"function.builtin": { "color": "#9d6afb" },
			"function.special.definition": { "color": "#9d6afb" },
			"function.call": { "color": "#9d6afb" },
			"type": { "color": "#d568ea" },
			"type.builtin": { "color": "#d568ea" },
			"constructor": { "color": "#d568ea" },
			"variable": { "color": "#fe8c2c" },
			"variable.builtin": { "color": "#ffab16" },
			"variable.member": { "color": "#fe8c2c" },
			"variable.parameter": { "color": "#737373" },
			"variable.special": { "color": "#ffab16" },
			"property": { "color": "#fe8c2c" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#08c0ef" },
			"constant.css": { "color": "#ffca00" },
			"string.plain": { "color": "#08c0ef" },
			"plain_value": { "color": "#08c0ef" },
			"tag.css": { "color": "#ff5d36" },
			"tag_name": { "color": "#ff5d36" },
			"class": { "color": "#07c480" },
			"class_name": { "color": "#07c480" },
			"selector.class": { "color": "#07c480" },
			"selector.id": { "color": "#9d6afb" },
			"id_name": { "color": "#9d6afb" },
			"selector.pseudo": { "color": "#68cdf2" },
			"pseudo_class_selector": { "color": "#68cdf2" },
			"pseudo_element_selector": { "color": "#68cdf2" },
			"keyword.directive": { "color": "#ff678d" },
			"keyword.control.at-rule": { "color": "#ff678d" },
			"at_keyword": { "color": "#ff678d" },
			"variable.scss": { "color": "#fe8c2c" },
			"variable.css": { "color": "#fe8c2c" },
			"property.custom": { "color": "#fe8c2c" },
			"unit": { "color": "#08c0ef" },
			"number.unit": { "color": "#08c0ef" },
			"color": { "color": "#ffca00" },
			"constant.color": { "color": "#ffca00" },
			"keyword.important": { "color": "#ff678d" },
			"variable.language": { "color": "#ffab16" },
			"this": { "color": "#ffab16" },
			"self": { "color": "#ffab16" },
			"type.class": { "color": "#d568ea" },
			"property.object": { "color": "#fe8c2c" },
			"property_identifier": { "color": "#fe8c2c" },
			"shorthand_property_identifier": { "color": "#fe8c2c" },
			"shorthand_property_identifier_pattern": { "color": "#fe8c2c" },
			"method_definition": { "color": "#9d6afb" },
			"function.method.call": { "color": "#9d6afb" },
			"string.template": { "color": "#0dbe4e" },
			"template_string": { "color": "#0dbe4e" },
			"tag.jsx": { "color": "#ff5d36" },
			"tag.component": { "color": "#d568ea" },
			"punctuation": { "color": "#737373" },
			"punctuation.bracket": { "color": "#737373" },
			"punctuation.delimiter": { "color": "#737373" },
			"punctuation.list_marker": { "color": "#737373" },
			"punctuation.special": { "color": "#ff678d" },
			"operator": { "color": "#68cdf2" },
			"tag": { "color": "#ff5d36" },
			"attribute": { "color": "#07c480" },
			"label": { "color": "#ffab16" },
			"namespace": { "color": "#ffab16" },
			"decorator": { "color": "#69b1ff" },
			"attribute.builtin": { "color": "#69b1ff" },
			"embedded": { "color": "#525252" },
			"preproc": { "color": "#ff678d" },
			"text.literal": { "color": "#0dbe4e" },
			"markup.heading": {
				"color": "#ff5d36",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ffca00",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#ff678d",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#8a8a8a" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#9d6afb" },
			"markup.quote": {
				"color": "#8a8a8a",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ff5d36" },
			"markup.list.numbered": { "color": "#ff5d36" },
			"markup.list.unnumbered": { "color": "#ff5d36" },
			"markup.raw": { "color": "#0dbe4e" },
			"markup.raw.inline": { "color": "#0dbe4e" },
			"markup.raw.block": { "color": "#0dbe4e" },
			"diff.plus": { "color": "#07c480" },
			"diff.minus": { "color": "#ff2e3f" },
			"diff.delta": { "color": "#ffca00" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#ff678d" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#ff5d36",
				"font_weight": 700
			},
			"predictive": {
				"color": "#a3a3a3",
				"font_style": "italic"
			},
			"selector": { "color": "#ff5d36" },
			"enum": { "color": "#d568ea" },
			"hint": { "color": "#8a8a8a" },
			"variant": { "color": "#ffca00" }
		}
	}
};
var pierre_light_tritanopia_default = {
	name: "Pierre Light Tritanopia",
	appearance: "light",
	style: {
		"background": "#f5f5f5",
		"text": "#0a0a0a",
		"editor.background": "#ffffff",
		"editor.foreground": "#0a0a0a",
		"editor.active_line.background": "#dfebff8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff2e"
		}],
		"created": "#1e858e",
		"deleted": "#d5512f",
		"modified": "#009fff",
		"terminal.ansi.green": "#1e858e",
		"terminal.ansi.red": "#d5512f",
		"terminal.ansi.blue": "#1a85d4",
		"syntax": {
			"comment": { "color": "#737373" },
			"comment.doc": { "color": "#737373" },
			"string": { "color": "#1e858e" },
			"string.escape": { "color": "#1e858e" },
			"string.regex": { "color": "#1e858e" },
			"string.special": { "color": "#1e858e" },
			"string.special.symbol": { "color": "#ac741d" },
			"number": { "color": "#1a85d4" },
			"constant": { "color": "#ac741d" },
			"boolean": { "color": "#1a85d4" },
			"keyword": { "color": "#a631be" },
			"keyword.operator": { "color": "#1e858e" },
			"function": { "color": "#216cab" },
			"function.method": { "color": "#216cab" },
			"function.builtin": { "color": "#216cab" },
			"function.special.definition": { "color": "#216cab" },
			"function.call": { "color": "#216cab" },
			"type": { "color": "#bd2e90" },
			"type.builtin": { "color": "#bd2e90" },
			"constructor": { "color": "#bd2e90" },
			"variable": { "color": "#ad4529" },
			"variable.builtin": { "color": "#d5512f" },
			"variable.member": { "color": "#ad4529" },
			"variable.parameter": { "color": "#636363" },
			"variable.special": { "color": "#d5512f" },
			"property": { "color": "#ad4529" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#1a85d4" },
			"constant.css": { "color": "#ac741d" },
			"string.plain": { "color": "#1a85d4" },
			"plain_value": { "color": "#1a85d4" },
			"tag.css": { "color": "#d5512f" },
			"tag_name": { "color": "#d5512f" },
			"class": { "color": "#1e858e" },
			"class_name": { "color": "#1e858e" },
			"selector.class": { "color": "#1e858e" },
			"selector.id": { "color": "#216cab" },
			"id_name": { "color": "#216cab" },
			"selector.pseudo": { "color": "#1e858e" },
			"pseudo_class_selector": { "color": "#1e858e" },
			"pseudo_element_selector": { "color": "#1e858e" },
			"keyword.directive": { "color": "#a631be" },
			"keyword.control.at-rule": { "color": "#a631be" },
			"at_keyword": { "color": "#a631be" },
			"variable.scss": { "color": "#ad4529" },
			"variable.css": { "color": "#ad4529" },
			"property.custom": { "color": "#ad4529" },
			"unit": { "color": "#1a85d4" },
			"number.unit": { "color": "#1a85d4" },
			"color": { "color": "#ac741d" },
			"constant.color": { "color": "#ac741d" },
			"keyword.important": { "color": "#a631be" },
			"variable.language": { "color": "#d5512f" },
			"this": { "color": "#d5512f" },
			"self": { "color": "#d5512f" },
			"type.class": { "color": "#bd2e90" },
			"property.object": { "color": "#ad4529" },
			"property_identifier": { "color": "#ad4529" },
			"shorthand_property_identifier": { "color": "#ad4529" },
			"shorthand_property_identifier_pattern": { "color": "#ad4529" },
			"method_definition": { "color": "#216cab" },
			"function.method.call": { "color": "#216cab" },
			"string.template": { "color": "#1e858e" },
			"template_string": { "color": "#1e858e" },
			"tag.jsx": { "color": "#d5512f" },
			"tag.component": { "color": "#bd2e90" },
			"punctuation": { "color": "#636363" },
			"punctuation.bracket": { "color": "#636363" },
			"punctuation.delimiter": { "color": "#636363" },
			"punctuation.list_marker": { "color": "#636363" },
			"punctuation.special": { "color": "#a631be" },
			"operator": { "color": "#1e858e" },
			"tag": { "color": "#d5512f" },
			"attribute": { "color": "#1e858e" },
			"label": { "color": "#d5512f" },
			"namespace": { "color": "#d5512f" },
			"decorator": { "color": "#1a85d4" },
			"attribute.builtin": { "color": "#1a85d4" },
			"embedded": { "color": "#0a0a0a" },
			"preproc": { "color": "#a631be" },
			"text.literal": { "color": "#1e858e" },
			"markup.heading": {
				"color": "#d5512f",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#ac741d",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#a631be",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#737373" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#216cab" },
			"markup.quote": {
				"color": "#737373",
				"font_style": "italic"
			},
			"markup.list": { "color": "#d5512f" },
			"markup.list.numbered": { "color": "#d5512f" },
			"markup.list.unnumbered": { "color": "#d5512f" },
			"markup.raw": { "color": "#1e858e" },
			"markup.raw.inline": { "color": "#1e858e" },
			"markup.raw.block": { "color": "#1e858e" },
			"diff.plus": { "color": "#1e858e" },
			"diff.minus": { "color": "#d5512f" },
			"diff.delta": { "color": "#ffab16" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#a631be" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#d5512f",
				"font_weight": 700
			},
			"predictive": {
				"color": "#8a8a8a",
				"font_style": "italic"
			},
			"selector": { "color": "#d5512f" },
			"enum": { "color": "#bd2e90" },
			"hint": { "color": "#737373" },
			"variant": { "color": "#ac741d" }
		}
	}
};
var pierre_light_vibrant_default = {
	name: "Pierre Light Vibrant",
	appearance: "light",
	style: {
		"background": "color(display-p3 0.960784 0.960784 0.960784)",
		"text": "color(display-p3 0.039216 0.039216 0.039216)",
		"editor.background": "color(display-p3 1.000000 1.000000 1.000000)",
		"editor.foreground": "color(display-p3 0.039216 0.039216 0.039216)",
		"editor.active_line.background": "color(display-p3 0.883107 0.920057 0.992610 / 0.550000)",
		"players": [{
			"cursor": "color(display-p3 0.308664 0.645271 1.000000)",
			"selection": "color(display-p3 0.308664 0.645271 1.000000 / 0.250000)"
		}],
		"created": "color(display-p3 0.266455 0.667541 0.435918)",
		"deleted": "color(display-p3 0.838044 0.219378 0.220424)",
		"modified": "color(display-p3 0.308664 0.645271 1.000000)",
		"terminal.ansi.green": "color(display-p3 0.266455 0.667541 0.435918)",
		"terminal.ansi.red": "color(display-p3 0.838044 0.219378 0.220424)",
		"terminal.ansi.blue": "color(display-p3 0.227104 0.537899 0.881328)",
		"syntax": {
			"comment": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"comment.doc": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"string": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"string.escape": { "color": "color(display-p3 0.272343 0.688141 0.603353)" },
			"string.regex": { "color": "color(display-p3 0.262058 0.668164 0.717478)" },
			"string.special": { "color": "color(display-p3 0.272343 0.688141 0.603353)" },
			"string.special.symbol": { "color": "color(display-p3 0.883654 0.721037 0.210874)" },
			"number": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"constant": { "color": "color(display-p3 0.883654 0.721037 0.210874)" },
			"boolean": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"keyword": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"keyword.operator": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"function": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"function.method": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"function.builtin": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"function.special.definition": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"function.call": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"type": { "color": "color(display-p3 0.660755 0.179954 0.815400)" },
			"type.builtin": { "color": "color(display-p3 0.660755 0.179954 0.815400)" },
			"constructor": { "color": "color(display-p3 0.660755 0.179954 0.815400)" },
			"variable": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"variable.builtin": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"variable.member": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"variable.parameter": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"variable.special": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"property": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"property.css": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"property.definition": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"property_name": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"value": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"constant.css": { "color": "color(display-p3 0.883654 0.721037 0.210874)" },
			"string.plain": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"plain_value": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"tag.css": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"tag_name": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"class": { "color": "color(display-p3 0.266455 0.667541 0.435918)" },
			"class_name": { "color": "color(display-p3 0.266455 0.667541 0.435918)" },
			"selector.class": { "color": "color(display-p3 0.266455 0.667541 0.435918)" },
			"selector.id": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"id_name": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"selector.pseudo": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"pseudo_class_selector": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"pseudo_element_selector": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"keyword.directive": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"keyword.control.at-rule": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"at_keyword": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"variable.scss": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"variable.css": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"property.custom": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"unit": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"number.unit": { "color": "color(display-p3 0.246852 0.642335 0.817202)" },
			"color": { "color": "color(display-p3 0.883654 0.721037 0.210874)" },
			"constant.color": { "color": "color(display-p3 0.883654 0.721037 0.210874)" },
			"keyword.important": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"variable.language": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"this": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"self": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"type.class": { "color": "color(display-p3 0.660755 0.179954 0.815400)" },
			"property.object": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"property_identifier": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"shorthand_property_identifier": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"shorthand_property_identifier_pattern": { "color": "color(display-p3 0.854172 0.502144 0.209646)" },
			"method_definition": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"function.method.call": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"string.template": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"template_string": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"tag.jsx": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"tag.component": { "color": "color(display-p3 0.660755 0.179954 0.815400)" },
			"punctuation": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.bracket": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.delimiter": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.list_marker": { "color": "color(display-p3 0.388235 0.388235 0.388235)" },
			"punctuation.special": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"operator": { "color": "color(display-p3 0.327292 0.790977 0.995660)" },
			"tag": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"attribute": { "color": "color(display-p3 0.266455 0.667541 0.435918)" },
			"label": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"namespace": { "color": "color(display-p3 0.870477 0.613222 0.203432)" },
			"decorator": { "color": "color(display-p3 0.227104 0.537899 0.881328)" },
			"attribute.builtin": { "color": "color(display-p3 0.227104 0.537899 0.881328)" },
			"embedded": { "color": "color(display-p3 0.039216 0.039216 0.039216)" },
			"preproc": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"text.literal": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"markup.heading": {
				"color": "color(display-p3 0.846123 0.351499 0.208754)",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "color(display-p3 0.883654 0.721037 0.210874)",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "color(display-p3 0.834880 0.207921 0.387456)",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"markup.link.url": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"markup.link.text": { "color": "color(display-p3 0.391345 0.215644 0.853560)" },
			"markup.quote": {
				"color": "color(display-p3 0.450980 0.450980 0.450980)",
				"font_style": "italic"
			},
			"markup.list": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"markup.list.numbered": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"markup.list.unnumbered": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"markup.raw": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"markup.raw.inline": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"markup.raw.block": { "color": "color(display-p3 0.259723 0.647032 0.276349)" },
			"diff.plus": { "color": "color(display-p3 0.266455 0.667541 0.435918)" },
			"diff.minus": { "color": "color(display-p3 0.838044 0.219378 0.220424)" },
			"diff.delta": { "color": "color(display-p3 0.883654 0.721037 0.210874)" },
			"link_text": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"link_uri": { "color": "color(display-p3 0.834880 0.207921 0.387456)" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "color(display-p3 0.308664 0.645271 1.000000)" },
			"title": {
				"color": "color(display-p3 0.846123 0.351499 0.208754)",
				"font_weight": 700
			},
			"predictive": {
				"color": "color(display-p3 0.541176 0.541176 0.541176)",
				"font_style": "italic"
			},
			"selector": { "color": "color(display-p3 0.846123 0.351499 0.208754)" },
			"enum": { "color": "color(display-p3 0.660755 0.179954 0.815400)" },
			"hint": { "color": "color(display-p3 0.450980 0.450980 0.450980)" },
			"variant": { "color": "color(display-p3 0.883654 0.721037 0.210874)" }
		}
	}
};
var pierre_light_default = {
	name: "Pierre Light",
	appearance: "light",
	style: {
		"background": "#f5f5f5",
		"text": "#0a0a0a",
		"editor.background": "#ffffff",
		"editor.foreground": "#0a0a0a",
		"editor.active_line.background": "#dfebff8c",
		"players": [{
			"cursor": "#009fff",
			"selection": "#009fff2e"
		}],
		"created": "#18a46c",
		"deleted": "#d52c36",
		"modified": "#009fff",
		"terminal.ansi.green": "#18a46c",
		"terminal.ansi.red": "#d52c36",
		"terminal.ansi.blue": "#1a85d4",
		"syntax": {
			"comment": { "color": "#737373" },
			"comment.doc": { "color": "#737373" },
			"string": { "color": "#199f43" },
			"string.escape": { "color": "#16a994" },
			"string.regex": { "color": "#17a5af" },
			"string.special": { "color": "#16a994" },
			"string.special.symbol": { "color": "#d5a910" },
			"number": { "color": "#1ca1c7" },
			"constant": { "color": "#d5a910" },
			"boolean": { "color": "#1ca1c7" },
			"keyword": { "color": "#d32a61" },
			"keyword.operator": { "color": "#08c0ef" },
			"function": { "color": "#693acf" },
			"function.method": { "color": "#693acf" },
			"function.builtin": { "color": "#693acf" },
			"function.special.definition": { "color": "#693acf" },
			"function.call": { "color": "#693acf" },
			"type": { "color": "#a631be" },
			"type.builtin": { "color": "#a631be" },
			"constructor": { "color": "#a631be" },
			"variable": { "color": "#d47628" },
			"variable.builtin": { "color": "#d5901c" },
			"variable.member": { "color": "#d47628" },
			"variable.parameter": { "color": "#636363" },
			"variable.special": { "color": "#d5901c" },
			"property": { "color": "#d47628" },
			"property.css": { "color": "#009fff" },
			"property.definition": { "color": "#009fff" },
			"property_name": { "color": "#009fff" },
			"value": { "color": "#1ca1c7" },
			"constant.css": { "color": "#d5a910" },
			"string.plain": { "color": "#1ca1c7" },
			"plain_value": { "color": "#1ca1c7" },
			"tag.css": { "color": "#d5512f" },
			"tag_name": { "color": "#d5512f" },
			"class": { "color": "#18a46c" },
			"class_name": { "color": "#18a46c" },
			"selector.class": { "color": "#18a46c" },
			"selector.id": { "color": "#693acf" },
			"id_name": { "color": "#693acf" },
			"selector.pseudo": { "color": "#08c0ef" },
			"pseudo_class_selector": { "color": "#08c0ef" },
			"pseudo_element_selector": { "color": "#08c0ef" },
			"keyword.directive": { "color": "#d32a61" },
			"keyword.control.at-rule": { "color": "#d32a61" },
			"at_keyword": { "color": "#d32a61" },
			"variable.scss": { "color": "#d47628" },
			"variable.css": { "color": "#d47628" },
			"property.custom": { "color": "#d47628" },
			"unit": { "color": "#1ca1c7" },
			"number.unit": { "color": "#1ca1c7" },
			"color": { "color": "#d5a910" },
			"constant.color": { "color": "#d5a910" },
			"keyword.important": { "color": "#d32a61" },
			"variable.language": { "color": "#d5901c" },
			"this": { "color": "#d5901c" },
			"self": { "color": "#d5901c" },
			"type.class": { "color": "#a631be" },
			"property.object": { "color": "#d47628" },
			"property_identifier": { "color": "#d47628" },
			"shorthand_property_identifier": { "color": "#d47628" },
			"shorthand_property_identifier_pattern": { "color": "#d47628" },
			"method_definition": { "color": "#693acf" },
			"function.method.call": { "color": "#693acf" },
			"string.template": { "color": "#199f43" },
			"template_string": { "color": "#199f43" },
			"tag.jsx": { "color": "#d5512f" },
			"tag.component": { "color": "#a631be" },
			"punctuation": { "color": "#636363" },
			"punctuation.bracket": { "color": "#636363" },
			"punctuation.delimiter": { "color": "#636363" },
			"punctuation.list_marker": { "color": "#636363" },
			"punctuation.special": { "color": "#d32a61" },
			"operator": { "color": "#08c0ef" },
			"tag": { "color": "#d5512f" },
			"attribute": { "color": "#18a46c" },
			"label": { "color": "#d5901c" },
			"namespace": { "color": "#d5901c" },
			"decorator": { "color": "#1a85d4" },
			"attribute.builtin": { "color": "#1a85d4" },
			"embedded": { "color": "#0a0a0a" },
			"preproc": { "color": "#d32a61" },
			"text.literal": { "color": "#199f43" },
			"markup.heading": {
				"color": "#d5512f",
				"font_weight": 700
			},
			"markup.bold": {
				"color": "#d5a910",
				"font_weight": 700
			},
			"markup.italic": {
				"color": "#d32a61",
				"font_style": "italic"
			},
			"markup.strikethrough": { "color": "#737373" },
			"markup.link.url": { "color": "#009fff" },
			"markup.link.text": { "color": "#693acf" },
			"markup.quote": {
				"color": "#737373",
				"font_style": "italic"
			},
			"markup.list": { "color": "#d5512f" },
			"markup.list.numbered": { "color": "#d5512f" },
			"markup.list.unnumbered": { "color": "#d5512f" },
			"markup.raw": { "color": "#199f43" },
			"markup.raw.inline": { "color": "#199f43" },
			"markup.raw.block": { "color": "#199f43" },
			"diff.plus": { "color": "#18a46c" },
			"diff.minus": { "color": "#d52c36" },
			"diff.delta": { "color": "#d5a910" },
			"link_text": { "color": "#009fff" },
			"link_uri": { "color": "#d32a61" },
			"emphasis": { "font_style": "italic" },
			"emphasis.strong": { "font_weight": 700 },
			"primary": { "color": "#009fff" },
			"title": {
				"color": "#d5512f",
				"font_weight": 700
			},
			"predictive": {
				"color": "#8a8a8a",
				"font_style": "italic"
			},
			"selector": { "color": "#d5512f" },
			"enum": { "color": "#a631be" },
			"hint": { "color": "#737373" },
			"variant": { "color": "#d5a910" }
		}
	}
};
var plastic_default = {
	name: "Plastic",
	appearance: "dark",
	style: {
		"background": "#21252Bff",
		"text": "#F5F7FAff",
		"editor.background": "#21252Bff",
		"editor.foreground": "#A9B2C3ff",
		"editor.active_line.background": "#A9B2C31A",
		"search.match_background": "#1085FF44",
		"players": [
			{
				"cursor": "#1085FFff",
				"background": "#1085FFff",
				"selection": "#1085FF3d"
			},
			{
				"cursor": "#E06C75ff",
				"background": "#E06C75ff",
				"selection": "#E06C753d"
			},
			{
				"cursor": "#D19A66ff",
				"background": "#D19A66ff",
				"selection": "#D19A663d"
			},
			{
				"cursor": "#B57EDCff",
				"background": "#B57EDCff",
				"selection": "#B57EDC3d"
			},
			{
				"cursor": "#56B6C2ff",
				"background": "#56B6C2ff",
				"selection": "#56B6C23d"
			},
			{
				"cursor": "#E5C07Bff",
				"background": "#E5C07Bff",
				"selection": "#E5C07B3d"
			},
			{
				"cursor": "#98C379ff",
				"background": "#98C379ff",
				"selection": "#98C3793d"
			},
			{
				"cursor": "#61AFEFff",
				"background": "#61AFEFff",
				"selection": "#61AFEF3d"
			}
		],
		"error": "#D74E42ff",
		"warning": "#E9D16Cff",
		"info": "#1085FFff",
		"hint": "#5F6672ff",
		"deleted": "#E06C75",
		"modified": "#D19A66",
		"terminal.ansi.green": "#98C379",
		"terminal.ansi.red": "#E06C75",
		"terminal.ansi.blue": "#61AFEF",
		"syntax": {
			"attribute": { "color": "#D19A66ff" },
			"boolean": { "color": "#56B6C2ff" },
			"comment": { "color": "#5F6672ff" },
			"comment.doc": { "color": "#5F6672ff" },
			"constant": { "color": "#56B6C2ff" },
			"constructor": { "color": "#61AFEFff" },
			"embedded": { "color": "#A9B2C3ff" },
			"emphasis": { "color": "#E06C75ff" },
			"emphasis.strong": {
				"color": "#D19A66ff",
				"font_weight": 700
			},
			"enum": { "color": "#E5C07Bff" },
			"function": { "color": "#B57EDCff" },
			"hint": { "color": "#5F6672ff" },
			"keyword": { "color": "#E06C75ff" },
			"label": { "color": "#E5C07Bff" },
			"link_text": {
				"color": "#61AFEFff",
				"font_style": "normal"
			},
			"link_uri": { "color": "#56B6C2ff" },
			"namespace": { "color": "#61AFEFff" },
			"number": { "color": "#56B6C2ff" },
			"operator": { "color": "#A9B2C3ff" },
			"predictive": {
				"color": "#5F6672ff",
				"font_style": "italic"
			},
			"preproc": { "color": "#E06C75ff" },
			"primary": { "color": "#A9B2C3ff" },
			"property": { "color": "#C6CCD7ff" },
			"punctuation": { "color": "#A9B2C3ff" },
			"punctuation.bracket": { "color": "#A9B2C3ff" },
			"punctuation.delimiter": { "color": "#A9B2C3ff" },
			"punctuation.list_marker": { "color": "#E06C75ff" },
			"punctuation.markup": { "color": "#E06C75ff" },
			"punctuation.special": { "color": "#E06C75ff" },
			"selector": { "color": "#E5C07Bff" },
			"selector.pseudo": { "color": "#61AFEFff" },
			"string": { "color": "#98C379ff" },
			"string.escape": { "color": "#56B6C2ff" },
			"string.regex": { "color": "#56B6C2ff" },
			"string.special": { "color": "#D19A66ff" },
			"string.special.symbol": { "color": "#D19A66ff" },
			"tag": { "color": "#E5C07Bff" },
			"text.literal": { "color": "#98C379ff" },
			"title": {
				"color": "#E5C07Bff",
				"font_weight": 400
			},
			"type": { "color": "#E5C07Bff" },
			"variable": { "color": "#C6CCD7ff" },
			"variable.special": { "color": "#E06C75ff" },
			"variant": { "color": "#61AFEFff" },
			"diff.minus": { "color": "#E06C75" },
			"diff.plus": { "color": "#98C379" }
		}
	}
};
var poimandres_default = {
	name: "Poimandres",
	appearance: "dark",
	style: {
		"background": "#1b1e28",
		"editor.background": "#1b1e28",
		"text": "#a6accd",
		"editor.foreground": "#a6accd",
		"editor.active_line.background": "#717cb425",
		"editor.document_highlight.bracket_background": "#00000000",
		"search.match_background": "#ADD7FF40",
		"error": "#d0679d",
		"warning": "#fffac2",
		"info": "#ADD7FF",
		"hint": "#7390AAb3",
		"players": [{
			"cursor": "#a6accd",
			"selection": "#717cb425"
		}],
		"created": "#5fb3a1",
		"deleted": "#d0679d",
		"modified": "#ADD7FF",
		"terminal.ansi.green": "#5DE4c7",
		"terminal.ansi.red": "#d0679d",
		"terminal.ansi.blue": "#89ddff",
		"syntax": {
			"attribute": {
				"color": "#91B4D5",
				"font_style": "italic"
			},
			"boolean": { "color": "#5DE4c7" },
			"comment": {
				"color": "#767c9dB0",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#767c9dB0",
				"font_style": "italic"
			},
			"constant": { "color": "#5DE4c7" },
			"constructor": { "color": "#5DE4c7" },
			"emphasis": {
				"color": "#7390AA",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#7390AA",
				"font_weight": 700
			},
			"function": { "color": "#ADD7FF" },
			"keyword": { "color": "#a6accd" },
			"label": { "color": "#91B4D5" },
			"link_text": { "color": "#5DE4c7" },
			"link_uri": { "color": "#5DE4c7" },
			"number": { "color": "#5DE4c7" },
			"operator": { "color": "#91B4D5" },
			"punctuation": { "color": "#a6accd" },
			"punctuation.bracket": { "color": "#a6accd" },
			"punctuation.delimiter": { "color": "#a6accd" },
			"punctuation.list_marker": { "color": "#a6accd" },
			"punctuation.special": { "color": "#a6accd" },
			"string": { "color": "#5DE4c7" },
			"string.escape": { "color": "#5DE4c7" },
			"string.regex": { "color": "#5DE4c7" },
			"string.special": { "color": "#5DE4c7" },
			"string.special.symbol": { "color": "#5DE4c7" },
			"tag": { "color": "#5DE4c7" },
			"text.literal": { "color": "#5DE4c7" },
			"title": { "color": "#91B4D5" },
			"type": { "color": "#a6accdC0" },
			"variable": {
				"color": "#ADD7FF",
				"font_style": "italic"
			},
			"variable.special": {
				"color": "#ADD7FF",
				"font_style": "italic"
			},
			"embedded": { "color": "#a6accd" },
			"namespace": { "color": "#91B4D5" },
			"predictive": { "color": "#767c9dB0" },
			"preproc": { "color": "#a6accd" },
			"primary": { "color": "#a6accd" },
			"property": {
				"color": "#ADD7FF",
				"font_style": "italic"
			},
			"selector": { "color": "#5DE4C7" },
			"enum": { "color": "#A6ACCDC0" },
			"hint": { "color": "#7390AAb3" },
			"variant": { "color": "#E4F0FB" },
			"diff.minus": { "color": "#506477" },
			"diff.plus": { "color": "#ADD7FF" },
			"property.json_key": { "color": "#A6ACCDC0" },
			"selector.class": {
				"color": "#5FB3A1",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#91B4D5",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#91B4D5",
				"font_style": "italic"
			}
		}
	}
};
var red_default = {
	name: "Red",
	appearance: "dark",
	style: {
		"background": "#390000ff",
		"text": "#f8f8f8ff",
		"editor.background": "#390000ff",
		"editor.foreground": "#f8f8f8ff",
		"editor.active_line.background": "#ff000033",
		"editor.document_highlight.bracket_background": "#f8f8f81a",
		"search.match_background": "#f8f8f833",
		"players": [
			{
				"cursor": "#970000ff",
				"background": "#97000026",
				"selection": "#750000ff"
			},
			{
				"cursor": "#977100ff",
				"background": "#97710026",
				"selection": "#9771004d"
			},
			{
				"cursor": "#4c9700ff",
				"background": "#4c970026",
				"selection": "#4c97004d"
			},
			{
				"cursor": "#009726ff",
				"background": "#00972626",
				"selection": "#0097264d"
			},
			{
				"cursor": "#009797ff",
				"background": "#00979726",
				"selection": "#0097974d"
			},
			{
				"cursor": "#002697ff",
				"background": "#00269726",
				"selection": "#0026974d"
			},
			{
				"cursor": "#4c0097ff",
				"background": "#4c009726",
				"selection": "#4c00974d"
			},
			{
				"cursor": "#970071ff",
				"background": "#97007126",
				"selection": "#9700714d"
			}
		],
		"error": "#f44747ff",
		"warning": "#cca700ff",
		"info": "#3794ffff",
		"hint": "#969696ff",
		"syntax": {
			"comment": {
				"color": "#e7c0c0ff",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#e7c0c0ff",
				"font_style": "italic"
			},
			"string": { "color": "#cd8d8dff" },
			"string.regex": { "color": "#ffb454ff" },
			"string.escape": { "color": "#ffe862ff" },
			"link_text": { "color": "#cd8d8dff" },
			"number": { "color": "#994646ff" },
			"boolean": { "color": "#994646ff" },
			"constant.builtin": { "color": "#994646ff" },
			"constant": { "color": "#994646ff" },
			"variable": {
				"color": "#fb9a4bff",
				"font_style": "italic"
			},
			"variable.special": {
				"color": "#fb9a4bff",
				"font_style": "italic"
			},
			"variable.parameter": {
				"color": "#fb9a4bff",
				"font_style": "italic"
			},
			"keyword": { "color": "#f12727ff" },
			"operator": { "color": "#f12727ff" },
			"type": { "color": "#fec758ff" },
			"type.builtin": { "color": "#9DF39FFF" },
			"function": { "color": "#fec758ff" },
			"function.builtin": { "color": "#ffb454ff" },
			"tag": { "color": "#fec758ff" },
			"attribute": { "color": "#fec758ff" },
			"punctuation.special": { "color": "#ec0d1eff" },
			"punctuation.delimiter": { "color": "#f8f8f8ff" },
			"punctuation": { "color": "#f8f8f8ff" },
			"preproc": { "color": "#f8f8f8ff" },
			"title": {
				"color": "#fec758ff",
				"font_weight": 700
			},
			"emphasis.strong": { "font_weight": 700 },
			"emphasis": {
				"color": "#FB9A4BFF",
				"font_style": "italic"
			},
			"text.literal": { "color": "#cd8d8dff" },
			"enum": { "color": "#fec758ff" },
			"property": {
				"color": "#fb9a4bff",
				"font_style": "italic"
			},
			"label": { "color": "#fec758ff" },
			"constructor": { "color": "#fec758ff" },
			"namespace": { "color": "#fec758ff" },
			"diff.minus": { "color": "#ec9799ff" },
			"diff.plus": { "color": "#41a83eff" },
			"embedded": { "color": "#f8f8f8ff" },
			"selector": { "color": "#fec758ff" },
			"selector.pseudo": { "color": "#fec758ff" },
			"variant": {
				"color": "#fb9a4bff",
				"font_style": "italic"
			},
			"string.special": { "color": "#cd8d8dff" },
			"string.special.symbol": { "color": "#994646ff" },
			"punctuation.markup": { "color": "#f8f8f8ff" },
			"primary": { "color": "#f8f8f8ff" },
			"link_uri": { "color": "#f8f8f8ff" },
			"hint": { "color": "#f8f8f866" },
			"predictive": { "color": "#f8f8f866" },
			"punctuation.bracket": { "color": "#f8f8f8ff" },
			"punctuation.list_marker": { "color": "#f8f8f8ff" },
			"keyword.declaration": {
				"color": "#FF6262FF",
				"font_weight": 700
			},
			"property.json_key": { "color": "#9DF39FFF" },
			"tag.doctype": { "color": "#EC0D1EFF" },
			"keyword.jsdoc": {
				"color": "#FF6262FF",
				"font_weight": 700
			},
			"tag.component.jsx": { "color": "#9DF39FFF" }
		},
		"created": "#81b88b",
		"deleted": "#c74e39",
		"modified": "#E2C08D"
	}
};
var rose_pine_dawn_default = {
	name: "Rosé Pine Dawn",
	appearance: "light",
	style: {
		"background": "#faf4ed",
		"text": "#575279",
		"editor.background": "#faf4ed",
		"editor.foreground": "#575279",
		"editor.active_line.background": "#fffaf3",
		"search.match_background": "#ea9d344d",
		"players": [
			{
				"cursor": "#575279",
				"background": "#575279",
				"selection": "#57527922"
			},
			{
				"cursor": "#56949f",
				"background": "#56949f",
				"selection": "#56949f44"
			},
			{
				"cursor": "#907aa9",
				"background": "#907aa9",
				"selection": "#907aa944"
			},
			{
				"cursor": "#286983",
				"background": "#286983",
				"selection": "#28698344"
			},
			{
				"cursor": "#b4637a",
				"background": "#b4637a",
				"selection": "#b4637a44"
			}
		],
		"error": "#b4637a",
		"warning": "#ea9d34",
		"info": "#286983",
		"hint": "#797593",
		"created": "#56949f",
		"deleted": "#797593",
		"modified": "#d7827e",
		"terminal.ansi.green": "#286983",
		"terminal.ansi.red": "#b4637a",
		"terminal.ansi.blue": "#56949f",
		"syntax": {
			"attribute": { "color": "#907aa9" },
			"boolean": { "color": "#d7827e" },
			"comment": {
				"color": "#9893a5",
				"font_style": "italic"
			},
			"comment.doc": { "color": "#797593" },
			"constant": { "color": "#ea9d34" },
			"constructor": { "color": "#56949f" },
			"embedded": { "color": "#575279" },
			"emphasis": {
				"color": "#907aa9",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#56949f",
				"font_weight": 700
			},
			"enum": { "color": "#286983" },
			"function": { "color": "#d7827e" },
			"hint": { "color": "#907aa9" },
			"keyword": { "color": "#286983" },
			"label": { "color": "#56949f" },
			"link_text": { "color": "#907aa9" },
			"link_uri": { "color": "#286983" },
			"number": { "color": "#ea9d34" },
			"operator": { "color": "#797593" },
			"predictive": { "color": "#797593" },
			"preproc": { "color": "#ea9d34" },
			"primary": { "color": "#907aa9" },
			"property": { "color": "#56949f" },
			"punctuation": { "color": "#797593" },
			"punctuation.bracket": { "color": "#797593" },
			"punctuation.delimiter": { "color": "#797593" },
			"punctuation.list_marker": {
				"color": "#797593",
				"font_weight": 700
			},
			"punctuation.special": { "color": "#797593" },
			"string": { "color": "#ea9d34" },
			"string.escape": { "color": "#286983" },
			"string.regex": { "color": "#907aa9" },
			"string.special": { "color": "#286983" },
			"string.special.symbol": { "color": "#286983" },
			"tag": { "color": "#56949f" },
			"text.literal": { "color": "#ea9d34" },
			"title": {
				"color": "#b4637a",
				"font_weight": 700
			},
			"type": { "color": "#56949f" },
			"variable": { "color": "#575279" },
			"variable.special": { "color": "#b4637a" },
			"variant": { "color": "#d7827e" },
			"namespace": { "color": "#56949F" },
			"selector": { "color": "#56949F" },
			"diff.minus": { "color": "#797593" },
			"diff.plus": { "color": "#56949f" },
			"selector.class": {
				"color": "#907AA9",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#907AA9",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#907AA9",
				"font_style": "italic"
			}
		}
	}
};
var rose_pine_moon_default = {
	name: "Rosé Pine Moon",
	appearance: "dark",
	style: {
		"background": "#232136",
		"text": "#e0def4",
		"editor.background": "#232136",
		"editor.foreground": "#e0def4",
		"editor.active_line.background": "#2a273f",
		"search.match_background": "#f6c1774d",
		"players": [
			{
				"cursor": "#e0def4",
				"background": "#e0def4",
				"selection": "#e0def422"
			},
			{
				"cursor": "#9ccfd8",
				"background": "#9ccfd8",
				"selection": "#9ccfd844"
			},
			{
				"cursor": "#c4a7e7",
				"background": "#c4a7e7",
				"selection": "#c4a7e744"
			},
			{
				"cursor": "#3e8fb0",
				"background": "#3e8fb0",
				"selection": "#3e8fb044"
			},
			{
				"cursor": "#eb6f92",
				"background": "#eb6f92",
				"selection": "#eb6f9244"
			}
		],
		"error": "#eb6f92",
		"warning": "#f6c177",
		"info": "#3e8fb0",
		"hint": "#908caa",
		"created": "#9ccfd8",
		"deleted": "#908caa",
		"modified": "#ea9a97",
		"terminal.ansi.green": "#3e8fb0",
		"terminal.ansi.red": "#eb6f92",
		"terminal.ansi.blue": "#9ccfd8",
		"syntax": {
			"attribute": { "color": "#c4a7e7" },
			"boolean": { "color": "#ea9a97" },
			"comment": {
				"color": "#6e6a86",
				"font_style": "italic"
			},
			"comment.doc": { "color": "#908caa" },
			"constant": { "color": "#f6c177" },
			"constructor": { "color": "#9ccfd8" },
			"embedded": { "color": "#e0def4" },
			"emphasis": {
				"color": "#c4a7e7",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#9ccfd8",
				"font_weight": 700
			},
			"enum": { "color": "#3e8fb0" },
			"function": { "color": "#ea9a97" },
			"hint": { "color": "#c4a7e7" },
			"keyword": { "color": "#3e8fb0" },
			"label": { "color": "#9ccfd8" },
			"link_text": { "color": "#c4a7e7" },
			"link_uri": { "color": "#3e8fb0" },
			"number": { "color": "#f6c177" },
			"operator": { "color": "#908caa" },
			"predictive": { "color": "#908caa" },
			"preproc": { "color": "#f6c177" },
			"primary": { "color": "#c4a7e7" },
			"property": { "color": "#9ccfd8" },
			"punctuation": { "color": "#908caa" },
			"punctuation.bracket": { "color": "#908caa" },
			"punctuation.delimiter": { "color": "#908caa" },
			"punctuation.list_marker": {
				"color": "#908caa",
				"font_weight": 700
			},
			"punctuation.special": { "color": "#908caa" },
			"string": { "color": "#f6c177" },
			"string.escape": { "color": "#3e8fb0" },
			"string.regex": { "color": "#c4a7e7" },
			"string.special": { "color": "#3e8fb0" },
			"string.special.symbol": { "color": "#3e8fb0" },
			"tag": { "color": "#9ccfd8" },
			"text.literal": { "color": "#f6c177" },
			"title": {
				"color": "#eb6f92",
				"font_weight": 700
			},
			"type": { "color": "#9ccfd8" },
			"variable": { "color": "#e0def4" },
			"variable.special": { "color": "#eb6f92" },
			"variant": { "color": "#ea9a97" },
			"namespace": { "color": "#9CCFD8" },
			"selector": { "color": "#9CCFD8" },
			"diff.minus": { "color": "#908caa" },
			"diff.plus": { "color": "#9ccfd8" },
			"selector.class": {
				"color": "#C4A7E7",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#C4A7E7",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#C4A7E7",
				"font_style": "italic"
			}
		}
	}
};
var rose_pine_default = {
	name: "Rosé Pine",
	appearance: "dark",
	style: {
		"background": "#191724",
		"text": "#e0def4",
		"editor.background": "#191724",
		"editor.foreground": "#e0def4",
		"editor.active_line.background": "#1f1d2e",
		"search.match_background": "#f6c1774d",
		"players": [
			{
				"cursor": "#e0def4",
				"background": "#e0def4",
				"selection": "#e0def422"
			},
			{
				"cursor": "#9ccfd8",
				"background": "#9ccfd8",
				"selection": "#9ccfd844"
			},
			{
				"cursor": "#c4a7e7",
				"background": "#c4a7e7",
				"selection": "#c4a7e744"
			},
			{
				"cursor": "#31748f",
				"background": "#31748f",
				"selection": "#31748f44"
			},
			{
				"cursor": "#eb6f92",
				"background": "#eb6f92",
				"selection": "#eb6f9244"
			}
		],
		"error": "#eb6f92",
		"warning": "#f6c177",
		"info": "#31748f",
		"hint": "#908caa",
		"created": "#9ccfd8",
		"deleted": "#908caa",
		"modified": "#ebbcba",
		"terminal.ansi.green": "#31748f",
		"terminal.ansi.red": "#eb6f92",
		"terminal.ansi.blue": "#9ccfd8",
		"syntax": {
			"attribute": { "color": "#c4a7e7" },
			"boolean": { "color": "#ebbcba" },
			"comment": {
				"color": "#6e6a86",
				"font_style": "italic"
			},
			"comment.doc": { "color": "#908caa" },
			"constant": { "color": "#f6c177" },
			"constructor": { "color": "#9ccfd8" },
			"embedded": { "color": "#e0def4" },
			"emphasis": {
				"color": "#c4a7e7",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#9ccfd8",
				"font_weight": 700
			},
			"enum": { "color": "#31748f" },
			"function": { "color": "#ebbcba" },
			"hint": { "color": "#c4a7e7" },
			"keyword": { "color": "#31748f" },
			"label": { "color": "#9ccfd8" },
			"link_text": { "color": "#c4a7e7" },
			"link_uri": { "color": "#31748f" },
			"number": { "color": "#f6c177" },
			"operator": { "color": "#908caa" },
			"predictive": { "color": "#908caa" },
			"preproc": { "color": "#f6c177" },
			"primary": { "color": "#c4a7e7" },
			"property": { "color": "#9ccfd8" },
			"punctuation": { "color": "#908caa" },
			"punctuation.bracket": { "color": "#908caa" },
			"punctuation.delimiter": { "color": "#908caa" },
			"punctuation.list_marker": {
				"color": "#908caa",
				"font_weight": 700
			},
			"punctuation.special": { "color": "#908caa" },
			"string": { "color": "#f6c177" },
			"string.escape": { "color": "#31748f" },
			"string.regex": { "color": "#c4a7e7" },
			"string.special": { "color": "#31748f" },
			"string.special.symbol": { "color": "#31748f" },
			"tag": { "color": "#9ccfd8" },
			"text.literal": { "color": "#f6c177" },
			"title": {
				"color": "#eb6f92",
				"font_weight": 700
			},
			"type": { "color": "#9ccfd8" },
			"variable": { "color": "#e0def4" },
			"variable.special": { "color": "#eb6f92" },
			"variant": { "color": "#ebbcba" },
			"namespace": { "color": "#9CCFD8" },
			"selector": { "color": "#9CCFD8" },
			"diff.minus": { "color": "#908caa" },
			"diff.plus": { "color": "#9ccfd8" },
			"selector.class": {
				"color": "#C4A7E7",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#C4A7E7",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#C4A7E7",
				"font_style": "italic"
			}
		}
	}
};
var slack_dark_default = {
	name: "Slack Dark",
	appearance: "dark",
	style: {
		"background": "#222222",
		"editor.background": "#222222",
		"text": "#E6E6E6",
		"editor.foreground": "#E6E6E6",
		"editor.active_line.background": "#141414",
		"players": [{ "cursor": "#E6E6E6" }],
		"created": "#ECB22E",
		"deleted": "#FFF",
		"modified": "#ECB22E",
		"syntax": {
			"attribute": { "color": "#9cdcfe" },
			"boolean": { "color": "#569cd6" },
			"comment": { "color": "#6A9955" },
			"comment.doc": { "color": "#6A9955" },
			"constant": { "color": "#569cd6" },
			"constructor": { "color": "#569cd6" },
			"embedded": { "color": "#D4D4D4" },
			"emphasis.strong": {
				"color": "#569cd6",
				"font_weight": 700
			},
			"function": { "color": "#DCDCAA" },
			"keyword": { "color": "#569cd6" },
			"number": { "color": "#b5cea8" },
			"operator": { "color": "#d4d4d4" },
			"preproc": { "color": "#569cd6" },
			"property": { "color": "#9cdcfe" },
			"punctuation": { "color": "#808080" },
			"punctuation.bracket": { "color": "#808080" },
			"punctuation.delimiter": { "color": "#808080" },
			"punctuation.list_marker": { "color": "#808080" },
			"punctuation.special": { "color": "#808080" },
			"string": { "color": "#ce9178" },
			"string.escape": { "color": "#569cd6" },
			"string.regex": { "color": "#ce9178" },
			"string.special": { "color": "#ce9178" },
			"string.special.symbol": { "color": "#ce9178" },
			"tag": { "color": "#569cd6" },
			"text.literal": { "color": "#ce9178" },
			"type": { "color": "#4EC9B0" },
			"variable": { "color": "#9CDCFE" },
			"variable.special": { "color": "#569cd6" },
			"emphasis": {
				"color": "#E6E6E6",
				"font_style": "italic"
			},
			"label": { "color": "#9CDCFE" },
			"namespace": { "color": "#4EC9B0" },
			"predictive": { "color": "#6A9955" },
			"primary": { "color": "#E6E6E6" },
			"selector": { "color": "#D7BA7D" },
			"title": {
				"color": "#569CD6",
				"font_weight": 700
			},
			"enum": { "color": "#4EC9B0" },
			"hint": { "color": "#6A9955" },
			"link_text": { "color": "#CE9178" },
			"link_uri": { "color": "#E6E6E6" },
			"variant": { "color": "#9CDCFE" },
			"diff.minus": { "color": "#CE9178" },
			"diff.plus": { "color": "#B5CEA8" }
		}
	}
};
var slack_ochin_default = {
	name: "Slack Ochin",
	appearance: "light",
	style: {
		"background": "#FFFFFF",
		"editor.background": "#FFFFFF",
		"text": "#000000",
		"editor.foreground": "#000000",
		"editor.active_line.background": "#EEEEEE",
		"search.match_background": "#AED4FB",
		"hint": "#F9F9F9",
		"players": [{
			"cursor": "#000000",
			"selection": "#AED4FB"
		}],
		"created": "#ECB22E",
		"deleted": "#e53935",
		"modified": "#ECB22E",
		"terminal.ansi.green": "#91b859",
		"terminal.ansi.red": "#e53935",
		"terminal.ansi.blue": "#6182b8",
		"syntax": {
			"attribute": {
				"color": "#df8618",
				"font_style": "italic"
			},
			"comment": {
				"color": "#357b42",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#357b42",
				"font_style": "italic"
			},
			"constant": { "color": "#174781" },
			"constructor": { "color": "#0444ac" },
			"emphasis": {
				"color": "#174781",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#08134A",
				"font_weight": 700
			},
			"function": { "color": "#7eb233" },
			"keyword": { "color": "#7b30d0" },
			"number": { "color": "#174781" },
			"string": { "color": "#a44185" },
			"string.escape": { "color": "#174781" },
			"string.regex": { "color": "#a44185" },
			"string.special": { "color": "#a44185" },
			"string.special.symbol": { "color": "#a44185" },
			"tag": { "color": "#0444ac" },
			"text.literal": { "color": "#a44185" },
			"type": { "color": "#0444ac" },
			"variable": { "color": "#2f86d2" },
			"variable.special": { "color": "#2f86d2" },
			"boolean": { "color": "#174781" },
			"embedded": { "color": "#000000" },
			"label": { "color": "#2f86d2" },
			"namespace": { "color": "#0444ac" },
			"operator": { "color": "#7B30D0" },
			"predictive": { "color": "#357b42" },
			"preproc": { "color": "#7b30d0" },
			"primary": { "color": "#000000" },
			"property": { "color": "#2F86D2" },
			"punctuation": { "color": "#000000" },
			"selector": { "color": "#0444AC" },
			"title": { "color": "#0444ac" },
			"enum": { "color": "#0444AC" },
			"hint": { "color": "#F9F9F9" },
			"link_text": { "color": "#A44185" },
			"link_uri": { "color": "#924205" },
			"variant": { "color": "#2F86D2" },
			"diff.minus": { "color": "#e53935" },
			"diff.plus": { "color": "#ECB22E" },
			"property.json_key": { "color": "#DC3EB7" },
			"selector.class": {
				"color": "#DF8618",
				"font_style": "italic"
			},
			"selector.id": {
				"color": "#DF8618",
				"font_style": "italic"
			},
			"selector.pseudo": {
				"color": "#DF8618",
				"font_style": "italic"
			}
		}
	}
};
var snazzy_light_default = {
	name: "Snazzy Light",
	appearance: "light",
	style: {
		"background": "#fafbfc",
		"foreground": "#565869",
		"text": "#565869",
		"editor.background": "#fafbfc",
		"editor.foreground": "#565869",
		"editor.active_line.background": "#f3f4f5",
		"search.match_background": "#00e6e06a",
		"error": "#ff5c57",
		"warning": "#b38700",
		"info": "#09a1ed",
		"modified": "#00A39F",
		"terminal.ansi.green": "#2DAE58",
		"terminal.ansi.red": "#FF5C57",
		"terminal.ansi.blue": "#09A1ED",
		"syntax": {
			"comment": {
				"color": "#adb1c2",
				"font_style": "italic"
			},
			"comment.doc": { "color": "#adb1c2" },
			"function": { "color": "#09a1ed" },
			"function.method": { "color": "#09a1ed" },
			"function.builtin": { "color": "#11658f" },
			"function.constructor": { "color": "#09a1ed" },
			"string": { "color": "#cf9c00" },
			"string.escape": { "color": "#f5b900" },
			"string.regex": { "color": "#13bbb7" },
			"string.special": { "color": "#cf9c00" },
			"type": { "color": "#2dae58" },
			"type.builtin": { "color": "#2dae58" },
			"constant": { "color": "#2dae58" },
			"constant.builtin": { "color": "#2dae58" },
			"constant.macro": { "color": "#11658f" },
			"number": { "color": "#ff5c57" },
			"boolean": { "color": "#2dae58" },
			"property": { "color": "#11658f" },
			"operator": { "color": "#adb1c2" },
			"punctuation": { "color": "#adb1c2" },
			"punctuation.bracket": { "color": "#adb1c2" },
			"punctuation.delimiter": { "color": "#adb1c2" },
			"variable": { "color": "#565869" },
			"variable.special": { "color": "#13bbb7" },
			"variable.parameter": { "color": "#565869" },
			"tag": { "color": "#13bbb7" },
			"attribute": { "color": "#ff8380" },
			"constructor": { "color": "#13bbb7" },
			"embedded": { "color": "#565869" },
			"keyword": { "color": "#f767bb" },
			"emphasis": {
				"color": "#13BBB7",
				"font_style": "italic"
			},
			"label": { "color": "#565869" },
			"namespace": { "color": "#2dae58" },
			"predictive": { "color": "#adb1c2" },
			"preproc": { "color": "#f767bb" },
			"primary": { "color": "#565869" },
			"selector": { "color": "#F767BB" },
			"title": { "color": "#2DAE58" },
			"enum": { "color": "#2dae58" },
			"hint": { "color": "#adb1c2" },
			"link_text": { "color": "#09A1ED" },
			"link_uri": { "color": "#565869" },
			"variant": { "color": "#565869" },
			"diff.minus": { "color": "#888888" },
			"diff.plus": { "color": "#888888" },
			"emphasis.strong": {
				"color": "#13BBB7",
				"font_weight": 700
			},
			"text.literal": { "color": "#F767BB" }
		}
	}
};
var solarized_dark_default = {
	name: "Solarized Dark",
	appearance: "dark",
	style: {
		"background": "#002b36ff",
		"text": "#839496ff",
		"editor.background": "#002b36ff",
		"editor.foreground": "#839496ff",
		"editor.active_line.background": "#073642ff",
		"editor.document_highlight.bracket_background": "#8394961a",
		"search.match_background": "#83949633",
		"players": [
			{
				"cursor": "#d30102ff",
				"background": "#d3010226",
				"selection": "#274642ff"
			},
			{
				"cursor": "#d39d01ff",
				"background": "#d39d0126",
				"selection": "#d39d014d"
			},
			{
				"cursor": "#6bd301ff",
				"background": "#6bd30126",
				"selection": "#6bd3014d"
			},
			{
				"cursor": "#01d334ff",
				"background": "#01d33426",
				"selection": "#01d3344d"
			},
			{
				"cursor": "#01d3d2ff",
				"background": "#01d3d226",
				"selection": "#01d3d24d"
			},
			{
				"cursor": "#0136d3ff",
				"background": "#0136d326",
				"selection": "#0136d34d"
			},
			{
				"cursor": "#6901d3ff",
				"background": "#6901d326",
				"selection": "#6901d34d"
			},
			{
				"cursor": "#d3019fff",
				"background": "#d3019f26",
				"selection": "#d3019f4d"
			}
		],
		"error": "#f44747ff",
		"warning": "#cca700ff",
		"info": "#3794ffff",
		"hint": "#969696ff",
		"terminal.ansi.green": "#859900",
		"terminal.ansi.red": "#dc322f",
		"terminal.ansi.blue": "#268bd2",
		"syntax": {
			"comment": {
				"color": "#586e75ff",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#586e75ff",
				"font_style": "italic"
			},
			"string": { "color": "#2aa198ff" },
			"string.regex": { "color": "#dc322fff" },
			"string.escape": { "color": "#cb4b16ff" },
			"link_text": { "color": "#2aa198ff" },
			"number": { "color": "#d33682ff" },
			"boolean": { "color": "#b58900ff" },
			"constant.builtin": { "color": "#b58900ff" },
			"constant": { "color": "#268BD2" },
			"variable": { "color": "#268BD2" },
			"variable.special": { "color": "#268bd2ff" },
			"keyword": { "color": "#859900ff" },
			"operator": { "color": "#859900ff" },
			"type": { "color": "#cb4b16ff" },
			"type.builtin": { "color": "#859900ff" },
			"function": { "color": "#268bd2ff" },
			"function.builtin": { "color": "#268bd2ff" },
			"tag": { "color": "#268bd2ff" },
			"attribute": { "color": "#93a1a1ff" },
			"punctuation.special": { "color": "#839496ff" },
			"punctuation.bracket": { "color": "#839496ff" },
			"punctuation.delimiter": { "color": "#839496ff" },
			"punctuation": { "color": "#839496ff" },
			"preproc": { "color": "#b58900ff" },
			"title": {
				"color": "#268bd2ff",
				"font_weight": 700
			},
			"emphasis.strong": { "font_weight": 700 },
			"emphasis": {
				"color": "#D33682",
				"font_style": "italic"
			},
			"text.literal": { "color": "#2aa198ff" },
			"enum": { "color": "#cb4b16ff" },
			"property": { "color": "#839496ff" },
			"label": { "color": "#839496ff" },
			"constructor": { "color": "#268bd2ff" },
			"namespace": { "color": "#cb4b16ff" },
			"diff.minus": { "color": "#dc322fff" },
			"diff.plus": { "color": "#859900ff" },
			"embedded": { "color": "#839496ff" },
			"selector": { "color": "#268bd2ff" },
			"selector.pseudo": { "color": "#93a1a1ff" },
			"variant": { "color": "#268bd2ff" },
			"string.special": { "color": "#2aa198ff" },
			"string.special.symbol": { "color": "#cb4b16ff" },
			"primary": { "color": "#839496ff" },
			"link_uri": { "color": "#839496ff" },
			"hint": { "color": "#83949666" },
			"predictive": { "color": "#83949666" },
			"punctuation.list_marker": { "color": "#839496ff" },
			"punctuation.markup": { "color": "#839496ff" },
			"keyword.declaration": {
				"color": "#93A1A1",
				"font_weight": 700
			},
			"property.json_key": { "color": "#859900" },
			"selector.class": { "color": "#93A1A1" },
			"selector.id": { "color": "#93A1A1" },
			"tag.doctype": { "color": "#839496ff" },
			"variable.parameter": { "color": "#839496ff" },
			"keyword.jsdoc": {
				"color": "#93A1A1",
				"font_weight": 700
			},
			"punctuation.bracket.html": { "color": "#586E75" },
			"punctuation.bracket.jsx": { "color": "#586E75" },
			"punctuation.delimiter.html": { "color": "#586E75" },
			"punctuation.delimiter.jsx": { "color": "#586E75" },
			"tag.component.jsx": { "color": "#859900" }
		},
		"created": "#81b88b",
		"deleted": "#c74e39",
		"modified": "#E2C08D"
	}
};
var solarized_light_default = {
	name: "Solarized Light",
	appearance: "light",
	style: {
		"background": "#fdf6e3ff",
		"text": "#657b83ff",
		"editor.background": "#fdf6e3ff",
		"editor.foreground": "#657b83ff",
		"editor.active_line.background": "#eee8d5ff",
		"editor.document_highlight.bracket_background": "#657b831a",
		"search.match_background": "#657b8333",
		"players": [
			{
				"cursor": "#657b83ff",
				"background": "#657b8326",
				"selection": "#eee8d5ff"
			},
			{
				"cursor": "#666583ff",
				"background": "#66658326",
				"selection": "#6665834d"
			},
			{
				"cursor": "#7c6583ff",
				"background": "#7c658326",
				"selection": "#7c65834d"
			},
			{
				"cursor": "#836573ff",
				"background": "#83657326",
				"selection": "#8365734d"
			},
			{
				"cursor": "#836d65ff",
				"background": "#836d6526",
				"selection": "#836d654d"
			},
			{
				"cursor": "#838365ff",
				"background": "#83836526",
				"selection": "#8383654d"
			},
			{
				"cursor": "#6c8365ff",
				"background": "#6c836526",
				"selection": "#6c83654d"
			},
			{
				"cursor": "#658374ff",
				"background": "#65837426",
				"selection": "#6583744d"
			}
		],
		"error": "#f44747ff",
		"warning": "#cca700ff",
		"info": "#3794ffff",
		"hint": "#969696ff",
		"terminal.ansi.green": "#859900",
		"terminal.ansi.red": "#dc322f",
		"terminal.ansi.blue": "#268bd2",
		"syntax": {
			"comment": {
				"color": "#93a1a1ff",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#93a1a1ff",
				"font_style": "italic"
			},
			"string": { "color": "#2aa198ff" },
			"string.regex": { "color": "#dc322fff" },
			"string.escape": { "color": "#cb4b16ff" },
			"link_text": { "color": "#2aa198ff" },
			"number": { "color": "#d33682ff" },
			"boolean": { "color": "#b58900ff" },
			"constant.builtin": { "color": "#b58900ff" },
			"constant": { "color": "#268BD2" },
			"variable": { "color": "#268BD2" },
			"variable.special": { "color": "#268bd2ff" },
			"keyword": { "color": "#859900ff" },
			"operator": { "color": "#859900ff" },
			"type": { "color": "#cb4b16ff" },
			"type.builtin": { "color": "#859900ff" },
			"function": { "color": "#268bd2ff" },
			"function.builtin": { "color": "#268bd2ff" },
			"tag": { "color": "#268bd2ff" },
			"attribute": { "color": "#93a1a1ff" },
			"punctuation.special": { "color": "#657b83ff" },
			"punctuation.bracket": { "color": "#657b83ff" },
			"punctuation.delimiter": { "color": "#657b83ff" },
			"punctuation": { "color": "#657b83ff" },
			"preproc": { "color": "#b58900ff" },
			"title": {
				"color": "#268bd2ff",
				"font_weight": 700
			},
			"emphasis.strong": { "font_weight": 700 },
			"emphasis": {
				"color": "#D33682",
				"font_style": "italic"
			},
			"text.literal": { "color": "#2aa198ff" },
			"enum": { "color": "#cb4b16ff" },
			"property": { "color": "#657b83ff" },
			"label": { "color": "#657b83ff" },
			"constructor": { "color": "#268bd2ff" },
			"namespace": { "color": "#cb4b16ff" },
			"diff.minus": { "color": "#dc322fff" },
			"diff.plus": { "color": "#859900ff" },
			"embedded": { "color": "#657b83ff" },
			"selector": { "color": "#268bd2ff" },
			"selector.pseudo": { "color": "#93a1a1ff" },
			"variant": { "color": "#268bd2ff" },
			"string.special": { "color": "#2aa198ff" },
			"string.special.symbol": { "color": "#cb4b16ff" },
			"primary": { "color": "#657b83ff" },
			"link_uri": { "color": "#657b83ff" },
			"hint": { "color": "#657b8366" },
			"predictive": { "color": "#657b8366" },
			"punctuation.list_marker": { "color": "#657b83ff" },
			"punctuation.markup": { "color": "#657b83ff" },
			"keyword.declaration": {
				"color": "#586E75",
				"font_weight": 700
			},
			"property.json_key": { "color": "#859900" },
			"selector.class": { "color": "#93A1A1" },
			"selector.id": { "color": "#93A1A1" },
			"tag.doctype": { "color": "#657b83ff" },
			"variable.parameter": { "color": "#657b83ff" },
			"keyword.jsdoc": {
				"color": "#586E75",
				"font_weight": 700
			},
			"punctuation.bracket.html": { "color": "#93A1A1" },
			"punctuation.bracket.jsx": { "color": "#93A1A1" },
			"punctuation.delimiter.html": { "color": "#93A1A1" },
			"punctuation.delimiter.jsx": { "color": "#93A1A1" },
			"tag.component.jsx": { "color": "#859900" }
		},
		"created": "#587c0c",
		"deleted": "#ad0707",
		"modified": "#895503"
	}
};
var synthwave_84_default = {
	name: "Synthwave '84",
	appearance: "dark",
	style: {
		"background": "#241b2f",
		"foreground": "#ffffff",
		"text": "#ffffff",
		"editor.background": "#262335",
		"editor.foreground": "#ffffff",
		"editor.active_line.background": "#2a2139",
		"search.match_background": "#ff7edb40",
		"players": [
			{
				"cursor": "#f97e72",
				"background": "#f97e72",
				"selection": "#f97e7240"
			},
			{
				"cursor": "#36f9f6",
				"background": "#36f9f6",
				"selection": "#36f9f640"
			},
			{
				"cursor": "#ff7edb",
				"background": "#ff7edb",
				"selection": "#ff7edb40"
			},
			{
				"cursor": "#fede5d",
				"background": "#fede5d",
				"selection": "#fede5d40"
			},
			{
				"cursor": "#72f1b8",
				"background": "#72f1b8",
				"selection": "#72f1b840"
			},
			{
				"cursor": "#03edf9",
				"background": "#03edf9",
				"selection": "#03edf940"
			},
			{
				"cursor": "#ff8b39",
				"background": "#ff8b39",
				"selection": "#ff8b3940"
			},
			{
				"cursor": "#b893ce",
				"background": "#b893ce",
				"selection": "#b893ce40"
			}
		],
		"error": "#fe4450",
		"warning": "#fede5d",
		"info": "#03edf9",
		"hint": "#03edf9",
		"created": "#72f1b8cc",
		"deleted": "#fe4450",
		"modified": "#b893ceee",
		"terminal.ansi.green": "#72f1b8",
		"terminal.ansi.red": "#fe4450",
		"terminal.ansi.blue": "#03edf9",
		"syntax": {
			"JSXAttribute": { "color": "#fede5d" },
			"JSXClosingElement": { "color": "#ff7edb" },
			"JSXOpeningElement": { "color": "#ff7edb" },
			"ai.suggestion": {
				"color": "#36f9f6",
				"font_style": "italic"
			},
			"ai.suggestion.hover": {
				"color": "#03edf9",
				"font_style": "italic"
			},
			"assistant": { "color": "#72f1b8" },
			"attribute": { "color": "#fede5d" },
			"boolean": {
				"color": "#f97e72",
				"font_weight": 700
			},
			"brackethighlighter.tag": { "color": "#fede5d" },
			"brackethighlighter.unmatched": { "color": "#fe4450" },
			"comment": {
				"color": "#848bbd",
				"font_style": "italic"
			},
			"comment.doc": {
				"color": "#848bbd",
				"font_style": "italic"
			},
			"constant": { "color": "#f97e72" },
			"constant.character.escape": { "color": "#72f1b8" },
			"constant.language": {
				"color": "#f97e72",
				"font_weight": 700
			},
			"constant.numeric": { "color": "#f97e72" },
			"constant.other.key.yaml": { "color": "#ff7edb" },
			"constructor": { "color": "#36f9f6" },
			"copilot.suggestion": {
				"color": "#36f9f6",
				"font_style": "italic"
			},
			"copilot.suggestion.hover": {
				"color": "#03edf9",
				"font_style": "italic"
			},
			"embedded": {
				"color": "#ffffff",
				"font_style": "normal"
			},
			"emphasis": {
				"color": "#ff7edb",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#ff7edb",
				"font_weight": 700
			},
			"entity.name.function": { "color": "#36f9f6" },
			"entity.name.function.async": { "color": "#36f9f6" },
			"entity.name.function.decorator.python": { "color": "#36f9f6" },
			"entity.name.function.generator": { "color": "#36f9f6" },
			"entity.name.function.go": { "color": "#36f9f6" },
			"entity.name.lifetime.rust": { "color": "#ff7edb" },
			"entity.name.macro": { "color": "#72f1b8" },
			"entity.name.section": { "color": "#36f9f6" },
			"entity.name.section.toml": { "color": "#36f9f6" },
			"entity.name.tag": { "color": "#ff7edb" },
			"entity.name.tag.html": { "color": "#ff7edb" },
			"entity.name.tag.toml": { "color": "#ff7edb" },
			"entity.name.tag.yaml": { "color": "#ff7edb" },
			"entity.name.type": { "color": "#ff7edb" },
			"entity.name.type.class": {
				"color": "#72f1b8",
				"font_weight": 700
			},
			"entity.name.type.class.cpp": {
				"color": "#72f1b8",
				"font_weight": 700
			},
			"entity.name.type.class.java": {
				"color": "#72f1b8",
				"font_weight": 700
			},
			"entity.name.type.class.python": {
				"color": "#72f1b8",
				"font_weight": 700
			},
			"entity.name.type.class.ruby": {
				"color": "#72f1b8",
				"font_weight": 700
			},
			"entity.name.type.conditional": { "color": "#fede5d" },
			"entity.name.type.cpp": { "color": "#72f1b8" },
			"entity.name.type.enum.cpp": { "color": "#72f1b8" },
			"entity.name.type.enum.java": { "color": "#72f1b8" },
			"entity.name.type.enum.rust": { "color": "#72f1b8" },
			"entity.name.type.generic": { "color": "#72f1b8" },
			"entity.name.type.go": { "color": "#72f1b8" },
			"entity.name.type.interface": { "color": "#72f1b8" },
			"entity.name.type.interface.go": { "color": "#ff7edb" },
			"entity.name.type.interface.java": { "color": "#ff7edb" },
			"entity.name.type.intersection": { "color": "#ff7edb" },
			"entity.name.type.mapped": { "color": "#36f9f6" },
			"entity.name.type.module": { "color": "#ff7edb" },
			"entity.name.type.module.ruby": { "color": "#ff7edb" },
			"entity.name.type.namespace.cpp": { "color": "#ff7edb" },
			"entity.name.type.option": { "color": "#72f1b8" },
			"entity.name.type.result": { "color": "#36f9f6" },
			"entity.name.type.rust": { "color": "#72f1b8" },
			"entity.name.type.struct.rust": { "color": "#72f1b8" },
			"entity.name.type.trait.rust": { "color": "#ff7edb" },
			"entity.name.type.union": { "color": "#36f9f6" },
			"entity.other.attribute-name": { "color": "#fede5d" },
			"entity.other.attribute-name.class.css": { "color": "#72f1b8" },
			"entity.other.attribute-name.html": { "color": "#fede5d" },
			"entity.other.attribute-name.id.css": { "color": "#fede5d" },
			"entity.other.attribute-name.jsx": { "color": "#fede5d" },
			"entity.other.attribute-name.pseudo-class.css": { "color": "#36f9f6" },
			"entity.other.attribute-name.pseudo-element.css": { "color": "#36f9f6" },
			"entity.other.attribute-name.tsx": { "color": "#fede5d" },
			"entity.other.inherited-class": { "color": "#72f1b8" },
			"enum": { "color": "#ff7edb" },
			"function": { "color": "#36f9f6" },
			"ghost_text": {
				"color": "#36f9f6",
				"font_style": "italic"
			},
			"hint": {
				"color": "#03edf9",
				"font_style": "italic"
			},
			"inlay_hint": {
				"color": "#848bbd",
				"font_style": "italic"
			},
			"inlay_hint.parameter": {
				"color": "#ff7edb",
				"font_style": "italic"
			},
			"inlay_hint.type": {
				"color": "#72f1b8",
				"font_style": "italic"
			},
			"inline_completion": {
				"color": "#36f9f6",
				"font_style": "italic"
			},
			"inline_completion.highlight": { "color": "#ff7edb" },
			"invalid": { "color": "#ffffff" },
			"invalid.deprecated": { "color": "#ffffff" },
			"keyword": { "color": "#fede5d" },
			"keyword.channel.go": { "color": "#fede5d" },
			"keyword.control": { "color": "#fede5d" },
			"keyword.control.conditional": { "color": "#fede5d" },
			"keyword.control.go": { "color": "#fede5d" },
			"keyword.control.import": { "color": "#ff7edb" },
			"keyword.function": { "color": "#ff7edb" },
			"keyword.function.go": { "color": "#ff7edb" },
			"keyword.operator": { "color": "#fede5d" },
			"keyword.operator.in": { "color": "#fede5d" },
			"keyword.operator.is": { "color": "#fede5d" },
			"keyword.operator.keyof": { "color": "#ff7edb" },
			"keyword.operator.logical.python": { "color": "#fede5d" },
			"keyword.operator.type": { "color": "#fede5d" },
			"keyword.operator.typeof": { "color": "#ff7edb" },
			"keyword.other": { "color": "#fede5d" },
			"keyword.other.DDL.sql": { "color": "#ff7edb" },
			"keyword.other.DML.sql": { "color": "#ff7edb" },
			"keyword.other.abstract": { "color": "#ff7edb" },
			"keyword.other.as": { "color": "#fede5d" },
			"keyword.other.async.rust": { "color": "#ff7edb" },
			"keyword.other.const": { "color": "#fede5d" },
			"keyword.other.dyn": { "color": "#ff7edb" },
			"keyword.other.impl": { "color": "#fede5d" },
			"keyword.other.macro": { "color": "#72f1b8" },
			"keyword.other.override": { "color": "#ff7edb" },
			"keyword.other.readonly": { "color": "#fede5d" },
			"keyword.other.satisfies": { "color": "#fede5d" },
			"keyword.other.special-method.ruby": { "color": "#36f9f6" },
			"keyword.other.sql": { "color": "#fede5d" },
			"keyword.other.trait": { "color": "#ff7edb" },
			"keyword.other.unsafe.rust": { "color": "#fe4450" },
			"keyword.other.using": { "color": "#ff7edb" },
			"keyword.other.where": { "color": "#fede5d" },
			"label": { "color": "#ff7edb" },
			"link_text": { "color": "#03edf9" },
			"link_uri": { "color": "#72f1b8" },
			"markup.bold": {
				"color": "#ff7edb",
				"font_weight": 700
			},
			"markup.bold.markdown": {
				"color": "#ff7edb",
				"font_weight": 700
			},
			"markup.heading": { "color": "#36f9f6" },
			"markup.heading.markdown": { "color": "#36f9f6" },
			"markup.italic": {
				"color": "#ff7edb",
				"font_style": "italic"
			},
			"markup.italic.markdown": {
				"color": "#ff7edb",
				"font_style": "italic"
			},
			"markup.list": { "color": "#ff7edb" },
			"markup.quote": {
				"color": "#848bbd",
				"font_style": "italic"
			},
			"markup.raw": {
				"color": "#72f1b8",
				"font_style": "italic"
			},
			"markup.raw.inline": {
				"color": "#72f1b8",
				"font_style": "italic"
			},
			"markup.raw.inline.markdown": {
				"color": "#72f1b8",
				"font_style": "italic"
			},
			"markup.underline": { "color": "#72f1b8" },
			"markup.underline.link.markdown": { "color": "#72f1b8" },
			"meta.attribute.rust": { "color": "#fede5d" },
			"meta.diff.header": { "color": "#36f9f6" },
			"meta.function-call.python": { "color": "#36f9f6" },
			"meta.jsx.children": { "color": "#ffffff" },
			"meta.output": {
				"color": "#848bbd",
				"font_style": "italic"
			},
			"meta.separator": {
				"color": "#848bbd",
				"font_style": "italic"
			},
			"meta.tag.jsx": { "color": "#ff7edb" },
			"number": { "color": "#f97e72" },
			"operator": { "color": "#fede5d" },
			"predictive": {
				"color": "#36f9f6",
				"font_style": "italic"
			},
			"preproc": { "color": "#ff7edb" },
			"primary": { "color": "#ffffff" },
			"property": { "color": "#ff7edb" },
			"punctuation": { "color": "#ffffff" },
			"punctuation.bracket": { "color": "#ffffff" },
			"punctuation.definition.list.begin.markdown": { "color": "#ff7edb" },
			"punctuation.delimiter": { "color": "#ffffff" },
			"punctuation.list_marker": { "color": "#ff7edb" },
			"punctuation.special": { "color": "#fede5d" },
			"source.c": { "color": "#ffffff" },
			"source.cpp": { "color": "#ffffff" },
			"source.css": { "color": "#ffffff" },
			"source.go": { "color": "#ffffff" },
			"source.html": { "color": "#ffffff" },
			"source.java": { "color": "#ffffff" },
			"source.js": { "color": "#ffffff" },
			"source.json": { "color": "#ffffff" },
			"source.jsx": { "color": "#ffffff" },
			"source.markdown": { "color": "#ffffff" },
			"source.python": { "color": "#ffffff" },
			"source.ruby": { "color": "#ffffff" },
			"source.rust": { "color": "#ffffff" },
			"source.shell": { "color": "#ffffff" },
			"source.sql": { "color": "#ffffff" },
			"source.toml": { "color": "#ffffff" },
			"source.ts": { "color": "#ffffff" },
			"source.tsx": { "color": "#ffffff" },
			"source.yaml": { "color": "#ffffff" },
			"storage": { "color": "#fede5d" },
			"storage.modifier": { "color": "#fede5d" },
			"storage.modifier.async": { "color": "#ff7edb" },
			"storage.modifier.java": { "color": "#fede5d" },
			"storage.type": { "color": "#ff7edb" },
			"storage.type.annotation.java": { "color": "#ff7edb" },
			"string": { "color": "#ff8b39" },
			"string.escape": { "color": "#72f1b8" },
			"string.regex": { "color": "#72f1b8" },
			"string.special": {
				"color": "#72f1b8",
				"font_style": "italic"
			},
			"string.special.symbol": { "color": "#ff8b39" },
			"support.class": {
				"color": "#72f1b8",
				"font_weight": 700
			},
			"support.constant": { "color": "#f97e72" },
			"support.function": { "color": "#72f1b8" },
			"support.other.namespace": { "color": "#ff7edb" },
			"support.type": { "color": "#72f1b8" },
			"support.type.property-name": { "color": "#ff7edb" },
			"support.type.property-name.css": { "color": "#ff7edb" },
			"support.type.property-name.json": { "color": "#ff7edb" },
			"tag": { "color": "#ff7edb" },
			"text.literal": { "color": "#ff8b39" },
			"title": { "color": "#36f9f6" },
			"type": { "color": "#ff7edb" },
			"type.builtin": { "color": "#ff7edb" },
			"variable": { "color": "#ff7edb" },
			"variable.function": { "color": "#36f9f6" },
			"variable.language": { "color": "#ff7edb" },
			"variable.other.bracket.shell": { "color": "#ff7edb" },
			"variable.other.member": { "color": "#ff7edb" },
			"variable.other.normal.shell": { "color": "#ff7edb" },
			"variable.other.readwrite.class.ruby": { "color": "#ff7edb" },
			"variable.other.readwrite.instance.ruby": { "color": "#ff7edb" },
			"variable.parameter": {
				"color": "#f97e72",
				"font_style": "italic"
			},
			"variable.parameter.function.language.special.cls.python": { "color": "#ff7edb" },
			"variable.parameter.function.language.special.self.python": { "color": "#ff7edb" },
			"variable.special": { "color": "#ff7edb" },
			"variant": { "color": "#36f9f6" },
			"ghost_text.background": { "color": "#36f9f615" },
			"ghost_text.border": { "color": "#36f9f640" },
			"assistant.background": { "color": "#72f1b815" },
			"assistant.border": { "color": "#72f1b840" },
			"inlay_hint.background": { "color": "#262335" },
			"namespace": { "color": "#FE4450" },
			"selector": { "color": "#72F1B8" },
			"diff.minus": { "color": "#fe4450" },
			"diff.plus": { "color": "#72f1b8cc" },
			"selector.class": { "color": "#FEDE5D" },
			"selector.id": { "color": "#36F9F6" },
			"selector.pseudo": { "color": "#D50" }
		}
	}
};
var tokyo_night_default = {
	name: "Tokyo Night",
	appearance: "dark",
	style: {
		"background": "#1a1b26",
		"text": "#a9b1d6",
		"editor.background": "#1a1b26",
		"editor.foreground": "#a9b1d6",
		"editor.active_line.background": "#1e202e",
		"editor.document_highlight.bracket_background": "#414868",
		"search.match_background": "#414868",
		"players": [{
			"cursor": "#7c7f93",
			"background": "#7c7f93",
			"selection": "#267ead3d"
		}],
		"error": "#f7768e",
		"warning": "#e0af68",
		"info": "#0da0ba",
		"hint": "#51597d",
		"created": "#449dab",
		"deleted": "#914c54",
		"modified": "#6183bb",
		"terminal.ansi.green": "#73daca",
		"terminal.ansi.red": "#f7768e",
		"terminal.ansi.blue": "#7aa2f7",
		"syntax": {
			"attribute": { "color": "#bb9af7" },
			"boolean": { "color": "#ff9e64" },
			"comment": { "color": "#51597d" },
			"comment.doc": { "color": "#51597d" },
			"constant": { "color": "#ff9e64" },
			"constructor": { "color": "#f7768e" },
			"emphasis": {
				"color": "#f7768e",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#f7768e",
				"font_weight": 700
			},
			"function": { "color": "#7aa2f7" },
			"keyword": { "color": "#bb9af7" },
			"label": { "color": "#c0caf5" },
			"link_text": { "color": "#73daca" },
			"link_uri": { "color": "#73daca" },
			"number": { "color": "#ff9e64" },
			"operator": { "color": "#89ddff" },
			"preproc": { "color": "#73daca" },
			"punctuation": { "color": "#89ddff" },
			"punctuation.bracket": { "color": "#89ddff" },
			"punctuation.delimiter": { "color": "#89ddff" },
			"punctuation.list_marker": { "color": "#89ddff" },
			"punctuation.special": { "color": "#89ddff" },
			"string": { "color": "#9ece6a" },
			"string.escape": { "color": "#bb9af7" },
			"string.regex": { "color": "#9ece6a" },
			"string.special": { "color": "#9ece6a" },
			"string.special.symbol": { "color": "#9ece6a" },
			"tag": { "color": "#f7768e" },
			"text.literal": { "color": "#9ece6a" },
			"title": { "color": "#ff9e64" },
			"type": { "color": "#0db9d7" },
			"variable": { "color": "#c0caf5" },
			"variable.special": { "color": "#f7768e" },
			"character": { "color": "#9ece6a" },
			"character.special": { "color": "#bb9af7" },
			"comment.documentation": { "color": "#51597d" },
			"comment.error": { "color": "#f7768e" },
			"comment.hint": { "color": "#0da0ba" },
			"comment.note": { "color": "#7dcfff" },
			"comment.todo": { "color": "#e0af68" },
			"comment.warning": { "color": "#e0af68" },
			"concept": { "color": "#bb9af7" },
			"constant.builtin": { "color": "#ff9e64" },
			"constant.macro": { "color": "#bb9af7" },
			"diff.minus": { "color": "#f7768e" },
			"diff.plus": { "color": "#9ece6a" },
			"embedded": { "color": "#c0caf5" },
			"enum": { "color": "#0db9d7" },
			"field": { "color": "#c0caf5" },
			"float": { "color": "#ff9e64" },
			"function.builtin": { "color": "#7aa2f7" },
			"function.call": { "color": "#7aa2f7" },
			"function.decorator": { "color": "#bb9af7" },
			"function.macro": { "color": "#bb9af7" },
			"function.method": { "color": "#7aa2f7" },
			"function.method.call": { "color": "#7aa2f7" },
			"keyword.conditional": { "color": "#bb9af7" },
			"keyword.conditional.ternary": { "color": "#bb9af7" },
			"keyword.coroutine": { "color": "#bb9af7" },
			"keyword.debug": { "color": "#f7768e" },
			"keyword.directive": { "color": "#bb9af7" },
			"keyword.directive.define": { "color": "#bb9af7" },
			"keyword.exception": { "color": "#bb9af7" },
			"keyword.export": { "color": "#bb9af7" },
			"keyword.function": { "color": "#bb9af7" },
			"keyword.import": { "color": "#bb9af7" },
			"keyword.modifier": { "color": "#bb9af7" },
			"keyword.operator": { "color": "#89ddff" },
			"keyword.repeat": { "color": "#bb9af7" },
			"keyword.return": { "color": "#bb9af7" },
			"keyword.type": { "color": "#bb9af7" },
			"module": { "color": "#c0caf5" },
			"namespace": { "color": "#c0caf5" },
			"number.float": { "color": "#ff9e64" },
			"parameter": { "color": "#c0caf5" },
			"parent": { "color": "#c0caf5" },
			"predoc": { "color": "#51597d" },
			"primary": { "color": "#c0caf5" },
			"property": { "color": "#c0caf5" },
			"string.doc": { "color": "#9ece6a" },
			"string.documentation": { "color": "#9ece6a" },
			"string.regexp": { "color": "#9ece6a" },
			"string.special.path": { "color": "#9ece6a" },
			"string.special.url": { "color": "#7dcfff" },
			"symbol": { "color": "#c0caf5" },
			"tag.attribute": { "color": "#bb9af7" },
			"tag.delimiter": { "color": "#89ddff" },
			"tag.doctype": { "color": "#51597d" },
			"type.builtin": { "color": "#0db9d7" },
			"type.class.definition": { "color": "#0db9d7" },
			"type.definition": { "color": "#0db9d7" },
			"type.interface": { "color": "#0db9d7" },
			"type.super": { "color": "#0db9d7" },
			"variable.builtin": { "color": "#f7768e" },
			"variable.member": { "color": "#c0caf5" },
			"variable.parameter": { "color": "#c0caf5" },
			"variant": { "color": "#c0caf5" },
			"predictive": { "color": "#51597d" },
			"selector": { "color": "#0DB9D7" },
			"hint": { "color": "#51597d" },
			"selector.class": { "color": "#9ECE6A" },
			"selector.id": { "color": "#FC7B7B" },
			"selector.pseudo": { "color": "#BB9AF7" }
		}
	}
};
var vesper_default = {
	name: "Vesper",
	appearance: "dark",
	style: {
		"background": "#101010",
		"text": "#FFFFFF",
		"editor.background": "#101010",
		"editor.foreground": "#FFFFFF",
		"editor.active_line.background": "#101010",
		"search.match_background": "#575757",
		"players": [{
			"cursor": "#FFC799ff",
			"background": "#FFC799ff",
			"selection": "#FFC7993d"
		}, {
			"cursor": "#99FFE4ff",
			"background": "#99FFE4ff",
			"selection": "#99FFE43d"
		}],
		"error": "#FF8080ff",
		"warning": "#FFC799ff",
		"info": "#7E7E7Eff",
		"hint": "#A0A0A0",
		"syntax": {
			"attribute": { "color": "#A0A0A0" },
			"comment": { "color": "#8b8b8b94" },
			"comment.doc": { "color": "#8b8b8b94" },
			"constant": { "color": "#FFC799" },
			"constructor": { "color": "#FFC799" },
			"emphasis": {
				"color": "#FFFFFF",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#FFFFFF",
				"font_weight": 700
			},
			"function": { "color": "#FFC799" },
			"keyword": { "color": "#A0A0A0" },
			"label": { "color": "#FFC799" },
			"link_text": { "color": "#FFFFFF" },
			"link_uri": { "color": "#FFFFFF" },
			"number": { "color": "#FFC799" },
			"operator": { "color": "#A0A0A0" },
			"punctuation": { "color": "#A0A0A0" },
			"punctuation.bracket": { "color": "#A0A0A0" },
			"punctuation.delimiter": { "color": "#A0A0A0" },
			"punctuation.list_marker": { "color": "#A0A0A0" },
			"punctuation.special": { "color": "#A0A0A0" },
			"string": { "color": "#99FFE4" },
			"string.escape": { "color": "#FFC799" },
			"string.regex": { "color": "#99FFE4" },
			"string.special": { "color": "#99FFE4" },
			"string.special.symbol": { "color": "#99FFE4" },
			"tag": { "color": "#FFC799" },
			"text.literal": { "color": "#99FFE4" },
			"title": { "color": "#FFC799" },
			"type": { "color": "#FFC799" },
			"variable": { "color": "#FFFFFF" },
			"variable.special": { "color": "#A0A0A0" },
			"boolean": { "color": "#FFC799" },
			"embedded": { "color": "#FFFFFF" },
			"namespace": { "color": "#FFC799" },
			"predictive": { "color": "#8b8b8b94" },
			"preproc": { "color": "#A0A0A0" },
			"primary": { "color": "#FFFFFF" },
			"property": { "color": "#FFF" },
			"selector": { "color": "#FFC799" },
			"enum": { "color": "#FFC799" },
			"hint": { "color": "#A0A0A0" },
			"variant": { "color": "#FFF" },
			"diff.minus": { "color": "#FF8080" },
			"diff.plus": { "color": "#99FFE4" },
			"property.json_key": { "color": "#FFC799" },
			"selector.pseudo": { "color": "#A0A0A0" }
		},
		"created": "#81b88b",
		"deleted": "#c74e39",
		"modified": "#E2C08D"
	}
};
var vitesse_black_default = {
	name: "Vitesse Black",
	appearance: "dark",
	style: {
		"background": "#000000",
		"text": "#dbd7cacc",
		"editor.background": "#000000",
		"editor.foreground": "#dbd7cacc",
		"editor.active_line.background": "#121212",
		"editor.document_highlight.bracket_background": "#eeeeee18",
		"search.match_background": "#121212",
		"players": [
			{
				"cursor": "#dbd7cacc",
				"background": "#dbd7cacc",
				"selection": "#363636"
			},
			{
				"cursor": "#d4976c",
				"background": "#d4976c",
				"selection": "#d4976c4D"
			},
			{
				"cursor": "#e6cc77",
				"background": "#e6cc77",
				"selection": "#e6cc774D"
			},
			{
				"cursor": "#4d9375",
				"background": "#4d9375",
				"selection": "#4d93754D"
			},
			{
				"cursor": "#5eaab5",
				"background": "#5eaab5",
				"selection": "#5eaab54D"
			},
			{
				"cursor": "#6394bf",
				"background": "#6394bf",
				"selection": "#6394bf4D"
			},
			{
				"cursor": "#d9739f",
				"background": "#d9739f",
				"selection": "#d9739f4D"
			},
			{
				"cursor": "#cb7676",
				"background": "#cb7676",
				"selection": "#cb76764D"
			}
		],
		"error": "#cb7676",
		"warning": "#d4976c",
		"info": "#6394bf",
		"hint": "#444444",
		"created": "#4d9375",
		"deleted": "#cb7676",
		"modified": "#6394bf",
		"terminal.ansi.green": "#4d9375",
		"terminal.ansi.red": "#cb7676",
		"terminal.ansi.blue": "#6394bf",
		"syntax": {
			"attribute": { "color": "#bd976a" },
			"boolean": { "color": "#4d9375" },
			"character": { "color": "#dbd7cacc" },
			"character.special": { "color": "#dbd7cacc" },
			"comment": { "color": "#758575dd" },
			"comment.doc": { "color": "#758575dd" },
			"concept": { "color": "#dbd7cacc" },
			"constant": { "color": "#bd976a" },
			"constant.builtin": { "color": "#cb7676" },
			"constant.macro": { "color": "#c99076" },
			"constructor": { "color": "#4d9375" },
			"diff": { "color": "#dbd7cacc" },
			"diff.minus": { "color": "#dbd7cacc" },
			"diff.plus": { "color": "#dbd7cacc" },
			"embedded": { "color": "#dbd7cacc" },
			"emphasis": {
				"color": "#dbd7cacc",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#dbd7cacc",
				"font_weight": 700
			},
			"enum": { "color": "#dbd7cacc" },
			"field": { "color": "#dbd7cacc" },
			"float": { "color": "#dbd7cacc" },
			"function": { "color": "#80a665" },
			"function.builtin": { "color": "#80a665" },
			"function.call": { "color": "#80a665" },
			"function.decorator": { "color": "#80a665" },
			"function.macro": { "color": "#80a665" },
			"function.method": { "color": "#80a665" },
			"function.method.call": { "color": "#80a665" },
			"hint": { "color": "#dbd7cacc" },
			"keyword": { "color": "#cb7676" },
			"keyword.conditional": { "color": "#4d9375" },
			"keyword.conditional.ternary": { "color": "#4d9375" },
			"keyword.coroutine": { "color": "#4d9375" },
			"keyword.debug": { "color": "#4d9375" },
			"keyword.directive": { "color": "#4d9375" },
			"keyword.directive.define": { "color": "#4d9375" },
			"keyword.exception": { "color": "#4d9375" },
			"keyword.export": { "color": "#4d9375" },
			"keyword.function": { "color": "#4d9375" },
			"keyword.import": { "color": "#4d9375" },
			"keyword.modifier": { "color": "#4d9375" },
			"keyword.operator": { "color": "#4d9375" },
			"keyword.repeat": { "color": "#4d9375" },
			"keyword.return": { "color": "#4d9375" },
			"keyword.type": { "color": "#5DA994" },
			"label": { "color": "#80a665" },
			"link_text": { "color": "#c98a7d" },
			"link_uri": { "color": "#758575dd" },
			"module": { "color": "#dbd7cacc" },
			"namespace": { "color": "#5d99a9" },
			"number": { "color": "#4C9A91" },
			"number.float": { "color": "#dbd7cacc" },
			"operator": { "color": "#cb7676" },
			"parameter": { "color": "#bd976a" },
			"parent": { "color": "#dbd7cacc" },
			"predictive": { "color": "#dbd7cacc" },
			"predoc": { "color": "#dbd7cacc" },
			"preproc": { "color": "#dbd7cacc" },
			"primary": { "color": "#4d9375" },
			"property": { "color": "#b8a965" },
			"property.json_key": { "color": "#b8a965" },
			"punctuation": { "color": "#444444" },
			"punctuation.bracket": { "color": "#444444" },
			"punctuation.delimiter": { "color": "#444444" },
			"punctuation.delimiter.jsx": { "color": "#444444" },
			"punctuation.list_marker": { "color": "#444444" },
			"punctuation.special": { "color": "#444444" },
			"punctuation.special.symbol": { "color": "#444444" },
			"selector": { "color": "#bd976a" },
			"selector.pseudo": { "color": "#80a665" },
			"string": { "color": "#c98a7d" },
			"string.doc": { "color": "#c98a7d" },
			"string.documentation": { "color": "#c98a7d" },
			"string.escape": { "color": "#6872ab" },
			"punctuation.markup": { "color": "#444444" },
			"string.regex": { "color": "#c4704f" },
			"string.regexp": { "color": "#c4704f" },
			"string.special": { "color": "#c98a7d" },
			"string.special.path": { "color": "#c98a7d" },
			"string.special.symbol": { "color": "#c98a7d" },
			"string.special.url": { "color": "#c98a7d" },
			"symbol": { "color": "#c98a7d" },
			"tag": { "color": "#4d9375" },
			"tag.attribute": { "color": "#4d9375" },
			"tag.delimiter": { "color": "#4d9375" },
			"tag.doctype": { "color": "#4d9375" },
			"text": { "color": "#dbd7cacc" },
			"text.literal": { "color": "#dedcd590" },
			"title": {
				"color": "#4d9375",
				"font_weight": 700
			},
			"type": { "color": "#5d99a9" },
			"type.builtin": { "color": "#5DA994" },
			"type.builtin.class": { "color": "#6872ab" },
			"type.class.definition": { "color": "#5DA994" },
			"type.definition": { "color": "#5DA994" },
			"type.interface": { "color": "#5DA994" },
			"type.super": { "color": "#5DA994" },
			"variable": { "color": "#bd976a" },
			"variable.builtin": { "color": "#bd976a" },
			"variable.member": { "color": "#bd976a" },
			"variable.parameter": { "color": "#bd976a" },
			"variable.special": { "color": "#c99076" },
			"variant": { "color": "#bd976a" },
			"constant.comment.todo": { "color": "#5eaab5" },
			"string.comment.info": { "color": "#6394bf" },
			"keyword.comment.warn": { "color": "#d4976c" },
			"property.comment.error": { "color": "#cb7676" }
		}
	}
};
var vitesse_dark_default = {
	name: "Vitesse Dark",
	appearance: "dark",
	style: {
		"background": "#121212",
		"text": "#dbd7caee",
		"editor.background": "#121212",
		"editor.foreground": "#dbd7caee",
		"editor.active_line.background": "#181818",
		"editor.document_highlight.bracket_background": "#eeeeee18",
		"search.match_background": "#181818",
		"players": [
			{
				"cursor": "#dbd7caee",
				"background": "#dbd7caee",
				"selection": "#363636"
			},
			{
				"cursor": "#d4976c",
				"background": "#d4976c",
				"selection": "#d4976c4D"
			},
			{
				"cursor": "#e6cc77",
				"background": "#e6cc77",
				"selection": "#e6cc774D"
			},
			{
				"cursor": "#4d9375",
				"background": "#4d9375",
				"selection": "#4d93754D"
			},
			{
				"cursor": "#5eaab5",
				"background": "#5eaab5",
				"selection": "#5eaab54D"
			},
			{
				"cursor": "#6394bf",
				"background": "#6394bf",
				"selection": "#6394bf4D"
			},
			{
				"cursor": "#d9739f",
				"background": "#d9739f",
				"selection": "#d9739f4D"
			},
			{
				"cursor": "#cb7676",
				"background": "#cb7676",
				"selection": "#cb76764D"
			}
		],
		"error": "#cb7676",
		"warning": "#d4976c",
		"info": "#6394bf",
		"hint": "#666666",
		"created": "#4d9375",
		"deleted": "#cb7676",
		"modified": "#6394bf",
		"terminal.ansi.green": "#4d9375",
		"terminal.ansi.red": "#cb7676",
		"terminal.ansi.blue": "#6394bf",
		"syntax": {
			"attribute": { "color": "#bd976a" },
			"boolean": { "color": "#4d9375" },
			"character": { "color": "#dbd7caee" },
			"character.special": { "color": "#dbd7caee" },
			"comment": { "color": "#758575dd" },
			"comment.doc": { "color": "#758575dd" },
			"concept": { "color": "#dbd7caee" },
			"constant": { "color": "#bd976a" },
			"constant.builtin": { "color": "#cb7676" },
			"constant.macro": { "color": "#c99076" },
			"constructor": { "color": "#4d9375" },
			"diff": { "color": "#dbd7caee" },
			"diff.minus": { "color": "#dbd7caee" },
			"diff.plus": { "color": "#dbd7caee" },
			"embedded": { "color": "#dbd7caee" },
			"emphasis": {
				"color": "#dbd7caee",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#dbd7caee",
				"font_weight": 700
			},
			"enum": { "color": "#dbd7caee" },
			"field": { "color": "#dbd7caee" },
			"float": { "color": "#dbd7caee" },
			"function": { "color": "#80a665" },
			"function.builtin": { "color": "#80a665" },
			"function.call": { "color": "#80a665" },
			"function.decorator": { "color": "#80a665" },
			"function.macro": { "color": "#80a665" },
			"function.method": { "color": "#80a665" },
			"function.method.call": { "color": "#80a665" },
			"hint": { "color": "#dbd7caee" },
			"keyword": { "color": "#cb7676" },
			"keyword.conditional": { "color": "#4d9375" },
			"keyword.conditional.ternary": { "color": "#4d9375" },
			"keyword.coroutine": { "color": "#4d9375" },
			"keyword.debug": { "color": "#4d9375" },
			"keyword.directive": { "color": "#4d9375" },
			"keyword.directive.define": { "color": "#4d9375" },
			"keyword.exception": { "color": "#4d9375" },
			"keyword.export": { "color": "#4d9375" },
			"keyword.function": { "color": "#4d9375" },
			"keyword.import": { "color": "#4d9375" },
			"keyword.modifier": { "color": "#4d9375" },
			"keyword.operator": { "color": "#4d9375" },
			"keyword.repeat": { "color": "#4d9375" },
			"keyword.return": { "color": "#4d9375" },
			"keyword.type": { "color": "#5DA994" },
			"label": { "color": "#80a665" },
			"link_text": { "color": "#c98a7d" },
			"link_uri": { "color": "#758575dd" },
			"module": { "color": "#dbd7caee" },
			"namespace": { "color": "#5d99a9" },
			"number": { "color": "#4C9A91" },
			"number.float": { "color": "#dbd7caee" },
			"operator": { "color": "#cb7676" },
			"parameter": { "color": "#bd976a" },
			"parent": { "color": "#dbd7caee" },
			"predictive": { "color": "#dbd7caee" },
			"predoc": { "color": "#dbd7caee" },
			"preproc": { "color": "#dbd7caee" },
			"primary": { "color": "#4d9375" },
			"property": { "color": "#b8a965" },
			"property.json_key": { "color": "#b8a965" },
			"punctuation": { "color": "#666666" },
			"punctuation.bracket": { "color": "#666666" },
			"punctuation.delimiter": { "color": "#666666" },
			"punctuation.delimiter.jsx": { "color": "#666666" },
			"punctuation.list_marker": { "color": "#666666" },
			"punctuation.special": { "color": "#666666" },
			"punctuation.special.symbol": { "color": "#666666" },
			"selector": { "color": "#bd976a" },
			"selector.pseudo": { "color": "#80a665" },
			"string": { "color": "#c98a7d" },
			"string.doc": { "color": "#c98a7d" },
			"string.documentation": { "color": "#c98a7d" },
			"string.escape": { "color": "#6872ab" },
			"punctuation.markup": { "color": "#666666" },
			"string.regex": { "color": "#c4704f" },
			"string.regexp": { "color": "#c4704f" },
			"string.special": { "color": "#c98a7d" },
			"string.special.path": { "color": "#c98a7d" },
			"string.special.symbol": { "color": "#c98a7d" },
			"string.special.url": { "color": "#c98a7d" },
			"symbol": { "color": "#c98a7d" },
			"tag": { "color": "#4d9375" },
			"tag.attribute": { "color": "#4d9375" },
			"tag.delimiter": { "color": "#4d9375" },
			"tag.doctype": { "color": "#4d9375" },
			"text": { "color": "#dbd7caee" },
			"text.literal": { "color": "#dedcd590" },
			"title": {
				"color": "#4d9375",
				"font_weight": 700
			},
			"type": { "color": "#5d99a9" },
			"type.builtin": { "color": "#5DA994" },
			"type.builtin.class": { "color": "#6872ab" },
			"type.class.definition": { "color": "#5DA994" },
			"type.definition": { "color": "#5DA994" },
			"type.interface": { "color": "#5DA994" },
			"type.super": { "color": "#5DA994" },
			"variable": { "color": "#bd976a" },
			"variable.builtin": { "color": "#bd976a" },
			"variable.member": { "color": "#bd976a" },
			"variable.parameter": { "color": "#bd976a" },
			"variable.special": { "color": "#c99076" },
			"variant": { "color": "#bd976a" },
			"constant.comment.todo": { "color": "#5eaab5" },
			"string.comment.info": { "color": "#6394bf" },
			"keyword.comment.warn": { "color": "#d4976c" },
			"property.comment.error": { "color": "#cb7676" }
		}
	}
};
var vitesse_light_default = {
	name: "Vitesse Light",
	appearance: "light",
	style: {
		"background": "#ffffff",
		"text": "#393a34",
		"editor.background": "#ffffff",
		"editor.foreground": "#393a34",
		"editor.active_line.background": "#f7f7f7",
		"editor.document_highlight.bracket_background": "#22222218",
		"search.match_background": "#f7f7f7",
		"players": [
			{
				"cursor": "#393a34",
				"background": "#393a34",
				"selection": "#dcdbd6"
			},
			{
				"cursor": "#a65e2b",
				"background": "#a65e2b",
				"selection": "#a65e2b4D"
			},
			{
				"cursor": "#bda437",
				"background": "#bda437",
				"selection": "#bda4374D"
			},
			{
				"cursor": "#1e754f",
				"background": "#1e754f",
				"selection": "#1e754f4D"
			},
			{
				"cursor": "#2993a3",
				"background": "#2993a3",
				"selection": "#2993a34D"
			},
			{
				"cursor": "#296aa3",
				"background": "#296aa3",
				"selection": "#296aa34D"
			},
			{
				"cursor": "#a13865",
				"background": "#a13865",
				"selection": "#a138654D"
			},
			{
				"cursor": "#ab5959",
				"background": "#ab5959",
				"selection": "#ab59594D"
			}
		],
		"error": "#ab5959",
		"warning": "#a65e2b",
		"info": "#296aa3",
		"hint": "#999999",
		"created": "#1e754f",
		"deleted": "#ab5959",
		"modified": "#296aa3",
		"terminal.ansi.green": "#1e754f",
		"terminal.ansi.red": "#ab5959",
		"terminal.ansi.blue": "#296aa3",
		"syntax": {
			"attribute": { "color": "#b07d48" },
			"boolean": { "color": "#1e754f" },
			"character": { "color": "#393a34" },
			"character.special": { "color": "#393a34" },
			"comment": { "color": "#a0ada0" },
			"comment.doc": { "color": "#a0ada0" },
			"concept": { "color": "#393a34" },
			"constant": { "color": "#b07d48" },
			"constant.builtin": { "color": "#ab5959" },
			"constant.macro": { "color": "#a65e2b" },
			"constructor": { "color": "#1e754f" },
			"diff": { "color": "#393a34" },
			"diff.minus": { "color": "#393a34" },
			"diff.plus": { "color": "#393a34" },
			"embedded": { "color": "#393a34" },
			"emphasis": {
				"color": "#393a34",
				"font_style": "italic"
			},
			"emphasis.strong": {
				"color": "#393a34",
				"font_weight": 700
			},
			"enum": { "color": "#393a34" },
			"field": { "color": "#393a34" },
			"float": { "color": "#393a34" },
			"function": { "color": "#59873a" },
			"function.builtin": { "color": "#59873a" },
			"function.call": { "color": "#59873a" },
			"function.decorator": { "color": "#59873a" },
			"function.macro": { "color": "#59873a" },
			"function.method": { "color": "#59873a" },
			"function.method.call": { "color": "#59873a" },
			"hint": { "color": "#393a34" },
			"keyword": { "color": "#ab5959" },
			"keyword.conditional": { "color": "#1e754f" },
			"keyword.conditional.ternary": { "color": "#1e754f" },
			"keyword.coroutine": { "color": "#1e754f" },
			"keyword.debug": { "color": "#1e754f" },
			"keyword.directive": { "color": "#1e754f" },
			"keyword.directive.define": { "color": "#1e754f" },
			"keyword.exception": { "color": "#1e754f" },
			"keyword.export": { "color": "#1e754f" },
			"keyword.function": { "color": "#1e754f" },
			"keyword.import": { "color": "#1e754f" },
			"keyword.modifier": { "color": "#1e754f" },
			"keyword.operator": { "color": "#1e754f" },
			"keyword.repeat": { "color": "#1e754f" },
			"keyword.return": { "color": "#1e754f" },
			"keyword.type": { "color": "#2e8f82" },
			"label": { "color": "#59873a" },
			"link_text": { "color": "#b56959" },
			"link_uri": { "color": "#a0ada0" },
			"module": { "color": "#393a34" },
			"namespace": { "color": "#2e808f" },
			"number": { "color": "#2f798a" },
			"number.float": { "color": "#393a34" },
			"operator": { "color": "#ab5959" },
			"parameter": { "color": "#b07d48" },
			"parent": { "color": "#393a34" },
			"predictive": { "color": "#393a34" },
			"predoc": { "color": "#393a34" },
			"preproc": { "color": "#393a34" },
			"primary": { "color": "#1c6b48" },
			"property": { "color": "#998418" },
			"property.json_key": { "color": "#998418" },
			"punctuation": { "color": "#999999" },
			"punctuation.bracket": { "color": "#999999" },
			"punctuation.delimiter": { "color": "#999999" },
			"punctuation.delimiter.jsx": { "color": "#999999" },
			"punctuation.list_marker": { "color": "#999999" },
			"punctuation.special": { "color": "#999999" },
			"punctuation.special.symbol": { "color": "#999999" },
			"selector": { "color": "#b07d48" },
			"selector.pseudo": { "color": "#59873a" },
			"string": { "color": "#b56959" },
			"string.doc": { "color": "#b56959" },
			"string.documentation": { "color": "#b56959" },
			"string.escape": { "color": "#5a6aa6" },
			"punctuation.markup": { "color": "#999999" },
			"string.regex": { "color": "#ab5e3f" },
			"string.regexp": { "color": "#ab5e3f" },
			"string.special": { "color": "#b56959" },
			"string.special.path": { "color": "#b56959" },
			"string.special.symbol": { "color": "#b56959" },
			"string.special.url": { "color": "#b56959" },
			"symbol": { "color": "#b56959" },
			"tag": { "color": "#1e754f" },
			"tag.attribute": { "color": "#1e754f" },
			"tag.delimiter": { "color": "#1e754f" },
			"tag.doctype": { "color": "#1e754f" },
			"text": { "color": "#393a34" },
			"text.literal": { "color": "#393a3490" },
			"title": {
				"color": "#1c6b48",
				"font_weight": 700
			},
			"type": { "color": "#2e808f" },
			"type.builtin": { "color": "#2e8f82" },
			"type.builtin.class": { "color": "#5a6aa6" },
			"type.class.definition": { "color": "#2e8f82" },
			"type.definition": { "color": "#2e8f82" },
			"type.interface": { "color": "#2e8f82" },
			"type.super": { "color": "#2e8f82" },
			"variable": { "color": "#b07d48" },
			"variable.builtin": { "color": "#b07d48" },
			"variable.member": { "color": "#b07d48" },
			"variable.parameter": { "color": "#b07d48" },
			"variable.special": { "color": "#a65e2b" },
			"variant": { "color": "#b07d48" },
			"constant.comment.todo": { "color": "#2993a3" },
			"string.comment.info": { "color": "#296aa3" },
			"keyword.comment.warn": { "color": "#a65e2b" },
			"property.comment.error": { "color": "#ab5959" }
		}
	}
};
/** A pass-through theme: every color resolves to a prefixed CSS variable. */
const cssVariables = {
	name: "CSS Variables",
	appearance: "dark",
	cssVariables: true,
	style: {}
};
/**
* Convert a Zed theme to CSS custom properties.
* Emit only hex and numeric Display P3 colors. Omit invalid background
* and foreground colors. Use `inherit` for invalid syntax colors.
* Skip syntax scopes whose names are not plain dotted identifiers.
*/
function toCSS({ style }, { cssVariablePrefix = defaultCssVariablePrefix } = {}) {
	let css = "";
	if (style == null) return css;
	const background = themeBackground(style);
	const foreground = themeForeground(style);
	if (isThemeColor(background)) css += `${cssVariablePrefix}background: ${background.trim()};`;
	if (isThemeColor(foreground)) css += `${cssVariablePrefix}foreground: ${foreground.trim()};`;
	const syntax = style.syntax ?? {};
	for (const name of /* @__PURE__ */ new Set([...Object.keys(syntax), ...tokenTypes.slice(1, -2)])) {
		if (!/^[a-z0-9_.-]+$/i.test(name)) continue;
		const color = resolveThemeSyntax(syntax, name)?.color ?? foreground;
		css += `${cssVariablePrefix}${name.replace(/[._]/g, "-")}: ${isThemeColor(color) ? color.trim() : "inherit"};`;
	}
	return css;
}
const andromeeda = andromeeda_default;
const auroraX = aurora_x_default;
const ayuDark = ayu_dark_default;
const ayuLight = ayu_light_default;
const ayuMirage = ayu_mirage_default;
const catppuccinFrappe = catppuccin_frappe_default;
const catppuccinLatte = catppuccin_latte_default;
const catppuccinMacchiato = catppuccin_macchiato_default;
const catppuccinMocha = catppuccin_mocha_default;
const darkPlus = dark_plus_default;
const dracula = dracula_default;
const draculaSoft = dracula_soft_default;
const everforestDark = everforest_dark_default;
const everforestLight = everforest_light_default;
const githubDark = github_dark_default;
const githubDarkDefault = github_dark_default_default;
const githubDarkDimmed = github_dark_dimmed_default;
const githubDarkHighContrast = github_dark_high_contrast_default;
const githubLight = github_light_default;
const githubLightDefault = github_light_default_default;
const githubLightHighContrast = github_light_high_contrast_default;
const gruvboxDarkHard = gruvbox_dark_hard_default;
const gruvboxDarkMedium = gruvbox_dark_medium_default;
const gruvboxDarkSoft = gruvbox_dark_soft_default;
const gruvboxLightHard = gruvbox_light_hard_default;
const gruvboxLightMedium = gruvbox_light_medium_default;
const gruvboxLightSoft = gruvbox_light_soft_default;
const horizon = horizon_default;
const horizonBright = horizon_bright_default;
const houston = houston_default;
const kanagawaDragon = kanagawa_dragon_default;
const kanagawaLotus = kanagawa_lotus_default;
const kanagawaWave = kanagawa_wave_default;
const laserwave = laserwave_default;
const lightPlus = light_plus_default;
const materialTheme = material_theme_default;
const materialThemeDarker = material_theme_darker_default;
const materialThemeLighter = material_theme_lighter_default;
const materialThemeOcean = material_theme_ocean_default;
const materialThemePalenight = material_theme_palenight_default;
const minDark = min_dark_default;
const minLight = min_light_default;
const monokai = monokai_default;
const nightOwl = night_owl_default;
const nightOwlLight = night_owl_light_default;
const nord = nord_default;
const oneDarkPro = one_dark_pro_default;
const oneLight = one_light_default;
const plastic = plastic_default;
const poimandres = poimandres_default;
const red = red_default;
const rosePine = rose_pine_default;
const rosePineDawn = rose_pine_dawn_default;
const rosePineMoon = rose_pine_moon_default;
const slackDark = slack_dark_default;
const slackOchin = slack_ochin_default;
const snazzyLight = snazzy_light_default;
const solarizedDark = solarized_dark_default;
const solarizedLight = solarized_light_default;
const synthwave84 = synthwave_84_default;
const tokyoNight = tokyo_night_default;
const vesper = vesper_default;
const vitesseBlack = vitesse_black_default;
const vitesseDark = vitesse_dark_default;
const vitesseLight = vitesse_light_default;
const pierreDark = pierre_dark_default;
const pierreDarkProtanopiaDeuteranopia = pierre_dark_protanopia_deuteranopia_default;
const pierreDarkSoft = pierre_dark_soft_default;
const pierreDarkTritanopia = pierre_dark_tritanopia_default;
const pierreDarkVibrant = pierre_dark_vibrant_default;
const pierreLight = pierre_light_default;
const pierreLightProtanopiaDeuteranopia = pierre_light_protanopia_deuteranopia_default;
const pierreLightSoft = pierre_light_soft_default;
const pierreLightTritanopia = pierre_light_tritanopia_default;
const pierreLightVibrant = pierre_light_vibrant_default;

// scripts/design/syntax-bases.mjs
/**
* The bundled highlights themes a theme may name as its `syntax.base`, looked
* up by the kebab-case name the renderer's lazy loader keys them by. It is
* plain JS so the contrast CLI and the backend's theme validator read the same
* catalog; the renderer keeps loading one base at a time.
*/
const kebab = (exportName) => exportName.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/\d+/g, (d) => `-${d}`);
let byName;
/** The style of the bundled highlights theme with this name, or undefined for an unknown name. */
function syntaxBaseStyle(name) {
	byName ??= new Map(Object.entries(themes_exports).filter(([, value]) => typeof value === "object" && value?.style !== void 0 && value.cssVariables !== true).map(([exportName, theme]) => [kebab(exportName), theme.style]));
	return byName.get(name);
}

// src/backend/themes/syntax-bases.ts
const layers = /* @__PURE__ */ new Map();
/** Whether a bundled highlights theme has this name, without building its layer. */
function isSyntaxBaseName(name) {
	return layers.has(name) || syntaxBaseStyle(name) !== void 0;
}
/**
* The layer of the bundled highlights theme a data theme names as its
* `syntax.base`, or undefined for a name no bundled theme has. The catalog is
* imported whole, unlike the renderer, which loads one base at a time: the
* validator measures any theme, and the gallery's bundle has no loader to ask.
*/
function syntaxBaseLayer(name) {
	const known = layers.get(name);
	if (known !== void 0) return known;
	const style = syntaxBaseStyle(name);
	if (style === void 0) return void 0;
	const layer = syntaxLayerFromBase(style);
	layers.set(name, layer);
	return layer;
}

// src/backend/themes/theme-preview.ts
const PREVIEW_SLOTS = {
	text: "foreground",
	keyword: "keyword",
	control: "keyword.control",
	function: "function",
	type: "type",
	string: "string",
	number: "number",
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
		const base = theme.syntax?.base === void 0 ? void 0 : syntaxBaseLayer(theme.syntax.base);
		const kepler = keplerSyntax[theme.polarity];
		const table = resolveSyntaxTable([
			{ foreground: { color: text } },
			base === void 0 || kepler.foreground === void 0 ? kepler : { foreground: kepler.foreground },
			base ?? {},
			theme.syntax?.tokens ?? {}
		]);
		const raisedRgb = channels(raised);
		const slotColor = (slot) => flatten(tokens, table[slot].color, raisedRgb);
		const syntax = {
			text: slotColor(PREVIEW_SLOTS.text),
			keyword: slotColor(PREVIEW_SLOTS.keyword),
			control: slotColor(PREVIEW_SLOTS.control),
			function: slotColor(PREVIEW_SLOTS.function),
			type: slotColor(PREVIEW_SLOTS.type),
			string: slotColor(PREVIEW_SLOTS.string),
			number: slotColor(PREVIEW_SLOTS.number),
			variable: slotColor(PREVIEW_SLOTS.variable),
			comment: slotColor(PREVIEW_SLOTS.comment)
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

// \0kepler:palette-css
var _kepler_palette_css_default = "\n:root {\n  /* Neutral surfaces — monotonically lighter as elevation rises. */\n  --surface-sunken: 0.145 0.006 264; /* wells, inputs, code blocks   #090a0d */\n  --surface-canvas: 0.17 0.006 264; /* app background                #0e0f12 */\n  --surface-raised: 0.198 0.007 264; /* panels, cards, list surfaces #141619 */\n  --surface-overlay: 0.228 0.008 264; /* menus, popovers             #1b1c20 */\n\n  /* Ink — one color, four alpha steps. Worst-case ratios against the LIGHTEST\n     surface (overlay): strong 15.3 · content 11.4 · muted 7.2 · subtle 4.8. */\n  --ink: 0.965 0.004 264;\n  --content-strong: var(--ink);\n  --content: var(--ink) / 0.85;\n  --content-muted: var(--ink) / 0.65;\n  --content-subtle: var(--ink) / 0.5;\n  --content-on-accent: var(--surface-sunken);\n\n  /* Fills — ink at low alpha, so they tint whatever they sit on. */\n  --fill-subtle: var(--ink) / 0.04;\n  --fill-muted: var(--ink) / 0.07;\n  --fill-strong: var(--ink) / 0.11;\n\n  /* Edges — `edge-strong` is the 3:1 control boundary (measured 3.00). */\n  --edge-subtle: var(--ink) / 0.08;\n  --edge: var(--ink) / 0.14;\n  --edge-strong: var(--ink) / 0.35;\n  /* Decorative line, between `edge` and `edge-strong`: visible on the canvas\n     without borrowing the control boundary's contrast contract. */\n  --edge-decor: var(--ink) / 0.22;\n\n  /* A sash's own element thickness and its (larger) grab/hover zone. The\n     hit-zone value is shared with the `Sash` primitive's panel-library\n     configuration — see the RESIZE HANDLES block below for why the two\n     must agree. */\n  --dock-tab-drop-line-size: 3px;\n  /* The line a Dashboard drag draws where the card would land. Thinner than\n     the dock's: it runs the length of a row, where 3px reads as a divider. */\n  --dashboard-drop-line-size: 2px;\n  --sash-size: 5px;\n  --sash-hit: 12px;\n  /* How long the pointer rests on a sash before it lights up. A sash sits\n     between two surfaces the pointer crosses constantly, and lighting up on\n     every pass reads as flicker; the delay is what makes the highlight mean\n     \"you could drag this\". */\n  --sash-hover-delay: 250ms;\n\n  /* Brand teal. Lighter than the previous #1f8f7c and paired with near-black\n     ink rather than white: white on the old teal measured 4.02:1, under the\n     AA floor, and no single teal can satisfy both \"readable as text on the\n     canvas\" (wants lighter) and \"readable under white ink\" (wants darker).\n     Dark ink resolves the conflict with one color instead of two.\n     ink-on-brand 6.68 · brand-on-canvas 6.47 · on its badge tint 4.59 */\n  --brand: 0.66 0.099 178.8; /*                                     #3fa693 */\n  --brand-hover: 0.71 0.106 178.8;\n  --brand-active: 0.61 0.092 178.8;\n  /* Solid brand surfaces and the ink on them. Raw aliases resolved at the point\n     of use, so Dark and Light follow their own `--brand`/`--content-on-accent`;\n     a custom theme overrides them when its text-safe brand cannot carry text. */\n  --brand-fill: var(--brand);\n  --brand-fill-hover: var(--brand-hover);\n  --brand-fill-active: var(--brand-active);\n  --content-on-brand: var(--content-on-accent);\n\n  /* AI purple. Higher chroma than the status ramp, and 15° off status-merged,\n     so the system's only two purples stay separable.\n     ai-on-canvas 6.11 · ink-on-ai 7.11 */\n  --ai: 0.7 0.185 285; /*                                           #968dfe */\n  --ai-hover: 0.75 0.175 285;\n\n  /* Selection & focus — brand-tinted. The ink is text on the wash: a step\n     lighter than brand, because a segmented control lays the wash over its own\n     track, and brand there falls under 4.5:1 over an overlay.\n     on the wash, worst over the track 4.67 */\n  --selected-bg: var(--brand) / 0.14;\n  --selected-border: var(--brand) / 0.45;\n  --selected-ink: 0.69 0.099 178.8; /*                              #4aaf9c */\n  --focus-ring: var(--brand) / 0.9;\n\n  /* Status ramp — identical L and C, hue only. Worst ratio in the set: 6.39. */\n  --status-success: 0.72 0.155 150; /* running, open, passing       #4fbf6e */\n  --status-info: 0.72 0.155 230; /* building, in progress, info   #04b4ec */\n  --status-warning: 0.72 0.155 82; /* review, spawning, degraded    #d29a08 */\n  --status-attention: 0.72 0.155 50; /* BLOCKED ON YOU              #f08440 */\n  --status-danger: 0.72 0.155 22; /* errored, closed, failed        #f67878 */\n  --status-merged: 0.72 0.155 300; /* merged PR, finished issue, done task #b48cf6 */\n  --status-dormant: 0.58 0.01 264; /* disconnected-session ring — see @theme */\n\n  /* Host identity — six hues spread around the wheel at ~0.125-0.165 chroma\n     (raised from a muted 0.09 that read as six near-identical pastels), each\n     placed and measured to clear an OKLab distance from brand/ai/every status\n     hue (checked by a dedicated test) rather than eyeballed. Amber sits in\n     the narrow gap between status-attention and status-warning, and violet in\n     the narrow gap between ai and status-merged; both borrow extra separation\n     from lightness (off the shared 0.72) where hue alone can't clear the\n     floor, which is also what keeps all six apart under red-green color\n     vision deficiency. Dark inherits these unchanged (same reasoning as the\n     status ramp): both dark themes solve the same contrast problem at the\n     same amplitude, so a second set of numbers here would only be Midnight's\n     copied by hand. */\n  --host-rose: 0.72 0.16 355; /*                                       #f075aa */\n  --host-amber: 0.78 0.125 66; /*                                      #eda65a */\n  --host-lime: 0.72 0.155 118; /*                                      #9db128 */\n  --host-cyan: 0.72 0.155 204; /*                                      #0fbac7 */\n  --host-blue: 0.72 0.155 258; /*                                      #69a5fe */\n  --host-violet: 0.75 0.165 328; /*                                    #e585e2 */\n\n  /* Agent account identity, in two sets of the same six hues. The bold\n     `--account-*` set tints a ~14px glyph and the picker swatch: it needs\n     enough chroma to read against muted-gray neighbours and only 3:1 as a\n     non-text mark. The `--account-ink-*` set colors the small account name and\n     address in the session hover card, which needs 4.5:1 on every surface,\n     the overlay included; in light that forces a darker ink, so the two sets\n     diverge there and are identical here.\n     Chroma is pushed to what sRGB holds at each lightness (hues differ, so\n     cyan stays quieter than violet) and hues are moved off the status ramp,\n     brand and ai (rose leans pink, away from danger) because an account\n     color must never read as state. Dark inherits both sets unchanged. */\n  --account-rose: 0.72 0.2 352;\n  --account-amber: 0.8 0.16 72;\n  --account-lime: 0.8 0.19 125;\n  --account-cyan: 0.78 0.125 210;\n  --account-blue: 0.67 0.175 258;\n  --account-violet: 0.7 0.23 320;\n  --account-ink-rose: 0.72 0.2 352;\n  --account-ink-amber: 0.8 0.16 72;\n  --account-ink-lime: 0.8 0.19 125;\n  --account-ink-cyan: 0.78 0.125 210;\n  --account-ink-blue: 0.67 0.175 258;\n  --account-ink-violet: 0.7 0.23 320;\n\n  /* Channel badge/mark — mirrors the channel icon tints (shared table in\n     scripts/_channel-tints.mjs): staging blue, dev purple, source rust.\n     The ink is the icon's PILL color, its brightest element, which is what a\n     small dark-surface badge wants; the mark trio recolors the title-bar\n     mark's own gradient stops (both its highlights to `-mark-hi`, both its\n     deep stops to `-mark-deep`) and is repeated verbatim in light below,\n     since it is brand artwork rather than a themed surface. */\n  --channel-staging: 0.674 0.172 264; /* pill  #5F91FF */\n  --channel-staging-mark-hi: 0.958 0.021 246; /* #E6F3FF */\n  --channel-staging-mark-mid: 0.66 0.17 265; /* #5E8CF9 */\n  --channel-staging-mark-deep: 0.561 0.15 265; /* #486FCC */\n  --channel-dev: 0.728 0.168 301; /* pill  #B98BFF */\n  --channel-dev-mark-hi: 0.961 0.024 309; /* #F7EEFF */\n  --channel-dev-mark-mid: 0.66 0.169 300; /* #A376E9 */\n  --channel-dev-mark-deep: 0.56 0.15 300; /* #835CBE */\n  --channel-source: 0.779 0.127 63; /* pill  #F0A45A */\n  --channel-source-mark-hi: 0.955 0.032 69; /* #FFEDDA */\n  --channel-source-mark-mid: 0.66 0.167 53; /* #DE6F00 */\n  --channel-source-mark-deep: 0.56 0.145 52; /* #B45600 */\n\n  /* Modal scrim — darkens toward the canvas hue rather than to neutral black,\n     so a dialog's backdrop stays part of the same world. */\n  --scrim: 0.08 0.008 264 / 0.72;\n\n  /* Diff washes — low-alpha line backgrounds, hue-matched to the status ramp. */\n  --diff-added: 0.72 0.155 150 / 0.14;\n  --diff-removed: 0.72 0.155 22 / 0.14;\n\n  /* Code-view highlights — opaque so the measured contrast is the real one. Teal\n     for selection (the brand hue), amber for find, orange for the current match;\n     the ink is white because the highlights are mid-tone and light grey ink\n     cannot be 4.5:1 on a background that is also 3:1 from the plate. */\n  --code-selection: 0.525 0.09 178.8;\n  --code-find: 0.535 0.12 95;\n  --code-find-current: 0.55 0.15 40;\n  --code-highlight-ink: 1 0 264;\n\n  /* Commit-graph lanes — 8 hues, 45° apart, one L and C. */\n  --lane-1: 0.74 0.15 150;\n  --lane-2: 0.74 0.15 195;\n  --lane-3: 0.74 0.15 240;\n  --lane-4: 0.74 0.15 285;\n  --lane-5: 0.74 0.15 330;\n  --lane-6: 0.74 0.15 15;\n  --lane-7: 0.74 0.15 60;\n  --lane-8: 0.74 0.15 105;\n\n  /* Providers — external brand colors, lifted to readable lightness on the\n     dark themes. */\n  --provider-github: 0.857 0.014 248;\n  --provider-gitlab: 0.753 0.145 37;\n  --provider-jira: 0.73 0.116 258;\n  --provider-linear: 0.772 0.115 294;\n\n  /* Usage gauge — consumed is the BRIGHTER of the pair on the dark themes. */\n  --usage-track: 0.464 0.019 264;\n  --usage-consumed: 0.825 0.126 180;\n  /* Track for bars filled with a status tone. The neutral track is too light for\n     a status fill to clear 3:1 against it on the dark themes, so this one is\n     darker; Dark inherits it, and it clears 3:1 for all three tones on both. */\n  --usage-track-toned: 0.42 0.019 264;\n\n  /* Type stacks. The system stack is the right voice for a desktop tool: it is\n     the reader's own UI face, it needs no network, and it renders at the\n     platform's own hinting. */\n  --sans-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  --mono-font: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;\n\n  /* Elevation — the dark themes lift by lightness, so shadows only anchor true\n     overlays. */\n  --elevation-raised: 0 0 #0000;\n  --elevation-overlay: 0 8px 24px -8px oklch(0 0 0 / 0.7), 0 2px 6px -2px oklch(0 0 0 / 0.5);\n\n  /* The selected segment's fill. A separate token from the overlay surface so\n     a theme can lift its controls without also lifting every menu and popover;\n     by default it is the overlay, resolved where it is used, so Dark, Light and\n     every data theme inherit their own overlay. */\n  --control-thumb: var(--surface-overlay);\n\n  /* Scrollbar colors. Separate tokens so a theme can color its scrollbars\n     without moving control borders or the faintest text; by default they\n     resolve to the edge and subtle-text steps where they are used, so every\n     theme inherits its own, like control-thumb. The track is a raw triplet\n     because it is transparent unless a theme gives it a color. */\n  --scrollbar-thumb: var(--edge-strong);\n  --scrollbar-thumb-hover: var(--content-subtle);\n  --scrollbar-track: 0 0 0 / 0;\n\n  /* A text field's fill, shared by inputs, form selects and the segmented\n     track; the canvas on the dark themes. */\n  --field: var(--surface-canvas);\n\n  /* The shade a segmented track lays over an overlay surface (menu, popover),\n     where the field fill would sit two steps below the surface. Black at 10%\n     scales each channel by 0.9. Dark inherits it. */\n  --control-track: 0 0 0 / 0.1;\n\n  /* How much ink the selected segment mixes in so it stands off the field-fill\n     track. A popover takes a little more because its thumb shares the popover's\n     fill. */\n  --control-thumb-lift: 2.5%;\n  --control-thumb-lift-overlay: 5%;\n\n  /* Control track and thumb (segmented control). The track is a well: the field\n     fill (or the overlay shade) with an inset shadow. The thumb is raised by a\n     1px top highlight, a drop shadow and a hairline of black that keeps its\n     edge on the track. Dark inherits these, and so does every data theme by its\n     base's polarity. */\n  --control-track-shadow: inset 0 1px 2px oklch(0 0 0 / 0.45);\n  --control-thumb-shadow:\n    inset 0 1px 0 oklch(var(--ink) / 0.1), 0 1px 2px oklch(0 0 0 / 0.55),\n    0 0 0 1px oklch(0 0 0 / 0.35);\n\n  color-scheme: dark;\n}\n\n:root.dark {\n  /* Midnight's ramp lifted bodily — same hue, same chroma, same step sizes. */\n  --surface-sunken: 0.205 0.006 264; /* wells, inputs, code blocks   #16171a */\n  --surface-canvas: 0.232 0.006 264; /* app background               #1c1d20 */\n  --surface-raised: 0.262 0.007 264; /* panels, cards, list surfaces #232528 */\n  --surface-overlay: 0.295 0.008 264; /* menus, popovers             #2a2d31 */\n\n  /* Dark's ramp sits higher, so both lifts take a little more ink. */\n  --control-thumb-lift: 3%;\n  --control-thumb-lift-overlay: 6%;\n\n  /* Ink drops with the surfaces rather than holding at Midnight's near-white, which\n     is what keeps this a softer theme instead of merely a greyer one. Worst-case\n     ratios against the LIGHTEST surface (overlay): strong 10.9 · content 8.6 ·\n     muted 6.3 · subtle 4.7. `--content-strong` and `--content-on-accent` are\n     inherited: both are written against tokens this block overrides. */\n  --ink: 0.92 0.004 264;\n  --content: var(--ink) / 0.87;\n  --content-muted: var(--ink) / 0.71;\n  --content-subtle: var(--ink) / 0.58;\n\n  /* Fills — alphas raised to hold Midnight's composited lightness delta (0.039 /\n     0.065 / 0.101), not Midnight's alphas, which would read thinner up here. */\n  --fill-subtle: var(--ink) / 0.05;\n  --fill-muted: var(--ink) / 0.085;\n  --fill-strong: var(--ink) / 0.13;\n\n  /* Edges — same treatment. `edge-strong` keeps the 3:1 control boundary\n     (measured 3.24) and is the one value here tuned to a ratio rather than to\n     Midnight's appearance. */\n  --edge-subtle: var(--ink) / 0.1;\n  --edge: var(--ink) / 0.17;\n  --edge-strong: var(--ink) / 0.41;\n  --edge-decor: var(--ink) / 0.26;\n\n  /* Brand teal, lifted above Midnight's #3fa693, which would sit too close to\n     these lighter surfaces and to its own badge tint over them. Same hue and\n     the same near-black ink on top, so the action color is recognisably the\n     product's. brand-on-canvas 7.36 · ink-on-brand 7.83 · on its badge tint 4.58 */\n  --brand: 0.73 0.106 178.8; /*                                      #4ebda9 */\n  --brand-hover: 0.78 0.112 178.8;\n  --brand-active: 0.68 0.1 178.8;\n\n  /* AI purple, lifted so it still reads as text on its own badge tint over\n     these surfaces. ai-on-canvas 7.34 · ink-on-ai 7.81 · on its badge tint 4.57 */\n  --ai: 0.75 0.185 285; /*                                           #a6a1fe */\n  --ai-hover: 0.8 0.175 285;\n\n  /* Selection reads off a lighter brand, so the tint needs a touch more of it\n     to separate from a lighter row underneath. */\n  --selected-bg: var(--brand) / 0.16;\n  --selected-border: var(--brand) / 0.5;\n  /* on the wash, worst over the track 4.60 */\n  --selected-ink: 0.77 0.106 178.8; /*                              #5ccab5 */\n\n  /* The six status hues are Midnight's, unchanged (AI purple is lifted above):\n     all of them still clear their floors here (worst in the status set 5.19), and a\n     second ramp at a second lightness is exactly the duplication the system\n     exists to remove. The dormant ring is the one exception — it is tuned\n     AGAINST its surface by construction, so it has to move with it (3.94, beside\n     Midnight's 3.96). */\n  --status-dormant: 0.63 0.01 264;\n\n  /* Scrim lightens with the canvas it dims. Still a darkening wash — a scrim\n     that merely greys the page cannot push it back. */\n  --scrim: 0.12 0.008 264 / 0.7;\n\n  /* Diff washes — same hues, a little more of them, since a 14% tint over a\n     lighter line is a fainter stripe. */\n  --diff-added: 0.72 0.155 150 / 0.15;\n  --diff-removed: 0.72 0.155 22 / 0.15;\n\n  /* Code-view highlights — the plate is lighter here, so the highlights rise with\n     it and the window that satisfies both 3:1 from the plate and 4.5:1 under\n     white ink narrows to about 0.015 of lightness. */\n  --code-selection: 0.545 0.09 178.8;\n  --code-find: 0.555 0.12 95;\n  --code-find-current: 0.57 0.15 40;\n  --code-highlight-ink: 1 0 264;\n\n  /* Usage gauge — the track is an opaque grey read against the panel it sits\n     on, so it rises with the panel; consumed is Midnight's and still clears the\n     3:1 the pair owes each other. */\n  --usage-track: 0.5 0.019 264;\n\n  /* Overlay shadow, softened. Elevation is lightness here as on Midnight, so the\n     shadow only anchors true overlays — and Midnight's 0.7 black, dropped on a\n     canvas this much lighter, reads as a hole cut in the page rather than as a\n     lift. `--elevation-raised` stays the inherited no-op. */\n  --elevation-overlay: 0 8px 24px -8px oklch(0 0 0 / 0.5), 0 2px 6px -2px oklch(0 0 0 / 0.34);\n\n  color-scheme: dark;\n}\n\n:root.light {\n  --surface-sunken: 0.93 0.006 264; /*                              #e6e8ec */\n  --surface-canvas: 0.958 0.004 264; /*                             #f0f1f4 */\n  --surface-raised: 0.988 0.003 264; /*                             #fafbfd */\n  --surface-overlay: 0.997 0.002 264; /*                            #fefefe */\n\n  /* Worst-case ratios against the DARKEST surface (sunken):\n     strong 14.6 · content 11.4 · muted 7.1 · subtle 4.7. */\n  --ink: 0.205 0.014 264;\n  --content-strong: var(--ink);\n  --content: var(--ink) / 0.9;\n  --content-muted: var(--ink) / 0.75;\n  --content-subtle: var(--ink) / 0.62;\n  --content-on-accent: 0.999 0 0;\n\n  --fill-subtle: var(--ink) / 0.045;\n  --fill-muted: var(--ink) / 0.08;\n  --fill-strong: var(--ink) / 0.12;\n\n  --edge-subtle: var(--ink) / 0.1;\n  --edge: var(--ink) / 0.16;\n  --edge-strong: var(--ink) / 0.47; /* 3:1 control boundary (measured 3.02) */\n  --edge-decor: var(--ink) / 0.28;\n\n  /* Brand teal, deeper here so it carries white ink and still reads as text.\n     ink-on-brand 7.10 · brand-on-canvas 6.29 · on its badge tint 4.64 */\n  --brand: 0.45 0.098 178.2; /*                                     #026455 */\n  --brand-hover: 0.4 0.09 178.2;\n  --brand-active: 0.36 0.082 178.2;\n\n  --ai: 0.47 0.195 285; /*                                          #563dc1 */\n  --ai-hover: 0.42 0.185 285;\n\n  --selected-bg: var(--brand) / 0.12;\n  --selected-border: var(--brand) / 0.5;\n  /* on the wash, worst over the track 4.68 */\n  --selected-ink: 0.44 0.098 178.2; /*                              #036153 */\n  --focus-ring: var(--brand) / 0.9;\n\n  /* Same hues as dark at a lightness that clears AA on light surfaces.\n     Worst ratio in the set: 5.02. */\n  --status-success: 0.48 0.15 150; /*                               #007132 */\n  --status-info: 0.48 0.15 230; /*                                  #066788 */\n  --status-warning: 0.48 0.15 82; /*                                #795702 */\n  --status-attention: 0.48 0.15 50; /*                              #934302 */\n  --status-danger: 0.48 0.15 22; /*                                 #a12f35 */\n  --status-merged: 0.48 0.15 300; /*                                #6c44a4 */\n  --status-dormant: 0.54 0.015 264; /* darker than Midnight's — see @theme */\n\n  /* Host identity — same hues and chroma as Midnight, at a lower,\n     independently-tuned lightness, same reasoning as the rest of this\n     theme's restated blocks: light solves a different contrast problem, so\n     it gets its own numbers rather than Midnight's lifted bodily. Amber and\n     violet keep the same lightness offset off the shared 0.52 that they carry\n     in Midnight, for the same OKLab-separation reason. */\n  --host-rose: 0.52 0.16 355; /*                                       #ab366e */\n  --host-amber: 0.58 0.125 66; /*                                      #ab690e */\n  --host-lime: 0.52 0.155 118; /*                                      #637100 */\n  --host-cyan: 0.52 0.155 204; /*                                      #087780 */\n  --host-blue: 0.52 0.155 258; /*                                      #2766c0 */\n  --host-violet: 0.55 0.165 328; /*                                    #a247a1 */\n\n  /* Agent account identity — same hues as Midnight at a lower lightness. The\n     glyph set stays bold (3:1 is all a non-text mark needs). The ink set for\n     small text must reach 4.5:1 on the light surfaces, so amber, lime and cyan\n     go darker and shift a few degrees of hue to keep their distance from the\n     warning, success and brand colors at the lightness 4.5:1 needs. */\n  --account-rose: 0.55 0.22 352;\n  --account-amber: 0.58 0.124 72;\n  --account-lime: 0.55 0.13 125;\n  --account-cyan: 0.56 0.095 210;\n  --account-blue: 0.5 0.18 258;\n  --account-violet: 0.5 0.23 320;\n  --account-ink-rose: 0.545 0.22 352;\n  --account-ink-amber: 0.435 0.095 66;\n  --account-ink-lime: 0.51 0.122 121;\n  --account-ink-cyan: 0.5 0.075 218;\n  --account-ink-blue: 0.5 0.18 258;\n  --account-ink-violet: 0.5 0.23 320;\n\n  /* Channel ink flips to the icon's FRAME color, for dark-on-light legibility;\n     the mark trio repeats Midnight's values verbatim (brand artwork, not\n     themed). */\n  --channel-staging: 0.501 0.209 265;\n  --channel-staging-mark-hi: 0.958 0.021 246;\n  --channel-staging-mark-mid: 0.66 0.17 265;\n  --channel-staging-mark-deep: 0.561 0.15 265;\n  --channel-dev: 0.508 0.204 300;\n  --channel-dev-mark-hi: 0.961 0.024 309;\n  --channel-dev-mark-mid: 0.66 0.169 300;\n  --channel-dev-mark-deep: 0.56 0.15 300;\n  --channel-source: 0.346 0.079 45;\n  --channel-source-mark-hi: 0.955 0.032 69;\n  --channel-source-mark-mid: 0.66 0.167 53;\n  --channel-source-mark-deep: 0.56 0.145 52;\n\n  /* Lighter than the dark themes', and still a DARKENING wash: a scrim's job is\n     to push\n     the page back, which a pale overlay cannot do in either theme. */\n  --scrim: 0.2 0.012 264 / 0.5;\n\n  --diff-added: 0.48 0.15 150 / 0.12;\n  --diff-removed: 0.48 0.15 22 / 0.12;\n\n  /* Code-view highlights — mid-tones against the near-white plate, under\n     near-black ink. */\n  --code-selection: 0.605 0.09 178.8;\n  --code-find: 0.62 0.12 95;\n  --code-find-current: 0.63 0.15 40;\n  --code-highlight-ink: 0.15 0.012 264;\n\n  --lane-1: 0.52 0.15 150;\n  --lane-2: 0.52 0.15 195;\n  --lane-3: 0.52 0.15 240;\n  --lane-4: 0.52 0.15 285;\n  --lane-5: 0.52 0.15 330;\n  --lane-6: 0.52 0.15 15;\n  --lane-7: 0.52 0.15 60;\n  --lane-8: 0.52 0.15 105;\n\n  --provider-github: 0.278 0.012 248;\n  --provider-gitlab: 0.5 0.166 37;\n  --provider-jira: 0.45 0.171 263;\n  --provider-linear: 0.45 0.217 284;\n\n  /* Usage gauge — consumed is the DARKER of the pair on light. */\n  --usage-track: 0.788 0.017 264;\n  --usage-consumed: 0.424 0.073 180;\n  /* The neutral track already clears 3:1 for every status tone on light. */\n  --usage-track-toned: 0.788 0.017 264;\n\n  /* Light lifts by shadow, since the surface ramp runs out of headroom. */\n  --elevation-raised: 0 1px 2px oklch(0.2 0.02 264 / 0.06);\n  --elevation-overlay:\n    0 8px 24px -8px oklch(0.2 0.02 264 / 0.18), 0 2px 6px -2px oklch(0.2 0.02 264 / 0.1);\n\n  /* Light's text fields sit a step below the canvas, so a field and a track\n     read as recessed on the top bar. */\n  --field: var(--surface-sunken);\n\n  /* Light's ink is the dark end; the popover's track deepens a little past the\n     field step since nothing is whiter than the popover to lift the thumb into. */\n  --control-track: var(--ink) / 0.06;\n  --control-thumb-lift: 0%;\n  --control-thumb-lift-overlay: 0%;\n\n  /* Control track and thumb: lighter shadows, and an ink hairline in place of\n     black so the thumb's edge stays soft on the light track. */\n  --control-track-shadow: inset 0 1px 2px oklch(0 0 0 / 0.08);\n  --control-thumb-shadow: 0 1px 2px oklch(0 0 0 / 0.14), 0 0 0 1px oklch(var(--ink) / 0.08);\n\n  color-scheme: light;\n}\n";

// src/ui/themes/kepler-syntax.json
var dark = {
	"foreground": "#c1c4c9",
	"operator": "#c1c4c9",
	"punctuation": "#c1c4c9",
	"embedded": "#c1c4c9",
	"label": "#c1c4c9",
	"primary": "#c1c4c9",
	"text.jsx": "#c1c4c9",
	"link_uri": "#c1c4c9",
	"keyword": "#70a6f5",
	"keyword.operator": "#70a6f5",
	"boolean": "#70a6f5",
	"constant.builtin": "#70a6f5",
	"variable.special": "#70a6f5",
	"preproc": "#70a6f5",
	"tag": "#70a6f5",
	"tag.doctype": "#70a6f5",
	"punctuation.special": "#70a6f5",
	"punctuation.list_marker": "#70a6f5",
	"punctuation.markup": "#70a6f5",
	"title": {
		"color": "#70a6f5",
		"font_weight": 700
	},
	"emphasis.strong": {
		"color": "#70a6f5",
		"font_style": "normal",
		"font_weight": 700
	},
	"emphasis": { "font_style": "italic" },
	"keyword.control": "#d192ce",
	"keyword.import": "#d192ce",
	"comment": {
		"color": "#98a6b8",
		"font_style": "italic"
	},
	"hint": "#98a6b8",
	"predictive": "#98a6b8",
	"punctuation.bracket.html": "#98a6b8",
	"punctuation.bracket.jsx": "#98a6b8",
	"punctuation.delimiter.html": "#98a6b8",
	"punctuation.delimiter.jsx": "#98a6b8",
	"number": "#96c07f",
	"diff.plus": "#96c07f",
	"string": "#e4ad84",
	"text.literal": "#e4ad84",
	"link_text": "#e4ad84",
	"diff.minus": "#e4ad84",
	"string.regex": "#eb8987",
	"string.escape": "#eb8987",
	"selector": "#eb8987",
	"string.special.symbol": "#95cefe",
	"variable": "#b4e7fc",
	"property": "#b4e7fc",
	"attribute": "#b4e7fc",
	"function": "#e5d494",
	"constructor": "#e5d494",
	"type": "#7cd3cd",
	"namespace": "#7cd3cd",
	"enum": "#7cd3cd",
	"tag.component.jsx": "#7cd3cd",
	"constant": "#95cefe",
	"variant": "#95cefe"
};
var light = {
	"foreground": "#21242a",
	"operator": "#21242a",
	"punctuation": "#21242a",
	"embedded": "#21242a",
	"label": "#21242a",
	"primary": "#21242a",
	"text.jsx": "#21242a",
	"link_uri": "#21242a",
	"keyword": "#254cba",
	"keyword.operator": "#254cba",
	"boolean": "#254cba",
	"constant.builtin": "#254cba",
	"variable.special": "#254cba",
	"preproc": "#254cba",
	"punctuation.special": "#254cba",
	"keyword.control": "#953490",
	"keyword.import": "#953490",
	"comment": {
		"color": "#636575",
		"font_style": "italic"
	},
	"hint": "#636575",
	"predictive": "#636575",
	"number": "#3a7234",
	"diff.plus": "#3a7234",
	"tag": "#85253a",
	"tag.doctype": "#85253a",
	"selector": "#85253a",
	"string.regex": "#85253a",
	"text.literal": "#85253a",
	"punctuation.bracket.html": "#85253a",
	"punctuation.bracket.jsx": "#85253a",
	"punctuation.delimiter.html": "#85253a",
	"punctuation.delimiter.jsx": "#85253a",
	"title": {
		"color": "#85253a",
		"font_weight": 700
	},
	"attribute": "#be2e31",
	"string.escape": "#be2e31",
	"string": "#8b3f03",
	"string.special.symbol": "#005078",
	"link_text": "#8b3f03",
	"diff.minus": "#8b3f03",
	"variable": "#102e6a",
	"property": "#102e6a",
	"emphasis.strong": {
		"color": "#102e6a",
		"font_style": "normal",
		"font_weight": 700
	},
	"emphasis": { "font_style": "italic" },
	"constant": "#005078",
	"variant": "#005078",
	"property.json_key": "#005078",
	"punctuation.list_marker": "#005078",
	"punctuation.markup": "#005078",
	"function": "#6f5c01",
	"constructor": "#6f5c01",
	"type": "#047079",
	"namespace": "#047079",
	"enum": "#047079",
	"tag.component.jsx": "#047079"
};

// src/backend/themes/theme-sources.ts
const BUNDLED_FAMILIES = Object.values([]);
/** Kepler's own syntax palette, which a theme naming no highlights theme draws code in. */
const KEPLER_SYNTAX = {
	dark: syntaxLayerFrom(dark),
	light: syntaxLayerFrom(light)
};
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

// src/shared/theme/token-guide.ts
/**
* Every themeable token by role, for anyone writing a theme without reading
* the design system first. A test holds each token to exactly one group, so a
* new token cannot ship without a role here.
*/
const TOKEN_GUIDE = [
	{
		id: "surfaces",
		title: "Surfaces",
		description: "A four-step elevation ladder: sunken for wells, code blocks and the terminal; canvas for the app background; raised for panels and cards; overlay for menus and popovers. On a dark theme each step is lighter than the one below; on a light theme the steps run toward white. field is the fill of a text field (inputs, form selects and the track of a segmented control): one of the four surfaces, not a fifth tier, so set it to the canvas on a dark theme and to sunken on a light one.",
		tokens: [
			"surface-sunken",
			"surface-canvas",
			"surface-raised",
			"surface-overlay",
			"field"
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
		id: "scrollbars",
		title: "Scrollbars",
		description: "scrollbar-thumb is the thumb at rest and must reach 3:1 over the track on canvas and raised, so overflow stays visible. scrollbar-thumb-hover is the thumb under the pointer and scrollbar-track the track behind it. Unset, they follow edge-strong, content-subtle and a transparent track, and each accepts an alpha over ink like the edges.",
		tokens: [
			"scrollbar-thumb",
			"scrollbar-thumb-hover",
			"scrollbar-track"
		]
	},
	{
		id: "brand",
		title: "Brand, AI and selection",
		description: "brand is the action color for text, icons and focus; brand-fill (with hover and active) is the solid button surface and content-on-brand the text on it. ai marks AI-driven surfaces only. selected-bg and selected-border tint a selected row in the brand and selected-ink is the text on it (set it with brand: it is a plain color, not derived), focus-ring is the keyboard focus outline, and control-thumb is the raised selected segment of a segmented control and control-track the translucent shade its track lays over a menu or popover (give it alpha, not an opaque color); elsewhere the track takes the field fill.",
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
			"control-thumb",
			"control-track"
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

// node_modules/jsonc-parser/lib/esm/impl/scanner.js
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

// node_modules/jsonc-parser/lib/esm/impl/string-intern.js
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

// node_modules/jsonc-parser/lib/esm/impl/parser.js
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

// node_modules/jsonc-parser/lib/esm/main.js
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

// src/backend/themes/load-user-themes.ts
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

// src/backend/themes/validate-theme.ts
function noticeMessage(notice) {
	switch (notice.kind) {
		case "newer-version": return `The file says it is a newer format than ${2}; fields this version does not know are ignored. Use schemaVersion ${2}.`;
		case "unknown-key": return `Unknown key "${notice.key}" was ignored. Remove it or check its spelling.`;
		case "renamed-token": return `"${notice.from}" was renamed to "${notice.to}". Use the new name.`;
		case "dropped-syntax": return `syntax.tokenColors is the format 1 TextMate form and was not applied, so code uses the default syntax colors. Write the colors as syntax.tokens and set schemaVersion ${2}.`;
		case "unknown-base": return `syntax.base "${notice.base}" is not a bundled highlights theme, so code uses Kepler's colors instead. Check the name (for example github-dark), or remove syntax.base.`;
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
	if (label.startsWith("base syntax ")) return `${floor} The listed slots take this color from syntax.base; set them in syntax.tokens to override it.`;
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
	const [entry] = dataThemes([{ themes: [contrastDefinition(theme)] }], palettes, KEPLER_SYNTAX, void 0, syntaxBaseLayer);
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
		const base = theme.syntax?.base;
		if (base !== void 0 && !isSyntaxBaseName(base)) notices.push({
			kind: "unknown-base",
			themeId: theme.id,
			message: noticeMessage({
				file,
				kind: "unknown-base",
				base
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
			formatVersion: 2,
			errors,
			notices,
			themes,
			idClashes
		},
		themes: resolved
	};
}

// src/backend/themes/theme-check-entry.ts
const version = "0.15.0";
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

export { checkThemeFamily, version };