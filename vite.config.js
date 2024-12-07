import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@tensorflow/tfjs-tflite'],
  },
  resolve: {
    alias: {
      // Add any necessary aliases if module resolution fails
      '@tensorflow/tfjs-tflite/dist/tflite_web_api_client': '@tensorflow/tfjs-tflite/dist/tflite_web_api_client.js'
    }
  }
});