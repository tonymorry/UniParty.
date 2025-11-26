
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api';
import { Ticket, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Search, ScanLine, Camera } from 'lucide-react';

const Scanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  
  // Ref for the scanner instance
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Initialize Scanner
  useEffect(() => {
    if (!user || user.role !== UserRole.ASSOCIAZIONE) {
        navigate('/');
        return;
    }

    // If we have a result or error, stop the scanner
    if (scanResult || error || loading) {
        if (isScannerActive) {
            stopScanner();
        }
        return;
    }

    // Start sequence
    let isMounted = true;

    const startScanner = async () => {
        // Wait for DOM element to be fully rendered
        await new Promise(r => setTimeout(r, 300));
        
        const element = document.getElementById('reader');
        if (!element || !isMounted) return;

        // If already instance exists, clean it first
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.clear();
            } catch(e) {
                // ignore clear error
            }
        }

        try {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                if (!isMounted) return;
                setCameraPermission(true);
                
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        disableFlip: false
                    },
                    (decodedText) => {
                        if (!isMounted) return;
                        handleValidation(decodedText);
                    },
                    (errorMessage) => {
                        // ignore frame errors
                    }
                );
                if (isMounted) setIsScannerActive(true);
            } else {
                if (isMounted) {
                    setCameraPermission(false);
                    setError("No cameras found on this device.");
                }
            }
        } catch (err) {
            console.error("Error starting scanner", err);
            if (isMounted) setCameraPermission(false);
        }
    };

    if (!isScannerActive) {
        startScanner();
    }

    return () => {
        isMounted = false;
        stopScanner();
    };
  }, [user, navigate, scanResult, error, loading]);

  const stopScanner = async () => {
      if (html5QrCodeRef.current) {
          try {
              if (html5QrCodeRef.current.isScanning) {
                  await html5QrCodeRef.current.stop();
              }
              html5QrCodeRef.current.clear();
          } catch (e) {
              console.error("Failed to stop scanner", e);
          }
          html5QrCodeRef.current = null;
          setIsScannerActive(false);
      }
  };

  const handleValidation = async (qrCodeId: string) => {
      // Stop scanner immediately upon detection
      await stopScanner();
      
      setLoading(true);
      setError(null);
      setScanResult(null);
      
      try {
          const ticket = await api.events.validateTicket(qrCodeId);
          
          const orgId = typeof ticket.event.organization === 'string' 
            ? ticket.event.organization 
            : ticket.event.organization._id;

          if (orgId !== user?._id) {
             setError("This ticket belongs to another association's event!");
             return;
          }

          setScanResult(ticket);
      } catch (err: any) {
          if (err.message === "INVALID_TICKET") {
              setError("Invalid Ticket. Code not found.");
          } else if (err.message === "ALREADY_USED") {
              setError("Ticket ALREADY USED! Entry denied.");
          } else if (err.message === "WRONG_EVENT_ORGANIZER") {
              setError("This ticket belongs to another association.");
          } else {
              setError("Error validating ticket.");
          }
      } finally {
          setLoading(false);
      }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(manualCode.trim()) {
          handleValidation(manualCode.trim());
      }
  };

  const resetScanner = () => {
      setScanResult(null);
      setError(null);
      setManualCode('');
      setLoading(false);
      setIsScannerActive(false); // This triggers useEffect to restart
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-indigo-900 shadow-lg flex justify-between items-center z-10">
          <h1 className="text-xl font-bold flex items-center">
              <ScanLine className="mr-2" /> Ticket Scanner
          </h1>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-200 hover:text-white">
              Exit
          </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          
          {/* CAMERA CONTAINER */}
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md relative">
                   <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500 relative aspect-square">
                        {/* Force height to prevent collapse */}
                        <div id="reader" className="w-full h-full" style={{ minHeight: '300px', height: '100%' }}></div>
                        
                        {/* Overlay Guide */}
                        <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none z-10">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-indigo-400 rounded-lg bg-transparent box-border"></div>
                        </div>
                   </div>
                   
                   {cameraPermission === false && (
                       <div className="mt-4 text-center text-red-300 bg-red-900/50 p-4 rounded-lg">
                           <Camera className="w-8 h-8 mx-auto mb-2" />
                           <p>Camera access denied or unavailable.</p>
                           <p className="text-sm">Please allow camera permissions in your browser settings or use manual entry below.</p>
                       </div>
                   )}
              </div>
          )}

          {/* LOADING STATE */}
          {loading && (
              <div