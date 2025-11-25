import React, { useEffect, useState } from 'react';
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
  const [scannerActive, setScannerActive] = useState(true);

  useEffect(() => {
    if (!user || user.role !== UserRole.ASSOCIAZIONE) {
        navigate('/');
        return;
    }

    // If scanner is not active, do nothing
    if (!scannerActive) return;

    // Safety check for element
    const readerElement = document.getElementById("reader");
    if (!readerElement) return;

    // Initialize scanner
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

    function onScanSuccess(decodedText: string, decodedResult: any) {
       // Stop scanning immediately upon success to prevent multiple triggers
       scanner.clear().then(() => {
           handleValidation(decodedText);
       }).catch((err) => {
           console.warn("Failed to clear scanner", err);
           handleValidation(decodedText);
       });
    }

    function onScanFailure(error: any) {
      // handle scan failure, usually better to ignore and keep scanning.
    }

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup function
    return () => {
        scanner.clear().catch(error => {
            console.warn("Failed to clear html5-qrcode scanner during cleanup. ", error);
        });
    };
  }, [user, navigate, scannerActive]);

  const handleValidation = async (qrCodeId: string) => {
      setLoading(true);
      setError(null);
      setScanResult(null);
      setScannerActive(false); // UI hides scanner container
      
      try {
          const ticket = await api.events.validateTicket(qrCodeId);
          
          // Security Check: Does this ticket belong to an event organized by THIS user?
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
      setScannerActive(true); 
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
          <div className={`w-full max-w-md bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500 relative ${(!scannerActive || loading) ? 'hidden' : ''}`}>
               <div id="reader" className="w-full"></div>
               <p className="text-center text-gray-400 text-sm p-2 bg-gray-800">
                   If prompted, please allow camera access.
               </p>
          </div>

          {/* LOADING STATE */}
          {loading && (
              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-xl font-bold">Verifying...</p>
              </div>
          )}

          {/* RESULT: SUCCESS */}
          {scanResult && !loading && (
              <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Access Granted</h2>
                  <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                      <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Event</p>
                      <p className="text-lg font-bold text-indigo-900 mb-3">{scanResult.event.title}</p>
                      
                      <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Ticket Holder</p>
                      <p className="text-lg font-bold text-gray-900 mb-3">{scanResult.ticketHolderName}</p>
                      
                      <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">PR List</p>
                      <p className="text-lg font-bold text-indigo-600">{scanResult.prList || "None"}</p>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2" /> Scan Next
                  </button>
              </div>
          )}

          {/* RESULT: ERROR */}
          {error && !loading && (
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
          {scannerActive && !loading && (
              <div className="w-full max-w-md mt-8">
                  <div className="flex items-center mb-2">
                      <div className="flex-1 h-px bg-gray-700"></div>
                      <span className="px-3 text-gray-500 text-sm uppercase font-bold">Or enter code manually</span>
                      <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <input 
                          type="text" 
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder="Enter Ticket ID (e.g. QR-123...)"
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