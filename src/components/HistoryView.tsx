import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Trash2, ExternalLink, Calendar, Filter } from 'lucide-react';
import { ScanRecord } from '../types';

interface HistoryViewProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ scans, onSelectScan, onClearHistory }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      (scan.url && scan.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (scan.domain && scan.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      scan.qrData.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterLevel === 'ALL' || scan.riskLevel === filterLevel;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Scan History & Audit Logs</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical records of all processed QR codes, URLs, and heuristic risk assessments.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain, URL, or data..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
          {['ALL', 'SAFE', 'SUSPICIOUS', 'MALICIOUS'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterLevel === level
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Scan Records Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredScans.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No scan records match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter settings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60">
                  <th className="py-3.5 px-6">Verdict</th>
                  <th className="py-3.5 px-6">Destination Domain / URL</th>
                  <th className="py-3.5 px-6">Risk Score</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredScans.map((scan) => {
                  const badgeColor =
                    scan.riskLevel === 'MALICIOUS'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : scan.riskLevel === 'SUSPICIOUS'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => onSelectScan(scan)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>
                          {scan.riskLevel === 'MALICIOUS' ? <ShieldAlert className="w-3.5 h-3.5" /> : scan.riskLevel === 'SUSPICIOUS' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          <span>{scan.riskLevel}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-white truncate">{scan.domain || scan.qrData}</div>
                        <div className="text-slate-400 truncate text-[11px] mt-0.5">{scan.url || scan.qrData}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{scan.riskScore} <span className="text-[10px] text-slate-500">/ 100</span></div>
                      </td>
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
