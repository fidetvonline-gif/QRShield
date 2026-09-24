import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Upload, Camera, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, Play, Square } from 'lucide-react';
import { ScanRecord } from '../types';
import { decodeQRImage } from '../utils/qrDecoder';
import { analyzeUrlClient } from '../utils/analyzer';
import jsQR from 'jsqr';

interface ScannerViewProps {
  onScanComplete: (record: ScanRecord) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onScanComplete }) => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check camera permissions or use Image Upload / Manual Input.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  // Frame scanning loop for camera
  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (cameraActive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            // QR found! Stop camera and analyze
            stopCamera();
            handleAnalyze(code.data);
            return;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };

    if (cameraActive) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive]);

  const handleAnalyze = async (qrData: string) => {
    if (!qrData.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData })
      });

      if (!res.ok) {
        throw new Error('Server scanning engine responded with error.');
      }

      const data: ScanRecord = await res.json();
      onScanComplete(data);
    } catch (err: any) {
      console.warn("Server scan API failed, using client-side fallback engine:", err);
      try {
        const localRecord = analyzeUrlClient(qrData);
        onScanComplete(localRecord);
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || 'An error occurred during analysis.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const decodedText = await decodeQRImage(file);
      await handleAnalyze(decodedText);
    } catch (err: any) {
      setError(err.message || 'Failed to decode QR code from image.');
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleAnalyze(manualInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          QR Code Analysis & Quishing Scanner
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Scan with your camera, upload an image file, or enter a URL directly to run heuristic analysis.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl space-x-1 shadow-md">
          <button
            onClick={() => setMode('camera')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'camera'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Scan</span>
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'upload'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'manual'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Direct Input</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-6 py-4 rounded-xl flex items-center justify-center space-x-3 text-sm animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="font-medium">Analyzing URL heuristics and threat intelligence feeds...</span>
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-6">
          <div className="relative max-w-md mx-auto aspect-square bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay Box */}
            <div className="absolute inset-0 border-2 border-cyan-500/40 m-12 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-cyan-400/80 animate-bounce absolute top-1/2"></div>
            </div>

            {!cameraActive && !loading && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6">
                <Camera className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
                <p className="text-sm font-medium text-slate-300 mb-4">Camera feed is paused or unavailable</p>
                <button
                  onClick={startCamera}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  Start Camera
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Position the QR code within the viewfinder. QRShield will automatically detect and analyze the embedded destination URL.
          </p>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
          <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 transition-all group block">
            <div className="p-4 rounded-full bg-slate-800 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <span className="text-base font-semibold text-white mb-1">
              Drop QR code image here, or browse
            </span>
            <span className="text-xs text-slate-400 mb-4">
              Supports PNG, JPG, JPEG, WEBP
            </span>
            <span className="bg-slate-800 group-hover:bg-cyan-600 text-slate-200 group-hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              Select Image File
            </span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Manual / Direct Input Mode */}
      {mode === 'manual' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter QR Destination URL or Encoded Text
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. https://paypa1-account-security.com/signin"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={loading || !manualInput.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center space-x-2 transition-all shrink-0"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Tip: You can test lookalike phishing domains, IP addresses, or safe URLs to evaluate heuristic scoring.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};
