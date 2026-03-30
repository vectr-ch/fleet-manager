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
    const { url, creds } = getConfig();

    const encoder = new TextEncoder();
    const credsBytes = creds.startsWith("-----BEGIN")
      ? encoder.encode(creds)
      : await import("fs").then((fs) => fs.readFileSync(creds));

    const nc = await connect({
      servers: url,
      authenticator: credsAuthenticator(credsBytes),
      name: "vectr-fleet-manager",
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });

    connection = nc;
    connecting = null;
    console.log(`[nats] connected to ${url}`);
    return nc;
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
