import React from 'react';
import { ShieldAlert, ShieldCheck, QrCode, History, LayoutDashboard, Terminal, Activity, Database } from 'lucide-react';
import { getSupabaseCredentials } from '../utils/supabaseClient';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    totalScans: number;
    maliciousCount: number;
  } | null;
  onOpenSupabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, stats, onOpenSupabase }) => {
  const { url } = getSupabaseCredentials();
  const isSupabaseConnected = Boolean(url);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight">QRShield</span>
              <span className="text-[10px] uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                Quishing Defense
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Pre-Navigation QR Phishing Analysis System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'scanner'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'playground'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Test Datasets</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Scan History</span>
          </button>
        </nav>

        {/* Status Indicator & Supabase Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSupabase}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSupabaseConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isSupabaseConnected ? 'Supabase Connected' : 'Connect Supabase'}</span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
          </button>

          {stats && stats.maliciousCount > 0 && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full text-xs text-red-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{stats.maliciousCount} Threats</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 px-2 py-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg text-xs font-medium ${
            activeTab === 'dashboard' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg text-xs font-medium ${
            activeTab === 'scanner' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scan</span>
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg text-xs font-medium ${
            activeTab === 'playground' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Test</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg text-xs font-medium ${
            activeTab === 'history' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>
    </header>
  );
};
