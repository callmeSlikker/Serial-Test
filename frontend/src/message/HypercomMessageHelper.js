// const msgUtils = require('./MsgUtils');
import { MsgUtils } from './MsgUtils';
import { Buffer } from 'buffer';

export class HypercomMessageHelper {
  static STX = 0x02;
  static ETX = 0x03;
  static FIELD_SEPARATOR = 0x1C;


  static build(msg) {
    const headerBuf = Buffer.from(msg.header.padEnd(12, ' '), 'ascii');
    const transBuf = Buffer.from(msg.transactionCode.padStart(2, '0'), 'ascii');
    const respBuf = Buffer.from(msg.responseCode.padStart(2, '0'), 'ascii');
    const moreBuf = Buffer.from(msg.moreIndicator || '0', 'ascii');
    const fsBuf = Buffer.from([this.FIELD_SEPARATOR]);

    // Build TLV fields (tag + len BCD + value + FS)
    const fieldChunks = [];
    for (const [tag, value] of Object.entries(msg.fields || {})) {
      const tagBuf = Buffer.from(tag.padStart(2, '0'), 'ascii');
      const valBuf = Buffer.from(value, 'utf8');
      const lenBuf = MsgUtils.toBCD(valBuf.length, 2); // 2 bytes BCD
      const sepBuf = Buffer.from([this.FIELD_SEPARATOR]);
      fieldChunks.push(tagBuf, lenBuf, valBuf, sepBuf);
    }

    const fieldBuf = Buffer.concat(fieldChunks);
    const bodyBuf = Buffer.concat([headerBuf, transBuf, respBuf, moreBuf, fsBuf, fieldBuf]);

    const etxBuf = Buffer.from([this.ETX]);

    // Length = body + ETX
    const lenBCD = MsgUtils.toBCD(bodyBuf.length, 2); // 2 bytes BCD

    // CRC = XOR ของทุก byteหลัง Length ถึงก่อน ETX
    //const crcBuf = Buffer.from([this.calcCRC(bodyBuf)]);

    // CRC = XOR ของทุก byteหลัง STX ถึง ETX
    const crcBuf = Buffer.from([this.calcCRC(Buffer.concat([lenBCD, bodyBuf, etxBuf]))]);

    return Buffer.concat([Buffer.from([this.STX]), lenBCD, bodyBuf, etxBuf, crcBuf]);
  }

  static parse(buffer) {
    if (buffer[0] !== this.STX) throw new Error('Invalid STX');

    // Read Length in BCD
    const totalLen = MsgUtils.fromBCD(buffer.subarray(1, 3)); // 2 bytes BCD
    const etxPos = 3 + totalLen;

    if (buffer[etxPos] !== this.ETX) throw new Error('Missing ETX');

    const crc = buffer[etxPos + 1];
    // const crcCalc = this.calcCRC(buffer.subarray(3, etxPos)); // after Length to before ETX

    const crcCalc = this.calcCRC(buffer.subarray(1, etxPos + 1)); // offset 1 = หลัง STX

    if (crc !== crcCalc) throw new Error(`CRC mismatch (expected ${crcCalc}, got ${crc})`);

    const body = buffer.subarray(3, etxPos);
    let offset = 0;

    const header = body.subarray(offset, offset + 12).toString('ascii').trim();
    offset += 12;

    const transactionCode = body.subarray(offset, offset + 2).toString('ascii');
    offset += 2;

    const responseCode = body.subarray(offset, offset + 2).toString('ascii');
    offset += 2;

    const moreIndicator = body.subarray(offset, offset + 1).toString('ascii');
    offset += 1;

    if (body[offset] !== this.FIELD_SEPARATOR) throw new Error('Missing field separator after header');
    offset += 1;

    const fields = {};
    while (offset < body.length) {
      const tag = body.subarray(offset, offset + 2).toString('ascii');
      offset += 2;

      const len = MsgUtils.fromBCD(body.subarray(offset, offset + 2)); // 2 bytes BCD
      offset += 2;

      const value = body.subarray(offset, offset + len).toString('utf8');
      offset += len;

      if (body[offset] !== this.FIELD_SEPARATOR) break;
      offset += 1;

      fields[tag] = value;
    }

    return { header, transactionCode, responseCode, moreIndicator, fields, crc };
  }

  static getTagList(buffer) {
    // ตรวจสอบ STX และ ETX
    if (buffer[0] !== this.STX) throw new Error('Invalid STX');
    const totalLen = MsgUtils.fromBCD(buffer.subarray(1, 3));
    const etxPos = 3 + totalLen;
    if (buffer[etxPos] !== this.ETX) throw new Error('Missing ETX');

    // ดึงส่วน body (หลัง length ถึงก่อน ETX)
    const body = buffer.subarray(3, etxPos);
    let offset = 0;

    // ข้าม header 12 + Transaction 2 + Response 2 + MoreIndicator 1 + FieldSeparator 1
    offset += 12 + 2 + 2 + 1;
    if (body[offset] !== this.FIELD_SEPARATOR) throw new Error('Missing FS after header');
    offset += 1;

    const tags = [];

    while (offset < body.length) {
      const tag = body.subarray(offset, offset + 2).toString('ascii');
      offset += 2;

      const len = MsgUtils.fromBCD(body.subarray(offset, offset + 2));
      offset += 2;

      const valueBuf = body.subarray(offset, offset + len)
      const value = valueBuf.toString('utf8');
      offset += len;

      tags.push({ tag, length: len, value, raw: valueBuf });

      if (body[offset] === this.FIELD_SEPARATOR) offset += 1;
      else break;
    }

    return tags;
  }

  static getByTag(buffer, tagCode) {
    // ตรวจสอบ STX / ETX
    if (buffer[0] !== this.STX) throw new Error('Invalid STX');
    const totalLen = MsgUtils.fromBCD(buffer.subarray(1, 3));
    const etxPos = 3 + totalLen;
    if (buffer[etxPos] !== this.ETX) throw new Error('Missing ETX');

    const body = buffer.subarray(3, etxPos);
    let offset = 0;

    // ข้าม header + transactionCode + responseCode + moreIndicator + FS
    offset += 12 + 2 + 2 + 1;
    if (body[offset] !== this.FIELD_SEPARATOR) throw new Error('Missing field separator after header');
    offset += 1;

    // วนหา tag
    while (offset < body.length) {
      const tag = body.subarray(offset, offset + 2).toString('ascii');
      offset += 2;

      const len = MsgUtils.fromBCD(body.subarray(offset, offset + 2));
      offset += 2;

      const valueBuf = body.subarray(offset, offset + len);
      const value = valueBuf.toString('utf8');
      offset += len;

      if (body[offset] === this.FIELD_SEPARATOR) offset += 1;

      if (tag === tagCode) {
        return {
          tag,
          length: len,
          value,
          raw: valueBuf
        };
      }
    }

    return null; // ไม่พบ tag
  }


  static calcCRC(buffer) {
    let crc = 0x00;
    for (const b of buffer) crc ^= b;
    return crc;
  }
}

