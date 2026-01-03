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
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  useEffect(() => {
    if (!user || (user.role !== UserRole.ASSOCIAZIONE && user.role !== UserRole.STAFF)) {
        navigate('/');
        return;
    }

    if (scanResult || error || loading) {
        stopScanner();
        return;
    }

    const startScanner = async () => {
        if (html5QrCodeRef.current || isScanningRef.current) return;
        await new Promise(r => setTimeout(r, 100));
        const element = document.getElementById('reader');
        if (!element) return;
        try {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                setCameraPermission(true);
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                    (decodedText) => { stopScanner(); handleValidation(decodedText); },
                    () => {}
                );
                isScanningRef.current = true;
            } else { setCameraPermission(false); setError("No cameras found."); }
        } catch (err) { setCameraPermission(false); }
    };
    startScanner();
    return () => { stopScanner(); };
  }, [user, navigate, scanResult, error, loading]);

  const stopScanner = async () => {
      if (html5QrCodeRef.current && isScanningRef.current) {
          try {
              isScanningRef.current = false;
              await html5QrCodeRef.current.stop();
              await html5QrCodeRef.current.clear();
          } catch (e) {} finally { html5QrCodeRef.current = null; }
      }
  };

  const handleValidation = async (qrCodeId: string) => {
      setLoading(true); setError(null); setScanResult(null);
      try {
          const ticket = await api.events.validateTicket(qrCodeId);
          const orgId = typeof ticket.event.organization === 'string' ? ticket.event.organization : ticket.event.organization._id;
          const isStaffOfOrg = user?.role === UserRole.STAFF && user?.parentOrganization === orgId;
          const isOrgOwner = user?._id === orgId;
          if (!isOrgOwner && !isStaffOfOrg) {
             setError("Questo voucher appartiene a un'altra associazione!"); return;
          }
          setScanResult(ticket);
      } catch (err: any) {
          setError(err.message || "Errore validazione.");
      } finally { setLoading(false); }
  };

  const resetScanner = () => { setScanResult(null); setError(null); setManualCode(''); setLoading(false); };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-indigo-950 shadow-lg flex justify-between items-center z-10 border-b border-indigo-900/50">
          <h1 className="text-xl font-bold flex items-center"><ScanLine className="mr-2 text-indigo-500" /> Scanner Voucher</h1>
          <button onClick={() => navigate(user?.role === UserRole.STAFF ? '/' : '/dashboard')} className="text-sm text-indigo-300 hover:text-white">Esci</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md relative">
                   <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500 relative aspect-square">
                        <div id="reader" className="w-full h-full"></div>
                   </div>
                   {cameraPermission === false && <div className="mt-4 text-center text-red-400 bg-red-950/30 p-4 rounded-lg border border-red-900/50"><p>Accesso fotocamera negato.</p></div>}
              </div>
          )}
          {loading && <div className="flex flex-col items-center"><div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-xl font-bold">Verifica...</p></div>}
          {scanResult && (
              <div className="bg-gray-800 text-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-700 animate-in zoom-in">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${scanResult.scanAction === 'exit' ? 'bg-blue-900/30' : 'bg-green-900/30'}`}>
                       {scanResult.scanAction === 'exit' ? <LogOut className="w-12 h-12 text-blue-400" /> : <CheckCircle className="w-12 h-12 text-green-400" />}
                  </div>
                  <h2 className={`text-3xl font-bold mb-2 ${scanResult.scanAction === 'exit' ? 'text-blue-400' : 'text-green-400'}`}>{scanResult.scanMessage || "Voucher Valido"}</h2>
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left border border-gray-700">
                      <p className="text-lg font-bold text-white mb-1">{scanResult.event.title}</p>
                      <div className="border-t border-gray-700 my-2"></div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Intestatario</p>
                      <p className="text-xl font-bold text-white mb-2">{scanResult.ticketHolderName}</p>
                      <p className="text-xs text-gray-500 uppercase font-bold">Lista PR</p>
                      <p className="text-lg font-bold text-indigo-400">{scanResult.prList || "Nessuna"}</p>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition"><RefreshCw className="w-5 h-5 mr-2" /> Scansiona Prossimo</button>
              </div>
          )}
          {error && (
              <div className="bg-gray-800 text-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-700 animate-in shake">
                  <div className="w-24 h-24 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-12 h-12 text-red-500" /></div>
                  <h2 className="text-3xl font-bold text-red-500 mb-4">Negato</h2>
                  <p className="text-xl font-medium text-gray-300 mb-8">{error}</p>
                  <button onClick={resetScanner} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition">Riprova</button>
              </div>
          )}
          {(!scanResult && !error && !loading) && (
              <div className="w-full max-w-md mt-8">
                  <form onSubmit={(e) => { e.preventDefault(); handleValidation(manualCode.trim()); }} className="flex gap-2">
                      <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Voucher ID" className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none" />
                      <button type="submit" disabled={!manualCode} className="bg-indigo-600 text-white px-6 py-3 rounded-lg"><Search className="w-5 h-5" /></button>
                  </form>
              </div>
          )}
      </div>
    </div>
  );
};

export default Scanner;