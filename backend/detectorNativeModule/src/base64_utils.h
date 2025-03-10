#ifndef BASE64_UTILS_H
#define BASE64_UTILS_H

#include <string>

static const std::string base64_chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

// Declare the Base64Encode function
std::string Base64Encode(const unsigned char *data, size_t len);

#endif // BASE64_UTILS_H
