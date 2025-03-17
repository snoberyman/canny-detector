#ifndef UTILS_H
#define UTILS_H

#include <opencv2/opencv.hpp>
#include <string>
#include "base64_utils.h"

// Function declaration for MatToBase64
std::string MatToBase64(const cv::Mat &frame);

// Function declaration for getAvailableCameraIndexes
std::vector<int>
getAvailableCameraIndexes();

#endif