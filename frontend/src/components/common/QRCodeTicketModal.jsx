import React from 'react';
import { X, QrCode, Calendar, MapPin, Clock, ShieldCheck, Download } from 'lucide-react';

const QRCodeTicketModal = ({ isOpen, onClose, event, student }) => {
  if (!isOpen || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white text-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-3xl rounded-3xl p-6 sm:p-8 border border-[#8b5cf6]/40 shadow-2xl text-slate-900 my-8">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#7c3aed]" />
            <h3 className="text-base font-bold text-slate-900">Event Attendance Pass</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-600 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Pass */}
        <div className="p-6 rounded-2xl bg-[#0e0e12] border border-slate-200 space-y-6 text-center print:bg-white print:text-black print:border-none">
          <div>
            <span className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-widest font-bold print:text-black">
              Official Entry Pass
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 print:text-black">{event.title}</h2>
            <p className="text-xs text-slate-600 font-mono mt-0.5 print:text-black/80">{event.communityName || 'Campus Community Event'}</p>
          </div>

          {/* Real QR Code Ticket */}
          <div className="flex justify-center my-4">
            <div className="p-4 rounded-2xl bg-white border-2 border-[#8b5cf6] shadow-xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0e0e12&data=${encodeURIComponent(`scts-attendance:${event.id}:${student?.id || student?.studentId || ''}`)}`}
                alt="Ticket QR Code"
                className="w-40 h-40"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs text-left p-3 rounded-xl bg-white/5 border border-slate-200 print:bg-gray-100 print:text-black">
            <div className="flex items-center gap-2 text-slate-600 print:text-black">
              <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Date: <strong>{event.eventDate || 'Scheduled Date'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 print:text-black">
              <Clock className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Time: <strong>{event.time || '10:00 AM IST'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 print:text-black">
              <MapPin className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Venue: <strong>{event.venue || 'Main Auditorium'}</strong></span>
            </div>
          </div>

          {/* Student Info */}
          <div className="pt-3 border-t border-slate-200 text-left text-xs font-mono flex items-center justify-between print:border-black/20 print:text-black">
            <div>
              <span className="text-slate-600/60 text-[10px] block">TICKET HOLDER</span>
              <strong className="text-slate-900 text-sm print:text-black">{student?.name || 'Student'}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-600/60 text-[10px] block">PASS CODE</span>
              <strong className="text-[#7c3aed] print:text-black">EVT-PASS-{event.id || '01'}</strong>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-xs font-bold flex items-center justify-center gap-2 shadow-md print:hidden"
          >
            <Download className="w-4 h-4" /> Download Ticket
          </button>

        </div>
      </div>
    </div>
  );
};

export default QRCodeTicketModal;
