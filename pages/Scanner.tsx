import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import { Ticket, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Search, ScanLine } from 'lucide-react';

const Scanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Ref to track if scanner is currently rendered to prevent duplicates
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== UserRole.ASSOCIAZIONE) {
        navigate('/');
        return;
    }

    // Only render scanner if we are NOT showing a result
    if (scanResult || error || loading) {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        return;
    }

    // Delay initialization slightly to ensure DOM is ready
    const timer = setTimeout(() => {
        if (!scannerWrapperRef.current) return;
        
        // If already initialized, do nothing
        if (scannerRef.current) return;

        // Clear previous content just in case
        scannerWrapperRef.current.innerHTML = "";

        try {
            // Create Scanner
            const scanner = new Html5QrcodeScanner(
              "reader",
              { 
                  fps: 10, 
                  qrbox: { width: 250, height: 250 },
                  aspectRatio: 1.0,
                  showTorchButtonIfSupported: true,
                  rememberLastUsedCamera: true
              },
              /* verbose= */ false
            );
            
            scannerRef.current = scanner;

            const onScanSuccess = (decodedText: string) => {
               // Stop scanning immediately upon success
               if(scannerRef.current) {
                   scannerRef.current.clear().then(() => {
                       scannerRef.current = null;
                       handleValidation(decodedText);
                   }).catch(err => {
                       console.error("Failed to clear", err);
                       handleValidation(decodedText);
                   });
               }
            };

            scanner.render(onScanSuccess, (err) => { /* ignore failures */ });
        } catch(e) {
            console.error("Scanner init error", e);
        }
    }, 300); // Increased delay slightly for stability

    return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
    };
  }, [user, navigate, scanResult, error, loading]);

  const handleValidation = async (qrCodeId: string) => {
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
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-indigo-900 shadow-lg flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
              <ScanLine className="mr-2" /> Ticket Scanner
          </h1>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-200 hover:text-white">
              Exit
          </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
          
          {/* SCANNER VIEWPORT */}
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500 relative">
                   {/* Added min-height to prevent collapse */}
                   <div id="reader" ref={scannerWrapperRef} className="w-full min-h-[300px]"></div>
              </div>
          )}

          {/* LOADING */}
          {loading && (
              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-xl font-bold">Verifying...</p>
              </div>
          )}

          {/* RESULT: SUCCESS */}
          {scanResult && (
              <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Access Granted</h2>
                  <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                      <p className="text-lg font-bold text-indigo-900 mb-3">{scanResult.event.title}</p>
                      <p className="text-lg font-bold text-gray-900 mb-3">{scanResult.ticketHolderName}</p>
                      <p className="text-lg font-bold text-indigo-600">{scanResult.prList || "None"}</p>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2" /> Scan Next
                  </button>
              </div>
          )}

          {/* RESULT: ERROR */}
          {error && (
              <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in shake duration-300">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {error.includes("ALREADY") ? (
                           <AlertTriangle className="w-12 h-12 text-red-600" />
                      ) : (
                           <XCircle className="w-12 h-12 text-red-600" />
                      )}
                  </div>
                  <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
                  <p className="text-xl font-medium text-gray-800 mb-8">{error}</p>
                  <button onClick={resetScanner} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2" /> Try Again
                  </button>
              </div>
          )}
          
          {/* MANUAL ENTRY */}
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md mt-8">
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <input 
                          type="text" 
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder="Enter Ticket ID..."
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                      />
                      <button 
                        type="submit"
                        disabled={!manualCode}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                      >
                          <Search className="w-5 h-5" />
                      </button>
                  </form>
              </div>
          )}
      </div>
    </div>
  );
};

export default Scanner;