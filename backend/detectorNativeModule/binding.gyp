{
  "targets": [
    {
      "target_name": "camera",
      "sources": [
     
        "src/camera.cpp"
      ],
      'include_dirs': ["<!(node -p \"require('node-addon-api').include_dir\")", "C:/opencv/build/include"],
      "libraries": [
      "C:/opencv/build/x64/vc16/lib/opencv_world4110"  
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ], 
    }
  ]
}
