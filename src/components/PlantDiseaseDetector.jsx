import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Upload, Camera, Loader2, CheckCircle2, XCircle } from 'lucide-react';

function CropDiseaseDetector() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedFile(file);
        setPrediction(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://plantdiseaseapi.vercel.app/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPrediction({
        class: response.data.class,
        confidence: response.data.confidence
      });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied',err);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setImagePreview(canvas.toDataURL());
        setIsCameraMode(false);

        // Stop video stream
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Crop Disease Detector</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isCameraMode ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              className="w-full rounded-lg shadow-md"
            />
            <canvas ref={canvasRef} className="hidden" />
            <motion.button
              type="button"
              onClick={captureImage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                bg-green-500 text-white p-3 rounded-full shadow-lg"
            >
              <Camera size={24} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="border-2 border-dashed rounded-lg p-6 text-center 
            transition-all duration-300 ease-in-out cursor-pointer
            hover:border-green-500 hover:bg-green-50"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg shadow-md object-cover"
                />
                <motion.button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <XCircle size={20} />
                </motion.button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="text-gray-400" size={48} />
                <p className="text-gray-600">Click to upload or drag and drop an image</p>
              </div>
            )}
          </motion.div>
        )}
        
        {!isCameraMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center space-x-4"
          >
            <motion.button
              type="button"
              onClick={startCamera}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-blue-500 text-white p-2 rounded-lg flex items-center"
            >
              <Camera className="mr-2" />
              Open Camera
            </motion.button>
          </motion.div>
        )}
        
        {!isCameraMode && (
          <motion.button 
            type="submit" 
            disabled={!selectedFile || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full p-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
              selectedFile && !isLoading 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Upload className="mr-2" />
            )}
            {isLoading ? 'Analyzing...' : 'Detect Disease'}
          </motion.button>
        )}
      </form>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-blue-500 flex items-center justify-center"
          >
            <Loader2 className="mr-2 animate-spin" />
            Processing image...
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mt-4 text-center text-red-500 flex items-center justify-center"
          >
            <XCircle className="mr-2" />
            {error}
          </motion.div>
        )}

        {prediction && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500"
          >
            <div className="flex items-center mb-2">
              <CheckCircle2 className="text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-green-800">Disease Detection Result</h2>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="font-medium">Disease:</span>
                <span className="text-green-700">{prediction.class}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Confidence:</span>
                <span className="text-green-700">{prediction.confidence}%</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CropDiseaseDetector;