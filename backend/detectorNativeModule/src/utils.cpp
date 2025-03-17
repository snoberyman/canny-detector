#include "utils.h"

// Helper function to convert cv::Mat to Base64
std::string MatToBase64(const cv::Mat &frame)
{
    std::vector<uchar> buf; // dynamic array of unsigned chars
    // std::vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 90}; // JPG quality
    cv::imencode(".jpg", frame, buf); // Encode and compress image to JPG, then store it in buf

    // Convert the encoded image buffer to Base64, using Base64Encode function
    return base64_encode(buf.data(), buf.size());
}

// Helper function that returns an array (vector) of available camera indexes
std::vector<int>
getAvailableCameraIndexes()
{
    std::vector<int> availableCameras;
    int index = 0;
    cv::VideoCapture tempCap;

    // Keep attempting camera indexes until cv::VideoCapture fails to open
    while (true)
    {
        tempCap.open(index); // Try to open the camera at the current index
        if (!tempCap.isOpened())
        {
            break; // No more cameras available, exit the loop
        }
        availableCameras.push_back(index); // Camera is available, add index to the list
        tempCap.release();                 // Release the camera after testing
        index++;                           // Increment to check the next camera index
    }

    return availableCameras; // Return the vector of available camera indexes
}