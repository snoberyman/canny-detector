#ifndef CAMERA_H
#define CAMERA_H

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
    std::atomic<bool> streaming;
    Napi::ThreadSafeFunction tsfn;
    std::unique_ptr<std::thread> streamThread;
    cv::VideoCapture cap;
    std::queue<cv::Mat> frameQueue;
    std::condition_variable queueCond;
    std::mutex cap_mutex;
    std::mutex queue_mutex;
    std::mutex params_mutex;

    int selectedAlgorithm;
    int lowThreshold;
    int highThreshold;
    bool L2gradient;
    int ksize;
    int delta;

    void CaptureFrames(Napi::Env *env, int index);
    void ProcessFrames();

public:
    Camera(const Napi::CallbackInfo &info);
    Napi::Value StartStreaming(const Napi::CallbackInfo &info);
    Napi::Value StopStreaming(const Napi::CallbackInfo &info);
    Napi::Value GetAvailableCameraIndexes(const Napi::CallbackInfo &info);
    Napi::Value SelectAlgorithm(const Napi::CallbackInfo &info);
    Napi::Value SetAlgorithmsParams(const Napi::CallbackInfo &info);
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
};

#endif // CAMERA_H
