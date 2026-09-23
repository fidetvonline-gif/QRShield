export interface ScanRecord {
  id: string;
  qrData: string;
  url: string | null;
  domain: string | null;
  dataType: string;
  riskScore: number;
  riskLevel: "SAFE" | "SUSPICIOUS" | "MALICIOUS";
  reasons: string[];
  checks: {
    usesHttps: boolean;
    hasIpAddress: boolean;
    hasPunycode: boolean;
    urlLength: number;
    subdomainCount: number;
    suspiciousKeywords: string[];
    threatIntelStatus: string;
  };
  recommendation: string;
  createdAt: string;
}

export interface SystemStats {
  totalScans: number;
  safeCount: number;
  suspiciousCount: number;
  maliciousCount: number;
  engines: {
    threatIntel: string;
    heuristicEngine: string;
    qrDecoder: string;
  };
}
