"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Properties = void 0;
const response_decoder_1 = require("../response_decoder");
const util_1 = require("../util");
const decoder_1 = require("./decoder");
class Properties {
    static parse(dataResponse, fields) {
        return (0, util_1.range)(fields).reduce((acc, index) => {
            if (dataResponse.isAtEnd())
                return acc;
            const formatCode = dataResponse.readUInt8();
            if (formatCode === decoder_1.FormatCode.Null) {
                return acc;
            }
            dataResponse.rewind(1);
            switch (index) {
                case 0:
                    acc.messageId = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 1:
                    // Reading of binary type
                    dataResponse.readUInt8();
                    const userIdLength = dataResponse.readUInt8();
                    acc.userId = dataResponse.readBufferOf(userIdLength);
                    break;
                case 2:
                    acc.to = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 3:
                    acc.subject = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 4:
                    acc.replyTo = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 5:
                    acc.correlationId = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 6:
                    acc.contentType = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 7:
                    acc.contentEncoding = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 8:
                    dataResponse.readUInt8();
                    acc.absoluteExpiryTime = new Date(Number(dataResponse.readInt64()));
                    break;
                case 9:
                    dataResponse.readUInt8();
                    acc.creationTime = new Date(Number(dataResponse.readInt64()));
                    break;
                case 10:
                    acc.groupId = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                case 11:
                    dataResponse.readUInt8();
                    acc.groupSequence = dataResponse.readUInt32();
                    break;
                case 12:
                    acc.replyToGroupId = (0, response_decoder_1.readUTF8String)(dataResponse);
                    break;
                default:
                    throw new Error(`PropertiesError`);
            }
            return acc;
        }, {});
    }
}
exports.Properties = Properties;
//# sourceMappingURL=properties.js.map