import aes from 'crypto-js/aes'
import utf8 from 'crypto-js/enc-utf8'

// Function to convert Base64 to URL-safe Base64
export const base64UrlEncode = (base64) => {
    return base64
        .replace(/\+/g, '-')  // Replace '+' with '-'
        .replace(/\//g, '_')  // Replace '/' with '_'
        .replace(/=+$/, '');  // Remove trailing '='
}

// Function to convert URL-safe Base64 back to Base64
export const base64UrlDecode = (urlBase64) => {
    urlBase64 = urlBase64
        .replace(/-/g, '+')  // Replace '-' with '+'
        .replace(/_/g, '/');  // Replace '_' with '/'
    
    // Add padding if necessary
    const padding = urlBase64.length % 4 === 0 ? '' : '='.repeat(4 - (urlBase64.length % 4));
    
    return urlBase64 + padding;
}

const testEncrypt = () => {
    // const data = aes.encrypt('1897626681', process.env.REACT_APP_SECRET_KEY).toString()
    // const urlSafeData = base64UrlEncode(data)
    // console.log("base64 :", data)
    // console.log("urlSafe :", urlSafeData)
    
    // const dec_urlSafe = base64UrlDecode(urlSafeData)
    // const dec_Data = aes.decrypt(dec_urlSafe, process.env.REACT_APP_SECRET_KEY)
    // const decryptedData = dec_Data.toString(utf8)
    // console.log("dec_urlSafe :", dec_urlSafe)
    // console.log("decrypted :", decryptedData)
}