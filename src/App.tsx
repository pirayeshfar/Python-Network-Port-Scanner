import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Activity, 
  FileCode, 
  BookOpen, 
  ExternalLink, 
  Github, 
  Cpu, 
  Lock, 
  Zap, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';
import { ScannerWorkbench } from './components/ScannerWorkbench';
import { HandshakeVisualizer } from './components/HandshakeVisualizer';
import { CodeViewer } from './components/CodeViewer';
import { BilingualGuide } from './components/BilingualGuide';

type NavigationTab = 'workbench' | 'handshake' | 'code' | 'guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('workbench');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 shadow-md">
        {/* Creator Attribution Bar */}
        <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/70 border-b border-slate-800/80 px-4 py-1.5 text-center text-xs">
          <span className="text-slate-300 font-medium">طراح، توسعه‌دهنده و مدرس: </span>
          <span className="font-bold text-amber-400 font-['Vazirmatn'] ml-1">
            امیرسامان پیرایش فر
          </span>
          <span className="text-slate-400 font-mono text-[11px] ml-1.5">
            (Amir Saman Pirayeshfar)
          </span>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Python Network Port Scanner
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v2.0 Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Threaded Socket Reconnaissance & Educational Handshake Laboratory
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'workbench'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Scanner Workbench
            </button>

            <button
              onClick={() => setActiveTab('handshake')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'handshake'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              TCP Handshake Lab
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Source Code & Files
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Bilingual Theory (FA/EN)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {activeTab === 'workbench' && <ScannerWorkbench />}
        {activeTab === 'handshake' && <HandshakeVisualizer />}
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'guide' && <BilingualGuide />}
      </main>

      {/* Persistent Academic & Instructor Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Network Port Scanner & TCP Socket Analyzer
              </p>
              <p className="text-[11px] text-slate-500">
                Engineered with Python 3 Standard Library, ThreadPoolExecutor & Socket API
              </p>
            </div>
          </div>

          {/* Central Mandatory Attribution */}
          <div className="text-center bg-slate-900 border border-slate-800/80 px-6 py-2.5 rounded-xl shadow-inner">
            <p className="text-xs text-slate-300 font-['Vazirmatn']">
              <span className="text-slate-400">طراح، توسعه‌دهنده و مدرس: </span>
              <strong className="text-amber-400 font-bold ml-1">امیرسامان پیرایش فر</strong>
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Amir Saman Pirayeshfar &mdash; Senior Network Security Engineer & Instructor
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified CLI Build
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
