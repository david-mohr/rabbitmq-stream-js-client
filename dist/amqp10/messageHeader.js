"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const util_1 = require("../util");
const response_decoder_1 = require("../response_decoder");
const decoder_1 = require("./decoder");
class Header {
    static parse(dataResponse, fields) {
        return (0, util_1.range)(fields).reduce((acc, index) => {
            if (dataResponse.isAtEnd())
                return acc;
            const type = dataResponse.readUInt8();
            if (type !== decoder_1.FormatCode.Null) {
                switch (index) {
                    case 0:
                        acc.durable = (0, response_decoder_1.decodeBooleanType)(dataResponse, type);
                        break;
                    case 1:
                        acc.priority = (0, response_decoder_1.decodeFormatCode)(dataResponse, type);
                        break;
                    case 2:
                        acc.ttl = (0, response_decoder_1.decodeFormatCode)(dataResponse, type);
                        break;
                    case 3:
                        acc.firstAcquirer = (0, response_decoder_1.decodeBooleanType)(dataResponse, type);
                        break;
                    case 4:
                        acc.deliveryCount = (0, response_decoder_1.decodeFormatCode)(dataResponse, type);
                        break;
                    default:
                        throw new Error(`HeaderError`);
                }
            }
            return acc;
        }, {});
    }
}
exports.Header = Header;
//# sourceMappingURL=messageHeader.js.map