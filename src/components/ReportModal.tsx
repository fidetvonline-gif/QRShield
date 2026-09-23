import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, X, ExternalLink, CheckCircle2, Lock, AlertOctagon, Terminal } from 'lucide-react';
import { ScanRecord } from '../types';

interface ReportModalProps {
  scan: ScanRecord | null;
  onClose: () => void;
  onScanAnother: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ scan, onClose, onScanAnother }) => {
  if (!scan) return null;

  const [showSandboxWarning, setShowSandboxWarning] = useState<boolean>(false);

  const isMalicious = scan.riskLevel === 'MALICIOUS';
  const isSuspicious = scan.riskLevel === 'SUSPICIOUS';
  const isSafe = scan.riskLevel === 'SAFE';

  const badgeColor = isMalicious
    ? 'bg-red-500/10 text-red-400 border-red-500/30'
    : isSuspicious
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  const scoreColor = isMalicious
    ? 'text-red-400 border-red-500/40 bg-red-950/20'
    : isSuspicious
    ? 'text-amber-400 border-amber-500/40 bg-amber-950/20'
    : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${badgeColor}`}>
              {isMalicious ? <ShieldAlert className="w-5 h-5" /> : isSuspicious ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">QRShield Security Report</h3>
              <p className="text-xs text-slate-400">Pre-Navigation Risk Analysis & Heuristics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Risk Score & Verdict Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-slate-950/60 border border-slate-800 gap-4">
            <div className="text-center sm:text-left">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border mb-2 ${badgeColor}`}>
                {scan.riskLevel} RISK VERDICT
              </span>
              <div className="text-xl font-bold text-white break-all sm:break-normal max-w-md">
                {scan.domain || scan.qrData}
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate max-w-md">
                {scan.url || scan.qrData}
              </p>
            </div>

            <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 ${scoreColor} shrink-0`}>
              <span className="text-3xl font-black">{scan.riskScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">Score / 100</span>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            isMalicious
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : isSuspicious
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">Security Recommendation</h4>
              <p className="text-xs mt-1 leading-relaxed font-medium">{scan.recommendation}</p>
            </div>
          </div>

          {/* Detected Issues / Heuristic Signals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Detected Heuristic Signals & Findings</h4>
            <div className="space-y-2">
              {scan.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-200">
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Checks Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Technical Inspection Matrix</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">HTTPS Protocol</span>
                <span className={scan.checks.usesHttps ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {scan.checks.usesHttps ? 'Enabled' : 'Disabled (HTTP)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">IP Address Host</span>
                <span className={scan.checks.hasIpAddress ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {scan.checks.hasIpAddress ? 'Yes (Risky)' : 'No (Domain)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Punycode / IDN</span>
                <span className={scan.checks.hasPunycode ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {scan.checks.hasPunycode ? 'Detected' : 'None'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Threat Intelligence</span>
                <span className="text-cyan-400 font-semibold truncate max-w-[150px]" title={scan.checks.threatIntelStatus}>
                  {scan.checks.threatIntelStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50 gap-3">
          <button
            onClick={onScanAnother}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Scan Another QR
          </button>

          <div className="flex space-x-3">
            {isMalicious ? (
              <button
                onClick={() => setShowSandboxWarning(true)}
                className="bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/50 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Open Anyway (Unsafe)
              </button>
            ) : scan.url ? (
              <a
                href={scan.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
              >
                <span>Open Destination</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Unsafe Override Warning Modal */}
      {showSandboxWarning && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90">
          <div className="max-w-md bg-slate-900 border border-red-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Warning: High Quishing Risk</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              QRShield heuristic analysis has classified this URL as <strong className="text-red-400">MALICIOUS</strong>. Opening this link may expose you to credential theft or malware.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowSandboxWarning(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancel & Go Back
              </button>
              <a
                href={scan.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors text-center"
                onClick={() => setShowSandboxWarning(false)}
              >
                Proceed Unsafe
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
