// camera.cpp
#include <napi.h>
#include <opencv2/opencv.hpp>
#include <thread>
#include <iostream>
#include "base64_utils.h"

// Helper function to convert cv::Mat to Base64
std::string MatToBase64(const cv::Mat &frame)
{
    std::vector<uchar> buf;                                   // dynamic array of unsigned chars
    std::vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 90}; // JPG quality
    cv::imencode(".jpg", frame, buf, params);                 // Encode and compress image to JPG, then store it in buf

    // Convert the encoded image buffer to Base64, using Base64Encode function
    return Base64Encode(buf.data(), buf.size());
}

Napi::FunctionReference callbackRef;     // Global reference to the Node.js callback
Napi::ThreadSafeFunction tsfn;           // Thread-safe function
std::atomic<bool> stopStreaming = false; // Use atomic for thread safety

// Camera streaming function
void StreamCamera()
{
    cv::VideoCapture cap(0, cv::CAP_DSHOW); // Open the default camera
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

        // Call the JavaScript callback with the frame
        Napi::Env env = callbackRef.Env();
        // Use ThreadSafeFunction to call the JavaScript callback
        tsfn.NonBlockingCall([base64Frame](Napi::Env env, Napi::Function jsCallback)
                             { jsCallback.Call({Napi::String::New(env, base64Frame)}); });
    }

    cap.release(); // Clean up
}

// NAPI function to start streaming from the camera
Napi::String StartStreaming(const Napi::CallbackInfo &info)
{

    Napi::Env env = info.Env();

    // Save the callback passed from Node.js
    if (!info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Expected a function as the first argument").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }
    // Create the ThreadSafeFunction
    tsfn = Napi::ThreadSafeFunction::New(
        env,                          // JavaScript environment
        info[0].As<Napi::Function>(), // JavaScript callback
        "Camera Streaming Callback",  // Resource name
        0,                            // Unlimited queue
        1,                            // Only one thread will use this
        [](Napi::Env) {               // Finalizer to clean up resources
            std::cout << "ThreadSafeFunction finalized!" << std::endl;
        });
    // callbackRef = Napi::Persistent(info[0].As<Napi::Function>());

    stopStreaming = false;

    // Start the streaming in a separate thread
    std::thread streamThread(StreamCamera);
    streamThread.detach();

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
