// src/pkce.js

// Generates a random string
export function generateCodeVerifier(length = 128) {
  let array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// Encodes an ArrayBuffer into Base64 URL Safe string
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode.apply(null, buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generates the code challenge based on the code verifier
export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}
