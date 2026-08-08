import React from 'react';
import { FileCheck, ShieldCheck, Download, ExternalLink, Headphones, Building, Award, Lock } from 'lucide-react';

export const DocumentsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Regulatory Compliance & Trust
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Verified Official Documents</h1>
          <p className="text-sm font-medium text-slate-400 max-w-lg">
            Hens Bedo is officially registered with government regulators and SECP corporate governance standards.
          </p>
        </div>
      </div>

      {/* Official Certificates Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FBR Document */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">FBR Tax Registration</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Federal Board of Revenue active taxpayer registration and corporate tax compliance ID.
            </p>
          </div>
          <a
            href="https://hnk-traders.pro/hrm786/uploads/fbr_1785397427.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> View FBR Certificate
          </a>
        </div>

        {/* SECP Document */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold mb-3">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">SECP Incorporation</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Securities and Exchange Commission of Pakistan license & corporate governance filing.
            </p>
          </div>
          <a
            href="https://hnk-traders.pro/secp_1774405617.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download SECP PDF
          </a>
        </div>

        {/* Android App */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Android Mobile App</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Download the official Hens Bedo Android APK for instant mobile wallet notifications.
            </p>
          </div>
          <a
            href="http://localhost/admin2/uploads/android_app_1781424673.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download APK Package
          </a>
        </div>
      </div>

      {/* Corporate Support Contacts */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Headphones className="w-5 h-5 text-blue-600" /> Executive Support Direct Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          <a
            href="https://whatsapp.com/channel/0029Vb8rWApA89MjWfuzM93a"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all dark:bg-slate-800 dark:border-slate-700"
          >
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Community Channel</span>
              <span className="text-slate-900 dark:text-white">WhatsApp News Channel</span>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600" />
          </a>

          <a
            href="https://wa.me/+923483747208"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all dark:bg-slate-800 dark:border-slate-700"
          >
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Desk Helpline</span>
              <span className="text-slate-900 dark:text-white">Admin Direct Support</span>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600" />
          </a>

          <a
            href="https://wa.me/+9233312345671"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all dark:bg-slate-800 dark:border-slate-700"
          >
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Escalation</span>
              <span className="text-slate-900 dark:text-white">Executive Corporate Desk</span>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-600" />
          </a>
        </div>
      </div>
    </div>
  );
};
