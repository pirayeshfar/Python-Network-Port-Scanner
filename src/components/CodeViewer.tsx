import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, FileText, Terminal, Layers } from 'lucide-react';
import { SCANNER_PY_CODE, REQUIREMENTS_TXT_CODE } from '../data/codeContent';
import { README_MD_CONTENT } from '../data/readmeContent';

type FileTab = 'scanner' | 'requirements' | 'readme';

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FileTab>('scanner');
  const [copied, setCopied] = useState<boolean>(false);

  const getActiveContent = (): { code: string; filename: string; language: string } => {
    switch (activeTab) {
      case 'scanner':
        return { code: SCANNER_PY_CODE, filename: 'scanner.py', language: 'python' };
      case 'requirements':
        return { code: REQUIREMENTS_TXT_CODE, filename: 'requirements.txt', language: 'text' };
      case 'readme':
        return { code: README_MD_CONTENT, filename: 'README.md', language: 'markdown' };
    }
  };

  const { code, filename, language } = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* File Navigation Tabs */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            scanner.py
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-sans">
              Python 3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
              activeTab === 'requirements'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-600/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            requirements.txt
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
              activeTab === 'readme'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-600/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            README.md (Bilingual)
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-sans">
              EN / FA
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copy Code
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download {filename}
          </button>
        </div>
      </div>

      {/* Code Display with Line Numbers */}
      <div className="p-4 bg-slate-950 overflow-x-auto max-h-[640px] font-mono text-xs leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60 transition">
                <td className="w-12 pr-4 text-right select-none text-slate-600 font-mono text-[11px] align-top">
                  {idx + 1}
                </td>
                <td className="text-slate-200 font-mono whitespace-pre text-xs align-top">
                  {line.startsWith('#') || line.startsWith('"""') || line.startsWith('//') ? (
                    <span className="text-slate-500 italic">{line}</span>
                  ) : line.includes('def ') || line.includes('class ') ? (
                    <span className="text-cyan-400 font-semibold">{line}</span>
                  ) : line.includes('import ') || line.includes('from ') ? (
                    <span className="text-purple-400">{line}</span>
                  ) : line.includes('return ') || line.includes('if ') || line.includes('else:') ? (
                    <span className="text-amber-300">{line}</span>
                  ) : line.includes('امیرسامان پیرایش فر') ? (
                    <span className="text-amber-400 font-bold bg-amber-950/30 px-1 rounded">{line}</span>
                  ) : (
                    line
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attribution Footer */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-500">
          Lines: {lines.length} | Format: UTF-8 | Target: Python 3.x
        </span>
        <span className="text-amber-400 font-semibold">
          طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar)
        </span>
      </div>
    </div>
  );
};
