import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  TableProperties,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { generateQRCodeDataUrl } from '../../utils/qr';

export const QRCodeGenerator: React.FC = () => {
  const { activeCafe, setCustomerSession, setRole } = useCafe();
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Derive target order URL
  const baseUrl = window.location.origin + window.location.pathname;
  const tableOrderUrl = `${baseUrl}?view=customer&cafe=${activeCafe.slug}&table=${selectedTable}`;

  useEffect(() => {
    let isMounted = true;
    generateQRCodeDataUrl(tableOrderUrl).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [tableOrderUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableOrderUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestLink = () => {
    setCustomerSession({
      name: `Guest (Table ${selectedTable})`,
      tableNumber: selectedTable,
    });
    setRole('customer');
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${activeCafe.slug}-table-${selectedTable}-qr.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-[#D7CCC8] rounded-3xl p-6 sm:p-8 shadow-xs text-[#3E2723]">
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        {/* Left Controls & Table Selection */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8] mb-2">
              <QrCode className="w-3.5 h-3.5" />
              <span>Instant Digital QR Generator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-[#3E2723]">
              Table QR Codes for {activeCafe.name}
            </h2>
            <p className="text-xs text-[#8D6E63] mt-1">
              Select any table to generate its unique, scannable QR code sticker. Customers scan this QR to place orders directly without logging in.
            </p>
          </div>

          {/* Table Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-[#5D4037] mb-2">
              Choose Table Number to Generate:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {activeCafe.tables.map((tableNum) => (
                <button
                  key={tableNum}
                  id={`qr-table-btn-${tableNum}`}
                  onClick={() => setSelectedTable(tableNum)}
                  className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                    selectedTable === tableNum
                      ? 'bg-[#795548] text-white border-[#5D4037] shadow-xs'
                      : 'bg-[#FAF8F6] text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                  }`}
                >
                  Table {tableNum}
                </button>
              ))}
            </div>
          </div>

          {/* Direct URL & Copy */}
          <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-[#D7CCC8] space-y-2">
            <label className="block text-xs font-bold text-[#8D6E63]">
              Scanned Destination URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={tableOrderUrl}
                className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[11px] font-mono text-[#3E2723] focus:outline-none"
              />
              <button
                id="btn-copy-qr-url"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-[#795548] hover:bg-[#5D4037] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-test-customer-link"
              onClick={handleTestLink}
              className="px-4 py-2.5 bg-[#795548] hover:bg-[#5D4037] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Simulate Customer Scan (Table #{selectedTable})</span>
            </button>

            <button
              id="btn-download-qr"
              onClick={handleDownload}
              className="px-4 py-2.5 bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#5D4037] text-xs font-bold rounded-xl border border-[#D7CCC8] transition-colors flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              id="btn-print-standee"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#5D4037] text-xs font-bold rounded-xl border border-[#D7CCC8] transition-colors flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Standee</span>
            </button>
          </div>
        </div>

        {/* Right Printable Table Standee Card Preview */}
        <div className="w-full lg:w-80 flex flex-col items-center">
          <div className="text-xs text-[#8D6E63] font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#795548]" />
            <span>Table Standee Preview</span>
          </div>

          <div
            id="printable-table-standee"
            className="w-72 bg-[#FAF8F6] text-[#3E2723] rounded-3xl p-6 border-2 border-[#795548] shadow-xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-2 bg-[#795548]" />

            {/* Standee Brand Header */}
            <div className="mt-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#795548] text-white font-black text-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                👑
              </div>
              <h3 className="text-lg font-black font-['Outfit'] tracking-tight text-[#3E2723]">
                {activeCafe.name}
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#795548]">
                Self-Order Digital Menu
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl shadow-inner max-w-[200px] mx-auto mb-4 border border-[#D7CCC8]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code Table ${selectedTable}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-[#8D6E63]">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Table Number Highlight */}
            <div className="bg-[#795548] text-white py-1.5 px-4 rounded-xl font-black text-sm tracking-wide shadow-xs mb-2">
              TABLE #{selectedTable}
            </div>

            <p className="text-[11px] text-[#5D4037] font-medium">
              Scan with your phone camera to view menu & place your order.
            </p>
            <p className="text-[9px] text-[#8D6E63] mt-2 font-mono">
              Powered by King Cafe SaaS Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
