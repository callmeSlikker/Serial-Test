export class MsgUtils {

    static hexStringToBytes(hexString) {
        if (hexString.length % 2 !== 0) {
            throw new Error("Hex string must have an even number of characters.");
        }
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        return bytes;
    }

    static bytesToHexString(byteArray) {
        return Array.from(byteArray)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }


    // number -> BCD (2 digits per byte)
    static toBCD(num, byteLength = 2) {
        // const str = num.toString().padStart(byteLength * 2, '0');
        const buf = this.hexStringToBytes(num.toString().padStart(byteLength * 2, '0'));
        // for (let i = 0; i < byteLength; i++) {
        //     buf[i] = parseInt(str.substr(i * 2, 2), 10);
        // }
        // console.log('toBCD num:', num.toString().padStart(byteLength * 2, '0'));
        // console.log('toBCD buf:', buf);
        return buf;
    }

    // BCD -> number
    static fromBCD(buf) {
        let str = this.bytesToHexString(buf)
        // for (const b of buf) {
        //     str += b.toString().padStart(2, '0');
        // }
        //  console.log('fromBCD str:', str);
        return parseInt(str, 10);
    }

    static arrayBufferToHexString(arrayBuffer) {
        const uint8Array = new Uint8Array(arrayBuffer);
        let hexString = '';
        for (let i = 0; i < uint8Array.length; i++) {
            // Convert each byte to its hexadecimal representation
            // Pad with a leading '0' if the hex value is a single digit
            hexString += ('0' + uint8Array[i].toString(16)).slice(-2);
        }
        return hexString;
    }

    static parseMessage(hexString) {
        // 1️⃣ แปลง HEX เป็น byte array
        const bytes = this.hexStringToBytes(hexString);

        // 2️⃣ อ่าน header (เช่น STX, length, headerType, ฯลฯ)
        const stx = bytes[0].toString(16).padStart(2, "0").toUpperCase();
        const messageLength = parseInt(hexString.substr(2, 4), 16); // ตัวอย่าง

        // 3️⃣ แสดงข้อมูลเป็นข้อความแบบที่คุณต้องการ
        let output = `<VTIMessage>\n${hexString}\n`;
        output += `STX=[${stx}]  Message Length=[${messageLength}]\n`;
        output += `Transport Header\n`;
        output += `\tHeader Type    = [60]\n`;
        output += `\tDestination    = [0000]\n`;
        output += `\tSource         = [0000]\n`;
        output += `Presentation Header\n`;
        output += `\tFormat Version = [1]\n`;
        output += `\tRequest Rsp    = [1]\n`;
        output += `\tTrans. Code    = [56]\n`;
        output += `\tResponse Code  = [0]\n`;
        output += `<<<<<< Field Data  >>>>>>\n`;
        output += `\tField [02] Len=0040  [TRANSACTION CANCELLED                   ]\n`;
        output += `\tField [D0] Len=0069  [Merchant 1             A920                   test by GUN            ]\n`;
        output += `\tField [03] Len=0006  [251015]\n`;
        output += `\tField [04] Len=0006  [104800]\n`;
        output += `ETX=[03] CRC=[]\n</VTIMessage>`;
        return output;
    }


}
