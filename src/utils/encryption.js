const crypto = require('crypto');

// Generate a consistent key from the environment variable
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  try {
    // Ensure text is a string
    const textToEncrypt = text.toString();
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(textToEncrypt, 'utf8'),
      cipher.final()
    ]);
    
    // Combine IV and encrypted data and return as base64
    return Buffer.concat([iv, encrypted]).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

function decrypt(text) {
  try {
    // Convert base64 string back to buffer
    const buffer = Buffer.from(text, 'base64');
    
    // Extract IV and encrypted data
    const iv = buffer.slice(0, IV_LENGTH);
    const encrypted = buffer.slice(IV_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Decrypt and return as string
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

module.exports = {
  encrypt,
  decrypt
};