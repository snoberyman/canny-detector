// base64_utils.cpp
#include "base64_utils.h"

std::string Base64Encode(const unsigned char *data, size_t len) // Base64: represent binary data in text format (ASCII)
{
    std::string encoded;
    encoded.reserve(((len + 2) / 3) * 4); // Pre-allocate memory for efficiency

    size_t i = 0;
    while (i < len)
    {
        uint32_t triple = 0;
        int remaining = std::min(3, static_cast<int>(len - i));

        // Combine up to 3 bytes into a 24-bit integer
        for (int j = 0; j < remaining; ++j)
        {
            triple |= data[i + j] << ((2 - j) * 8);
        }

        // Encode the 24-bit integer into 4 Base64 characters
        for (int j = 0; j < 4; ++j)
        {
            if (j <= (remaining + 1))
            {
                encoded.push_back(base64_chars[(triple >> ((3 - j) * 6)) & 0x3F]);
            }
            else
            {
                encoded.push_back('='); // Padding for incomplete groups
            }
        }

        i += 3;
    }

    return encoded;
}
