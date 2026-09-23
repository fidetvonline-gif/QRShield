import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScannerView } from './components/ScannerView';
import { PlaygroundView } from './components/PlaygroundView';
import { HistoryView } from './components/HistoryView';
import { ReportModal } from './components/ReportModal';
import { ScanRecord, SystemStats } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [scansRes, statsRes] = await Promise.all([
        fetch('/api/scans'),
        fetch('/api/stats')
      ]);

      if (scansRes.ok) {
        const scansData = await scansRes.json();
        setScans(scansData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to fetch QRShield data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScanComplete = (newScan: ScanRecord) => {
    setSelectedScan(newScan);
    fetchData(); // Refresh list and stats
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all scan history?")) return;
    try {
      const res = await fetch('/api/scans', { method: 'DELETE' });
      if (res.ok) {
        setScans([]);
        setStats(prev => prev ? { ...prev, totalScans: 0, safeCount: 0, suspiciousCount: 0, maliciousCount: 0 } : null);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            scans={scans}
            onSelectScan={(scan) => setSelectedScan(scan)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView onScanComplete={handleScanComplete} />
        )}

        {activeTab === 'playground' && (
          <PlaygroundView onScanComplete={handleScanComplete} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            scans={scans}
            onSelectScan={(scan) => setSelectedScan(scan)}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Security Report Modal */}
      {selectedScan && (
        <ReportModal
          scan={selectedScan}
          onClose={() => setSelectedScan(null)}
          onScanAnother={() => {
            setSelectedScan(null);
            setActiveTab('scanner');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-400">QRShield v1.0.0</span> — QR Code Phishing & Quishing Defense System
          </div>
          <div>
            Pre-Navigation Security Layer • Secure Sandbox Inspection
          </div>
        </div>
      </footer>
    </div>
  );
}
