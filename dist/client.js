"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
exports.connect = connect;
const crypto_1 = require("crypto");
const semver_1 = require("semver");
const util_1 = require("util");
const compression_1 = require("./compression");
const connection_1 = require("./connection");
const connection_pool_1 = require("./connection_pool");
const consumer_1 = require("./consumer");
const error_codes_1 = require("./error_codes");
const logger_1 = require("./logger");
const publisher_1 = require("./publisher");
const consumer_update_response_1 = require("./requests/consumer_update_response");
const create_stream_request_1 = require("./requests/create_stream_request");
const create_super_stream_request_1 = require("./requests/create_super_stream_request");
const credit_request_1 = require("./requests/credit_request");
const declare_publisher_request_1 = require("./requests/declare_publisher_request");
const delete_publisher_request_1 = require("./requests/delete_publisher_request");
const delete_stream_request_1 = require("./requests/delete_stream_request");
const delete_super_stream_request_1 = require("./requests/delete_super_stream_request");
const metadata_request_1 = require("./requests/metadata_request");
const partitions_query_1 = require("./requests/partitions_query");
const route_query_1 = require("./requests/route_query");
const stream_stats_request_1 = require("./requests/stream_stats_request");
const subscribe_request_1 = require("./requests/subscribe_request");
const unsubscribe_request_1 = require("./requests/unsubscribe_request");
const super_stream_consumer_1 = require("./super_stream_consumer");
const super_stream_publisher_1 = require("./super_stream_publisher");
const util_2 = require("./util");
const consumer_credit_policy_1 = require("./consumer_credit_policy");
/**
 * Main RabbitMQ Stream client for managing connections, publishers, and consumers.
 *
 * The Client class serves as the primary entry point for interacting with RabbitMQ streams.
 * It manages:
 * - A locator connection for metadata queries and topology management
 * - A connection pool for sharing TCP connections among publishers and consumers
 * - Publisher and consumer lifecycle
 * - Stream creation and deletion
 *
 * @example
 * ```typescript
 * const client = await connect({
 *   hostname: 'localhost',
 *   port: 5552,
 *   username: 'guest',
 *   password: 'guest',
 *   vhost: '/'
 * });
 *
 * await client.createStream({ stream: 'my-stream' });
 * const publisher = await client.declarePublisher({ stream: 'my-stream' });
 * await publisher.send(Buffer.from('Hello World'));
 * await client.close();
 * ```
 */
class Client {
    logger;
    params;
    id = (0, crypto_1.randomUUID)();
    consumers = new Map();
    publishers = new Map();
    compressions = new Map();
    locatorConnection;
    pool;
    constructor(logger, params) {
        this.logger = logger;
        this.params = params;
        this.compressions.set(compression_1.CompressionType.None, compression_1.NoneCompression.create());
        this.compressions.set(compression_1.CompressionType.Gzip, compression_1.GzipCompression.create());
        this.locatorConnection = this.getLocatorConnection();
        this.pool = new connection_pool_1.ConnectionPool(logger);
    }
    getCompression(compressionType) {
        return this.locatorConnection.getCompression(compressionType);
    }
    registerCompression(compression) {
        this.locatorConnection.registerCompression(compression);
    }
    /**
     * Start the client by establishing the locator connection
     * @returns A promise that resolves to the client instance
     */
    start() {
        return this.locatorConnection.start().then((_res) => {
            return this;
        }, (rej) => {
            if (rej instanceof Error)
                throw rej;
            throw new Error(`${(0, util_1.inspect)(rej)}`);
        });
    }
    /**
     * Close the client and all associated publishers, consumers, and connections
     * @param params - Optional closing parameters with code and reason
     * @returns A promise that resolves when the client is fully closed
     * @example
     * ```typescript
     * await client.close();
     * // or with custom parameters
     * await client.close({ closingCode: 1, closingReason: 'Shutting down' });
     * ```
     */
    async close(params = { closingCode: 0, closingReason: "" }) {
        this.logger.info(`${this.id} Closing client...`);
        if (this.publisherCounts()) {
            this.logger.info(`Stopping all producers...`);
            await this.closeAllPublishers();
        }
        if (this.consumerCounts()) {
            this.logger.info(`Stopping all consumers...`);
            await this.closeAllConsumers();
        }
        await this.locatorConnection.close({ ...params, manuallyClose: true });
    }
    /**
     * Query metadata for one or more streams
     * @param params - Parameters containing the list of stream names to query
     * @returns A promise that resolves to an array of stream metadata
     * @throws {Error} If the query returns an error code
     */
    async queryMetadata(params) {
        const { streams } = params;
        const res = await this.locatorConnection.sendAndWait(new metadata_request_1.MetadataRequest({ streams }));
        if (!res.ok) {
            throw new Error(`Query Metadata command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        this.logger.info(`Returned stream metadata for streams with names ${params.streams.join(",")}`);
        const { streamInfos } = res;
        return streamInfos;
    }
    /**
     * Query the partitions of a super stream
     * @param params - Parameters containing the super stream name
     * @returns A promise that resolves to an array of partition stream names
     * @throws {Error} If the query returns an error code
     */
    async queryPartitions(params) {
        const { superStream } = params;
        const res = await this.locatorConnection.sendAndWait(new partitions_query_1.PartitionsQuery({ superStream }));
        if (!res.ok) {
            throw new Error(`Query Partitions command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        this.logger.info(`Returned superstream partitions for superstream ${superStream}`);
        return res.streams;
    }
    /**
     * Declare a publisher for a stream
     *
     * Publishers are used to send messages to a stream. If a publisherRef is provided,
     * deduplication is enabled and the publisher will use monotonically increasing publishing IDs.
     *
     * @param params - Publisher configuration including stream name and optional publisherRef
     * @param filter - Optional filter function for server-side message filtering
     * @returns A promise that resolves to a Publisher instance
     * @throws {Error} If the declare command fails or filtering is not supported by the broker
     * @example
     * ```typescript
     * // Simple publisher
     * const publisher = await client.declarePublisher({ stream: 'my-stream' });
     * await publisher.send(Buffer.from('Hello'));
     *
     * // Publisher with deduplication
     * const dedupPublisher = await client.declarePublisher({
     *   stream: 'my-stream',
     *   publisherRef: 'unique-publisher-ref'
     * });
     * ```
     */
    async declarePublisher(params, filter) {
        const connection = await this.getConnection(params.stream, "publisher", params.connectionClosedListener);
        const publisherId = connection.getNextPublisherId();
        await this.declarePublisherOnConnection(params, publisherId, connection, filter);
        const streamPublisherParams = {
            connection: connection,
            stream: params.stream,
            publisherId: publisherId,
            publisherRef: params.publisherRef,
            maxFrameSize: this.maxFrameSize,
            maxChunkLength: params.maxChunkLength,
            logger: this.logger,
        };
        let lastPublishingId = 0n;
        if (streamPublisherParams.publisherRef) {
            lastPublishingId = await this.locatorConnection.queryPublisherSequence({
                stream: streamPublisherParams.stream,
                publisherRef: streamPublisherParams.publisherRef,
            });
        }
        const publisher = new publisher_1.StreamPublisher(this.pool, streamPublisherParams, lastPublishingId, filter);
        connection.registerForClosePublisher(publisher.extendedId, params.stream, async () => {
            await publisher.automaticClose();
            this.publishers.delete(publisher.extendedId);
        });
        this.publishers.set(publisher.extendedId, { publisher, connection, params, filter });
        this.logger.info(`New publisher created with stream name ${params.stream}, publisher id ${publisherId} and publisher reference ${params.publisherRef}`);
        return publisher;
    }
    async deletePublisher(extendedPublisherId) {
        const { publisher, connection } = this.publishers.get(extendedPublisherId) ?? {
            publisher: undefined,
            connection: this.locatorConnection,
        };
        const publisherId = extractPublisherId(extendedPublisherId);
        const res = await connection.sendAndWait(new delete_publisher_request_1.DeletePublisherRequest(publisherId));
        if (!res.ok) {
            throw new Error(`Delete Publisher command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        await publisher?.close();
        this.publishers.delete(extendedPublisherId);
        this.logger.info(`deleted publisher with publishing id ${publisherId}`);
        return res.ok;
    }
    /**
     * Declare a consumer for a stream
     *
     * Consumers receive messages from a stream starting at a specified offset.
     * They can be configured with various options including single active consumer mode,
     * filtering, and custom credit policies.
     *
     * @param params - Consumer configuration including stream, offset, and optional settings
     * @param handle - Message handler function that processes received messages
     * @param superStreamConsumer - Optional super stream consumer for internal use
     * @returns A promise that resolves to a Consumer instance
     * @throws {Error} If the consumer cannot be declared or filtering is not supported
     * @example
     * ```typescript
     * // Basic consumer
     * const consumer = await client.declareConsumer(
     *   { stream: 'my-stream', offset: Offset.first() },
     *   (message) => console.log(message.content.toString())
     * );
     *
     * // Single active consumer with offset tracking
     * const sacConsumer = await client.declareConsumer(
     *   {
     *     stream: 'my-stream',
     *     offset: Offset.first(),
     *     singleActive: true,
     *     consumerRef: 'my-consumer-group',
     *     consumerUpdateListener: async (ref, stream) => {
     *       const offset = await client.queryOffset({ reference: ref, stream });
     *       return Offset.offset(offset);
     *     }
     *   },
     *   (message) => console.log(message.content.toString())
     * );
     * ```
     */
    async declareConsumer(params, handle, superStreamConsumer) {
        const connection = await this.getConnection(params.stream, "consumer", params.connectionClosedListener);
        const consumerId = connection.getNextConsumerId();
        if (params.filter && !connection.isFilteringEnabled) {
            throw new Error(`Broker does not support message filtering.`);
        }
        const consumer = new consumer_1.StreamConsumer(this.pool, handle, {
            connection,
            stream: params.stream,
            consumerId,
            consumerRef: params.consumerRef,
            consumerTag: params.consumerTag,
            offset: params.offset,
            creditPolicy: params.creditPolicy,
            singleActive: params.singleActive,
            consumerUpdateListener: params.consumerUpdateListener,
        }, params.filter);
        connection.registerForCloseConsumer(consumer.extendedId, params.stream, async () => {
            if (params.connectionClosedListener) {
                params.connectionClosedListener(false);
            }
            await this.closeConsumer(consumer.extendedId);
        });
        this.consumers.set(consumer.extendedId, { connection, consumer, params });
        await this.declareConsumerOnConnection(params, consumerId, connection, superStreamConsumer?.superStream);
        this.logger.info(`New consumer created with stream name ${params.stream}, consumer id ${consumerId} and offset ${params.offset.type}`);
        return consumer;
    }
    async closeConsumer(extendedConsumerId) {
        const activeConsumer = this.consumers.get(extendedConsumerId);
        if (!activeConsumer) {
            this.logger.error("Consumer does not exist");
            throw new Error(`Consumer with id: ${extendedConsumerId} does not exist`);
        }
        const consumerId = extractConsumerId(extendedConsumerId);
        const { streamInfos } = await this.locatorConnection.sendAndWait(new metadata_request_1.MetadataRequest({ streams: [activeConsumer.consumer.streamName] }));
        if (streamInfos.length > 0 && streamExists(streamInfos[0])) {
            await this.unsubscribe(activeConsumer.connection, consumerId);
        }
        await this.closing(activeConsumer.consumer, extendedConsumerId);
        return true;
    }
    async declareSuperStreamConsumer({ superStream, offset, consumerRef, creditPolicy }, handle) {
        const partitions = await this.queryPartitions({ superStream });
        return super_stream_consumer_1.SuperStreamConsumer.create(handle, {
            superStream,
            locator: this,
            consumerRef: consumerRef || `${superStream}-${(0, crypto_1.randomUUID)()}`,
            offset: offset || subscribe_request_1.Offset.first(),
            partitions,
            creditPolicy,
        });
    }
    async declareSuperStreamPublisher({ superStream, publisherRef, routingStrategy }, keyExtractor) {
        return super_stream_publisher_1.SuperStreamPublisher.create({
            locator: this,
            superStream: superStream,
            keyExtractor,
            publisherRef,
            routingStrategy,
        });
    }
    queryOffset(params) {
        return this.locatorConnection.queryOffset(params);
    }
    async closeAllConsumers() {
        await Promise.all([...this.consumers.values()].map(({ consumer }) => consumer.close()));
        this.consumers = new Map();
    }
    async closeAllPublishers() {
        await Promise.all([...this.publishers.values()].map((c) => c.publisher.close()));
        this.publishers = new Map();
    }
    consumerCounts() {
        return this.consumers.size;
    }
    publisherCounts() {
        return this.publishers.size;
    }
    getConsumers() {
        return Array.from(this.consumers.values());
    }
    /**
     * Create a new stream on the RabbitMQ server
     *
     * @param params - Stream configuration including name and optional arguments (max-length-bytes, max-age, etc.)
     * @returns A promise that resolves to true when the stream is created or already exists
     * @throws {Error} If the create command fails with an error other than "already exists"
     * @example
     * ```typescript
     * // Simple stream
     * await client.createStream({ stream: 'my-stream' });
     *
     * // Stream with retention policy
     * await client.createStream({
     *   stream: 'my-stream',
     *   arguments: {
     *     'max-length-bytes': 10_000_000_000, // 10GB
     *     'max-age': '7D' // 7 days
     *   }
     * });
     * ```
     */
    async createStream(params) {
        this.logger.debug(`Create Stream...`);
        const res = await this.locatorConnection.sendAndWait(new create_stream_request_1.CreateStreamRequest(params));
        if (res.code === error_codes_1.STREAM_ALREADY_EXISTS_ERROR_CODE) {
            return true;
        }
        if (!res.ok) {
            throw new Error(`Create Stream command returned error with code ${res.code}`);
        }
        this.logger.debug(`Create Stream response: ${res.ok} - with arguments: '${(0, util_1.inspect)(params.arguments)}'`);
        return res.ok;
    }
    /**
     * Delete a stream from the RabbitMQ server
     *
     * @param params - Parameters containing the stream name to delete
     * @returns A promise that resolves to true when the stream is deleted
     * @throws {Error} If the delete command fails
     */
    async deleteStream(params) {
        this.logger.debug(`Delete Stream...`);
        const res = await this.locatorConnection.sendAndWait(new delete_stream_request_1.DeleteStreamRequest(params.stream));
        if (!res.ok) {
            throw new Error(`Delete Stream command returned error with code ${res.code}`);
        }
        this.logger.debug(`Delete Stream response: ${res.ok} - '${(0, util_1.inspect)(params.stream)}'`);
        return res.ok;
    }
    async createSuperStream(params, bindingKeys, numberOfPartitions = 3) {
        if ((0, semver_1.lt)((0, semver_1.coerce)(this.rabbitManagementVersion), util_2.REQUIRED_MANAGEMENT_VERSION)) {
            throw new Error(`Rabbitmq Management version ${this.rabbitManagementVersion} does not handle Create Super Stream Command. To create the stream use the cli`);
        }
        this.logger.debug(`Create Super Stream...`);
        const { partitions, streamBindingKeys } = this.createSuperStreamPartitionsAndBindingKeys(params.streamName, numberOfPartitions, bindingKeys);
        const res = await this.locatorConnection.sendAndWait(new create_super_stream_request_1.CreateSuperStreamRequest({ ...params, partitions, bindingKeys: streamBindingKeys }));
        if (res.code === error_codes_1.STREAM_ALREADY_EXISTS_ERROR_CODE) {
            return true;
        }
        if (!res.ok) {
            throw new Error(`Create Super Stream command returned error with code ${res.code}`);
        }
        this.logger.debug(`Create Super Stream response: ${res.ok} - with arguments: '${(0, util_1.inspect)(params.arguments)}'`);
        return res.ok;
    }
    async deleteSuperStream(params) {
        if ((0, semver_1.lt)((0, semver_1.coerce)(this.rabbitManagementVersion), util_2.REQUIRED_MANAGEMENT_VERSION)) {
            throw new Error(`Rabbitmq Management version ${this.rabbitManagementVersion} does not handle Delete Super Stream Command. To delete the stream use the cli`);
        }
        this.logger.debug(`Delete Super Stream...`);
        const res = await this.locatorConnection.sendAndWait(new delete_super_stream_request_1.DeleteSuperStreamRequest(params.streamName));
        if (!res.ok) {
            throw new Error(`Delete Super Stream command returned error with code ${res.code}`);
        }
        this.logger.debug(`Delete Super Stream response: ${res.ok} - '${(0, util_1.inspect)(params.streamName)}'`);
        return res.ok;
    }
    async streamStatsRequest(streamName) {
        const res = await this.locatorConnection.sendAndWait(new stream_stats_request_1.StreamStatsRequest(streamName));
        if (!res.ok) {
            throw new Error(`Stream Stats command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        this.logger.info(`Statistics for stream name ${streamName}, ${res.statistics}`);
        return res.statistics;
    }
    getConnectionInfo() {
        return this.locatorConnection.getConnectionInfo();
    }
    async subscribe(params) {
        const res = await this.locatorConnection.sendAndWait(new subscribe_request_1.SubscribeRequest({ ...params }));
        if (!res.ok) {
            throw new Error(`Subscribe command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        return res;
    }
    /**
     * Restart the client after a connection failure
     *
     * This method re-establishes all connections (locator, publishers, and consumers)
     * and re-declares all publishers and consumers. Useful for automatic reconnection
     * after network failures.
     *
     * @returns A promise that resolves when all connections are restarted
     * @example
     * ```typescript
     * const client = await connect({
     *   // ...connection params
     *   listeners: {
     *     connection_closed: (hadError) => {
     *       client.restart()
     *         .then(() => console.log('Reconnected'))
     *         .catch(err => console.error('Reconnection failed', err));
     *     }
     *   }
     * });
     * ```
     */
    async restart() {
        this.logger.info(`Restarting client connection ${this.locatorConnection.connectionId}`);
        const uniqueConnectionIds = new Set();
        uniqueConnectionIds.add(this.locatorConnection.connectionId);
        await (0, util_2.wait)(5000);
        await this.locatorConnection.restart();
        for (const { consumer, connection, params } of this.consumers.values()) {
            if (!uniqueConnectionIds.has(connection.connectionId)) {
                this.logger.info(`Restarting consumer connection ${connection.connectionId}`);
                await connection.restart();
            }
            uniqueConnectionIds.add(connection.connectionId);
            const consumerParams = { ...params, offset: subscribe_request_1.Offset.offset(consumer.getOffset()) };
            await this.declareConsumerOnConnection(consumerParams, consumer.consumerId, connection);
        }
        for (const { publisher, connection, params, filter } of this.publishers.values()) {
            if (!uniqueConnectionIds.has(connection.connectionId)) {
                this.logger.info(`Restarting publisher connection ${connection.connectionId}`);
                await connection.restart();
            }
            uniqueConnectionIds.add(connection.connectionId);
            await this.declarePublisherOnConnection(params, publisher.publisherId, connection, filter);
        }
    }
    get maxFrameSize() {
        return this.locatorConnection.maxFrameSize ?? util_2.DEFAULT_FRAME_MAX;
    }
    get serverVersions() {
        return this.locatorConnection.serverVersions;
    }
    get rabbitManagementVersion() {
        return this.locatorConnection.rabbitManagementVersion;
    }
    async routeQuery(params) {
        const res = await this.locatorConnection.sendAndWait(new route_query_1.RouteQuery(params));
        if (!res.ok) {
            throw new Error(`Route Query command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        this.logger.info(`Route Response for super stream ${params.superStream}, ${res.streams}`);
        return res.streams;
    }
    async partitionsQuery(params) {
        const res = await this.locatorConnection.sendAndWait(new partitions_query_1.PartitionsQuery(params));
        if (!res.ok) {
            throw new Error(`Partitions Query command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        this.logger.info(`Partitions Response for super stream ${params.superStream}, ${res.streams}`);
        return res.streams;
    }
    async declarePublisherOnConnection(params, publisherId, connection, filter) {
        const res = await connection.sendAndWait(new declare_publisher_request_1.DeclarePublisherRequest({ stream: params.stream, publisherRef: params.publisherRef, publisherId }));
        if (!res.ok) {
            await connection.close();
            throw new Error(`Declare Publisher command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        if (filter && !connection.isFilteringEnabled) {
            throw new Error(`Broker does not support message filtering.`);
        }
    }
    async declareConsumerOnConnection(params, consumerId, connection, superStream) {
        const properties = {};
        if (params.singleActive && !params.consumerRef) {
            throw new Error("consumerRef is mandatory when declaring a single active consumer");
        }
        if (params.singleActive) {
            properties["single-active-consumer"] = "true";
            properties["name"] = params.consumerRef;
        }
        if (superStream) {
            properties["super-stream"] = superStream;
        }
        if (params.filter) {
            for (let i = 0; i < params.filter.values.length; i++) {
                properties[`filter.${i}`] = params.filter.values[i];
            }
            properties["match-unfiltered"] = `${params.filter.matchUnfiltered}`;
        }
        if (params.consumerTag) {
            properties["identifier"] = params.consumerTag;
        }
        const creditPolicy = params.creditPolicy || consumer_credit_policy_1.defaultCreditPolicy;
        const res = await connection.sendAndWait(new subscribe_request_1.SubscribeRequest({
            ...params,
            subscriptionId: consumerId,
            credit: creditPolicy.onSubscription(),
            properties: properties,
        }));
        if (!res.ok) {
            this.consumers.delete((0, consumer_1.computeExtendedConsumerId)(consumerId, connection.connectionId));
            throw new Error(`Declare Consumer command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
    }
    askForCredit(subscriptionId, connection) {
        return async (howMany) => {
            return connection.send(new credit_request_1.CreditRequest({ subscriptionId: subscriptionId, credit: howMany }));
        };
    }
    getDeliverV1Callback(connectionId) {
        return async (response) => {
            const deliverData = {
                messages: response.messages,
                subscriptionId: response.subscriptionId,
                consumerId: (0, consumer_1.computeExtendedConsumerId)(response.subscriptionId, connectionId),
                messageFilteringSupported: false,
            };
            await this.handleDelivery(deliverData);
        };
    }
    getDeliverV2Callback(connectionId) {
        return async (response) => {
            const deliverData = {
                messages: response.messages,
                subscriptionId: response.subscriptionId,
                consumerId: (0, consumer_1.computeExtendedConsumerId)(response.subscriptionId, connectionId),
                messageFilteringSupported: true,
            };
            await this.handleDelivery(deliverData);
        };
    }
    handleDelivery = async (deliverData) => {
        const { messages, subscriptionId, consumerId, messageFilteringSupported } = deliverData;
        const { consumer, connection } = this.consumers.get(consumerId) ?? {
            consumer: undefined,
            connection: undefined,
        };
        if (!consumer) {
            this.logger.error(`On delivery, no consumer found`);
            return;
        }
        this.logger.debug(`on delivery -> ${consumer.consumerRef}`);
        this.logger.debug(`response.messages.length: ${messages.length}`);
        const creditRequestWrapper = this.askForCredit(subscriptionId, connection);
        await consumer.creditPolicy.onChunkReceived(creditRequestWrapper);
        const messageFilter = messageFilteringSupported && consumer.filter?.postFilterFunc
            ? consumer.filter?.postFilterFunc
            : (_msg) => true;
        for (const message of messages) {
            if (messageFilter(message)) {
                await consumer.handle(message);
            }
        }
        await consumer.creditPolicy.onChunkCompleted(creditRequestWrapper);
    };
    getConsumerUpdateCallback(connectionId) {
        return async (response) => {
            const { consumer, connection } = this.consumers.get((0, consumer_1.computeExtendedConsumerId)(response.subscriptionId, connectionId)) ?? {
                consumer: undefined,
                connection: undefined,
            };
            if (!consumer) {
                this.logger.error(`On consumer_update_query no consumer found`);
                return;
            }
            const offset = await this.getConsumerOrServerSavedOffset(consumer);
            consumer.updateConsumerOffset(offset);
            this.logger.debug(`on consumer_update_query -> ${consumer.consumerRef}`);
            await connection.send(new consumer_update_response_1.ConsumerUpdateResponse({ correlationId: response.correlationId, responseCode: 1, offset }));
        };
    }
    async getConsumerOrServerSavedOffset(consumer) {
        if (consumer.isSingleActive && consumer.consumerRef && consumer.consumerUpdateListener) {
            try {
                const offset = await consumer.consumerUpdateListener(consumer.consumerRef, consumer.streamName);
                return offset;
            }
            catch (error) {
                this.logger.error(`Error in consumerUpdateListener for consumerRef ${consumer.consumerRef}: ${error.message}`);
                return consumer.offset;
            }
        }
        return consumer.offset;
    }
    getLocatorConnection() {
        const connectionParams = this.buildConnectionParams(false, "", this.params.listeners?.connection_closed);
        return connection_1.Connection.create(connectionParams, this.logger);
    }
    async getConnection(streamName, purpose, connectionClosedListener) {
        const [metadata] = await this.queryMetadata({ streams: [streamName] });
        const isPublisher = purpose === "publisher";
        const chosenNode = chooseNode(metadata, isPublisher);
        if (!chosenNode) {
            throw new Error(`Stream was not found on any node`);
        }
        const connection = await this.pool.getConnection(purpose, streamName, this.locatorConnection.vhost, chosenNode.host, async () => {
            return await this.getConnectionOnChosenNode(isPublisher, streamName, chosenNode, metadata, connectionClosedListener);
        });
        return connection;
    }
    createSuperStreamPartitionsAndBindingKeys(streamName, numberOfPartitions, bindingKeys) {
        const partitions = [];
        if (!bindingKeys) {
            for (let i = 0; i < numberOfPartitions; i++) {
                partitions.push(`${streamName}-${i}`);
            }
            const streamBindingKeys = Array.from(Array(numberOfPartitions).keys()).map((n) => `${n}`);
            return { partitions, streamBindingKeys };
        }
        bindingKeys.map((bk) => partitions.push(`${streamName}-${bk}`));
        return { partitions, streamBindingKeys: bindingKeys };
    }
    buildConnectionParams(leader, streamName, connectionClosedListener) {
        const connectionId = (0, crypto_1.randomUUID)();
        const connectionListeners = {
            ...this.params.listeners,
            connection_closed: connectionClosedListener,
            deliverV1: this.getDeliverV1Callback(connectionId),
            deliverV2: this.getDeliverV2Callback(connectionId),
            consumer_update_query: this.getConsumerUpdateCallback(connectionId),
        };
        return {
            ...this.params,
            listeners: connectionListeners,
            leader: leader,
            streamName: streamName,
            connectionId,
        };
    }
    async getConnectionOnChosenNode(isPublisher, streamName, chosenNode, metadata, connectionClosedListener) {
        const connectionParams = this.buildConnectionParams(isPublisher, streamName, connectionClosedListener);
        if (this.params.addressResolver && this.params.addressResolver.enabled) {
            const maxAttempts = computeMaxAttempts(metadata);
            const resolver = this.params.addressResolver;
            let currentAttempt = 0;
            while (currentAttempt < maxAttempts) {
                this.logger.debug(`Attempting to connect using the address resolver - attempt ${currentAttempt + 1}`);
                const hostname = resolver.endpoint?.host ?? this.params.hostname;
                const port = resolver.endpoint?.port ?? this.params.port;
                const connection = await connection_1.Connection.connect({ ...connectionParams, hostname, port }, this.logger);
                const { host: connectionHost, port: connectionPort } = connection.getConnectionInfo();
                if (connectionHost === chosenNode.host && connectionPort === chosenNode.port) {
                    this.logger.debug(`Correct connection was found!`);
                    return connection;
                }
                this.logger.debug(`The node found was not the right one - closing the connection`);
                await connection.close();
                currentAttempt++;
            }
            throw new Error(`Could not find broker (${chosenNode.host}:${chosenNode.port}) after ${maxAttempts} attempts`);
        }
        return connection_1.Connection.connect({ ...connectionParams, hostname: chosenNode.host, port: chosenNode.port }, this.logger);
    }
    async unsubscribe(connection, consumerId) {
        const res = await connection.sendAndWait(new unsubscribe_request_1.UnsubscribeRequest(consumerId));
        if (!res.ok) {
            throw new Error(`Unsubscribe command returned error with code ${res.code} - ${(0, connection_1.errorMessageOf)(res.code)}`);
        }
        return res;
    }
    async closing(consumer, extendedConsumerId) {
        await consumer.close();
        this.consumers.delete(extendedConsumerId);
        this.logger.info(`Closed consumer with id: ${extendedConsumerId}`);
    }
    /**
     * Create and connect a new Client instance
     *
     * @param params - Connection parameters including hostname, port, credentials, and optional settings
     * @param logger - Optional logger instance for debugging
     * @returns A promise that resolves to a connected Client instance
     * @example
     * ```typescript
     * const client = await Client.connect({
     *   hostname: 'localhost',
     *   port: 5552,
     *   username: 'guest',
     *   password: 'guest',
     *   vhost: '/'
     * });
     * ```
     */
    static async connect(params, logger) {
        return new Client(logger ?? new logger_1.NullLogger(), {
            ...params,
            vhost: getVhostOrDefault(params.vhost),
        }).start();
    }
}
exports.Client = Client;
/**
 * Connect to RabbitMQ and create a new Client instance
 *
 * This is the main entry point for creating a connection to RabbitMQ streams.
 * It establishes a locator connection for metadata queries and sets up connection pooling.
 *
 * @param params - Connection parameters including hostname, port, credentials, and optional settings
 * @param logger - Optional logger instance for debugging and monitoring
 * @returns A promise that resolves to a connected Client instance
 * @throws {Error} If connection fails (invalid credentials, network issues, etc.)
 * @example
 * ```typescript
 * // Basic connection
 * const client = await connect({
 *   hostname: 'localhost',
 *   port: 5552,
 *   username: 'guest',
 *   password: 'guest',
 *   vhost: '/'
 * });
 *
 * // Connection with TLS
 * const secureClient = await connect({
 *   hostname: 'rabbitmq.example.com',
 *   port: 5551,
 *   username: 'user',
 *   password: 'pass',
 *   vhost: '/',
 *   ssl: {
 *     cert: fs.readFileSync('client-cert.pem'),
 *     key: fs.readFileSync('client-key.pem'),
 *     ca: fs.readFileSync('ca-cert.pem')
 *   }
 * });
 *
 * // Connection with listeners
 * const client = await connect({
 *   hostname: 'localhost',
 *   port: 5552,
 *   username: 'guest',
 *   password: 'guest',
 *   vhost: '/',
 *   listeners: {
 *     connection_closed: (hadError) => {
 *       console.log('Connection closed', hadError);
 *     },
 *     publish_confirm: (confirm, connId) => {
 *       console.log('Message confirmed', confirm.publishingId);
 *     }
 *   }
 * });
 * ```
 */
function connect(params, logger) {
    return Client.connect(params, logger);
}
const chooseNode = (metadata, leader) => {
    if (leader) {
        return metadata.leader;
    }
    const chosenNode = metadata.replicas?.length ? (0, util_2.sample)(metadata.replicas) : metadata.leader;
    return chosenNode;
};
const computeMaxAttempts = (metadata) => {
    return Math.pow(2 + (metadata.leader ? 1 : 0) + (metadata.replicas?.length ?? 0), 2);
};
const extractConsumerId = (extendedConsumerId) => {
    return parseInt(extendedConsumerId.split("@").shift() ?? "0");
};
const extractPublisherId = (extendedPublisherId) => {
    return parseInt(extendedPublisherId.split("@").shift() ?? "0");
};
const getVhostOrDefault = (vhost) => vhost ?? "/";
const streamExists = (streamInfo) => {
    return (streamInfo.responseCode !== util_2.ResponseCode.StreamDoesNotExist &&
        streamInfo.responseCode !== util_2.ResponseCode.SubscriptionIdDoesNotExist);
};
//# sourceMappingURL=client.js.map