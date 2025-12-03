
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { api } from '../services/api';
import { Ticket, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Search, ScanLine, Camera, Clock, LogOut, LogIn } from 'lucide-react';

const Scanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<Ticket & { scanAction?: string, scanMessage?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  
  // Ref for the scanner instance
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Initialize Scanner
  useEffect(() => {
    if (!user || user.role !== UserRole.ASSOCIAZIONE) {
        navigate('/');
        return;
    }

    // Don't start if we have a result or are loading
    if (scanResult || error || loading) {
        stopScanner();
        return;
    }

    const startScanner = async () => {
        // Prevent multiple initializations
        if (html5QrCodeRef.current || isScanningRef.current) return;

        // Wait for DOM
        await new Promise(r => setTimeout(r, 100));
        const element = document.getElementById('reader');
        if (!element) return;

        try {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            // Check cameras
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                setCameraPermission(true);
                
                // Start scanning (Prefer Back Camera)
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // Success Callback
                        stopScanner();
                        handleValidation(decodedText);
                    },
                    (errorMessage) => {
                        // Error Callback (ignore frame errors)
                    }
                );
                isScanningRef.current = true;
            } else {
                setCameraPermission(false);
                setError("No cameras found.");
            }
        } catch (err) {
            console.error("Error starting scanner", err);
            setCameraPermission(false);
            // Don't set global error yet, let them use manual
        }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
        stopScanner();
    };
  }, [user, navigate, scanResult, error, loading]);

  const stopScanner = async () => {
      if (html5QrCodeRef.current && isScanningRef.current) {
          try {
              isScanningRef.current = false;
              await html5QrCodeRef.current.stop();
              await html5QrCodeRef.current.clear();
          } catch (e) {
              console.error("Failed to stop scanner", e);
          } finally {
              html5QrCodeRef.current = null;
          }
      }
  };

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
             setError("Questo voucher appartiene all'evento di un'altra associazione!");
             return;
          }

          setScanResult(ticket);
      } catch (err: any) {
          if (err.message === "INVALID_TICKET") {
              setError("Voucher Non Valido. Codice non trovato.");
          } else if (err.message === "ALREADY_USED") {
              setError("Voucher GIÀ USATO (Uscita già registrata).");
          } else if (err.message === "WRONG_EVENT_ORGANIZER") {
              setError("Questo voucher appartiene a un'altra associazione.");
          } else if (err.message === "TICKET_INVALID_DELETED") {
              setError("Voucher Annullato (Evento eliminato).");
          } else {
              setError("Errore validazione.");
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
      // Changing state will trigger useEffect to restart scanner
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-indigo-900 shadow-lg flex justify-between items-center z-10">
          <h1 className="text-xl font-bold flex items-center">
              <ScanLine className="mr-2" /> Scanner Voucher
          </h1>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-200 hover:text-white">
              Esci
          </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          
          {/* CAMERA CONTAINER */}
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md relative">
                   <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500 relative aspect-square">
                        {/* Force height to prevent collapse */}
                        <div id="reader" className="w-full h-full" style={{ minHeight: '300px' }}></div>
                        
                        {/* Overlay Guide */}
                        <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-indigo-400 rounded-lg bg-transparent box-border"></div>
                        </div>
                   </div>
                   
                   {cameraPermission === false && (
                       <div className="mt-4 text-center text-red-300 bg-red-900/50 p-4 rounded-lg">
                           <Camera className="w-8 h-8 mx-auto mb-2" />
                           <p>Accesso fotocamera negato.</p>
                           <p className="text-sm">Abilita i permessi nelle impostazioni del browser o usa l'inserimento manuale.</p>
                       </div>
                   )}
              </div>
          )}

          {/* LOADING STATE */}
          {loading && (
              <div className="flex flex-col items-center animate-in fade-in duration-200">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-xl font-bold">Verifica in corso...</p>
              </div>
          )}

          {/* SUCCESS RESULT */}
          {scanResult && (
              <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                  {scanResult.scanAction === 'exit' ? (
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <LogOut className="w-12 h-12 text-blue-600" />
                      </div>
                  ) : (
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                  )}
                  
                  <h2 className={`text-3xl font-bold mb-2 ${scanResult.scanAction === 'exit' ? 'text-blue-600' : 'text-green-600'}`}>
                      {scanResult.scanMessage || "Voucher Valido"}
                  </h2>

                  <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left border border-gray-200">
                      <p className="text-lg font-bold text-indigo-900 mb-1">{scanResult.event.title}</p>
                      <div className="border-t border-gray-200 my-2"></div>
                      <p className="text-sm text-gray-500 uppercase font-bold">Intestatario</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">{scanResult.ticketHolderName}</p>
                      
                      {scanResult.matricola && (
                          <>
                            <p className="text-sm text-gray-500 uppercase font-bold">Matricola</p>
                            <p className="text-lg font-bold text-gray-900 mb-2">{scanResult.matricola}</p>
                          </>
                      )}

                      {scanResult.scanAction === 'exit' && scanResult.entryTime && (
                           <div className="mt-2 text-sm bg-blue-50 p-2 rounded text-blue-800">
                               <Clock className="w-3 h-3 inline mr-1" />
                               Entrato alle: {new Date(scanResult.entryTime).toLocaleTimeString()}
                           </div>
                      )}

                      <p className="text-sm text-gray-500 uppercase font-bold mt-2">Lista PR</p>
                      <p className="text-lg font-bold text-indigo-600">{scanResult.prList || "Nessuna"}</p>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-transform active:scale-95">
                      <RefreshCw className="w-5 h-5 mr-2" /> Scansiona Prossimo
                  </button>
              </div>
          )}

          {/* ERROR RESULT */}
          {error && (
              <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in shake duration-300">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {error.includes("USATO") ? (
                           <AlertTriangle className="w-12 h-12 text-red-600" />
                      ) : (
                           <XCircle className="w-12 h-12 text-red-600" />
                      )}
                  </div>
                  <h2 className="text-3xl font-bold text-red-600 mb-4">Accesso Negato</h2>
                  <p className="text-xl font-medium text-gray-800 mb-8 leading-snug">{error}</p>
                  <button onClick={resetScanner} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-transform active:scale-95">
                      <RefreshCw className="w-5 h-5 mr-2" /> Riprova
                  </button>
              </div>
          )}
          
          {/* MANUAL ENTRY */}
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md mt-8">
                  <p className="text-gray-400 text-sm text-center mb-2">Oppure inserisci codice manuale:</p>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <input 
                          type="text" 
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder="Voucher ID (es. 123-ABC)"
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 uppercase"
                      />
                      <button 
                        type="submit"
                        disabled={!manualCode}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors"
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
