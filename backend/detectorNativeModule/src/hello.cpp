#include <napi.h> // write native cpp addons for Node

// Hello World function
Napi::String HelloWorld(const Napi::CallbackInfo &info) // Opaque datatype that is passed to a callback function
{
    Napi::Env env = info.Env();                                    // handle to Node environment
    return Napi::String::New(env, "Hello, World from C++ N-API!"); // construct a new JavaScript string, considering the environment context
}

Napi::Object Init(Napi::Env env, Napi::Object exports) //  Initializiation function: exposing functionality to JavaScript.
{
    // exporst is the object that will be used to store the functions or classes that will be exposed to JavaScript.
    exports.Set("helloWorld", Napi::Function::New(env, HelloWorld)); // helloworld JavaScript function
    return exports;
}

// Register the native module with Node
NODE_API_MODULE(addon, Init)
// addon: name of the module which will be used in JavaScript to access native code
// Init: defines which functions (like helloWorld) will be exposed to the JavaScript environment.
