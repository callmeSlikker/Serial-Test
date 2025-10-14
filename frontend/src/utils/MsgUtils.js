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

}
