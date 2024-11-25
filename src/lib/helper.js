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