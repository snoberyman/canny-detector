// camera.cpp
#include <iostream>
#include <napi.h>
#include <opencv2/opencv.hpp>
#include <thread>
#include "base64_utils.h"

// Helper function to convert cv::Mat to Base64
std::string MatToBase64(const cv::Mat &frame)
{
    std::vector<uchar> buf; // dynamic array of unsigned chars
    // std::vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 90}; // JPG quality
    cv::imencode(".jpg", frame, buf); // Encode and compress image to JPG, then store it in buf

    // Convert the encoded image buffer to Base64, using Base64Encode function
    return Base64Encode(buf.data(), buf.size());
}

Napi::ThreadSafeFunction tsfn;           // Thread-safe function: provides APIs for threads to communicate with the addon's main thread to invoke JavaScript functions on their behalf.
std::atomic<bool> stopStreaming = false; // Use atomic for thread safety (ensures no race conditions occur, if multiple threads modify the variable)

// Camera streaming function
void StreamCamera(Napi::Env *env)
{

    cv::VideoCapture cap; // Open the default camera
#ifdef _WIN32
    cap.open(0, cv::CAP_DSHOW); // Windows (DirectShow)
#elif __APPLE__
    cap.open(0, cv::CAP_AVFOUNDATION); // macOS (AVFoundation)
#elif __linux__
    cap.open(0, cv::CAP_V4L2); // Linux (Video4Linux2)
#else
    cap.open(0, cv::CAP_ANY); // Use any available backend
#endif

    cap.set(cv::CAP_PROP_FRAME_WIDTH, 640);
    cap.set(cv::CAP_PROP_FRAME_HEIGHT, 480);

    if (!cap.isOpened())
    {
        std::cerr << "Error: Could not open the camera" << std::endl;
        return;
    }

    while (!stopStreaming)
    {
        cv::Mat frame;
        cap >> frame; // Capture a frame from the camera
        if (frame.empty())
        {
            std::cerr << "Error: Cannot grab a frame" << std::endl;
            continue;
        }
        // std::cout << "Frame captured successfully!" << std::endl;
        // Convert frame to Base64
        std::string base64Frame = MatToBase64(frame);

        // tsfn: ensures that calls from a background thread to the JavaScript callback function are safe (Node is single-threaded)
        tsfn.NonBlockingCall([base64Frame](Napi::Env env, Napi::Function jsCallback)
                             { jsCallback.Call({Napi::String::New(env, base64Frame)}); });
    }

    cap.release(); // Clean up and release the camera
}

// NAPI function to start streaming from the camera
Napi::String StartStreaming(const Napi::CallbackInfo &info)
{

    Napi::Env env = info.Env(); // JS runtime environment

    // check if JS functions is recieved
    if (!info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Expected a function as the first argument").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }
    // Create the ThreadSafeFunction
    tsfn = Napi::ThreadSafeFunction::New( // safely call a JavaScript function from the cpp thread to run in the background, without blocking the main (node) thread
        env,                              // JavaScript environment
        info[0].As<Napi::Function>(),     // JavaScript callback
        "Camera Streaming Callback",      // Resource name
        0,                                // Unlimited queue
        1,                                // Only one thread will use this function
        [](Napi::Env) {                   // Finalizer to clean up resources
            std::cout << "ThreadSafeFunction finalized!" << std::endl;
        });

    stopStreaming = false; // Reset and ensure any previous streaming operation is cleaned up.

    // Start the streaming in a separate thread
    std::thread streamThread(StreamCamera, &env); // Start a new thread to handle camera streaming
    streamThread.detach();                        // Detach the thread to run independently

    return Napi::String::New(env, "Streaming started!");
}

Napi::Value StopStreaming(const Napi::CallbackInfo &info)
{
    stopStreaming = true;
    return Napi::String::New(info.Env(), "Streaming stopped!");
}

// Define Init function for the module
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("startStreaming", Napi::Function::New(env, StartStreaming));
    return exports;
}

NODE_API_MODULE(addon, Init) // Export the module
