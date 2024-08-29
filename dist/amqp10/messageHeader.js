"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const util_1 = require("../util");
const response_decoder_1 = require("../response_decoder");
class Header {
    static parse(dataResponse, fields) {
        return (0, util_1.range)(fields).reduce((acc, index) => {
            if (dataResponse.isAtEnd())
                return acc;
            switch (index) {
                case 0:
                    const formatCode = dataResponse.readUInt8();
                    dataResponse.rewind(1);
                    const decodedBoolean = (0, response_decoder_1.decodeFormatCode)(dataResponse, formatCode);
                    if (!decodedBoolean)
                        throw new Error(`invalid formatCode %#02x: ${formatCode}`);
                    acc.durable = decodedBoolean;
                    break;
                case 1:
                    dataResponse.readUInt8(); // Read type
                    acc.priority = dataResponse.readUInt8();
                    break;
                case 2:
                    const type = dataResponse.readUInt8();
                    acc.ttl = (0, response_decoder_1.decodeFormatCode)(dataResponse, type);
                    break;
                case 3:
                    acc.firstAcquirer = (0, response_decoder_1.decodeBooleanType)(dataResponse, true);
                    break;
                case 4:
                    acc.deliveryCount = dataResponse.readUInt32();
                    break;
                default:
                    throw new Error(`PropertiesError`);
            }
            return acc;
        }, {});
    }
}
exports.Header = Header;
//# sourceMappingURL=messageHeader.js.map