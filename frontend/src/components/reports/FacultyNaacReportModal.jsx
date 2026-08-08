import React from 'react';
import { X, ShieldCheck, Printer, Download, Award, Building2, Users, FileText } from 'lucide-react';

const FacultyNaacReportModal = ({ isOpen, onClose, reportData }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white text-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-sm rounded-3xl rounded-3xl p-6 sm:p-8 border border-[#8b5cf6]/40 shadow-2xl text-slate-900 my-8">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#7c3aed]" />
            <h3 className="text-lg font-bold text-slate-900">NAAC Accreditation Executive Report</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" /> Export / Print Report
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-600 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="p-8 rounded-2xl bg-[#0e0e12] border border-slate-200 space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-6 print:border-black/20">
            <div>
              <h1 className="text-[#7c3aed]xl font-black text-slate-900 print:text-black">SMART CAMPUS UNIVERSITY</h1>
              <p className="text-xs text-[#7c3aed] font-mono font-bold uppercase tracking-widest mt-0.5 print:text-black">
                NAAC Criterion 5 - Student Support & Progression Report
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-600 print:text-black">
              <div>Academic Year: 2025 - 2026</div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Key Metric Summary Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
            <div className="p-4 rounded-xl bg-white/5 border border-slate-200 text-center print:bg-gray-100 print:text-black print:border-black/20">
              <span className="text-[10px] text-slate-600/60 uppercase font-mono block print:text-black/60">Active Communities</span>
              <strong className="text-xl font-bold text-[#7c3aed] print:text-black">30+ Chapters</strong>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-slate-200 text-center print:bg-gray-100 print:text-black print:border-black/20">
              <span className="text-[10px] text-slate-600/60 uppercase font-mono block print:text-black/60">Enrolled Students</span>
              <strong className="text-xl font-bold text-slate-900 print:text-black">1,450+ Enrolled</strong>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-slate-200 text-center print:bg-gray-100 print:text-black print:border-black/20">
              <span className="text-[10px] text-slate-600/60 uppercase font-mono block print:text-black/60">Verified Deliverables</span>
              <strong className="text-xl font-bold text-emerald-400 print:text-black">840 Verified</strong>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-slate-200 text-center print:bg-gray-100 print:text-black print:border-black/20">
              <span className="text-[10px] text-slate-600/60 uppercase font-mono block print:text-black/60">Participation Rate</span>
              <strong className="text-xl font-bold text-slate-800 print:text-black">92.4% Overall</strong>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div>
            <h4 className="text-xs uppercase font-mono font-bold text-[#7c3aed] mb-3 print:text-black">
              Department-Wise Extracurricular Engagement Summary
            </h4>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-mono text-[11px] print:border-black/20 print:text-black">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Total Students</th>
                  <th className="py-2.5 px-3">Joined Memberships</th>
                  <th className="py-2.5 px-3">Verified Proofs</th>
                  <th className="py-2.5 px-3 text-right">Engagement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-black/10">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 print:text-black">Computer Science & Engg</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">450</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">420</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 print:text-black">310</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#7c3aed] print:text-black">93.3%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 print:text-black">Information Technology</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">380</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">355</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 print:text-black">265</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#7c3aed] print:text-black">93.4%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 print:text-black">Electronics & Comm Engg</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">320</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">290</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 print:text-black">190</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#7c3aed] print:text-black">90.6%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 print:text-black">Mechanical Engineering</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">300</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 print:text-black">270</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 print:text-black">175</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#7c3aed] print:text-black">90.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 print:border-black/20 print:text-black">
            <div>
              <p className="font-bold">Super Admin / Dean Signature</p>
              <p className="text-[10px] opacity-60 font-mono">Verified by SCTS System Engine</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Principal Approval</p>
              <p className="text-[10px] opacity-60 font-mono">Ref: NAAC-SCTS-ACC-2026</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacultyNaacReportModal;
