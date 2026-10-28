import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Activity, Terminal, Info } from 'lucide-react';

type ScenarioType = 'open' | 'closed' | 'filtered';

interface PacketStep {
  title: string;
  titleFa: string;
  sender: 'client' | 'server' | 'firewall';
  receiver: 'client' | 'server' | 'drop' | 'firewall';
  flags: string[];
  seq: number;
  ack: number;
  descriptionEn: string;
  descriptionFa: string;
  pythonSnippet: string;
  packetSummary: string;
}

export const HandshakeVisualizer: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioType>('open');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [targetPort, setTargetPort] = useState<number>(80);

  const getStepsForScenario = (scen: ScenarioType, port: number): PacketStep[] => {
    if (scen === 'open') {
      return [
        {
          title: '1. Client SYN Transmission',
          titleFa: '۱. ارسال پکت SYN توسط کلاینت',
          sender: 'client',
          receiver: 'server',
          flags: ['SYN'],
          seq: 1000,
          ack: 0,
          descriptionEn: 'The scanner generates a random initial sequence number (ISN=1000) and sends a TCP segment with the SYN flag enabled to request a new session.',
          descriptionFa: 'اسکنر با ایجاد یک شماره توالی اولیه تصادفی، پکت TCP با پرچم SYN فعال را جهت درخواست برقراری نشست ارسال می‌کند.',
          pythonSnippet: 's = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.settimeout(1.0)\ns.connect_ex((ip, port))  # Triggers OS SYN',
          packetSummary: `TCP Flags: [SYN] | SrcPort: 53210 -> DstPort: ${port} | Seq: 1000 | Ack: 0`
        },
        {
          title: '2. Server SYN-ACK Response',
          titleFa: '۲. پاسخ SYN-ACK از سمت سرور',
          sender: 'server',
          receiver: 'client',
          flags: ['SYN', 'ACK'],
          seq: 5000,
          ack: 1001,
          descriptionEn: `The server port ${port} is OPEN with an active daemon listening. It synchronizes its own sequence number (5000) and acknowledges the client's SYN (1001).`,
          descriptionFa: `پورت ${port} باز و سرویس مربوطه فعال است. سرور شماره توالی خود را ارسال کرده و درخواست کلاینت را تایید می‌کند.`,
          pythonSnippet: '# Kernel receives SYN-ACK packet\n# connect_ex returns code 0 (Success!)',
          packetSummary: `TCP Flags: [SYN, ACK] | SrcPort: ${port} -> DstPort: 53210 | Seq: 5000 | Ack: 1001`
        },
        {
          title: '3. Client ACK (Handshake Complete)',
          titleFa: '۳. تایید نهایی ACK توسط کلاینت',
          sender: 'client',
          receiver: 'server',
          flags: ['ACK'],
          seq: 1001,
          ack: 5001,
          descriptionEn: 'The client sends the final ACK segment. The TCP connection is now in the ESTABLISHED state.',
          descriptionFa: 'کلاینت با ارسال تاییدیه ACK، فرایند دست‌تکانی را کامل کرده و نشست در وضعیت ESTABLISHED قرار می‌گیرد.',
          pythonSnippet: '# Socket is connected and ready for I/O operations\nis_open = True',
          packetSummary: `TCP Flags: [ACK] | SrcPort: 53210 -> DstPort: ${port} | Seq: 1001 | Ack: 5001`
        },
        {
          title: '4. Service Banner Interrogation',
          titleFa: '۴. دریافت بنر و شناسایی نسخه سرویس',
          sender: 'client',
          receiver: 'server',
          flags: ['PSH', 'ACK'],
          seq: 1001,
          ack: 5001,
          descriptionEn: 'The scanner sends a non-destructive application probe (e.g. HEAD / HTTP/1.1 or empty newline) or awaits the initial welcome greeting.',
          descriptionFa: 'اسکنر برای شناسایی نرم‌افزار، درخواست سبکی مانند HEAD ارسال می‌کند یا منتظر پیام خوش‌آمدگویی سرور می‌ماند.',
          pythonSnippet: 's.sendall(b"HEAD / HTTP/1.1\\r\\nHost: target\\r\\n\\r\\n")\nbanner = s.recv(1024).decode()',
          packetSummary: 'Data payload: "HEAD / HTTP/1.1\\r\\nHost: ..."'
        },
        {
          title: '5. Connection Teardown & Resource Cleanup',
          titleFa: '۵. بستن سوکت و آزادسازی منابع',
          sender: 'client',
          receiver: 'server',
          flags: ['FIN', 'ACK'],
          seq: 1055,
          ack: 5240,
          descriptionEn: 'The socket is gracefully closed via s.close() to free system file descriptors and avoid server connection exhaustion.',
          descriptionFa: 'سوکت با متد s.close() بسته می‌شود تا دسکریپتورهای فایل آزاد شده و سرور زیر بار نماند.',
          pythonSnippet: 's.close()  # Clean socket termination',
          packetSummary: `TCP Flags: [FIN, ACK] -> Connection terminated cleanly.`
        }
      ];
    } else if (scen === 'closed') {
      return [
        {
          title: '1. Client SYN Transmission',
          titleFa: '۱. ارسال پکت SYN توسط کلاینت',
          sender: 'client',
          receiver: 'server',
          flags: ['SYN'],
          seq: 1000,
          ack: 0,
          descriptionEn: `The scanner attempts to connect to port ${port} by sending a SYN segment.`,
          descriptionFa: `اسکنر برای بررسی وضعیت پورت ${port} پکت آغازین SYN را به سمت میزبان ارسال می‌کند.`,
          pythonSnippet: 's.connect_ex((ip, port))',
          packetSummary: `TCP Flags: [SYN] | SrcPort: 53210 -> DstPort: ${port} | Seq: 1000`
        },
        {
          title: '2. Server RST Response (Port Closed)',
          titleFa: '۲. ارسال پکت RST توسط سرور (پورت بسته است)',
          sender: 'server',
          receiver: 'client',
          flags: ['RST', 'ACK'],
          seq: 0,
          ack: 1001,
          descriptionEn: `The host operating system kernel inspects its port binding table. Because NO application is bound to port ${port}, the TCP stack immediately replies with a Reset (RST) packet.`,
          descriptionFa: `هیچ پردازه‌ای روی پورت ${port} گوش نمی‌دهد. در نتیجه پشته شبکه سرور بلافاصله یک پکت RST پس می‌فرستد.`,
          pythonSnippet: '# Kernel returns ConnectionRefusedError (errno 111 / ECONNREFUSED)\ncode = s.connect_ex(...) # code != 0 -> CLOSED',
          packetSummary: `TCP Flags: [RST, ACK] | Connection Refused by Target OS`
        },
        {
          title: '3. Scanner Classification: CLOSED',
          titleFa: '۳. طبقه‌بندی وضعیت: پورت بسته (CLOSED)',
          sender: 'client',
          receiver: 'client',
          flags: [],
          seq: 0,
          ack: 0,
          descriptionEn: 'The scanner determines the target host is online and responsive, but the specified service port is closed.',
          descriptionFa: 'اسکنر متوجه می‌شود که سیستم روشن است اما این سرویس روی آن فعال نیست.',
          pythonSnippet: 'is_open = False\ns.close()',
          packetSummary: `Port State: CLOSED | Return Code: ECONNREFUSED`
        }
      ];
    } else {
      // filtered
      return [
        {
          title: '1. Client SYN Transmission',
          titleFa: '۱. ارسال پکت SYN به سمت پورت فیلترشده',
          sender: 'client',
          receiver: 'firewall',
          flags: ['SYN'],
          seq: 1000,
          ack: 0,
          descriptionEn: `The scanner sends a SYN packet to port ${port}. An intermediate firewall or host security rule (iptables/Windows Defender) is present.`,
          descriptionFa: `اسکنر پکت SYN را ارسال می‌کند؛ اما در مسیر یا روی سرور، دیواره آتش (Firewall) قرار دارد.`,
          pythonSnippet: 's.settimeout(1.0)\ns.connect_ex((ip, port))',
          packetSummary: `TCP Flags: [SYN] -> Traversing Network Boundary`
        },
        {
          title: '2. Firewall Silent Packet Drop',
          titleFa: '۲. مسدودسازی خاموش بسته توسط فایروال (DROP)',
          sender: 'firewall',
          receiver: 'drop',
          flags: ['DROP'],
          seq: 0,
          ack: 0,
          descriptionEn: 'Rather than rejecting with RST, the security gateway silently discards the packet (DROP policy). No response is transmitted back to the scanner.',
          descriptionFa: 'فایروال پکت را بدون هیچ پاسخی دور می‌اندازد (سیاست DROP) تا وجود سرور فاش نشود.',
          pythonSnippet: '# Firewall action: iptables -A INPUT -p tcp --dport 445 -j DROP\n# No packets transmitted back.',
          packetSummary: `FIREWALL ACTION: PACKET DROPPED SILENTLY`
        },
        {
          title: '3. Socket Timeout Expiration',
          titleFa: '۳. انقضای مهلت زمانی سوکت (Timeout)',
          sender: 'client',
          receiver: 'client',
          flags: ['TIMEOUT'],
          seq: 0,
          ack: 0,
          descriptionEn: 'The socket wait deadline (e.g. 1.0 second) expires with zero packets returned. The port is classified as FILTERED.',
          descriptionFa: 'مهلت زمانی تعیین شده به پایان می‌رسد و وضعیّت پورت به عنوان فیلترشده (FILTERED) ثبت می‌گردد.',
          pythonSnippet: 'except socket.timeout:\n    is_open = False\n    error_msg = "Timeout (filtered/firewalled)"',
          packetSummary: `Socket Error: Operation timed out (FILTERED)`
        }
      ];
    }
  };

  const currentSteps = getStepsForScenario(scenario, targetPort);

  // Auto-advance if playing
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= currentSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentSteps.length]);

  const activeStep = currentSteps[currentStepIndex] || currentSteps[0];

  const handleScenarioChange = (scen: ScenarioType) => {
    setScenario(scen);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (scen === 'open') setTargetPort(80);
    if (scen === 'closed') setTargetPort(23);
    if (scen === 'filtered') setTargetPort(445);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Scenario Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              TCP 3-Way Handshake & Socket Visualizer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive packet-level inspection of <code className="text-emerald-300 font-mono">socket.connect_ex()</code> behavior in Python
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleScenarioChange('open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                scenario === 'open'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Open Port (SYN-ACK)
            </button>
            <button
              onClick={() => handleScenarioChange('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                scenario === 'closed'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              Closed Port (RST)
            </button>
            <button
              onClick={() => handleScenarioChange('filtered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                scenario === 'filtered'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Filtered (Firewall DROP)
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              title={isPlaying ? 'Pause' : 'Auto Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              disabled={currentStepIndex >= currentSteps.length - 1}
              onClick={() => setCurrentStepIndex(p => Math.min(currentSteps.length - 1, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 transition flex items-center gap-1 border border-slate-700"
            >
              Next Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {currentSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentStepIndex(idx); setIsPlaying(false); }}
                className={`w-7 h-7 rounded-full text-xs font-bold transition flex items-center justify-center ${
                  idx === currentStepIndex
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/50'
                    : idx < currentStepIndex
                    ? 'bg-slate-700 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Animated Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Arena */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          {/* Header of Visual */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-4 border-b border-slate-800">
            <div>
              Target: <span className="text-white font-semibold">192.168.1.50</span> : <span className="text-emerald-400 font-bold">{targetPort}/tcp</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Step {currentStepIndex + 1} of {currentSteps.length}</span>
            </div>
          </div>

          {/* Node Entities */}
          <div className="py-8 grid grid-cols-3 items-center text-center relative">
            {/* Client Machine */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500/60 flex items-center justify-center shadow-lg shadow-cyan-950/50 relative">
                <Terminal className="w-7 h-7 text-cyan-400" />
                <span className="absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-900 text-cyan-200 border border-cyan-700">
                  Client
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-2">Python Scanner</p>
              <p className="text-[11px] font-mono text-slate-400">192.168.1.10</p>
              <p className="text-[10px] font-mono text-cyan-400 mt-0.5">Port 53210</p>
            </div>

            {/* In-Transit Packet Animation */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="w-full relative flex items-center justify-center py-2">
                <div className="w-full h-0.5 bg-slate-800 absolute top-1/2 -translate-y-1/2"></div>
                
                {/* Dynamic Packet Card */}
                <div 
                  className={`relative z-10 px-3 py-1.5 rounded-md text-xs font-mono font-bold shadow-md transition-all duration-500 border ${
                    activeStep.receiver === 'drop'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                      : activeStep.sender === 'client'
                      ? 'bg-cyan-900/90 text-cyan-200 border-cyan-400'
                      : 'bg-emerald-900/90 text-emerald-200 border-emerald-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {activeStep.sender === 'client' && <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{activeStep.flags.join('+') || 'TIMEOUT'}</span>
                    {activeStep.sender === 'server' && <ArrowRight className="w-3.5 h-3.5 rotate-180 text-emerald-400" />}
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-full">
                {activeStep.packetSummary}
              </p>
            </div>

            {/* Target Server / Firewall */}
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative border-2 ${
                scenario === 'filtered'
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-400'
                  : scenario === 'closed'
                  ? 'bg-rose-950/70 border-rose-500/60 text-rose-400'
                  : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-400'
              }`}>
                {scenario === 'filtered' ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <Activity className="w-7 h-7" />
                )}
                <span className="absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-200 border border-slate-700">
                  {scenario === 'filtered' ? 'Firewall' : 'Target Host'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-2">
                {scenario === 'filtered' ? 'Edge Firewall' : 'Target Server'}
              </p>
              <p className="text-[11px] font-mono text-slate-400">192.168.1.50</p>
              <p className="text-[10px] font-mono text-amber-400 mt-0.5">Port {targetPort}/tcp</p>
            </div>
          </div>

          {/* Bilingual Step Explanations */}
          <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                {activeStep.title}
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Step {currentStepIndex + 1}/{currentSteps.length}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeStep.descriptionEn}
            </p>
            <p className="text-xs text-slate-400 pt-1 border-t border-slate-900 leading-relaxed text-right font-['Vazirmatn']" dir="rtl">
              {activeStep.descriptionFa}
            </p>
          </div>
        </div>

        {/* Python Code & Packet Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Python Execution Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-mono text-slate-300 ml-1">scanner.py : Socket Execution</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Python 3.10</span>
            </div>
            <div className="p-4 font-mono text-xs text-emerald-400 bg-slate-950/90 leading-relaxed overflow-x-auto min-h-[140px]">
              <pre className="text-slate-300">
                {activeStep.pythonSnippet}
              </pre>
            </div>
          </div>

          {/* Packet Header Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              TCP Packet Inspection
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">TCP FLAGS</span>
                <span className="text-cyan-300 font-semibold">{activeStep.flags.join(', ') || 'NONE'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PORT STATE</span>
                <span className={`font-semibold ${
                  scenario === 'open' ? 'text-emerald-400' : scenario === 'closed' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {scenario.toUpperCase()}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SEQUENCE NUMBER</span>
                <span className="text-slate-300">{activeStep.seq || 'N/A'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ACKNOWLEDGMENT</span>
                <span className="text-slate-300">{activeStep.ack || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
