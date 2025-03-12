// camera.cpp
#include <iostream>
#include <napi.h>
#include <opencv2/opencv.hpp>
#include <thread>
#include <mutex>
#include <atomic>
#include <vector>
#include "base64_utils.h"

Napi::ThreadSafeFunction tsfn;       // Thread-safe function: provides APIs for threads to communicate with the addon's main thread to invoke JavaScript functions on their behalf.
std::atomic<bool> streaming = false; // Use atomic for thread safety (ensures no race conditions occur, if multiple threads modify the variable)
cv::VideoCapture cap;                // Open the default camera
std::mutex cap_mutex;                // Mutex to protect access to `cap`
std::thread streamThread;            // Worker thread

// Helper function that returns an array (vector) of available camera indexes
std::vector<int> getAvailableCameraIndexes()
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

// Helper function to convert cv::Mat to Base64
std::string MatToBase64(const cv::Mat &frame)
{
    std::vector<uchar> buf; // dynamic array of unsigned chars
    // std::vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 90}; // JPG quality
    cv::imencode(".jpg", frame, buf); // Encode and compress image to JPG, then store it in buf

    // Convert the encoded image buffer to Base64, using Base64Encode function
    return base64_encode(buf.data(), buf.size());
}

/**
 * @brief  Responsible for streaming frames to Electrons' node main process.
 *         Uses a thread safe function to send each frame as base64 string, through a non-blocking JS callback approach.
 *
 * @param  env   JS environment variable
 * @return void
 *
 */
void StreamCamera(Napi::Env *env) // , int index
{
    {
        std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to `cap`

        // int cameraIndex = getAvailableCameraIndex();

#ifdef _WIN32
        cap.open(0, cv::CAP_DSHOW); // Windows (DirectShow)
#elif __APPLE__
        cap.open(index, cv::CAP_AVFOUNDATION); // macOS (AVFoundation)
#elif __linux__
        cap.open(index, cv::CAP_V4L2); // Linux (Video4Linux2)
#else
        cap.open(index, cv::CAP_ANY); // Use any available backend
#endif

        cap.set(cv::CAP_PROP_FRAME_WIDTH, 640);
        cap.set(cv::CAP_PROP_FRAME_HEIGHT, 480);

        if (!cap.isOpened())
        {
            std::cerr << "Error: Could not open the camera" << std::endl;
            return;
        }
    }

    while (streaming)
    {
        cv::Mat frame;
        {
            std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to `cap`
            cap >> frame;
        }
        // Capture a frame from the camera
        if (frame.empty())
        {
            std::cerr << "Error: Cannot grab a frame" << std::endl;
            continue;
        }
        // Convert frame to Base64
        std::string base64Frame = MatToBase64(frame);
        // tsfn: ensures that calls from a background thread to the JavaScript callback function are safe (Node is single-threaded)
        tsfn.NonBlockingCall([base64Frame](Napi::Env env, Napi::Function jsCallback)
                             { jsCallback.Call({Napi::String::New(env, base64Frame)}); });
    }

    {
        std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to cap
        cap.release();                               // Release the camera
    }

    std::cout << "Worker thread stopped and cleaned up." << std::endl;
}

/**
 * @brief  Responsible for initializing and starting the camera stream
 *
 * @param  info    JavaScript callback function, recieved from Electrons' node main process.
 * @return string  return back a message indicating the status
 *
 */
// NAPI function to start streaming from the camera
Napi::String StartStreaming(const Napi::CallbackInfo &info)
{
    std::cout << "start cout: " << streaming;
    Napi::Env env = info.Env(); // JS runtime environment

    if (streaming)
    {
        return Napi::String::New(env, "Streaming is already running!");
    }
    // check if JS functions is recieved
    if (!info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Expected a function as the first argument").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }
    // Reset and ensure any previous streaming operation is cleaned up.
    // Create the ThreadSafeFunction
    tsfn = Napi::ThreadSafeFunction::New( // safely call a JavaScript function from the cpp thread to run in the background, without blocking the main (node) thread
        env,                              // JavaScript environment
        info[0].As<Napi::Function>(),     // JavaScript callback
        "Camera Streaming Callback",      // Resource name
        0,                                // Unlimited queue
        1,                                // Only one thread will use this function
        [](Napi::Env) {                   // Finalizer to clean up resources
            streaming = false;            // make sure streaming is set to false when finalizing the thread
            std::cout << "ThreadSafeFunction finalized!" << streaming << std::endl;
        });

    // int index = info[1].As<Napi::Number>().Int32Value();
    streaming = true;
    // Start the streaming in a separate thread
    streamThread = std::thread(StreamCamera, &env); // index
    // streamThread.detach();                        // Detach the thread to run independently

    return Napi::String::New(env, "Streaming started!");
}

/**
 * @brief  Responsible for stopping the camera stream and releasing the worker thread
 *
 * @param  info    JavaScript callback function, recieved from Electrons' node main process.
 * @return string  return back a message indicating the status
 *
 */
Napi::Value StopStreaming(const Napi::CallbackInfo &info)
{
    std::cout << "stop cout: " << streaming;
    Napi::Env env = info.Env();

    if (!streaming)
    {
        return Napi::String::New(env, "Streaming is not running!");
    }
    streaming = false;
    if (streamThread.joinable())
    {
        streamThread.join(); // Wait for the worker thread to finish
    }

    {
        std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to `cap`
        if (cap.isOpened())
        {
            cap.release(); // Release the camera
        }
    }

    tsfn.Release();

    return Napi::String::New(env, "Streaming stopped!");
}

/**
 * @brief  Responsible for getting indexes of avaialble cameras
 *
 * @param  none
 * @return Array   return an array of integers for camera indexes
 *
 */
Napi::Array GetAvailableCameraIndexes(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::vector<int> cameraIndexes = getAvailableCameraIndexes(); // Fetch available cameras
    Napi::Array result = Napi::Array::New(env, cameraIndexes.size());

    for (size_t i = 0; i < cameraIndexes.size(); i++)
    {
        result[i] = Napi::Number::New(env, cameraIndexes[i]); // Fill the array with camera indexes
    }

    return result; // Return the array of available indexes
}

Napi::Object Init(Napi::Env env, Napi::Object exports) // Define Init function for the module
{
    // Add exported functions to the exports object.
    exports.Set("startStreaming", Napi::Function::New(env, StartStreaming));
    exports.Set("stopStreaming", Napi::Function::New(env, StopStreaming));
    exports.Set("getAvailableCameraIndexes", Napi::Function::New(env, GetAvailableCameraIndexes));
    return exports;
}

NODE_API_MODULE(addon, Init) // Export the module
