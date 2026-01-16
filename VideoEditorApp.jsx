import React, { useState } from 'react';
import { Upload, Film, FileText, Loader, CheckCircle, AlertCircle, Play } from 'lucide-react';

export default function VideoEditorApp() {
  const [scriptFile, setScriptFile] = useState(null);
  const [videoFiles, setVideoFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScriptUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.fountain'))) {
      setScriptFile(file);
      setError(null);
    } else {
      setError('Please upload a valid script file (.txt or .fountain)');
    }
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type.startsWith('video/'));
    if (validFiles.length > 0) {
      setVideoFiles(prev => [...prev, ...validFiles]);
      setError(null);
    } else {
      setError('Please upload valid video files');
    }
  };

  const removeVideo = (index) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processVideo = async () => {
    if (!scriptFile || videoFiles.length === 0) {
      setError('Please upload both script and video files');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('script', scriptFile);
    videoFiles.forEach((file, index) => {
      formData.append('videos', file);
    });

    try {
      // Simulating progress for demo
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      // Replace with your actual backend URL
      const response = await fetch('http://localhost:8000/api/process', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const data = await response.json();
      setProgress(100);
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during processing');
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Film className="w-12 h-12 text-purple-300 mr-3" />
            <h1 className="text-4xl font-bold text-white">AI Video Editor</h1>
          </div>
          <p className="text-purple-200 text-lg">
            Upload your script and video scenes - AI will automatically arrange them
          </p>
        </div>

        {/* Main Upload Area */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Script Upload */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-300 mr-2" />
              <h2 className="text-xl font-semibold text-white">Script File</h2>
            </div>
            
            <label className="block">
              <div className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center cursor-pointer hover:border-purple-300 transition-colors">
                <Upload className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-white mb-2">Click to upload script</p>
                <p className="text-purple-300 text-sm">.txt or .fountain format</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.fountain"
                  onChange={handleScriptUpload}
                />
              </div>
            </label>

            {scriptFile && (
              <div className="mt-4 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                    <span className="text-white text-sm">{scriptFile.name}</span>
                  </div>
                  <button
                    onClick={() => setScriptFile(null)}
                    className="text-red-300 hover:text-red-200 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center mb-4">
              <Film className="w-6 h-6 text-purple-300 mr-2" />
              <h2 className="text-xl font-semibold text-white">Video Scenes</h2>
            </div>
            
            <label className="block">
              <div className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center cursor-pointer hover:border-purple-300 transition-colors">
                <Upload className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-white mb-2">Click to upload videos</p>
                <p className="text-purple-300 text-sm">Multiple files supported</p>
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                />
              </div>
            </label>

            {videoFiles.length > 0 && (
              <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
                {videoFiles.map((file, index) => (
                  <div key={index} className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{file.name}</p>
                        <p className="text-purple-300 text-xs">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeVideo(index)}
                        className="text-red-300 hover:text-red-200 text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-300 mr-2" />
              <p className="text-white">{error}</p>
            </div>
          </div>
        )}

        {/* Process Button */}
        <div className="text-center mb-6">
          <button
            onClick={processVideo}
            disabled={processing || !scriptFile || videoFiles.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {processing ? (
              <span className="flex items-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              'Process & Generate Video'
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 mb-6">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-white font-medium">Processing Progress</span>
              <span className="text-purple-300">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-purple-200 text-sm mt-3">
              {progress < 30 && 'Analyzing script...'}
              {progress >= 30 && progress < 60 && 'Processing video scenes...'}
              {progress >= 60 && progress < 90 && 'Matching scenes to script...'}
              {progress >= 90 && 'Finalizing video...'}
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Processing Complete!</h2>
            </div>
            
            <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-4 mb-4">
              <p className="text-white mb-2">Your video has been successfully processed.</p>
              <p className="text-purple-200 text-sm">
                Matched {result.matched_scenes || 0} scenes from your script.
              </p>
            </div>

            <div className="flex gap-4">
              <a
                href={result.download_url || '#'}
                download
                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                Download Final Video
              </a>
              <button
                onClick={() => {
                  setScriptFile(null);
                  setVideoFiles([]);
                  setResult(null);
                  setProgress(0);
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Start New Project
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-10">
          <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-purple-200 text-sm">
            <div>
              <p className="font-semibold text-white mb-1">1. Upload Script</p>
              <p>Upload your screenplay in .txt or .fountain format</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">2. Upload Scenes</p>
              <p>Add all raw video clips from your film</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">3. AI Processing</p>
              <p>Our AI matches and arranges scenes automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
