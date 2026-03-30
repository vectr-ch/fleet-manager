/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const vectr = $root.vectr = (() => {

    /**
     * Namespace vectr.
     * @exports vectr
     * @namespace
     */
    const vectr = {};

    vectr.Position = (function() {

        /**
         * Properties of a Position.
         * @memberof vectr
         * @interface IPosition
         * @property {number|null} [latitude] Position latitude
         * @property {number|null} [longitude] Position longitude
         * @property {number|null} [altitudeM] Position altitudeM
         */

        /**
         * Constructs a new Position.
         * @memberof vectr
         * @classdesc Represents a Position.
         * @implements IPosition
         * @constructor
         * @param {vectr.IPosition=} [properties] Properties to set
         */
        function Position(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Position latitude.
         * @member {number} latitude
         * @memberof vectr.Position
         * @instance
         */
        Position.prototype.latitude = 0;

        /**
         * Position longitude.
         * @member {number} longitude
         * @memberof vectr.Position
         * @instance
         */
        Position.prototype.longitude = 0;

        /**
         * Position altitudeM.
         * @member {number} altitudeM
         * @memberof vectr.Position
         * @instance
         */
        Position.prototype.altitudeM = 0;

        /**
         * Creates a new Position instance using the specified properties.
         * @function create
         * @memberof vectr.Position
         * @static
         * @param {vectr.IPosition=} [properties] Properties to set
         * @returns {vectr.Position} Position instance
         */
        Position.create = function create(properties) {
            return new Position(properties);
        };

        /**
         * Encodes the specified Position message. Does not implicitly {@link vectr.Position.verify|verify} messages.
         * @function encode
         * @memberof vectr.Position
         * @static
         * @param {vectr.IPosition} message Position message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Position.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.latitude != null && Object.hasOwnProperty.call(message, "latitude"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.latitude);
            if (message.longitude != null && Object.hasOwnProperty.call(message, "longitude"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.longitude);
            if (message.altitudeM != null && Object.hasOwnProperty.call(message, "altitudeM"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.altitudeM);
            return writer;
        };

        /**
         * Encodes the specified Position message, length delimited. Does not implicitly {@link vectr.Position.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.Position
         * @static
         * @param {vectr.IPosition} message Position message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Position.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Position message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.Position
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.Position} Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Position.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.Position();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.latitude = reader.double();
                        break;
                    }
                case 2: {
                        message.longitude = reader.double();
                        break;
                    }
                case 3: {
                        message.altitudeM = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Position message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.Position
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.Position} Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Position.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Position message.
         * @function verify
         * @memberof vectr.Position
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Position.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                if (typeof message.latitude !== "number")
                    return "latitude: number expected";
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                if (typeof message.longitude !== "number")
                    return "longitude: number expected";
            if (message.altitudeM != null && message.hasOwnProperty("altitudeM"))
                if (typeof message.altitudeM !== "number")
                    return "altitudeM: number expected";
            return null;
        };

        /**
         * Creates a Position message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.Position
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.Position} Position
         */
        Position.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.Position)
                return object;
            let message = new $root.vectr.Position();
            if (object.latitude != null)
                message.latitude = Number(object.latitude);
            if (object.longitude != null)
                message.longitude = Number(object.longitude);
            if (object.altitudeM != null)
                message.altitudeM = Number(object.altitudeM);
            return message;
        };

        /**
         * Creates a plain object from a Position message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.Position
         * @static
         * @param {vectr.Position} message Position
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Position.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.latitude = 0;
                object.longitude = 0;
                object.altitudeM = 0;
            }
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
            if (message.altitudeM != null && message.hasOwnProperty("altitudeM"))
                object.altitudeM = options.json && !isFinite(message.altitudeM) ? String(message.altitudeM) : message.altitudeM;
            return object;
        };

        /**
         * Converts this Position to JSON.
         * @function toJSON
         * @memberof vectr.Position
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Position.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Position
         * @function getTypeUrl
         * @memberof vectr.Position
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Position.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.Position";
        };

        return Position;
    })();

    vectr.Attitude = (function() {

        /**
         * Properties of an Attitude.
         * @memberof vectr
         * @interface IAttitude
         * @property {number|null} [rollDeg] Attitude rollDeg
         * @property {number|null} [pitchDeg] Attitude pitchDeg
         * @property {number|null} [yawDeg] Attitude yawDeg
         */

        /**
         * Constructs a new Attitude.
         * @memberof vectr
         * @classdesc Represents an Attitude.
         * @implements IAttitude
         * @constructor
         * @param {vectr.IAttitude=} [properties] Properties to set
         */
        function Attitude(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Attitude rollDeg.
         * @member {number} rollDeg
         * @memberof vectr.Attitude
         * @instance
         */
        Attitude.prototype.rollDeg = 0;

        /**
         * Attitude pitchDeg.
         * @member {number} pitchDeg
         * @memberof vectr.Attitude
         * @instance
         */
        Attitude.prototype.pitchDeg = 0;

        /**
         * Attitude yawDeg.
         * @member {number} yawDeg
         * @memberof vectr.Attitude
         * @instance
         */
        Attitude.prototype.yawDeg = 0;

        /**
         * Creates a new Attitude instance using the specified properties.
         * @function create
         * @memberof vectr.Attitude
         * @static
         * @param {vectr.IAttitude=} [properties] Properties to set
         * @returns {vectr.Attitude} Attitude instance
         */
        Attitude.create = function create(properties) {
            return new Attitude(properties);
        };

        /**
         * Encodes the specified Attitude message. Does not implicitly {@link vectr.Attitude.verify|verify} messages.
         * @function encode
         * @memberof vectr.Attitude
         * @static
         * @param {vectr.IAttitude} message Attitude message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Attitude.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.rollDeg != null && Object.hasOwnProperty.call(message, "rollDeg"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.rollDeg);
            if (message.pitchDeg != null && Object.hasOwnProperty.call(message, "pitchDeg"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.pitchDeg);
            if (message.yawDeg != null && Object.hasOwnProperty.call(message, "yawDeg"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.yawDeg);
            return writer;
        };

        /**
         * Encodes the specified Attitude message, length delimited. Does not implicitly {@link vectr.Attitude.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.Attitude
         * @static
         * @param {vectr.IAttitude} message Attitude message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Attitude.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Attitude message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.Attitude
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.Attitude} Attitude
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Attitude.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.Attitude();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.rollDeg = reader.float();
                        break;
                    }
                case 2: {
                        message.pitchDeg = reader.float();
                        break;
                    }
                case 3: {
                        message.yawDeg = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Attitude message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.Attitude
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.Attitude} Attitude
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Attitude.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Attitude message.
         * @function verify
         * @memberof vectr.Attitude
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Attitude.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.rollDeg != null && message.hasOwnProperty("rollDeg"))
                if (typeof message.rollDeg !== "number")
                    return "rollDeg: number expected";
            if (message.pitchDeg != null && message.hasOwnProperty("pitchDeg"))
                if (typeof message.pitchDeg !== "number")
                    return "pitchDeg: number expected";
            if (message.yawDeg != null && message.hasOwnProperty("yawDeg"))
                if (typeof message.yawDeg !== "number")
                    return "yawDeg: number expected";
            return null;
        };

        /**
         * Creates an Attitude message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.Attitude
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.Attitude} Attitude
         */
        Attitude.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.Attitude)
                return object;
            let message = new $root.vectr.Attitude();
            if (object.rollDeg != null)
                message.rollDeg = Number(object.rollDeg);
            if (object.pitchDeg != null)
                message.pitchDeg = Number(object.pitchDeg);
            if (object.yawDeg != null)
                message.yawDeg = Number(object.yawDeg);
            return message;
        };

        /**
         * Creates a plain object from an Attitude message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.Attitude
         * @static
         * @param {vectr.Attitude} message Attitude
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Attitude.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.rollDeg = 0;
                object.pitchDeg = 0;
                object.yawDeg = 0;
            }
            if (message.rollDeg != null && message.hasOwnProperty("rollDeg"))
                object.rollDeg = options.json && !isFinite(message.rollDeg) ? String(message.rollDeg) : message.rollDeg;
            if (message.pitchDeg != null && message.hasOwnProperty("pitchDeg"))
                object.pitchDeg = options.json && !isFinite(message.pitchDeg) ? String(message.pitchDeg) : message.pitchDeg;
            if (message.yawDeg != null && message.hasOwnProperty("yawDeg"))
                object.yawDeg = options.json && !isFinite(message.yawDeg) ? String(message.yawDeg) : message.yawDeg;
            return object;
        };

        /**
         * Converts this Attitude to JSON.
         * @function toJSON
         * @memberof vectr.Attitude
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Attitude.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Attitude
         * @function getTypeUrl
         * @memberof vectr.Attitude
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Attitude.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.Attitude";
        };

        return Attitude;
    })();

    /**
     * FlightMode enum.
     * @name vectr.FlightMode
     * @enum {number}
     * @property {number} FLIGHT_MODE_UNSPECIFIED=0 FLIGHT_MODE_UNSPECIFIED value
     * @property {number} FLIGHT_MODE_STABILIZE=1 FLIGHT_MODE_STABILIZE value
     * @property {number} FLIGHT_MODE_ACRO=2 FLIGHT_MODE_ACRO value
     * @property {number} FLIGHT_MODE_ALT_HOLD=3 FLIGHT_MODE_ALT_HOLD value
     * @property {number} FLIGHT_MODE_LOITER=4 FLIGHT_MODE_LOITER value
     * @property {number} FLIGHT_MODE_RTL=5 FLIGHT_MODE_RTL value
     * @property {number} FLIGHT_MODE_LAND=6 FLIGHT_MODE_LAND value
     * @property {number} FLIGHT_MODE_ANGLE=7 FLIGHT_MODE_ANGLE value
     * @property {number} FLIGHT_MODE_HORIZON=8 FLIGHT_MODE_HORIZON value
     * @property {number} FLIGHT_MODE_AUTO=9 FLIGHT_MODE_AUTO value
     * @property {number} FLIGHT_MODE_GUIDED=10 FLIGHT_MODE_GUIDED value
     * @property {number} FLIGHT_MODE_NAV_POSHOLD=11 FLIGHT_MODE_NAV_POSHOLD value
     * @property {number} FLIGHT_MODE_NAV_WP=12 FLIGHT_MODE_NAV_WP value
     * @property {number} FLIGHT_MODE_NAV_RTH=13 FLIGHT_MODE_NAV_RTH value
     */
    vectr.FlightMode = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "FLIGHT_MODE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "FLIGHT_MODE_STABILIZE"] = 1;
        values[valuesById[2] = "FLIGHT_MODE_ACRO"] = 2;
        values[valuesById[3] = "FLIGHT_MODE_ALT_HOLD"] = 3;
        values[valuesById[4] = "FLIGHT_MODE_LOITER"] = 4;
        values[valuesById[5] = "FLIGHT_MODE_RTL"] = 5;
        values[valuesById[6] = "FLIGHT_MODE_LAND"] = 6;
        values[valuesById[7] = "FLIGHT_MODE_ANGLE"] = 7;
        values[valuesById[8] = "FLIGHT_MODE_HORIZON"] = 8;
        values[valuesById[9] = "FLIGHT_MODE_AUTO"] = 9;
        values[valuesById[10] = "FLIGHT_MODE_GUIDED"] = 10;
        values[valuesById[11] = "FLIGHT_MODE_NAV_POSHOLD"] = 11;
        values[valuesById[12] = "FLIGHT_MODE_NAV_WP"] = 12;
        values[valuesById[13] = "FLIGHT_MODE_NAV_RTH"] = 13;
        return values;
    })();

    /**
     * NodeHealthMode enum.
     * @name vectr.NodeHealthMode
     * @enum {number}
     * @property {number} NODE_HEALTH_MODE_UNSPECIFIED=0 NODE_HEALTH_MODE_UNSPECIFIED value
     * @property {number} NODE_HEALTH_MODE_NORMAL=1 NODE_HEALTH_MODE_NORMAL value
     * @property {number} NODE_HEALTH_MODE_DEGRADED=2 NODE_HEALTH_MODE_DEGRADED value
     * @property {number} NODE_HEALTH_MODE_RECOVERING=3 NODE_HEALTH_MODE_RECOVERING value
     */
    vectr.NodeHealthMode = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NODE_HEALTH_MODE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "NODE_HEALTH_MODE_NORMAL"] = 1;
        values[valuesById[2] = "NODE_HEALTH_MODE_DEGRADED"] = 2;
        values[valuesById[3] = "NODE_HEALTH_MODE_RECOVERING"] = 3;
        return values;
    })();

    vectr.GpsInfo = (function() {

        /**
         * Properties of a GpsInfo.
         * @memberof vectr
         * @interface IGpsInfo
         * @property {number|null} [fixType] GpsInfo fixType
         * @property {number|null} [satellites] GpsInfo satellites
         * @property {number|null} [hdop] GpsInfo hdop
         */

        /**
         * Constructs a new GpsInfo.
         * @memberof vectr
         * @classdesc Represents a GpsInfo.
         * @implements IGpsInfo
         * @constructor
         * @param {vectr.IGpsInfo=} [properties] Properties to set
         */
        function GpsInfo(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GpsInfo fixType.
         * @member {number} fixType
         * @memberof vectr.GpsInfo
         * @instance
         */
        GpsInfo.prototype.fixType = 0;

        /**
         * GpsInfo satellites.
         * @member {number} satellites
         * @memberof vectr.GpsInfo
         * @instance
         */
        GpsInfo.prototype.satellites = 0;

        /**
         * GpsInfo hdop.
         * @member {number} hdop
         * @memberof vectr.GpsInfo
         * @instance
         */
        GpsInfo.prototype.hdop = 0;

        /**
         * Creates a new GpsInfo instance using the specified properties.
         * @function create
         * @memberof vectr.GpsInfo
         * @static
         * @param {vectr.IGpsInfo=} [properties] Properties to set
         * @returns {vectr.GpsInfo} GpsInfo instance
         */
        GpsInfo.create = function create(properties) {
            return new GpsInfo(properties);
        };

        /**
         * Encodes the specified GpsInfo message. Does not implicitly {@link vectr.GpsInfo.verify|verify} messages.
         * @function encode
         * @memberof vectr.GpsInfo
         * @static
         * @param {vectr.IGpsInfo} message GpsInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GpsInfo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fixType != null && Object.hasOwnProperty.call(message, "fixType"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.fixType);
            if (message.satellites != null && Object.hasOwnProperty.call(message, "satellites"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.satellites);
            if (message.hdop != null && Object.hasOwnProperty.call(message, "hdop"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.hdop);
            return writer;
        };

        /**
         * Encodes the specified GpsInfo message, length delimited. Does not implicitly {@link vectr.GpsInfo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.GpsInfo
         * @static
         * @param {vectr.IGpsInfo} message GpsInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GpsInfo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GpsInfo message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.GpsInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.GpsInfo} GpsInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GpsInfo.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.GpsInfo();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.fixType = reader.uint32();
                        break;
                    }
                case 2: {
                        message.satellites = reader.uint32();
                        break;
                    }
                case 3: {
                        message.hdop = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GpsInfo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.GpsInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.GpsInfo} GpsInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GpsInfo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GpsInfo message.
         * @function verify
         * @memberof vectr.GpsInfo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GpsInfo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fixType != null && message.hasOwnProperty("fixType"))
                if (!$util.isInteger(message.fixType))
                    return "fixType: integer expected";
            if (message.satellites != null && message.hasOwnProperty("satellites"))
                if (!$util.isInteger(message.satellites))
                    return "satellites: integer expected";
            if (message.hdop != null && message.hasOwnProperty("hdop"))
                if (typeof message.hdop !== "number")
                    return "hdop: number expected";
            return null;
        };

        /**
         * Creates a GpsInfo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.GpsInfo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.GpsInfo} GpsInfo
         */
        GpsInfo.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.GpsInfo)
                return object;
            let message = new $root.vectr.GpsInfo();
            if (object.fixType != null)
                message.fixType = object.fixType >>> 0;
            if (object.satellites != null)
                message.satellites = object.satellites >>> 0;
            if (object.hdop != null)
                message.hdop = Number(object.hdop);
            return message;
        };

        /**
         * Creates a plain object from a GpsInfo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.GpsInfo
         * @static
         * @param {vectr.GpsInfo} message GpsInfo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GpsInfo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.fixType = 0;
                object.satellites = 0;
                object.hdop = 0;
            }
            if (message.fixType != null && message.hasOwnProperty("fixType"))
                object.fixType = message.fixType;
            if (message.satellites != null && message.hasOwnProperty("satellites"))
                object.satellites = message.satellites;
            if (message.hdop != null && message.hasOwnProperty("hdop"))
                object.hdop = options.json && !isFinite(message.hdop) ? String(message.hdop) : message.hdop;
            return object;
        };

        /**
         * Converts this GpsInfo to JSON.
         * @function toJSON
         * @memberof vectr.GpsInfo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GpsInfo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GpsInfo
         * @function getTypeUrl
         * @memberof vectr.GpsInfo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GpsInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.GpsInfo";
        };

        return GpsInfo;
    })();

    vectr.FCCapabilities = (function() {

        /**
         * Properties of a FCCapabilities.
         * @memberof vectr
         * @interface IFCCapabilities
         * @property {string|null} [fcType] FCCapabilities fcType
         * @property {string|null} [protocol] FCCapabilities protocol
         * @property {boolean|null} [supportsGps] FCCapabilities supportsGps
         * @property {boolean|null} [supportsWaypoints] FCCapabilities supportsWaypoints
         * @property {boolean|null} [supportsGuided] FCCapabilities supportsGuided
         * @property {boolean|null} [supportsRtl] FCCapabilities supportsRtl
         * @property {boolean|null} [supportsParams] FCCapabilities supportsParams
         * @property {Array.<string>|null} [flightModes] FCCapabilities flightModes
         */

        /**
         * Constructs a new FCCapabilities.
         * @memberof vectr
         * @classdesc Represents a FCCapabilities.
         * @implements IFCCapabilities
         * @constructor
         * @param {vectr.IFCCapabilities=} [properties] Properties to set
         */
        function FCCapabilities(properties) {
            this.flightModes = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FCCapabilities fcType.
         * @member {string} fcType
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.fcType = "";

        /**
         * FCCapabilities protocol.
         * @member {string} protocol
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.protocol = "";

        /**
         * FCCapabilities supportsGps.
         * @member {boolean} supportsGps
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.supportsGps = false;

        /**
         * FCCapabilities supportsWaypoints.
         * @member {boolean} supportsWaypoints
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.supportsWaypoints = false;

        /**
         * FCCapabilities supportsGuided.
         * @member {boolean} supportsGuided
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.supportsGuided = false;

        /**
         * FCCapabilities supportsRtl.
         * @member {boolean} supportsRtl
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.supportsRtl = false;

        /**
         * FCCapabilities supportsParams.
         * @member {boolean} supportsParams
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.supportsParams = false;

        /**
         * FCCapabilities flightModes.
         * @member {Array.<string>} flightModes
         * @memberof vectr.FCCapabilities
         * @instance
         */
        FCCapabilities.prototype.flightModes = $util.emptyArray;

        /**
         * Creates a new FCCapabilities instance using the specified properties.
         * @function create
         * @memberof vectr.FCCapabilities
         * @static
         * @param {vectr.IFCCapabilities=} [properties] Properties to set
         * @returns {vectr.FCCapabilities} FCCapabilities instance
         */
        FCCapabilities.create = function create(properties) {
            return new FCCapabilities(properties);
        };

        /**
         * Encodes the specified FCCapabilities message. Does not implicitly {@link vectr.FCCapabilities.verify|verify} messages.
         * @function encode
         * @memberof vectr.FCCapabilities
         * @static
         * @param {vectr.IFCCapabilities} message FCCapabilities message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FCCapabilities.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fcType != null && Object.hasOwnProperty.call(message, "fcType"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.fcType);
            if (message.protocol != null && Object.hasOwnProperty.call(message, "protocol"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.protocol);
            if (message.supportsGps != null && Object.hasOwnProperty.call(message, "supportsGps"))
                writer.uint32(/* id 10, wireType 0 =*/80).bool(message.supportsGps);
            if (message.supportsWaypoints != null && Object.hasOwnProperty.call(message, "supportsWaypoints"))
                writer.uint32(/* id 11, wireType 0 =*/88).bool(message.supportsWaypoints);
            if (message.supportsGuided != null && Object.hasOwnProperty.call(message, "supportsGuided"))
                writer.uint32(/* id 12, wireType 0 =*/96).bool(message.supportsGuided);
            if (message.supportsRtl != null && Object.hasOwnProperty.call(message, "supportsRtl"))
                writer.uint32(/* id 13, wireType 0 =*/104).bool(message.supportsRtl);
            if (message.supportsParams != null && Object.hasOwnProperty.call(message, "supportsParams"))
                writer.uint32(/* id 14, wireType 0 =*/112).bool(message.supportsParams);
            if (message.flightModes != null && message.flightModes.length)
                for (let i = 0; i < message.flightModes.length; ++i)
                    writer.uint32(/* id 15, wireType 2 =*/122).string(message.flightModes[i]);
            return writer;
        };

        /**
         * Encodes the specified FCCapabilities message, length delimited. Does not implicitly {@link vectr.FCCapabilities.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.FCCapabilities
         * @static
         * @param {vectr.IFCCapabilities} message FCCapabilities message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FCCapabilities.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FCCapabilities message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.FCCapabilities
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.FCCapabilities} FCCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FCCapabilities.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.FCCapabilities();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.fcType = reader.string();
                        break;
                    }
                case 2: {
                        message.protocol = reader.string();
                        break;
                    }
                case 10: {
                        message.supportsGps = reader.bool();
                        break;
                    }
                case 11: {
                        message.supportsWaypoints = reader.bool();
                        break;
                    }
                case 12: {
                        message.supportsGuided = reader.bool();
                        break;
                    }
                case 13: {
                        message.supportsRtl = reader.bool();
                        break;
                    }
                case 14: {
                        message.supportsParams = reader.bool();
                        break;
                    }
                case 15: {
                        if (!(message.flightModes && message.flightModes.length))
                            message.flightModes = [];
                        message.flightModes.push(reader.string());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FCCapabilities message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.FCCapabilities
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.FCCapabilities} FCCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FCCapabilities.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FCCapabilities message.
         * @function verify
         * @memberof vectr.FCCapabilities
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FCCapabilities.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fcType != null && message.hasOwnProperty("fcType"))
                if (!$util.isString(message.fcType))
                    return "fcType: string expected";
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                if (!$util.isString(message.protocol))
                    return "protocol: string expected";
            if (message.supportsGps != null && message.hasOwnProperty("supportsGps"))
                if (typeof message.supportsGps !== "boolean")
                    return "supportsGps: boolean expected";
            if (message.supportsWaypoints != null && message.hasOwnProperty("supportsWaypoints"))
                if (typeof message.supportsWaypoints !== "boolean")
                    return "supportsWaypoints: boolean expected";
            if (message.supportsGuided != null && message.hasOwnProperty("supportsGuided"))
                if (typeof message.supportsGuided !== "boolean")
                    return "supportsGuided: boolean expected";
            if (message.supportsRtl != null && message.hasOwnProperty("supportsRtl"))
                if (typeof message.supportsRtl !== "boolean")
                    return "supportsRtl: boolean expected";
            if (message.supportsParams != null && message.hasOwnProperty("supportsParams"))
                if (typeof message.supportsParams !== "boolean")
                    return "supportsParams: boolean expected";
            if (message.flightModes != null && message.hasOwnProperty("flightModes")) {
                if (!Array.isArray(message.flightModes))
                    return "flightModes: array expected";
                for (let i = 0; i < message.flightModes.length; ++i)
                    if (!$util.isString(message.flightModes[i]))
                        return "flightModes: string[] expected";
            }
            return null;
        };

        /**
         * Creates a FCCapabilities message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.FCCapabilities
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.FCCapabilities} FCCapabilities
         */
        FCCapabilities.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.FCCapabilities)
                return object;
            let message = new $root.vectr.FCCapabilities();
            if (object.fcType != null)
                message.fcType = String(object.fcType);
            if (object.protocol != null)
                message.protocol = String(object.protocol);
            if (object.supportsGps != null)
                message.supportsGps = Boolean(object.supportsGps);
            if (object.supportsWaypoints != null)
                message.supportsWaypoints = Boolean(object.supportsWaypoints);
            if (object.supportsGuided != null)
                message.supportsGuided = Boolean(object.supportsGuided);
            if (object.supportsRtl != null)
                message.supportsRtl = Boolean(object.supportsRtl);
            if (object.supportsParams != null)
                message.supportsParams = Boolean(object.supportsParams);
            if (object.flightModes) {
                if (!Array.isArray(object.flightModes))
                    throw TypeError(".vectr.FCCapabilities.flightModes: array expected");
                message.flightModes = [];
                for (let i = 0; i < object.flightModes.length; ++i)
                    message.flightModes[i] = String(object.flightModes[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a FCCapabilities message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.FCCapabilities
         * @static
         * @param {vectr.FCCapabilities} message FCCapabilities
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FCCapabilities.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.flightModes = [];
            if (options.defaults) {
                object.fcType = "";
                object.protocol = "";
                object.supportsGps = false;
                object.supportsWaypoints = false;
                object.supportsGuided = false;
                object.supportsRtl = false;
                object.supportsParams = false;
            }
            if (message.fcType != null && message.hasOwnProperty("fcType"))
                object.fcType = message.fcType;
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                object.protocol = message.protocol;
            if (message.supportsGps != null && message.hasOwnProperty("supportsGps"))
                object.supportsGps = message.supportsGps;
            if (message.supportsWaypoints != null && message.hasOwnProperty("supportsWaypoints"))
                object.supportsWaypoints = message.supportsWaypoints;
            if (message.supportsGuided != null && message.hasOwnProperty("supportsGuided"))
                object.supportsGuided = message.supportsGuided;
            if (message.supportsRtl != null && message.hasOwnProperty("supportsRtl"))
                object.supportsRtl = message.supportsRtl;
            if (message.supportsParams != null && message.hasOwnProperty("supportsParams"))
                object.supportsParams = message.supportsParams;
            if (message.flightModes && message.flightModes.length) {
                object.flightModes = [];
                for (let j = 0; j < message.flightModes.length; ++j)
                    object.flightModes[j] = message.flightModes[j];
            }
            return object;
        };

        /**
         * Converts this FCCapabilities to JSON.
         * @function toJSON
         * @memberof vectr.FCCapabilities
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FCCapabilities.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FCCapabilities
         * @function getTypeUrl
         * @memberof vectr.FCCapabilities
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FCCapabilities.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.FCCapabilities";
        };

        return FCCapabilities;
    })();

    vectr.TelemetryFrame = (function() {

        /**
         * Properties of a TelemetryFrame.
         * @memberof vectr
         * @interface ITelemetryFrame
         * @property {string|null} [nodeId] TelemetryFrame nodeId
         * @property {string|null} [orgId] TelemetryFrame orgId
         * @property {string|null} [baseId] TelemetryFrame baseId
         * @property {number|Long|null} [timestampMs] TelemetryFrame timestampMs
         * @property {vectr.IAttitude|null} [attitude] TelemetryFrame attitude
         * @property {vectr.IPosition|null} [position] TelemetryFrame position
         * @property {number|null} [batteryVoltage] TelemetryFrame batteryVoltage
         * @property {number|null} [batteryPercent] TelemetryFrame batteryPercent
         * @property {vectr.FlightMode|null} [flightMode] TelemetryFrame flightMode
         * @property {boolean|null} [armed] TelemetryFrame armed
         * @property {vectr.IGpsInfo|null} [gps] TelemetryFrame gps
         */

        /**
         * Constructs a new TelemetryFrame.
         * @memberof vectr
         * @classdesc Represents a TelemetryFrame.
         * @implements ITelemetryFrame
         * @constructor
         * @param {vectr.ITelemetryFrame=} [properties] Properties to set
         */
        function TelemetryFrame(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TelemetryFrame nodeId.
         * @member {string} nodeId
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.nodeId = "";

        /**
         * TelemetryFrame orgId.
         * @member {string} orgId
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.orgId = "";

        /**
         * TelemetryFrame baseId.
         * @member {string} baseId
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.baseId = "";

        /**
         * TelemetryFrame timestampMs.
         * @member {number|Long} timestampMs
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TelemetryFrame attitude.
         * @member {vectr.IAttitude|null|undefined} attitude
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.attitude = null;

        /**
         * TelemetryFrame position.
         * @member {vectr.IPosition|null|undefined} position
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.position = null;

        /**
         * TelemetryFrame batteryVoltage.
         * @member {number} batteryVoltage
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.batteryVoltage = 0;

        /**
         * TelemetryFrame batteryPercent.
         * @member {number} batteryPercent
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.batteryPercent = 0;

        /**
         * TelemetryFrame flightMode.
         * @member {vectr.FlightMode} flightMode
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.flightMode = 0;

        /**
         * TelemetryFrame armed.
         * @member {boolean} armed
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.armed = false;

        /**
         * TelemetryFrame gps.
         * @member {vectr.IGpsInfo|null|undefined} gps
         * @memberof vectr.TelemetryFrame
         * @instance
         */
        TelemetryFrame.prototype.gps = null;

        /**
         * Creates a new TelemetryFrame instance using the specified properties.
         * @function create
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {vectr.ITelemetryFrame=} [properties] Properties to set
         * @returns {vectr.TelemetryFrame} TelemetryFrame instance
         */
        TelemetryFrame.create = function create(properties) {
            return new TelemetryFrame(properties);
        };

        /**
         * Encodes the specified TelemetryFrame message. Does not implicitly {@link vectr.TelemetryFrame.verify|verify} messages.
         * @function encode
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {vectr.ITelemetryFrame} message TelemetryFrame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TelemetryFrame.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.nodeId != null && Object.hasOwnProperty.call(message, "nodeId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.nodeId);
            if (message.orgId != null && Object.hasOwnProperty.call(message, "orgId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.orgId);
            if (message.baseId != null && Object.hasOwnProperty.call(message, "baseId"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.baseId);
            if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.timestampMs);
            if (message.attitude != null && Object.hasOwnProperty.call(message, "attitude"))
                $root.vectr.Attitude.encode(message.attitude, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                $root.vectr.Position.encode(message.position, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.batteryVoltage != null && Object.hasOwnProperty.call(message, "batteryVoltage"))
                writer.uint32(/* id 12, wireType 5 =*/101).float(message.batteryVoltage);
            if (message.batteryPercent != null && Object.hasOwnProperty.call(message, "batteryPercent"))
                writer.uint32(/* id 13, wireType 5 =*/109).float(message.batteryPercent);
            if (message.flightMode != null && Object.hasOwnProperty.call(message, "flightMode"))
                writer.uint32(/* id 14, wireType 0 =*/112).int32(message.flightMode);
            if (message.armed != null && Object.hasOwnProperty.call(message, "armed"))
                writer.uint32(/* id 15, wireType 0 =*/120).bool(message.armed);
            if (message.gps != null && Object.hasOwnProperty.call(message, "gps"))
                $root.vectr.GpsInfo.encode(message.gps, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TelemetryFrame message, length delimited. Does not implicitly {@link vectr.TelemetryFrame.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {vectr.ITelemetryFrame} message TelemetryFrame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TelemetryFrame.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TelemetryFrame message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.TelemetryFrame} TelemetryFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TelemetryFrame.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.TelemetryFrame();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.nodeId = reader.string();
                        break;
                    }
                case 2: {
                        message.orgId = reader.string();
                        break;
                    }
                case 3: {
                        message.baseId = reader.string();
                        break;
                    }
                case 4: {
                        message.timestampMs = reader.uint64();
                        break;
                    }
                case 10: {
                        message.attitude = $root.vectr.Attitude.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.position = $root.vectr.Position.decode(reader, reader.uint32());
                        break;
                    }
                case 12: {
                        message.batteryVoltage = reader.float();
                        break;
                    }
                case 13: {
                        message.batteryPercent = reader.float();
                        break;
                    }
                case 14: {
                        message.flightMode = reader.int32();
                        break;
                    }
                case 15: {
                        message.armed = reader.bool();
                        break;
                    }
                case 16: {
                        message.gps = $root.vectr.GpsInfo.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TelemetryFrame message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.TelemetryFrame} TelemetryFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TelemetryFrame.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TelemetryFrame message.
         * @function verify
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TelemetryFrame.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                if (!$util.isString(message.nodeId))
                    return "nodeId: string expected";
            if (message.orgId != null && message.hasOwnProperty("orgId"))
                if (!$util.isString(message.orgId))
                    return "orgId: string expected";
            if (message.baseId != null && message.hasOwnProperty("baseId"))
                if (!$util.isString(message.baseId))
                    return "baseId: string expected";
            if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                    return "timestampMs: integer|Long expected";
            if (message.attitude != null && message.hasOwnProperty("attitude")) {
                let error = $root.vectr.Attitude.verify(message.attitude);
                if (error)
                    return "attitude." + error;
            }
            if (message.position != null && message.hasOwnProperty("position")) {
                let error = $root.vectr.Position.verify(message.position);
                if (error)
                    return "position." + error;
            }
            if (message.batteryVoltage != null && message.hasOwnProperty("batteryVoltage"))
                if (typeof message.batteryVoltage !== "number")
                    return "batteryVoltage: number expected";
            if (message.batteryPercent != null && message.hasOwnProperty("batteryPercent"))
                if (typeof message.batteryPercent !== "number")
                    return "batteryPercent: number expected";
            if (message.flightMode != null && message.hasOwnProperty("flightMode"))
                switch (message.flightMode) {
                default:
                    return "flightMode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    break;
                }
            if (message.armed != null && message.hasOwnProperty("armed"))
                if (typeof message.armed !== "boolean")
                    return "armed: boolean expected";
            if (message.gps != null && message.hasOwnProperty("gps")) {
                let error = $root.vectr.GpsInfo.verify(message.gps);
                if (error)
                    return "gps." + error;
            }
            return null;
        };

        /**
         * Creates a TelemetryFrame message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.TelemetryFrame} TelemetryFrame
         */
        TelemetryFrame.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.TelemetryFrame)
                return object;
            let message = new $root.vectr.TelemetryFrame();
            if (object.nodeId != null)
                message.nodeId = String(object.nodeId);
            if (object.orgId != null)
                message.orgId = String(object.orgId);
            if (object.baseId != null)
                message.baseId = String(object.baseId);
            if (object.timestampMs != null)
                if ($util.Long)
                    (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = true;
                else if (typeof object.timestampMs === "string")
                    message.timestampMs = parseInt(object.timestampMs, 10);
                else if (typeof object.timestampMs === "number")
                    message.timestampMs = object.timestampMs;
                else if (typeof object.timestampMs === "object")
                    message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber(true);
            if (object.attitude != null) {
                if (typeof object.attitude !== "object")
                    throw TypeError(".vectr.TelemetryFrame.attitude: object expected");
                message.attitude = $root.vectr.Attitude.fromObject(object.attitude);
            }
            if (object.position != null) {
                if (typeof object.position !== "object")
                    throw TypeError(".vectr.TelemetryFrame.position: object expected");
                message.position = $root.vectr.Position.fromObject(object.position);
            }
            if (object.batteryVoltage != null)
                message.batteryVoltage = Number(object.batteryVoltage);
            if (object.batteryPercent != null)
                message.batteryPercent = Number(object.batteryPercent);
            switch (object.flightMode) {
            default:
                if (typeof object.flightMode === "number") {
                    message.flightMode = object.flightMode;
                    break;
                }
                break;
            case "FLIGHT_MODE_UNSPECIFIED":
            case 0:
                message.flightMode = 0;
                break;
            case "FLIGHT_MODE_STABILIZE":
            case 1:
                message.flightMode = 1;
                break;
            case "FLIGHT_MODE_ACRO":
            case 2:
                message.flightMode = 2;
                break;
            case "FLIGHT_MODE_ALT_HOLD":
            case 3:
                message.flightMode = 3;
                break;
            case "FLIGHT_MODE_LOITER":
            case 4:
                message.flightMode = 4;
                break;
            case "FLIGHT_MODE_RTL":
            case 5:
                message.flightMode = 5;
                break;
            case "FLIGHT_MODE_LAND":
            case 6:
                message.flightMode = 6;
                break;
            case "FLIGHT_MODE_ANGLE":
            case 7:
                message.flightMode = 7;
                break;
            case "FLIGHT_MODE_HORIZON":
            case 8:
                message.flightMode = 8;
                break;
            case "FLIGHT_MODE_AUTO":
            case 9:
                message.flightMode = 9;
                break;
            case "FLIGHT_MODE_GUIDED":
            case 10:
                message.flightMode = 10;
                break;
            case "FLIGHT_MODE_NAV_POSHOLD":
            case 11:
                message.flightMode = 11;
                break;
            case "FLIGHT_MODE_NAV_WP":
            case 12:
                message.flightMode = 12;
                break;
            case "FLIGHT_MODE_NAV_RTH":
            case 13:
                message.flightMode = 13;
                break;
            }
            if (object.armed != null)
                message.armed = Boolean(object.armed);
            if (object.gps != null) {
                if (typeof object.gps !== "object")
                    throw TypeError(".vectr.TelemetryFrame.gps: object expected");
                message.gps = $root.vectr.GpsInfo.fromObject(object.gps);
            }
            return message;
        };

        /**
         * Creates a plain object from a TelemetryFrame message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {vectr.TelemetryFrame} message TelemetryFrame
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TelemetryFrame.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.nodeId = "";
                object.orgId = "";
                object.baseId = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestampMs = options.longs === String ? "0" : 0;
                object.attitude = null;
                object.position = null;
                object.batteryVoltage = 0;
                object.batteryPercent = 0;
                object.flightMode = options.enums === String ? "FLIGHT_MODE_UNSPECIFIED" : 0;
                object.armed = false;
                object.gps = null;
            }
            if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                object.nodeId = message.nodeId;
            if (message.orgId != null && message.hasOwnProperty("orgId"))
                object.orgId = message.orgId;
            if (message.baseId != null && message.hasOwnProperty("baseId"))
                object.baseId = message.baseId;
            if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                if (typeof message.timestampMs === "number")
                    object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                else
                    object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber(true) : message.timestampMs;
            if (message.attitude != null && message.hasOwnProperty("attitude"))
                object.attitude = $root.vectr.Attitude.toObject(message.attitude, options);
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = $root.vectr.Position.toObject(message.position, options);
            if (message.batteryVoltage != null && message.hasOwnProperty("batteryVoltage"))
                object.batteryVoltage = options.json && !isFinite(message.batteryVoltage) ? String(message.batteryVoltage) : message.batteryVoltage;
            if (message.batteryPercent != null && message.hasOwnProperty("batteryPercent"))
                object.batteryPercent = options.json && !isFinite(message.batteryPercent) ? String(message.batteryPercent) : message.batteryPercent;
            if (message.flightMode != null && message.hasOwnProperty("flightMode"))
                object.flightMode = options.enums === String ? $root.vectr.FlightMode[message.flightMode] === undefined ? message.flightMode : $root.vectr.FlightMode[message.flightMode] : message.flightMode;
            if (message.armed != null && message.hasOwnProperty("armed"))
                object.armed = message.armed;
            if (message.gps != null && message.hasOwnProperty("gps"))
                object.gps = $root.vectr.GpsInfo.toObject(message.gps, options);
            return object;
        };

        /**
         * Converts this TelemetryFrame to JSON.
         * @function toJSON
         * @memberof vectr.TelemetryFrame
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TelemetryFrame.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TelemetryFrame
         * @function getTypeUrl
         * @memberof vectr.TelemetryFrame
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TelemetryFrame.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.TelemetryFrame";
        };

        return TelemetryFrame;
    })();

    vectr.Heartbeat = (function() {

        /**
         * Properties of a Heartbeat.
         * @memberof vectr
         * @interface IHeartbeat
         * @property {number|Long|null} [timestampMs] Heartbeat timestampMs
         * @property {string|null} [firmwareVersion] Heartbeat firmwareVersion
         */

        /**
         * Constructs a new Heartbeat.
         * @memberof vectr
         * @classdesc Represents a Heartbeat.
         * @implements IHeartbeat
         * @constructor
         * @param {vectr.IHeartbeat=} [properties] Properties to set
         */
        function Heartbeat(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Heartbeat timestampMs.
         * @member {number|Long} timestampMs
         * @memberof vectr.Heartbeat
         * @instance
         */
        Heartbeat.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Heartbeat firmwareVersion.
         * @member {string} firmwareVersion
         * @memberof vectr.Heartbeat
         * @instance
         */
        Heartbeat.prototype.firmwareVersion = "";

        /**
         * Creates a new Heartbeat instance using the specified properties.
         * @function create
         * @memberof vectr.Heartbeat
         * @static
         * @param {vectr.IHeartbeat=} [properties] Properties to set
         * @returns {vectr.Heartbeat} Heartbeat instance
         */
        Heartbeat.create = function create(properties) {
            return new Heartbeat(properties);
        };

        /**
         * Encodes the specified Heartbeat message. Does not implicitly {@link vectr.Heartbeat.verify|verify} messages.
         * @function encode
         * @memberof vectr.Heartbeat
         * @static
         * @param {vectr.IHeartbeat} message Heartbeat message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Heartbeat.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.timestampMs);
            if (message.firmwareVersion != null && Object.hasOwnProperty.call(message, "firmwareVersion"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.firmwareVersion);
            return writer;
        };

        /**
         * Encodes the specified Heartbeat message, length delimited. Does not implicitly {@link vectr.Heartbeat.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.Heartbeat
         * @static
         * @param {vectr.IHeartbeat} message Heartbeat message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Heartbeat.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Heartbeat message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.Heartbeat
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.Heartbeat} Heartbeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Heartbeat.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.Heartbeat();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.timestampMs = reader.uint64();
                        break;
                    }
                case 2: {
                        message.firmwareVersion = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Heartbeat message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.Heartbeat
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.Heartbeat} Heartbeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Heartbeat.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Heartbeat message.
         * @function verify
         * @memberof vectr.Heartbeat
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Heartbeat.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                    return "timestampMs: integer|Long expected";
            if (message.firmwareVersion != null && message.hasOwnProperty("firmwareVersion"))
                if (!$util.isString(message.firmwareVersion))
                    return "firmwareVersion: string expected";
            return null;
        };

        /**
         * Creates a Heartbeat message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.Heartbeat
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.Heartbeat} Heartbeat
         */
        Heartbeat.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.Heartbeat)
                return object;
            let message = new $root.vectr.Heartbeat();
            if (object.timestampMs != null)
                if ($util.Long)
                    (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = true;
                else if (typeof object.timestampMs === "string")
                    message.timestampMs = parseInt(object.timestampMs, 10);
                else if (typeof object.timestampMs === "number")
                    message.timestampMs = object.timestampMs;
                else if (typeof object.timestampMs === "object")
                    message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber(true);
            if (object.firmwareVersion != null)
                message.firmwareVersion = String(object.firmwareVersion);
            return message;
        };

        /**
         * Creates a plain object from a Heartbeat message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.Heartbeat
         * @static
         * @param {vectr.Heartbeat} message Heartbeat
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Heartbeat.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestampMs = options.longs === String ? "0" : 0;
                object.firmwareVersion = "";
            }
            if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                if (typeof message.timestampMs === "number")
                    object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                else
                    object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber(true) : message.timestampMs;
            if (message.firmwareVersion != null && message.hasOwnProperty("firmwareVersion"))
                object.firmwareVersion = message.firmwareVersion;
            return object;
        };

        /**
         * Converts this Heartbeat to JSON.
         * @function toJSON
         * @memberof vectr.Heartbeat
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Heartbeat.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Heartbeat
         * @function getTypeUrl
         * @memberof vectr.Heartbeat
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Heartbeat.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.Heartbeat";
        };

        return Heartbeat;
    })();

    vectr.NodeStatus = (function() {

        /**
         * Properties of a NodeStatus.
         * @memberof vectr
         * @interface INodeStatus
         * @property {string|null} [nodeId] NodeStatus nodeId
         * @property {number|Long|null} [timestampMs] NodeStatus timestampMs
         * @property {boolean|null} [fcOk] NodeStatus fcOk
         * @property {boolean|null} [radioOk] NodeStatus radioOk
         * @property {vectr.NodeHealthMode|null} [healthMode] NodeStatus healthMode
         * @property {number|null} [serialReopenCount] NodeStatus serialReopenCount
         * @property {number|Long|null} [lastAttitudeMs] NodeStatus lastAttitudeMs
         * @property {number|Long|null} [lastStatusMs] NodeStatus lastStatusMs
         * @property {number|Long|null} [lastAnalogMs] NodeStatus lastAnalogMs
         * @property {number|null} [attitudeFailures] NodeStatus attitudeFailures
         * @property {number|null} [statusFailures] NodeStatus statusFailures
         * @property {number|null} [analogFailures] NodeStatus analogFailures
         * @property {vectr.IFCCapabilities|null} [capabilities] NodeStatus capabilities
         */

        /**
         * Constructs a new NodeStatus.
         * @memberof vectr
         * @classdesc Represents a NodeStatus.
         * @implements INodeStatus
         * @constructor
         * @param {vectr.INodeStatus=} [properties] Properties to set
         */
        function NodeStatus(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NodeStatus nodeId.
         * @member {string} nodeId
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.nodeId = "";

        /**
         * NodeStatus timestampMs.
         * @member {number|Long} timestampMs
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * NodeStatus fcOk.
         * @member {boolean} fcOk
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.fcOk = false;

        /**
         * NodeStatus radioOk.
         * @member {boolean} radioOk
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.radioOk = false;

        /**
         * NodeStatus healthMode.
         * @member {vectr.NodeHealthMode} healthMode
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.healthMode = 0;

        /**
         * NodeStatus serialReopenCount.
         * @member {number} serialReopenCount
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.serialReopenCount = 0;

        /**
         * NodeStatus lastAttitudeMs.
         * @member {number|Long} lastAttitudeMs
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.lastAttitudeMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * NodeStatus lastStatusMs.
         * @member {number|Long} lastStatusMs
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.lastStatusMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * NodeStatus lastAnalogMs.
         * @member {number|Long} lastAnalogMs
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.lastAnalogMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * NodeStatus attitudeFailures.
         * @member {number} attitudeFailures
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.attitudeFailures = 0;

        /**
         * NodeStatus statusFailures.
         * @member {number} statusFailures
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.statusFailures = 0;

        /**
         * NodeStatus analogFailures.
         * @member {number} analogFailures
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.analogFailures = 0;

        /**
         * NodeStatus capabilities.
         * @member {vectr.IFCCapabilities|null|undefined} capabilities
         * @memberof vectr.NodeStatus
         * @instance
         */
        NodeStatus.prototype.capabilities = null;

        /**
         * Creates a new NodeStatus instance using the specified properties.
         * @function create
         * @memberof vectr.NodeStatus
         * @static
         * @param {vectr.INodeStatus=} [properties] Properties to set
         * @returns {vectr.NodeStatus} NodeStatus instance
         */
        NodeStatus.create = function create(properties) {
            return new NodeStatus(properties);
        };

        /**
         * Encodes the specified NodeStatus message. Does not implicitly {@link vectr.NodeStatus.verify|verify} messages.
         * @function encode
         * @memberof vectr.NodeStatus
         * @static
         * @param {vectr.INodeStatus} message NodeStatus message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NodeStatus.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.nodeId != null && Object.hasOwnProperty.call(message, "nodeId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.nodeId);
            if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.timestampMs);
            if (message.fcOk != null && Object.hasOwnProperty.call(message, "fcOk"))
                writer.uint32(/* id 10, wireType 0 =*/80).bool(message.fcOk);
            if (message.radioOk != null && Object.hasOwnProperty.call(message, "radioOk"))
                writer.uint32(/* id 11, wireType 0 =*/88).bool(message.radioOk);
            if (message.healthMode != null && Object.hasOwnProperty.call(message, "healthMode"))
                writer.uint32(/* id 12, wireType 0 =*/96).int32(message.healthMode);
            if (message.serialReopenCount != null && Object.hasOwnProperty.call(message, "serialReopenCount"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.serialReopenCount);
            if (message.lastAttitudeMs != null && Object.hasOwnProperty.call(message, "lastAttitudeMs"))
                writer.uint32(/* id 14, wireType 0 =*/112).uint64(message.lastAttitudeMs);
            if (message.lastStatusMs != null && Object.hasOwnProperty.call(message, "lastStatusMs"))
                writer.uint32(/* id 15, wireType 0 =*/120).uint64(message.lastStatusMs);
            if (message.lastAnalogMs != null && Object.hasOwnProperty.call(message, "lastAnalogMs"))
                writer.uint32(/* id 16, wireType 0 =*/128).uint64(message.lastAnalogMs);
            if (message.attitudeFailures != null && Object.hasOwnProperty.call(message, "attitudeFailures"))
                writer.uint32(/* id 17, wireType 0 =*/136).uint32(message.attitudeFailures);
            if (message.statusFailures != null && Object.hasOwnProperty.call(message, "statusFailures"))
                writer.uint32(/* id 18, wireType 0 =*/144).uint32(message.statusFailures);
            if (message.analogFailures != null && Object.hasOwnProperty.call(message, "analogFailures"))
                writer.uint32(/* id 19, wireType 0 =*/152).uint32(message.analogFailures);
            if (message.capabilities != null && Object.hasOwnProperty.call(message, "capabilities"))
                $root.vectr.FCCapabilities.encode(message.capabilities, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified NodeStatus message, length delimited. Does not implicitly {@link vectr.NodeStatus.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vectr.NodeStatus
         * @static
         * @param {vectr.INodeStatus} message NodeStatus message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NodeStatus.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NodeStatus message from the specified reader or buffer.
         * @function decode
         * @memberof vectr.NodeStatus
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vectr.NodeStatus} NodeStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NodeStatus.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vectr.NodeStatus();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.nodeId = reader.string();
                        break;
                    }
                case 2: {
                        message.timestampMs = reader.uint64();
                        break;
                    }
                case 10: {
                        message.fcOk = reader.bool();
                        break;
                    }
                case 11: {
                        message.radioOk = reader.bool();
                        break;
                    }
                case 12: {
                        message.healthMode = reader.int32();
                        break;
                    }
                case 13: {
                        message.serialReopenCount = reader.uint32();
                        break;
                    }
                case 14: {
                        message.lastAttitudeMs = reader.uint64();
                        break;
                    }
                case 15: {
                        message.lastStatusMs = reader.uint64();
                        break;
                    }
                case 16: {
                        message.lastAnalogMs = reader.uint64();
                        break;
                    }
                case 17: {
                        message.attitudeFailures = reader.uint32();
                        break;
                    }
                case 18: {
                        message.statusFailures = reader.uint32();
                        break;
                    }
                case 19: {
                        message.analogFailures = reader.uint32();
                        break;
                    }
                case 20: {
                        message.capabilities = $root.vectr.FCCapabilities.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NodeStatus message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vectr.NodeStatus
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vectr.NodeStatus} NodeStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NodeStatus.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NodeStatus message.
         * @function verify
         * @memberof vectr.NodeStatus
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NodeStatus.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                if (!$util.isString(message.nodeId))
                    return "nodeId: string expected";
            if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                    return "timestampMs: integer|Long expected";
            if (message.fcOk != null && message.hasOwnProperty("fcOk"))
                if (typeof message.fcOk !== "boolean")
                    return "fcOk: boolean expected";
            if (message.radioOk != null && message.hasOwnProperty("radioOk"))
                if (typeof message.radioOk !== "boolean")
                    return "radioOk: boolean expected";
            if (message.healthMode != null && message.hasOwnProperty("healthMode"))
                switch (message.healthMode) {
                default:
                    return "healthMode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.serialReopenCount != null && message.hasOwnProperty("serialReopenCount"))
                if (!$util.isInteger(message.serialReopenCount))
                    return "serialReopenCount: integer expected";
            if (message.lastAttitudeMs != null && message.hasOwnProperty("lastAttitudeMs"))
                if (!$util.isInteger(message.lastAttitudeMs) && !(message.lastAttitudeMs && $util.isInteger(message.lastAttitudeMs.low) && $util.isInteger(message.lastAttitudeMs.high)))
                    return "lastAttitudeMs: integer|Long expected";
            if (message.lastStatusMs != null && message.hasOwnProperty("lastStatusMs"))
                if (!$util.isInteger(message.lastStatusMs) && !(message.lastStatusMs && $util.isInteger(message.lastStatusMs.low) && $util.isInteger(message.lastStatusMs.high)))
                    return "lastStatusMs: integer|Long expected";
            if (message.lastAnalogMs != null && message.hasOwnProperty("lastAnalogMs"))
                if (!$util.isInteger(message.lastAnalogMs) && !(message.lastAnalogMs && $util.isInteger(message.lastAnalogMs.low) && $util.isInteger(message.lastAnalogMs.high)))
                    return "lastAnalogMs: integer|Long expected";
            if (message.attitudeFailures != null && message.hasOwnProperty("attitudeFailures"))
                if (!$util.isInteger(message.attitudeFailures))
                    return "attitudeFailures: integer expected";
            if (message.statusFailures != null && message.hasOwnProperty("statusFailures"))
                if (!$util.isInteger(message.statusFailures))
                    return "statusFailures: integer expected";
            if (message.analogFailures != null && message.hasOwnProperty("analogFailures"))
                if (!$util.isInteger(message.analogFailures))
                    return "analogFailures: integer expected";
            if (message.capabilities != null && message.hasOwnProperty("capabilities")) {
                let error = $root.vectr.FCCapabilities.verify(message.capabilities);
                if (error)
                    return "capabilities." + error;
            }
            return null;
        };

        /**
         * Creates a NodeStatus message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vectr.NodeStatus
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vectr.NodeStatus} NodeStatus
         */
        NodeStatus.fromObject = function fromObject(object) {
            if (object instanceof $root.vectr.NodeStatus)
                return object;
            let message = new $root.vectr.NodeStatus();
            if (object.nodeId != null)
                message.nodeId = String(object.nodeId);
            if (object.timestampMs != null)
                if ($util.Long)
                    (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = true;
                else if (typeof object.timestampMs === "string")
                    message.timestampMs = parseInt(object.timestampMs, 10);
                else if (typeof object.timestampMs === "number")
                    message.timestampMs = object.timestampMs;
                else if (typeof object.timestampMs === "object")
                    message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber(true);
            if (object.fcOk != null)
                message.fcOk = Boolean(object.fcOk);
            if (object.radioOk != null)
                message.radioOk = Boolean(object.radioOk);
            switch (object.healthMode) {
            default:
                if (typeof object.healthMode === "number") {
                    message.healthMode = object.healthMode;
                    break;
                }
                break;
            case "NODE_HEALTH_MODE_UNSPECIFIED":
            case 0:
                message.healthMode = 0;
                break;
            case "NODE_HEALTH_MODE_NORMAL":
            case 1:
                message.healthMode = 1;
                break;
            case "NODE_HEALTH_MODE_DEGRADED":
            case 2:
                message.healthMode = 2;
                break;
            case "NODE_HEALTH_MODE_RECOVERING":
            case 3:
                message.healthMode = 3;
                break;
            }
            if (object.serialReopenCount != null)
                message.serialReopenCount = object.serialReopenCount >>> 0;
            if (object.lastAttitudeMs != null)
                if ($util.Long)
                    (message.lastAttitudeMs = $util.Long.fromValue(object.lastAttitudeMs)).unsigned = true;
                else if (typeof object.lastAttitudeMs === "string")
                    message.lastAttitudeMs = parseInt(object.lastAttitudeMs, 10);
                else if (typeof object.lastAttitudeMs === "number")
                    message.lastAttitudeMs = object.lastAttitudeMs;
                else if (typeof object.lastAttitudeMs === "object")
                    message.lastAttitudeMs = new $util.LongBits(object.lastAttitudeMs.low >>> 0, object.lastAttitudeMs.high >>> 0).toNumber(true);
            if (object.lastStatusMs != null)
                if ($util.Long)
                    (message.lastStatusMs = $util.Long.fromValue(object.lastStatusMs)).unsigned = true;
                else if (typeof object.lastStatusMs === "string")
                    message.lastStatusMs = parseInt(object.lastStatusMs, 10);
                else if (typeof object.lastStatusMs === "number")
                    message.lastStatusMs = object.lastStatusMs;
                else if (typeof object.lastStatusMs === "object")
                    message.lastStatusMs = new $util.LongBits(object.lastStatusMs.low >>> 0, object.lastStatusMs.high >>> 0).toNumber(true);
            if (object.lastAnalogMs != null)
                if ($util.Long)
                    (message.lastAnalogMs = $util.Long.fromValue(object.lastAnalogMs)).unsigned = true;
                else if (typeof object.lastAnalogMs === "string")
                    message.lastAnalogMs = parseInt(object.lastAnalogMs, 10);
                else if (typeof object.lastAnalogMs === "number")
                    message.lastAnalogMs = object.lastAnalogMs;
                else if (typeof object.lastAnalogMs === "object")
                    message.lastAnalogMs = new $util.LongBits(object.lastAnalogMs.low >>> 0, object.lastAnalogMs.high >>> 0).toNumber(true);
            if (object.attitudeFailures != null)
                message.attitudeFailures = object.attitudeFailures >>> 0;
            if (object.statusFailures != null)
                message.statusFailures = object.statusFailures >>> 0;
            if (object.analogFailures != null)
                message.analogFailures = object.analogFailures >>> 0;
            if (object.capabilities != null) {
                if (typeof object.capabilities !== "object")
                    throw TypeError(".vectr.NodeStatus.capabilities: object expected");
                message.capabilities = $root.vectr.FCCapabilities.fromObject(object.capabilities);
            }
            return message;
        };

        /**
         * Creates a plain object from a NodeStatus message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vectr.NodeStatus
         * @static
         * @param {vectr.NodeStatus} message NodeStatus
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NodeStatus.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.nodeId = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestampMs = options.longs === String ? "0" : 0;
                object.fcOk = false;
                object.radioOk = false;
                object.healthMode = options.enums === String ? "NODE_HEALTH_MODE_UNSPECIFIED" : 0;
                object.serialReopenCount = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.lastAttitudeMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastAttitudeMs = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.lastStatusMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastStatusMs = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.lastAnalogMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastAnalogMs = options.longs === String ? "0" : 0;
                object.attitudeFailures = 0;
                object.statusFailures = 0;
                object.analogFailures = 0;
                object.capabilities = null;
            }
            if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                object.nodeId = message.nodeId;
            if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                if (typeof message.timestampMs === "number")
                    object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                else
                    object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber(true) : message.timestampMs;
            if (message.fcOk != null && message.hasOwnProperty("fcOk"))
                object.fcOk = message.fcOk;
            if (message.radioOk != null && message.hasOwnProperty("radioOk"))
                object.radioOk = message.radioOk;
            if (message.healthMode != null && message.hasOwnProperty("healthMode"))
                object.healthMode = options.enums === String ? $root.vectr.NodeHealthMode[message.healthMode] === undefined ? message.healthMode : $root.vectr.NodeHealthMode[message.healthMode] : message.healthMode;
            if (message.serialReopenCount != null && message.hasOwnProperty("serialReopenCount"))
                object.serialReopenCount = message.serialReopenCount;
            if (message.lastAttitudeMs != null && message.hasOwnProperty("lastAttitudeMs"))
                if (typeof message.lastAttitudeMs === "number")
                    object.lastAttitudeMs = options.longs === String ? String(message.lastAttitudeMs) : message.lastAttitudeMs;
                else
                    object.lastAttitudeMs = options.longs === String ? $util.Long.prototype.toString.call(message.lastAttitudeMs) : options.longs === Number ? new $util.LongBits(message.lastAttitudeMs.low >>> 0, message.lastAttitudeMs.high >>> 0).toNumber(true) : message.lastAttitudeMs;
            if (message.lastStatusMs != null && message.hasOwnProperty("lastStatusMs"))
                if (typeof message.lastStatusMs === "number")
                    object.lastStatusMs = options.longs === String ? String(message.lastStatusMs) : message.lastStatusMs;
                else
                    object.lastStatusMs = options.longs === String ? $util.Long.prototype.toString.call(message.lastStatusMs) : options.longs === Number ? new $util.LongBits(message.lastStatusMs.low >>> 0, message.lastStatusMs.high >>> 0).toNumber(true) : message.lastStatusMs;
            if (message.lastAnalogMs != null && message.hasOwnProperty("lastAnalogMs"))
                if (typeof message.lastAnalogMs === "number")
                    object.lastAnalogMs = options.longs === String ? String(message.lastAnalogMs) : message.lastAnalogMs;
                else
                    object.lastAnalogMs = options.longs === String ? $util.Long.prototype.toString.call(message.lastAnalogMs) : options.longs === Number ? new $util.LongBits(message.lastAnalogMs.low >>> 0, message.lastAnalogMs.high >>> 0).toNumber(true) : message.lastAnalogMs;
            if (message.attitudeFailures != null && message.hasOwnProperty("attitudeFailures"))
                object.attitudeFailures = message.attitudeFailures;
            if (message.statusFailures != null && message.hasOwnProperty("statusFailures"))
                object.statusFailures = message.statusFailures;
            if (message.analogFailures != null && message.hasOwnProperty("analogFailures"))
                object.analogFailures = message.analogFailures;
            if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                object.capabilities = $root.vectr.FCCapabilities.toObject(message.capabilities, options);
            return object;
        };

        /**
         * Converts this NodeStatus to JSON.
         * @function toJSON
         * @memberof vectr.NodeStatus
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NodeStatus.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for NodeStatus
         * @function getTypeUrl
         * @memberof vectr.NodeStatus
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        NodeStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/vectr.NodeStatus";
        };

        return NodeStatus;
    })();

    return vectr;
})();

export { $root as default };
