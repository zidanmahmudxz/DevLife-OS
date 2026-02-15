
/**
 * Simple local encryption using Web Crypto API.
 * In a real production app, we would use a master password from the user.
 * For this demo, we use a derived key from a fixed salt or user session.
 */

const ENCRYPTION_KEY_NAME = 'devlife_master_key';

export const getOrCreateKey = async (): Promise<CryptoKey> => {
  const existingKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (existingKey) {
    // In a real app, you'd import this properly. For simplicity:
    // We recreate a key from a hardcoded phrase if not present.
  }
  
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode('devlife-os-super-secret-master-key'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('devlife-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (text: string): Promise<string> => {
  const key = await getOrCreateKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(text)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

export const decryptData = async (base64Data: string): Promise<string> => {
  try {
    const key = await getOrCreateKey();
    const combined = new Uint8Array(atob(base64Data).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return 'Decryption failed';
  }
};
