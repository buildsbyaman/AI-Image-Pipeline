/**
 * Cloudflare Worker — R2 Upload Validator
 * Intercepts PUT requests and enforces: allowed MIME types, 5 MB size cap, magic byte check.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// First-byte signatures per MIME type to detect Content-Type spoofing
const MAGIC_BYTES = {
  "image/jpeg": { offset: 0, bytes: [0xFF, 0xD8, 0xFF] },
  "image/png":  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  "image/webp": {
    offset: 0, bytes: [0x52, 0x49, 0x46, 0x46],          // "RIFF"
    secondaryOffset: 8, secondaryBytes: [0x57, 0x45, 0x42, 0x50], // "WEBP"
  },
};

function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function hasValidMagicBytes(bytes, mimeType) {
  const sig = MAGIC_BYTES[mimeType];
  if (!sig) return false;

  for (let i = 0; i < sig.bytes.length; i++) {
    if (bytes[sig.offset + i] !== sig.bytes[i]) return false;
  }

  if (sig.secondaryBytes) {
    for (let i = 0; i < sig.secondaryBytes.length; i++) {
      if (bytes[sig.secondaryOffset + i] !== sig.secondaryBytes[i]) return false;
    }
  }

  return true;
}

export default {
  async fetch(request, env, ctx) {
    // Only validate PUT requests; pass everything else through
    if (request.method !== "PUT") return fetch(request);

    const contentType = request.headers.get("Content-Type") || "";
    const mimeType = contentType.split(";")[0].trim().toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return errorResponse(`File type "${mimeType}" is not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(", ")}.`);
    }

    // Fast size check via Content-Length header before reading body
    const declaredSize = parseInt(request.headers.get("Content-Length") || "0", 10);
    if (declaredSize > MAX_FILE_SIZE) {
      return errorResponse(`File size ${(declaredSize / (1024 * 1024)).toFixed(2)} MB exceeds the 5 MB limit.`);
    }

    // Buffer body for magic byte inspection and exact size verification
    let bodyBuffer;
    try {
      bodyBuffer = await request.arrayBuffer();
    } catch {
      return errorResponse("Failed to read request body.");
    }

    if (bodyBuffer.byteLength > MAX_FILE_SIZE) {
      return errorResponse(`File size ${(bodyBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB exceeds the 5 MB limit.`);
    }

    if (bodyBuffer.byteLength < 12) {
      return errorResponse("File is too small to be a valid image.");
    }

    if (!hasValidMagicBytes(new Uint8Array(bodyBuffer, 0, 12), mimeType)) {
      return errorResponse(`File content does not match the declared Content-Type "${mimeType}".`);
    }

    // All checks passed — forward to R2
    return fetch(new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: bodyBuffer,
    }));
  },
};
