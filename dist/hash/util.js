"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToBuffer = exports.fMix32 = exports.rotl32 = exports.imul32 = void 0;
const imul32 = (a, b) => {
    const aHi = (a >>> 16) & 0xffff;
    const aLo = a & 0xffff;
    const bHi = (b >>> 16) & 0xffff;
    const bLo = b & 0xffff;
    // the shift by 0 fixes the sign on the high part
    return aLo * bLo + (((aHi * bLo + aLo * bHi) << 16) >>> 0);
};
exports.imul32 = imul32;
const rotl32 = (x, r) => {
    const rMod = r % 32;
    return ((x & ((1 << (32 - rMod)) - 1)) << rMod) | (x >>> (32 - rMod));
};
exports.rotl32 = rotl32;
const fMix32 = (hi) => {
    let h = hi;
    h ^= h >>> 16;
    h = (0, exports.imul32)(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = (0, exports.imul32)(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h;
};
exports.fMix32 = fMix32;
const stringToBuffer = (str) => {
    return typeof str === "string" ? Buffer.from(str) : Buffer.from(String(str));
};
exports.stringToBuffer = stringToBuffer;
//# sourceMappingURL=util.js.map