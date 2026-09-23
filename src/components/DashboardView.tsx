import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, QrCode, Upload, ArrowRight, Activity, Terminal, History, Lock, Search, ExternalLink } from 'lucide-react';
import { ScanRecord, SystemStats } from '../types';

interface DashboardViewProps {
  stats: SystemStats | null;
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, scans, onSelectScan, setActiveTab }) => {
  const recentScans = scans.slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pre-Navigation Security Layer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            QRShield: Quishing Detection & Risk Analysis
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
            Detect and intercept malicious QR-embedded URLs before opening them. QRShield analyzes domain reputation, phishing heuristics, typosquatting, and redirect chains in real-time.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-cyan-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-6 py-3 rounded-xl transition-all"
            >
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Test Datasets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Analyzed</span>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats?.totalScans || scans.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Operational</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Safe Destinations</span>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400">{stats?.safeCount || scans.filter(s => s.riskLevel === 'SAFE').length}</span>
            <span className="text-xs text-slate-400">Verified URLs</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Suspicious Warnings</span>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-400">{stats?.suspiciousCount || scans.filter(s => s.riskLevel === 'SUSPICIOUS').length}</span>
            <span className="text-xs text-slate-400">Caution Required</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Malicious Blocked</span>
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-red-400">{stats?.maliciousCount || scans.filter(s => s.riskLevel === 'MALICIOUS').length}</span>
            <span className="text-xs text-red-400 font-medium">Quishing Prevented</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Scans & System Protection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Scans (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Security Scans</h2>
              <p className="text-xs text-slate-400">Latest QR codes processed by the heuristic analysis engine</p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
              <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">No scans recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">Scan a QR code or upload an image to begin.</p>
              <button
                onClick={() => setActiveTab('scanner')}
                className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              >
                Scan QR Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => {
                const badgeColor =
                  scan.riskLevel === 'MALICIOUS'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : scan.riskLevel === 'SUSPICIOUS'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                return (
                  <div
                    key={scan.id}
                    onClick={() => onSelectScan(scan)}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`p-2.5 rounded-lg border ${badgeColor}`}>
                        {scan.riskLevel === 'MALICIOUS' ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : scan.riskLevel === 'SUSPICIOUS' ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <ShieldCheck className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                            {scan.domain || scan.qrData}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {scan.riskLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md mt-0.5">
                          {scan.url || scan.qrData}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 ml-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white">{scan.riskScore}/100</div>
                        <div className="text-[10px] text-slate-500">Risk Score</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Protection Status (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Protection Status</h3>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mb-6">
              All modular sub-systems are operating normally and synchronizing threat feeds.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div>
                    <div className="text-xs font-semibold text-white">Threat Intelligence</div>
                    <div className="text-[10px] text-slate-400">URLhaus / VirusTotal Feed</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  ONLINE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div>
                    <div className="text-xs font-semibold text-white">Heuristic Engine</div>
                    <div className="text-[10px] text-slate-400">Deterministic v2.4 Rules</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div>
                    <div className="text-xs font-semibold text-white">QR Decoder Matrix</div>
                    <div className="text-[10px] text-slate-400">Canvas & jsQR Engine</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  READY
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-800/40 rounded-xl p-4 text-center">
              <Lock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pre-Navigation Defense</h4>
              <p className="text-[11px] text-slate-300 mt-1">
                QRShield never auto-navigates URLs. All inspection occurs inside a secure sandbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
