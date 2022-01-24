import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
  private static _iv = process.env.IMGAPI_IV;
  private static _key = process.env.IMGAPI_KEY;
  private static _algorithm = process.env.IMGAPI_ALGORITHM;

  static encrypt(text: string): string {
    // Creating Cipheriv with its parameter
    const cipher = crypto.createCipheriv(
      this._algorithm,
      Buffer.from(this._key),
      this._iv,
    );

    // Updating text
    let encrypted = cipher.update(text);

    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Returning encrypted data
    return encrypted.toString('hex');
  }

  static decrypt(text: string): string {
    const textParts = text.split(':');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      this._algorithm,
      Buffer.from(this._key),
      this._iv,
    );
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
}
