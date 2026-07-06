import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

// Cifrado simétrico AES-256-GCM para datos sensibles en reposo
// (credenciales y contenido de archivos .env).
//
// Formato almacenado: base64(iv).base64(authTag).base64(ciphertext)
// - iv: 12 bytes aleatorios por operación (recomendado para GCM)
// - authTag: 16 bytes, garantiza integridad/autenticidad
//
// La clave maestra proviene de ENCRYPTION_KEY (32 bytes en base64).

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("Falta la variable de entorno ENCRYPTION_KEY");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY debe ser de 32 bytes codificados en base64 (AES-256)",
    );
  }
  return key;
}

/** Cifra texto plano y devuelve una cadena "iv.tag.ciphertext" en base64. */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

/** Descifra una cadena producida por encrypt(). Lanza si fue manipulada. */
export function decrypt(stored: string): string {
  const key = getKey();
  const parts = stored.split(".");
  if (parts.length !== 3) {
    throw new Error("Formato cifrado inválido");
  }
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
