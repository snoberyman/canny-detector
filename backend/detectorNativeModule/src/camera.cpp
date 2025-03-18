#include <iostream>
#include <napi.h>
#include <opencv2/opencv.hpp>
#include <thread>
#include <memory>
#include <mutex>
#include <atomic>
#include <vector>
#include <queue>
#include <condition_variable>
#include "utils.h"

class Camera : public Napi::ObjectWrap<Camera>
{
private:
    std::atomic<bool> streaming = false;       // Use atomic for thread safety (ensures no race conditions occur, if multiple threads modify the variable)
    Napi::ThreadSafeFunction tsfn;             // Thread-safe function: provides APIs for threads to communicate with the addon's main thread to invoke JavaScript functions on their behalf.
    std::unique_ptr<std::thread> streamThread; // Worker thread
    cv::VideoCapture cap;                      // Open the camera
    std::queue<cv::Mat> frameQueue;            // queue that stores the frames captured
    std::condition_variable queueCond;         // used for thread synchronization. Notifies the processing threads when new frame is avilable
    std::mutex cap_mutex;                      // Mutex to protect access to `cap`
    std::mutex queue_mutex;                    // Mutex to protect access to `frameQueue`
    std::mutex params_mutex;                   // Mutex to protect access to `parameters`

    int selectedAlgorithm = 0;
    int lowThreshold = 100;  // canny low threshold (Weak edge threshold)
    int highThreshold = 200; // canny high threshold (Strong edge threshold)
    bool L2gradient = false; // Use Euclidean norm for gradient
    int ksize = 3;
    int delta = 0;

    /**
     * @brief  Responsible for capturing frames from camera based on camera index parameter.
     *         Once a frame is captured, it is added to a frame queue, then this thread notifies waiting processing threads.
     *
     * @param  env    JS environment variable
     * @param  index  the selected camera index
     * @return void
     *
     */
    void CaptureFrames(Napi::Env *env, int index)
    {
        {
            std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to `cap`

#ifdef _WIN32
            cap.open(index, cv::CAP_DSHOW); // Windows (DirectShow)
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
            cv::Mat edges;
            {
                std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to `cap`
                cap >> frame;                                // Capture a frame from the camera
            }

            if (frame.empty())
                continue;

            // Push frame into queue
            {
                std::lock_guard<std::mutex> lock(queue_mutex);
                frameQueue.push(frame);
            }
            queueCond.notify_one(); // wake up on waiting thread
        }
    }

    /**
     * @brief  Responsible for processing captured frames and streaming them to Electrons' node main process.
     *         Uses a thread safe function to send each frame as base64 string, through a non-blocking JS callback approach.
     *
     * @param  none
     * @return void
     *
     */
    void ProcessFrames()
    {
        while (streaming)
        {
            cv::Mat frame;
            {
                std::unique_lock<std::mutex> lock(queue_mutex);
                queueCond.wait(lock, [this]
                               { return !frameQueue.empty() || !streaming; }); // waits for another thread to call queueCond.notify_one() to wake up, then check the conditions after waking up

                if (!streaming)
                    return;

                frame = frameQueue.front(); // retrieve the next frame from frameQueue
                frameQueue.pop();           // Remove the next frame from the queue
            }

            // Process Frame
            cv::Mat edges;
            int localLowThreshold;
            int localHighThreshold;
            bool localL2gradient;
            int localKsize;
            int localDelta;
            /********************************************************************************** */
            { // Critical section (locked)
                std::lock_guard<std::mutex> lock(params_mutex);
                localLowThreshold = lowThreshold;
                localHighThreshold = highThreshold;
                localL2gradient = L2gradient;
                localKsize = ksize;
                localDelta = delta;

                if (selectedAlgorithm == 0) // Canny
                {
                    cv::Mat gray_frame;
                    cv::cvtColor(frame, gray_frame, cv::COLOR_BGR2GRAY);
                    cv::Canny(gray_frame, edges, localLowThreshold, localHighThreshold, 3, localL2gradient);
                }
                else if (selectedAlgorithm == 1) // Sobel
                {
                    cv::Mat grad_x, grad_y;
                    cv::Sobel(frame, grad_x, CV_8U, 1, 0, localKsize, 1.0, localDelta);
                    cv::Sobel(frame, grad_y, CV_8U, 0, 1, localKsize, 1.0, localDelta);
                    cv::addWeighted(grad_x, 0.5, grad_y, 0.5, 0, edges);
                }
                else if (selectedAlgorithm == 2) // Laplacian
                {
                    cv::Laplacian(frame, edges, CV_8U, localKsize, 1.0, localDelta);
                }
            }
            /********************************************************************************** */
            // Send to JavaScript
            std::string base64Frame = MatToBase64(edges);
            tsfn.NonBlockingCall([base64Frame](Napi::Env env, Napi::Function jsCallback)
                                 { jsCallback.Call({Napi::String::New(env, base64Frame)}); });
        }
    }

public:
    // class constructor. Objects wrapped with Napi object
    Camera::Camera(const Napi::CallbackInfo &info)
        : Napi::ObjectWrap<Camera>(info)
    {
    }

    /**
     * @brief  Responsible for initializing and starting the camera stream
     *
     * @param  info    JavaScript callback function, recieved from Electrons' node main process.
     *
     * @return string  return back a message indicating the status
     *
     */
    // NAPI function to start streaming from the camera
    Napi::Value Camera::StartStreaming(const Napi::CallbackInfo &info)
    {
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
        // Create the ThreadSafeFunction
        tsfn = Napi::ThreadSafeFunction::New( // safely call a JavaScript function from the cpp thread to run in the background, without blocking the main (node) thread
            env,                              // JavaScript environment
            info[0].As<Napi::Function>(),     // JavaScript callback
            "Camera Streaming Callback",      // Resource name
            0,                                // Unlimited queue
            1,                                // Only one thread will use this function
            [this](Napi::Env) {               // Finalizer to clean up resources
                streaming = false;            // make sure streaming is set to false when finalizing the thread
                std::cout << "ThreadSafeFunction finalized!" << streaming << std::endl;
            });

        int index = info[1].As<Napi::Number>().Int32Value(); // get camera index passed through the callback
        streaming = true;
        // Start the streaming thread (1 worker)
        streamThread = std::make_unique<std::thread>(&Camera::CaptureFrames, this, &env, index);

        // Start processing threads (2 workers)
        for (int i = 0; i < 2; i++)
        {
            // std::thread(ProcessFrames).detach();
            auto thread_ptr = std::make_shared<std::thread>(&Camera::ProcessFrames, this); // shared pointer
            thread_ptr->detach();                                                          // Detaching the thread pointed to by thread_ptr
        }
        return Napi::String::New(env, "Streaming frames started!");
    }

    /**
     * @brief  Responsible for stopping the camera stream and releasing the worker thread
     *
     * @param  info.Env() JS environment variable
     * @param  info       JavaScript callback function, recieved from Electrons' node main process.
     *
     * @return string     return back a message indicating the status
     *
     */
    Napi::Value Camera::StopStreaming(const Napi::CallbackInfo &info)
    {
        std::cout << "stop cout: " << streaming;
        Napi::Env env = info.Env();
        std::queue<cv::Mat> empty;

        if (!streaming)
            return Napi::String::New(env, "Streaming is not running!");
        streaming = false;
        if (streamThread && streamThread->joinable())
            streamThread->join(); // Wait for the worker thread to finish

        {
            std::lock_guard<std::mutex> lock(cap_mutex); // Lock access to `cap`
            if (cap.isOpened())
            {
                cap.release(); // Release the camera
            }
        }
        std::swap(frameQueue, empty); // empt frames queue
        tsfn.Release();               // release threadsafe function

        return Napi::String::New(env, "Streaming stopped! Worker thread is released.");
    }

    /**
     * @brief  Responsible for getting indexes of avaialble cameras
     *
     * @param  info.Env() JS environment variable
     *
     * @return Array      return an array of integers for camera indexes
     *
     */
    Napi::Value Camera::GetAvailableCameraIndexes(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        std::vector<int> cameraIndexes = getAvailableCameraIndexes(); // Fetch available cameras
        Napi::Array result = Napi::Array::New(env, cameraIndexes.size());

        for (size_t i = 0; i < cameraIndexes.size(); i++)
        {
            result[i] = Napi::Number::New(env, cameraIndexes[i]); // Fill the result array with camera indexes
        }

        return result;
    }

    /**
     * @brief  Responsible for updating selected algorithm index
     *
     * @param  info.Env() JS environment variable
     * @param  info[1]    holds the algorithm's index selected from the front end
     *
     * @return String     return message
     *
     */
    Napi::Value Camera::SelectAlgorithm(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        selectedAlgorithm = info[1].As<Napi::Number>().Int32Value();

        return Napi::String::New(env, "Algorithm selected!"); // Return the array of available indexes
    }

    /**
     * @brief  Responsible for updating algorithms parameters
     *
     * @param  info.Env() JS environment variable
     * @param  info[1]    Canny low threshold: any pixels below this value (gradient magnitude) are discarded (not edges)
     * @param  info[2]    Canny high threshold:  any pixels with above this value are considered strong edges.   (edges between thresholds are weaker edges)
     * @param  info[3]    Kernel size: the size of the Gaussian blurring filter. Smaller values capture fine edges, and higher values produce thicker edges.
     * @param  info[4]    delta: Shifts gradient values
     *
     * @return String     return message
     *
     */
    Napi::Value Camera::SetAlgorithmsParams(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        {
            std::lock_guard<std::mutex> lock(params_mutex);

            lowThreshold = info[1].As<Napi::Number>().Int32Value();
            highThreshold = info[2].As<Napi::Number>().Int32Value();
            L2gradient = info[3].As<Napi::Boolean>();
            ksize = info[4].As<Napi::Number>().Int32Value();
            delta = info[5].As<Napi::Number>().Int32Value();
        }

        return Napi::String::New(env, "Algorithm controlls are set!"); // Return the array of available indexes
    }

    /**
     * @brief  Responsible for initializing and exporting the Camera class
     *
     * @param  env       JS environment variable
     * @param  exports   the object used to the class to JavaScript
     *
     * @return Object     return exports
     *
     */
    static Napi::Object Camera::Init(Napi::Env env, Napi::Object exports)
    {
        // DefineClass method defines a new JavaScript class with corresponding methods, to be pass later on to the exports object
        Napi::Function func = DefineClass(env, "Camera", {InstanceMethod("startStreaming", &Camera::StartStreaming), InstanceMethod("stopStreaming", &Camera::StopStreaming), InstanceMethod("selectAlgorithm", &Camera::SelectAlgorithm), InstanceMethod("setAlgorithmsParams", &Camera::SetAlgorithmsParams), InstanceMethod("getAvailableCameraIndexes", &Camera::GetAvailableCameraIndexes)});

        Napi::FunctionReference *constructor = new Napi::FunctionReference(); // reference to the class constructor
        *constructor = Napi::Persistent(func);                                // keep the constructor alive (not garbage collected by JavaScript)
        env.SetInstanceData<Napi::FunctionReference>(constructor);            // stores the persistent constructor func in the environment as instance data

        exports.Set("Camera", func); // adds the Camera class constructor to exports objects. Makes the Camera class available for use in JavaScript code.
        return exports;
    }
};

// Initialize native add-on module
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    Camera::Init(env, exports); // initialize the Camera class and add it to the exports object.
    return exports;
}

NODE_API_MODULE(addon, Init) // Export the module
