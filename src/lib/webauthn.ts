export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

export function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function toCreationOptions(serverOptions: Record<string, unknown>): PublicKeyCredentialCreationOptions {
  const opts = structuredClone(serverOptions) as Record<string, unknown>;
  if (typeof opts.challenge === "string") {
    (opts as { challenge: ArrayBuffer }).challenge = base64urlToBuffer(opts.challenge);
  }
  const user = opts.user as Record<string, unknown> | undefined;
  if (user && typeof user.id === "string") {
    user.id = base64urlToBuffer(user.id);
  }
  const exclude = opts.excludeCredentials as Array<Record<string, unknown>> | undefined;
  if (exclude) {
    for (const c of exclude) {
      if (typeof c.id === "string") { c.id = base64urlToBuffer(c.id); }
    }
  }
  return opts as unknown as PublicKeyCredentialCreationOptions;
}

export function toRequestOptions(serverOptions: Record<string, unknown>): PublicKeyCredentialRequestOptions {
  const opts = structuredClone(serverOptions) as Record<string, unknown>;
  if (typeof opts.challenge === "string") {
    (opts as { challenge: ArrayBuffer }).challenge = base64urlToBuffer(opts.challenge);
  }
  const allow = opts.allowCredentials as Array<Record<string, unknown>> | undefined;
  if (allow) {
    for (const c of allow) {
      if (typeof c.id === "string") { c.id = base64urlToBuffer(c.id); }
    }
  }
  return opts as unknown as PublicKeyCredentialRequestOptions;
}

export function serializeRegistration(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64url(response.attestationObject),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
    },
  };
}

export function serializeAuthentication(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bufferToBase64url(response.authenticatorData),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    },
  };
}
