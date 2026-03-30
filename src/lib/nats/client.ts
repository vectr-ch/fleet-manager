import { connect, credsAuthenticator, type NatsConnection } from "nats";

let connection: NatsConnection | null = null;
let connecting: Promise<NatsConnection> | null = null;

function getConfig() {
  const url = process.env.NATS_URL;
  const creds = process.env.NATS_CREDS;
  if (!url) throw new Error("NATS_URL environment variable is required");
  if (!creds) throw new Error("NATS_CREDS environment variable is required");
  return { url, creds };
}

export async function getNatsConnection(): Promise<NatsConnection> {
  if (connection && !connection.isClosed()) return connection;

  // Prevent multiple concurrent connection attempts
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      const { url, creds } = getConfig();

      // Railway stores multiline env vars with literal \n — normalize to real newlines
      const normalizedCreds = creds.includes("\\n")
        ? creds.replace(/\\n/g, "\n")
        : creds;

      const encoder = new TextEncoder();
      const credsBytes = normalizedCreds.startsWith("-----BEGIN")
        ? encoder.encode(normalizedCreds)
        : await import("fs").then((fs) => fs.readFileSync(normalizedCreds));

      console.log("[nats] connecting to", url);

      const nc = await connect({
        servers: url,
        authenticator: credsAuthenticator(credsBytes),
        name: "vectr-fleet-manager",
        maxReconnectAttempts: 5,
        reconnectTimeWait: 2000,
        timeout: 10000,
      });

      connection = nc;
      connecting = null;
      console.log(`[nats] connected to ${url}`);
      return nc;
    } catch (err) {
      connecting = null;
      console.error("[nats] connection failed:", err);
      throw err;
    }
  })();

  return connecting;
}

export async function closeNatsConnection(): Promise<void> {
  if (connection && !connection.isClosed()) {
    await connection.drain();
    connection = null;
    console.log("[nats] connection closed");
  }
}
