import { Message } from "../publisher";
import { DataWriter } from "../requests/data_writer";
export declare function amqpEncode(writer: DataWriter, { content, messageProperties, applicationProperties, messageAnnotations }: Message): void;
export declare function messageSize({ content, messageProperties, applicationProperties, messageAnnotations }: Message): number;
