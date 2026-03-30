import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace vectr. */
export namespace vectr {

    /** Properties of a Position. */
    interface IPosition {

        /** Position latitude */
        latitude?: (number|null);

        /** Position longitude */
        longitude?: (number|null);

        /** Position altitudeM */
        altitudeM?: (number|null);
    }

    /** Represents a Position. */
    class Position implements IPosition {

        /**
         * Constructs a new Position.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.IPosition);

        /** Position latitude. */
        public latitude: number;

        /** Position longitude. */
        public longitude: number;

        /** Position altitudeM. */
        public altitudeM: number;

        /**
         * Creates a new Position instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Position instance
         */
        public static create(properties?: vectr.IPosition): vectr.Position;

        /**
         * Encodes the specified Position message. Does not implicitly {@link vectr.Position.verify|verify} messages.
         * @param message Position message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Position message, length delimited. Does not implicitly {@link vectr.Position.verify|verify} messages.
         * @param message Position message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Position message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.Position;

        /**
         * Decodes a Position message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.Position;

        /**
         * Verifies a Position message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Position message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Position
         */
        public static fromObject(object: { [k: string]: any }): vectr.Position;

        /**
         * Creates a plain object from a Position message. Also converts values to other types if specified.
         * @param message Position
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.Position, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Position to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Position
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Attitude. */
    interface IAttitude {

        /** Attitude rollDeg */
        rollDeg?: (number|null);

        /** Attitude pitchDeg */
        pitchDeg?: (number|null);

        /** Attitude yawDeg */
        yawDeg?: (number|null);
    }

    /** Represents an Attitude. */
    class Attitude implements IAttitude {

        /**
         * Constructs a new Attitude.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.IAttitude);

        /** Attitude rollDeg. */
        public rollDeg: number;

        /** Attitude pitchDeg. */
        public pitchDeg: number;

        /** Attitude yawDeg. */
        public yawDeg: number;

        /**
         * Creates a new Attitude instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Attitude instance
         */
        public static create(properties?: vectr.IAttitude): vectr.Attitude;

        /**
         * Encodes the specified Attitude message. Does not implicitly {@link vectr.Attitude.verify|verify} messages.
         * @param message Attitude message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.IAttitude, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Attitude message, length delimited. Does not implicitly {@link vectr.Attitude.verify|verify} messages.
         * @param message Attitude message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.IAttitude, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Attitude message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Attitude
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.Attitude;

        /**
         * Decodes an Attitude message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Attitude
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.Attitude;

        /**
         * Verifies an Attitude message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Attitude message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Attitude
         */
        public static fromObject(object: { [k: string]: any }): vectr.Attitude;

        /**
         * Creates a plain object from an Attitude message. Also converts values to other types if specified.
         * @param message Attitude
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.Attitude, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Attitude to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Attitude
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** FlightMode enum. */
    enum FlightMode {
        FLIGHT_MODE_UNSPECIFIED = 0,
        FLIGHT_MODE_STABILIZE = 1,
        FLIGHT_MODE_ACRO = 2,
        FLIGHT_MODE_ALT_HOLD = 3,
        FLIGHT_MODE_LOITER = 4,
        FLIGHT_MODE_RTL = 5,
        FLIGHT_MODE_LAND = 6,
        FLIGHT_MODE_ANGLE = 7,
        FLIGHT_MODE_HORIZON = 8,
        FLIGHT_MODE_AUTO = 9,
        FLIGHT_MODE_GUIDED = 10,
        FLIGHT_MODE_NAV_POSHOLD = 11,
        FLIGHT_MODE_NAV_WP = 12,
        FLIGHT_MODE_NAV_RTH = 13
    }

    /** NodeHealthMode enum. */
    enum NodeHealthMode {
        NODE_HEALTH_MODE_UNSPECIFIED = 0,
        NODE_HEALTH_MODE_NORMAL = 1,
        NODE_HEALTH_MODE_DEGRADED = 2,
        NODE_HEALTH_MODE_RECOVERING = 3
    }

    /** Properties of a GpsInfo. */
    interface IGpsInfo {

        /** GpsInfo fixType */
        fixType?: (number|null);

        /** GpsInfo satellites */
        satellites?: (number|null);

        /** GpsInfo hdop */
        hdop?: (number|null);
    }

    /** Represents a GpsInfo. */
    class GpsInfo implements IGpsInfo {

        /**
         * Constructs a new GpsInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.IGpsInfo);

        /** GpsInfo fixType. */
        public fixType: number;

        /** GpsInfo satellites. */
        public satellites: number;

        /** GpsInfo hdop. */
        public hdop: number;

        /**
         * Creates a new GpsInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GpsInfo instance
         */
        public static create(properties?: vectr.IGpsInfo): vectr.GpsInfo;

        /**
         * Encodes the specified GpsInfo message. Does not implicitly {@link vectr.GpsInfo.verify|verify} messages.
         * @param message GpsInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.IGpsInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GpsInfo message, length delimited. Does not implicitly {@link vectr.GpsInfo.verify|verify} messages.
         * @param message GpsInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.IGpsInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GpsInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GpsInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.GpsInfo;

        /**
         * Decodes a GpsInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GpsInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.GpsInfo;

        /**
         * Verifies a GpsInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GpsInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GpsInfo
         */
        public static fromObject(object: { [k: string]: any }): vectr.GpsInfo;

        /**
         * Creates a plain object from a GpsInfo message. Also converts values to other types if specified.
         * @param message GpsInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.GpsInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GpsInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GpsInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FCCapabilities. */
    interface IFCCapabilities {

        /** FCCapabilities fcType */
        fcType?: (string|null);

        /** FCCapabilities protocol */
        protocol?: (string|null);

        /** FCCapabilities supportsGps */
        supportsGps?: (boolean|null);

        /** FCCapabilities supportsWaypoints */
        supportsWaypoints?: (boolean|null);

        /** FCCapabilities supportsGuided */
        supportsGuided?: (boolean|null);

        /** FCCapabilities supportsRtl */
        supportsRtl?: (boolean|null);

        /** FCCapabilities supportsParams */
        supportsParams?: (boolean|null);

        /** FCCapabilities flightModes */
        flightModes?: (string[]|null);
    }

    /** Represents a FCCapabilities. */
    class FCCapabilities implements IFCCapabilities {

        /**
         * Constructs a new FCCapabilities.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.IFCCapabilities);

        /** FCCapabilities fcType. */
        public fcType: string;

        /** FCCapabilities protocol. */
        public protocol: string;

        /** FCCapabilities supportsGps. */
        public supportsGps: boolean;

        /** FCCapabilities supportsWaypoints. */
        public supportsWaypoints: boolean;

        /** FCCapabilities supportsGuided. */
        public supportsGuided: boolean;

        /** FCCapabilities supportsRtl. */
        public supportsRtl: boolean;

        /** FCCapabilities supportsParams. */
        public supportsParams: boolean;

        /** FCCapabilities flightModes. */
        public flightModes: string[];

        /**
         * Creates a new FCCapabilities instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FCCapabilities instance
         */
        public static create(properties?: vectr.IFCCapabilities): vectr.FCCapabilities;

        /**
         * Encodes the specified FCCapabilities message. Does not implicitly {@link vectr.FCCapabilities.verify|verify} messages.
         * @param message FCCapabilities message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.IFCCapabilities, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FCCapabilities message, length delimited. Does not implicitly {@link vectr.FCCapabilities.verify|verify} messages.
         * @param message FCCapabilities message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.IFCCapabilities, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FCCapabilities message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FCCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.FCCapabilities;

        /**
         * Decodes a FCCapabilities message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FCCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.FCCapabilities;

        /**
         * Verifies a FCCapabilities message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FCCapabilities message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FCCapabilities
         */
        public static fromObject(object: { [k: string]: any }): vectr.FCCapabilities;

        /**
         * Creates a plain object from a FCCapabilities message. Also converts values to other types if specified.
         * @param message FCCapabilities
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.FCCapabilities, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FCCapabilities to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FCCapabilities
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TelemetryFrame. */
    interface ITelemetryFrame {

        /** TelemetryFrame nodeId */
        nodeId?: (string|null);

        /** TelemetryFrame orgId */
        orgId?: (string|null);

        /** TelemetryFrame baseId */
        baseId?: (string|null);

        /** TelemetryFrame timestampMs */
        timestampMs?: (number|Long|null);

        /** TelemetryFrame attitude */
        attitude?: (vectr.IAttitude|null);

        /** TelemetryFrame position */
        position?: (vectr.IPosition|null);

        /** TelemetryFrame batteryVoltage */
        batteryVoltage?: (number|null);

        /** TelemetryFrame batteryPercent */
        batteryPercent?: (number|null);

        /** TelemetryFrame flightMode */
        flightMode?: (vectr.FlightMode|null);

        /** TelemetryFrame armed */
        armed?: (boolean|null);

        /** TelemetryFrame gps */
        gps?: (vectr.IGpsInfo|null);
    }

    /** Represents a TelemetryFrame. */
    class TelemetryFrame implements ITelemetryFrame {

        /**
         * Constructs a new TelemetryFrame.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.ITelemetryFrame);

        /** TelemetryFrame nodeId. */
        public nodeId: string;

        /** TelemetryFrame orgId. */
        public orgId: string;

        /** TelemetryFrame baseId. */
        public baseId: string;

        /** TelemetryFrame timestampMs. */
        public timestampMs: (number|Long);

        /** TelemetryFrame attitude. */
        public attitude?: (vectr.IAttitude|null);

        /** TelemetryFrame position. */
        public position?: (vectr.IPosition|null);

        /** TelemetryFrame batteryVoltage. */
        public batteryVoltage: number;

        /** TelemetryFrame batteryPercent. */
        public batteryPercent: number;

        /** TelemetryFrame flightMode. */
        public flightMode: vectr.FlightMode;

        /** TelemetryFrame armed. */
        public armed: boolean;

        /** TelemetryFrame gps. */
        public gps?: (vectr.IGpsInfo|null);

        /**
         * Creates a new TelemetryFrame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TelemetryFrame instance
         */
        public static create(properties?: vectr.ITelemetryFrame): vectr.TelemetryFrame;

        /**
         * Encodes the specified TelemetryFrame message. Does not implicitly {@link vectr.TelemetryFrame.verify|verify} messages.
         * @param message TelemetryFrame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.ITelemetryFrame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TelemetryFrame message, length delimited. Does not implicitly {@link vectr.TelemetryFrame.verify|verify} messages.
         * @param message TelemetryFrame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.ITelemetryFrame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TelemetryFrame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TelemetryFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.TelemetryFrame;

        /**
         * Decodes a TelemetryFrame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TelemetryFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.TelemetryFrame;

        /**
         * Verifies a TelemetryFrame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TelemetryFrame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TelemetryFrame
         */
        public static fromObject(object: { [k: string]: any }): vectr.TelemetryFrame;

        /**
         * Creates a plain object from a TelemetryFrame message. Also converts values to other types if specified.
         * @param message TelemetryFrame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.TelemetryFrame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TelemetryFrame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TelemetryFrame
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Heartbeat. */
    interface IHeartbeat {

        /** Heartbeat timestampMs */
        timestampMs?: (number|Long|null);

        /** Heartbeat firmwareVersion */
        firmwareVersion?: (string|null);
    }

    /** Represents a Heartbeat. */
    class Heartbeat implements IHeartbeat {

        /**
         * Constructs a new Heartbeat.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.IHeartbeat);

        /** Heartbeat timestampMs. */
        public timestampMs: (number|Long);

        /** Heartbeat firmwareVersion. */
        public firmwareVersion: string;

        /**
         * Creates a new Heartbeat instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Heartbeat instance
         */
        public static create(properties?: vectr.IHeartbeat): vectr.Heartbeat;

        /**
         * Encodes the specified Heartbeat message. Does not implicitly {@link vectr.Heartbeat.verify|verify} messages.
         * @param message Heartbeat message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.IHeartbeat, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Heartbeat message, length delimited. Does not implicitly {@link vectr.Heartbeat.verify|verify} messages.
         * @param message Heartbeat message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.IHeartbeat, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Heartbeat message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Heartbeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.Heartbeat;

        /**
         * Decodes a Heartbeat message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Heartbeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.Heartbeat;

        /**
         * Verifies a Heartbeat message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Heartbeat message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Heartbeat
         */
        public static fromObject(object: { [k: string]: any }): vectr.Heartbeat;

        /**
         * Creates a plain object from a Heartbeat message. Also converts values to other types if specified.
         * @param message Heartbeat
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.Heartbeat, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Heartbeat to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Heartbeat
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a NodeStatus. */
    interface INodeStatus {

        /** NodeStatus nodeId */
        nodeId?: (string|null);

        /** NodeStatus timestampMs */
        timestampMs?: (number|Long|null);

        /** NodeStatus fcOk */
        fcOk?: (boolean|null);

        /** NodeStatus radioOk */
        radioOk?: (boolean|null);

        /** NodeStatus healthMode */
        healthMode?: (vectr.NodeHealthMode|null);

        /** NodeStatus serialReopenCount */
        serialReopenCount?: (number|null);

        /** NodeStatus lastAttitudeMs */
        lastAttitudeMs?: (number|Long|null);

        /** NodeStatus lastStatusMs */
        lastStatusMs?: (number|Long|null);

        /** NodeStatus lastAnalogMs */
        lastAnalogMs?: (number|Long|null);

        /** NodeStatus attitudeFailures */
        attitudeFailures?: (number|null);

        /** NodeStatus statusFailures */
        statusFailures?: (number|null);

        /** NodeStatus analogFailures */
        analogFailures?: (number|null);

        /** NodeStatus capabilities */
        capabilities?: (vectr.IFCCapabilities|null);
    }

    /** Represents a NodeStatus. */
    class NodeStatus implements INodeStatus {

        /**
         * Constructs a new NodeStatus.
         * @param [properties] Properties to set
         */
        constructor(properties?: vectr.INodeStatus);

        /** NodeStatus nodeId. */
        public nodeId: string;

        /** NodeStatus timestampMs. */
        public timestampMs: (number|Long);

        /** NodeStatus fcOk. */
        public fcOk: boolean;

        /** NodeStatus radioOk. */
        public radioOk: boolean;

        /** NodeStatus healthMode. */
        public healthMode: vectr.NodeHealthMode;

        /** NodeStatus serialReopenCount. */
        public serialReopenCount: number;

        /** NodeStatus lastAttitudeMs. */
        public lastAttitudeMs: (number|Long);

        /** NodeStatus lastStatusMs. */
        public lastStatusMs: (number|Long);

        /** NodeStatus lastAnalogMs. */
        public lastAnalogMs: (number|Long);

        /** NodeStatus attitudeFailures. */
        public attitudeFailures: number;

        /** NodeStatus statusFailures. */
        public statusFailures: number;

        /** NodeStatus analogFailures. */
        public analogFailures: number;

        /** NodeStatus capabilities. */
        public capabilities?: (vectr.IFCCapabilities|null);

        /**
         * Creates a new NodeStatus instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NodeStatus instance
         */
        public static create(properties?: vectr.INodeStatus): vectr.NodeStatus;

        /**
         * Encodes the specified NodeStatus message. Does not implicitly {@link vectr.NodeStatus.verify|verify} messages.
         * @param message NodeStatus message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vectr.INodeStatus, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified NodeStatus message, length delimited. Does not implicitly {@link vectr.NodeStatus.verify|verify} messages.
         * @param message NodeStatus message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vectr.INodeStatus, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NodeStatus message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns NodeStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vectr.NodeStatus;

        /**
         * Decodes a NodeStatus message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns NodeStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vectr.NodeStatus;

        /**
         * Verifies a NodeStatus message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a NodeStatus message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NodeStatus
         */
        public static fromObject(object: { [k: string]: any }): vectr.NodeStatus;

        /**
         * Creates a plain object from a NodeStatus message. Also converts values to other types if specified.
         * @param message NodeStatus
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vectr.NodeStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this NodeStatus to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for NodeStatus
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
