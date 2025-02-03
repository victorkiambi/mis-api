const { encrypt, decrypt } = require('../encryption');

describe('Encryption Utility', () => {
  beforeAll(() => {
    // Ensure encryption key is set for tests
    process.env.ENCRYPTION_KEY = "2GulbbquYO699p/kbaWQTBH5fmSXK4iGfBOY9j3rTeM=";
  });

  it('should encrypt and decrypt a string correctly', () => {
    const originalText = '254712345678';
    const encrypted = encrypt(originalText);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(originalText);
  });

  it('should generate different ciphertexts for the same input', () => {
    const text = '254712345678';
    const encrypted1 = encrypt(text);
    const encrypted2 = encrypt(text);
    
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should handle non-string inputs', () => {
    const number = 254712345678;
    const encrypted = encrypt(number);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(number.toString());
  });

  it('should throw error for invalid encrypted data', () => {
    expect(() => {
      decrypt('invalid-encrypted-data');
    }).toThrow();
  });
}); 