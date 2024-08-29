"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationProperties = void 0;
const util_1 = require("../util");
const response_decoder_1 = require("../response_decoder");
class ApplicationProperties {
    static parse(dataReader, elementsLength) {
        const numEntries = elementsLength / 2;
        return (0, util_1.range)(numEntries).reduce((acc, _) => {
            const propertyKey = (0, response_decoder_1.readUTF8String)(dataReader);
            const nextByteType = dataReader.readUInt8();
            dataReader.rewind(1);
            const propertyValue = (0, response_decoder_1.decodeFormatCode)(dataReader, nextByteType, true);
            if (!propertyValue)
                throw new Error(`invalid nextByteType %#02x: ${nextByteType}`);
            acc[propertyKey] = propertyValue;
            return acc;
        }, {});
    }
}
exports.ApplicationProperties = ApplicationProperties;
//# sourceMappingURL=applicationProperties.js.map