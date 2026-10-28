import React, { useState } from 'react';
import { 
  Play, 
  Terminal as TerminalIcon, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Server, 
  Zap, 
  Globe, 
  Hash, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { KNOWN_SERVICES, TARGET_PRESETS } from '../data/services';

interface DiscoveredPort {
  port: number;
  ip: string;
  state: 'open' | 'closed' | 'filtered';
  service: string;
  latencyMs: number;
  banner: string;
}

export const ScannerWorkbench: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('local');
  const [targetInput, setTargetInput] = useState<string>('127.0.0.1');
  const [portMode, setPortMode] = useState<'top20' | 'top100' | 'webdb' | 'custom'>('top20');
  const [customPorts, setCustomPorts] = useState<string>('80,443,3000,8080');
  const [threads, setThreads] = useState<number>(100);
  const [timeoutSec, setTimeoutSec] = useState<number>(1.0);
  const [enableBanner, setEnableBanner] = useState<boolean>(true);

  // Scanning simulation state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [discoveredPorts, setDiscoveredPorts] = useState<DiscoveredPort[]>([]);
  const [scanDuration, setScanDuration] = useState<number>(0);

  const getPortsToScan = (): number[] => {
    if (portMode === 'top20') {
      return [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723, 3000, 3306, 3389, 8080];
    } else if (portMode === 'top100') {
      const p = new Set<number>([
        21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723, 3000, 3306, 3389, 5900, 8080,
        1433, 1521, 2049, 2082, 2083, 5000, 5432, 5672, 6379, 6443, 8000, 8443, 8888, 9000, 9090, 9200, 9300, 27017
      ]);
      // Fill to simulate 100
      for (let i = 1; i <= 60; i++) p.add(1000 + i);
      return Array.from(p).sort((a, b) => a - b);
    } else if (portMode === 'webdb') {
      return [80, 443, 3000, 3306, 5432, 6379, 8000, 8080, 8443, 9200, 27017];
    } else {
      // parse custom string
      const set = new Set<number>();
      customPorts.split(',').forEach(seg => {
        const s = seg.trim();
        if (s.includes('-')) {
          const [start, end] = s.split('-').map(Number);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.max(1, start); i <= Math.min(65535, end); i++) set.add(i);
          }
        } else {
          const num = Number(s);
          if (!isNaN(num) && num >= 1 && num <= 65535) set.add(num);
        }
      });
      return Array.from(set).sort((a, b) => a - b);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = TARGET_PRESETS.find(x => x.id === presetId);
    if (p) {
      setTargetInput(p.address);
    }
  };

  const startScan = () => {
    const ports = getPortsToScan();
    if (ports.length === 0) {
      alert('Please specify at least one valid port number.');
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setDiscoveredPorts([]);
    setTerminalLogs([]);

    const startTime = performance.now();
    const preset = TARGET_PRESETS.find(x => x.address === targetInput) || TARGET_PRESETS[0];

    const logs: string[] = [
      '================================================================================',
      '        _   _      _                      _      ____                                 ',
      '       | \\ | | ___| |___      _____  _ __| | __ / ___|  ___ __ _ _ __  _ __   ___ _ __ ',
      '       |  \\| |/ _ \\ __\\ \\ /\\ / / _ \\| \'__| |/ / \\___ \\ / __/ _` | \'_ \\| \'_ \\ / _ \\ \'__|',
      '       | |\\  |  __/ |_ \\ V  V / (_) | |  |   <   ___) | (_| (_| | | | | | | |  __/ |   ',
      '       |_| \\_|\\___|\\__| \\_/\\_/ \\___/|_|  |_|\\_\\ |____/ \\___\\__,_|_| |_|_| |_|\\___|_|   ',
      '             Python 3 Multi-Threaded Network & Security Port Scanner             ',
      '================================================================================',
      'طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar)',
      '================================================================================',
      `[*] Target Host(s) to Scan: 1 host(s) [${targetInput}]`,
      `[*] Target Port Count: ${ports.length} ports`,
      `[*] Multi-Threading Concurrency: ${threads} threads`,
      `[*] Socket Timeout: ${timeoutSec}s | Banner Grabbing: ${enableBanner ? 'Enabled' : 'Disabled'}`,
      `---> Commencing Scan on Host: ${targetInput}`,
      ''
    ];
    setTerminalLogs([...logs]);

    let completed = 0;
    const found: DiscoveredPort[] = [];
    const stepSize = Math.max(1, Math.floor(ports.length / 15));

    const interval = setInterval(() => {
      completed += stepSize;
      const currentPortBatch = ports.slice(completed - stepSize, completed);

      currentPortBatch.forEach(port => {
        // Determine state
        let isOpen = false;
        if (targetInput === '127.0.0.1') {
          // Port 3000 is our live server! Port 80 can also be open
          isOpen = port === 3000 || port === 80;
        } else if (preset) {
          isOpen = preset.openPorts.includes(port);
        }

        if (isOpen) {
          const serviceInfo = KNOWN_SERVICES[port];
          const serviceName = serviceInfo ? serviceInfo.service : 'Unknown Service';
          const latency = Number((Math.random() * 8 + 0.8).toFixed(1));
          let banner = '';
          if (enableBanner) {
            banner = serviceInfo?.defaultBanner || (port === 3000 ? 'HTTP/1.1 200 OK | Vite Dev Server' : 'Service Probe Active');
          }

          const discovered: DiscoveredPort = {
            port,
            ip: targetInput,
            state: 'open',
            service: serviceName,
            latencyMs: latency,
            banner
          };

          found.push(discovered);
          logs.push(
            `[+] OPEN PORT: ${port.toString().padEnd(6)} ${serviceName.padEnd(20)} (${latency}ms)${banner ? ` | Banner: ${banner}` : ''}`
          );
        }
      });

      const pct = Math.min(100, Math.round((completed / ports.length) * 100));
      setProgress(pct);
      setTerminalLogs([...logs]);
      setDiscoveredPorts([...found]);

      if (completed >= ports.length) {
        clearInterval(interval);
        const duration = Number(((performance.now() - startTime) / 1000).toFixed(2));
        setScanDuration(duration);

        logs.push('');
        logs.push('================================================================================');
        logs.push(`SCAN REPORT FOR HOST: ${targetInput} (Scan Duration: ${duration}s)`);
        logs.push('================================================================================');
        logs.push(`PORT     STATE    SERVICE                  LATENCY      BANNER / VERSION`);
        logs.push('--------------------------------------------------------------------------------');

        found.forEach(res => {
          logs.push(
            `${(res.port + '/tcp').padEnd(8)} OPEN     ${res.service.padEnd(24)} ${(res.latencyMs + ' ms').padEnd(12)} ${res.banner || '-'}`
          );
        });

        logs.push('--------------------------------------------------------------------------------');
        logs.push(`Total Open Ports Detected: ${found.length}`);
        logs.push(`[*] Entire Scan Completed in: ${duration} seconds`);
        logs.push('================================================================================');
        logs.push('طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar)');
        logs.push('================================================================================');

        setTerminalLogs([...logs]);
        setIsScanning(false);
      }
    }, 120);
  };

  const exportJSON = () => {
    const payload = {
      metadata: {
        timestamp: new Date().toISOString(),
        scanner: "Python Network Port Scanner",
        instructor: "امیرسامان پیرایش فر (Amir Saman Pirayeshfar)",
        target: targetInput,
        durationSeconds: scanDuration
      },
      results: discoveredPorts
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_${targetInput.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    let csv = "Host IP,Port,State,Service Name,Latency (ms),Banner\n";
    discoveredPorts.forEach(p => {
      csv += `"${p.ip}",${p.port},OPEN,"${p.service}",${p.latencyMs},"${p.banner.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_${targetInput.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Scanner Parameters & Target Execution
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure target host, port ranges, multi-threading concurrency, and socket timeout
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
            <Zap className="w-3.5 h-3.5" />
            <span>Python 3.10 Engine Ready</span>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          {/* Target Host */}
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Target Host / IP / Subnet
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="127.0.0.1 or scanme.nmap.org"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TARGET_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                    targetInput === p.address
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-semibold'
                      : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Port Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-yellow-400" />
              Port Specification (-p / --top)
            </label>
            <select
              value={portMode}
              onChange={(e: any) => setPortMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="top20">Top 20 Well-Known Ports</option>
              <option value="top100">Top 100 Common Ports</option>
              <option value="webdb">Web & Database Ports (80,443,3000...)</option>
              <option value="custom">Custom Range / List...</option>
            </select>
            {portMode === 'custom' && (
              <input
                type="text"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                placeholder="e.g. 1-1024 or 80,443,3000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-yellow-300 focus:outline-none focus:border-yellow-500"
              />
            )}
          </div>

          {/* Concurrency & Timeout */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Threads:
                </span>
                <span className="font-mono text-emerald-400 font-bold">{threads}</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                className="w-full accent-emerald-500 mt-1"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Timeout (seconds):</span>
                <span className="font-mono text-amber-400 font-bold">{timeoutSec}s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={timeoutSec}
                onChange={(e) => setTimeoutSec(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={enableBanner}
              onChange={(e) => setEnableBanner(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span>Enable Service Banner Grabbing (HTTP HEAD, SSH, FTP probe)</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              disabled={isScanning}
              onClick={startScan}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide uppercase transition shadow-lg shadow-emerald-950 flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning In Progress ({progress}%)...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Python Port Scanner
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        {isScanning && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Scanning {getPortsToScan().length} ports via ThreadPoolExecutor...</span>
              <span className="text-emerald-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Discovered Ports & Terminal Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Discovered Open Ports Table */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Discovered Ports ({discoveredPorts.length})
              </h4>
              {discoveredPorts.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={exportJSON}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 border border-slate-700"
                    title="Export JSON"
                  >
                    <FileJson className="w-3.5 h-3.5 text-cyan-400" /> JSON
                  </button>
                  <button
                    onClick={exportCSV}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 border border-slate-700"
                    title="Export CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
                  </button>
                </div>
              )}
            </div>

            {discoveredPorts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                {isScanning ? (
                  <p className="animate-pulse">Inspecting socket states across thread workers...</p>
                ) : (
                  <p>Click "Run Python Port Scanner" to discover open services on {targetInput}</p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {discoveredPorts.map((item) => (
                  <div
                    key={item.port}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {item.port}/tcp
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          OPEN
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400">
                        {item.latencyMs} ms
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-semibold">{item.service}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.ip}</span>
                    </div>
                    {item.banner && (
                      <p className="mt-1.5 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded truncate border border-slate-800/80">
                        Banner: <span className="text-purple-300">{item.banner}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target: <code className="text-white font-mono">{targetInput}</code></span>
            <span>Duration: <code className="text-emerald-400 font-mono">{scanDuration}s</code></span>
          </div>
        </div>

        {/* Live Terminal Output Console */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Terminal Window Chrome */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-mono text-slate-300 ml-2 flex items-center gap-1.5">
                <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                bash ~ python3 scanner.py {targetInput}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">stdout</span>
          </div>

          {/* Terminal Scroll Content */}
          <div className="p-4 font-mono text-xs text-slate-300 bg-slate-950 overflow-y-auto max-h-[420px] min-h-[320px] space-y-0.5">
            {terminalLogs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center">
                Terminal output stream idle. Press "Run Python Port Scanner" to execute.
              </div>
            ) : (
              terminalLogs.map((line, idx) => {
                let colorClass = 'text-slate-300';
                if (line.includes('OPEN PORT')) colorClass = 'text-emerald-400 font-bold';
                else if (line.includes('SCAN REPORT')) colorClass = 'text-cyan-400 font-bold';
                else if (line.includes('طراح، توسعه‌دهنده و مدرس')) colorClass = 'text-amber-400 font-bold';
                else if (line.includes('Commencing Scan')) colorClass = 'text-cyan-300';
                else if (line.includes('[*]')) colorClass = 'text-yellow-300';
                else if (line.startsWith('=')) colorClass = 'text-slate-500';

                return (
                  <div key={idx} className={`${colorClass} whitespace-pre-wrap leading-relaxed`}>
                    {line}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
