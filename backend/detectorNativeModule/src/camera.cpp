// camera.cpp
#include <napi.h>
#include <opencv2/opencv.hpp>
#include <thread>
#include <iostream>
// #include <base64.h>

static const std::string base64_chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

// encode image to Base64
std::string Base64Encode(const unsigned char *data, size_t len)
{
    std::string encoded;
    int val = 0, valb = -6;
    for (size_t i = 0; i < len; ++i)
    {
        val = (val << 8) + data[i];
        valb += 8;
        while (valb >= 0)
        {
            encoded.push_back(base64_chars[(val >> valb) & 0x3F]);
            valb -= 6;
        }
    }
    if (valb > -6)
    {
        encoded.push_back(base64_chars[((val << 8) >> (valb + 8)) & 0x3F]);
    }
    while (encoded.size() % 4)
    {
        encoded.push_back('=');
    }
    return encoded;
}

// Helper function to convert cv::Mat to Base64
std::string MatToBase64(const cv::Mat &frame)
{
    // Encode the image as JPEG
    std::vector<uchar> buf;
    cv::imencode(".jpg", frame, buf);

    // Convert the encoded image buffer to Base64
    return Base64Encode(buf.data(), buf.size());
}

Napi::FunctionReference callbackRef;     // Global reference to the Node.js callback
Napi::ThreadSafeFunction tsfn;           // Thread-safe function
std::atomic<bool> stopStreaming = false; // Use atomic for thread safety

// Camera streaming function
void StreamCamera()
{
    cv::VideoCapture cap(0, cv::CAP_DSHOW); // Open the default camera
    // cap.set(cv::CAP_PROP_FRAME_WIDTH, 640);
    // cap.set(cv::CAP_PROP_FRAME_HEIGHT, 480);

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

        std::cout << "Frame captured successfully!" << std::endl;

        // cv::resize(frame, frame, cv::Size(320, 240)); // Resize frame before encoding
        // cv::cvtColor(frame, frame, cv::COLOR_BGR2GRAY); //  Convert to grayscale (optional, but reduces size further)
        // Encode with lower JPEG quality
        std::vector<uchar> buf;
        std::vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 50}; // Reduce quality
        cv::imencode(".jpg", frame, buf, params);
        cv::Mat bufMat(buf);

        // Convert frame to Base64
        std::string base64Frame = MatToBase64(bufMat);
        std::cout << "Base64 Frame Size: " << base64Frame.length() << " bytes" << std::endl;

        // Call the JavaScript callback with the frame
        Napi::Env env = callbackRef.Env();
        // Use ThreadSafeFunction to call the JavaScript callback
        static int frameCounter = 0;
        if (frameCounter % 3 == 0)
        { // Only send every 3rd frame (reduces FPS)
            tsfn.NonBlockingCall([base64Frame](Napi::Env env, Napi::Function jsCallback)
                                 { jsCallback.Call({Napi::String::New(env, base64Frame)}); });
        }
        frameCounter++;
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
