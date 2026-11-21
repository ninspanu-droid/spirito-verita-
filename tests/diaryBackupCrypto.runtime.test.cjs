const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'src', 'diary', 'diaryBackup.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const pbkdf2 = promisify(crypto.pbkdf2);
const utf8ToBytes = (value) => new TextEncoder().encode(value);
const bytesToUtf8 = (value) => new TextDecoder('utf-8', { fatal: true }).decode(value);
const nobleGcmAdapter = (key, nonce, aad) => ({
  encrypt(plaintext) {
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(nonce));
    cipher.setAAD(Buffer.from(aad));
    return Uint8Array.from(Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final(), cipher.getAuthTag()]));
  },
  decrypt(ciphertext) {
    const input = Buffer.from(ciphertext);
    const body = input.subarray(0, -16);
    const tag = input.subarray(-16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(nonce));
    decipher.setAAD(Buffer.from(aad));
    decipher.setAuthTag(tag);
    return Uint8Array.from(Buffer.concat([decipher.update(body), decipher.final()]));
  },
});
const exportsObject = {};
const sandbox = {
  exports: exportsObject,
  require(name) {
    if (name === '@noble/ciphers/aes') return { gcm: nobleGcmAdapter };
    if (name === '@noble/hashes/pbkdf2') return { pbkdf2Async: async (_hash, password, salt, opts) => Uint8Array.from(await pbkdf2(Buffer.from(password), Buffer.from(salt), opts.c, opts.dkLen, 'sha256')) };
    if (name === '@noble/hashes/sha2') return { sha256: (value) => value };
    if (name === '@noble/ciphers/utils') return { utf8ToBytes, bytesToUtf8 };
    if (name === 'base64-js') return {
      fromByteArray: (value) => Buffer.from(value).toString('base64'),
      toByteArray: (value) => Uint8Array.from(Buffer.from(value, 'base64')),
    };
    if (name === 'expo-crypto') return { getRandomBytesAsync: async (length) => Uint8Array.from(crypto.randomBytes(length)) };
    throw new Error(`Dipendenza inattesa nel test: ${name}`);
  },
  TextEncoder, TextDecoder, Uint8Array, Array, Set, Map, Number, Date, JSON, String, Error, Promise,
};
vm.runInNewContext(js, sandbox, { filename: sourcePath });
const { createEncryptedDiaryBackup, openEncryptedDiaryBackup } = exportsObject;
const sample = (id = 'note-1') => ({
  id, type: 'prayer', title: 'Preghiera privata', body: 'Testo da custodire',
  createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:05:00.000Z',
});
const passphrase = 'una-passphrase-lunga-e-sicura';

 test('round-trip del backup: AES-256-GCM e derivazione PBKDF2 riproducibili', async () => {
  const serialized = await createEncryptedDiaryBackup([sample(), sample('note-2')], passphrase);
  const restored = await openEncryptedDiaryBackup(serialized, passphrase);
  assert.deepEqual(JSON.parse(JSON.stringify(restored)), [sample(), sample('note-2')]);
  assert.doesNotMatch(serialized, /Preghiera privata|Testo da custodire/);
});

test('passphrase errata viene rifiutata senza restituire contenuto', async () => {
  const serialized = await createEncryptedDiaryBackup([sample()], passphrase);
  await assert.rejects(() => openEncryptedDiaryBackup(serialized, 'passphrase-completamente-errata'), /autenticare il backup/);
});

test('modifica del ciphertext viene rilevata dall autenticazione GCM', async () => {
  const envelope = JSON.parse(await createEncryptedDiaryBackup([sample()], passphrase));
  const bytes = Buffer.from(envelope.ciphertext, 'base64');
  bytes[0] ^= 0x01;
  envelope.ciphertext = bytes.toString('base64');
  await assert.rejects(() => openEncryptedDiaryBackup(JSON.stringify(envelope), passphrase), /autenticare il backup/);
});

test('parametri crittografici non supportati vengono rifiutati prima della decifratura', async () => {
  const envelope = JSON.parse(await createEncryptedDiaryBackup([sample()], passphrase));
  envelope.iterations = 1000;
  await assert.rejects(() => openEncryptedDiaryBackup(JSON.stringify(envelope), passphrase), /parametri crittografici/);
});

test('dimensioni errate di salt e nonce vengono rifiutate', async () => {
  const envelope = JSON.parse(await createEncryptedDiaryBackup([sample()], passphrase));
  envelope.nonce = Buffer.alloc(8).toString('base64');
  await assert.rejects(() => openEncryptedDiaryBackup(JSON.stringify(envelope), passphrase), /Dimensioni/);
});

test('payload autenticato ma semanticamente invalido viene rifiutato', async () => {
  const salt = crypto.randomBytes(16);
  const nonce = crypto.randomBytes(12);
  const passwordBytes = utf8ToBytes(passphrase);
  const key = await pbkdf2(Buffer.from(passwordBytes), salt, 600000, 32, 'sha256');
  const aad = utf8ToBytes('spirito-verita-diary-backup:v1:PBKDF2-HMAC-SHA256:600000');
  const plaintext = utf8ToBytes(JSON.stringify({ format: 'spirito-verita-diary-backup', version: 1, entries: [{ id: 'bad', type: 'unknown' }] }));
  const encrypted = nobleGcmAdapter(key, nonce, aad).encrypt(plaintext);
  const envelope = {
    format: 'spirito-verita-diary-backup', version: 1, kdf: 'PBKDF2-HMAC-SHA256', iterations: 600000,
    salt: salt.toString('base64'), nonce: nonce.toString('base64'), ciphertext: Buffer.from(encrypted).toString('base64'),
  };
  await assert.rejects(() => openEncryptedDiaryBackup(JSON.stringify(envelope), passphrase), /Annotazione del backup/);
});
