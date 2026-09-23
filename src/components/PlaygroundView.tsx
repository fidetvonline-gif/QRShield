import React, { useState } from 'react';
import { Terminal, ShieldCheck, AlertTriangle, ShieldAlert, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ScanRecord } from '../types';

interface PlaygroundViewProps {
  onScanComplete: (record: ScanRecord) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ onScanComplete }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const testSamples = [
    {
      category: 'Safe URLs',
      description: 'Standard, trusted domains with valid HTTPS certificates and normal path structures.',
      items: [
        { name: 'Official Google Portal', url: 'https://www.google.com', expected: 'SAFE' },
        { name: 'GitHub Open Source Repository', url: 'https://github.com/trending', expected: 'SAFE' },
        { name: 'Cloudflare Edge Network', url: 'https://www.cloudflare.com/learning/', expected: 'SAFE' }
      ]
    },
    {
      category: 'Suspicious Heuristics',
      description: 'URLs exhibiting unencrypted HTTP, private IP endpoints, or unusual query parameters.',
      items: [
        { name: 'Local Router / Unsecured IP', url: 'http://192.168.1.50/admin/login?token=abc', expected: 'SUSPICIOUS' },
        { name: 'Excessive Subdomains & Long Path', url: 'https://auth.verify.security.update.customer.service-portal.example.com/signin', expected: 'SUSPICIOUS' }
      ]
    },
    {
      category: 'Malicious Quishing Samples',
      description: 'Known phishing patterns, brand typosquatting (e.g., paypa1), and credential harvesting endpoints.',
      items: [
        { name: 'PayPal Typosquatting Phishing', url: 'https://paypa1-account-security-update.com/signin?verify=true', expected: 'MALICIOUS' },
        { name: 'Bank Secure Login Impersonation', url: 'https://secure-chase-bank-verify.com/auth/login?session=expired', expected: 'MALICIOUS' }
      ]
    }
  ];

  const handleTestSample = async (url: string, id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: url })
      });
      if (!res.ok) throw new Error('Failed to analyze test URL.');
      const data: ScanRecord = await res.json();
      onScanComplete(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>Academic Evaluation Playground</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pre-Configured Threat Test Datasets
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Click any sample below to instantly evaluate QRShield's heuristic detection engine, risk scoring, and threat categorization without needing a physical QR code reader.
        </p>
      </div>

      <div className="space-y-8">
        {testSamples.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{group.category}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item, idx) => {
                const sampleId = `${groupIdx}-${idx}`;
                const isLoading = loadingId === sampleId;
                const isMalicious = item.expected === 'MALICIOUS';
                const isSuspicious = item.expected === 'SUSPICIOUS';

                const badgeColor = isMalicious
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : isSuspicious
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{item.name}</span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                          {item.expected}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all">
                        {item.url}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTestSample(item.url, sampleId)}
                      disabled={isLoading}
                      className="w-full bg-slate-800 hover:bg-cyan-600 disabled:opacity-50 text-slate-200 hover:text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Running Heuristics...</span>
                        </>
                      ) : (
                        <>
                          <span>Run Security Scan</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
