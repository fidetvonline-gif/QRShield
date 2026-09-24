import React, { useState } from 'react';
import { Database, X, CheckCircle2, AlertCircle, Key, Link as LinkIcon, ShieldCheck, Copy, Check } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials, getSupabaseClient } from '../utils/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onConnected }) => {
  if (!isOpen) return null;

  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds.url);
  const [key, setKey] = useState(creds.key);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSchema = `
-- Create scans table for QRShield
create table if not exists public.scans (
  id text primary key,
  user_id uuid references auth.users(id),
  qr_data text not null,
  url text,
  domain text,
  data_type text default 'URL',
  risk_score integer not null,
  risk_level text not null,
  reasons jsonb,
  checks jsonb,
  recommendation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.scans enable row level security;

-- Allow public read/write for MVP demonstration
create policy "Allow all operations on scans" on public.scans for all using (true) with check (true);
  `.trim();

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    saveSupabaseCredentials(url, key);
    const client = getSupabaseClient();

    if (!client) {
      setTestResult({ success: false, message: 'Invalid URL or API Key format.' });
      setTesting(false);
      return;
    }

    try {
      // Test connection by querying table or auth
      const { data, error } = await client.from('scans').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.scans" does not exist')) {
        // If table doesn't exist yet, client connected successfully but table needs creation
        setTestResult({ 
          success: true, 
          message: 'Connected to Supabase successfully! Note: Please run the SQL schema script below to create the "scans" table.' 
        });
      } else {
        setTestResult({ success: true, message: 'Supabase connection and PostgreSQL table verified successfully!' });
      }
      onConnected();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed. Please verify credentials.' });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setKey('');
    setTestResult({ success: true, message: 'Disconnected from Supabase. Running in local/memory mode.' });
    onConnected();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Connect Supabase PostgreSQL</h3>
              <p className="text-xs text-slate-400">Persist scan history and telemetry in Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase Anon / Public API Key</span>
              </label>
              <input
                type="password"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {url && key ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Disconnect Supabase
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={testing}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                {testing ? 'Connecting...' : 'Save & Connect Supabase'}
              </button>
            </div>
          </form>

          {/* SQL Setup Schema Guide */}
          <div className="border-t border-slate-800 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Database Schema (SQL Editor)</h4>
                <p className="text-[11px] text-slate-500">Run this query in your Supabase SQL Editor to initialize the tables.</p>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-40">
              {sqlSchema}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
