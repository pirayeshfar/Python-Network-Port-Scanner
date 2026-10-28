import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Cpu, Network, Terminal, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export const BilingualGuide: React.FC = () => {
  const [langView, setLangView] = useState<'both' | 'fa' | 'en'>('both');

  return (
    <div className="space-y-6">
      {/* Header & Language Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Educational Architecture & Theory / راهنمای جامع معماری و تئوری
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            In-depth academic guide on Socket Programming, TCP handshakes, GIL concurrency, and network recon
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start">
          <button
            onClick={() => setLangView('both')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              langView === 'both' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bilingual (Both)
          </button>
          <button
            onClick={() => setLangView('en')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              langView === 'en' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            English Only
          </button>
          <button
            onClick={() => setLangView('fa')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition font-['Vazirmatn'] ${
              langView === 'fa' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            فارسی (Persian Only)
          </button>
        </div>
      </div>

      {/* Grid of Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Socket Programming */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Network className="w-4 h-4" />
            <h3>1. Socket Programming & Low-Level API</h3>
          </div>

          {(langView === 'both' || langView === 'en') && (
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <h4 className="font-semibold text-white">Python Socket Fundamentals:</h4>
              <p>
                A network socket is an endpoint for sending or receiving data across a computer network. 
                In Python, <code className="text-cyan-300 font-mono">socket.socket(socket.AF_INET, socket.SOCK_STREAM)</code> specifies 
                IPv4 protocol addressing combined with reliable, connection-oriented TCP streams.
              </p>
              <p>
                <strong>Why <code className="text-emerald-300 font-mono">connect_ex()</code> instead of <code className="text-emerald-300 font-mono">connect()</code>?</strong><br />
                The standard <code className="font-mono">connect()</code> raises exceptions on failure, creating heavy CPU overhead for try/except blocks. 
                In contrast, <code className="font-mono">connect_ex()</code> directly mirrors the C-level system call and returns an integer status code (<code className="text-emerald-400 font-mono">0</code> for success, or <code className="text-rose-400 font-mono">errno</code> on rejection), boosting speed drastically.
              </p>
            </div>
          )}

          {(langView === 'both' || langView === 'fa') && (
            <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800 leading-relaxed font-['Vazirmatn']" dir="rtl">
              <h4 className="font-semibold text-white">مبانی برنامه‌نویسی سوکت در پایتون:</h4>
              <p>
                سوکت نقطه پایانی ارتباطات بین دو برنامه در بستر شبکه است. ترکیب <code className="text-cyan-300 font-mono">AF_INET</code> (پروتکل IPv4) و <code className="text-cyan-300 font-mono">SOCK_STREAM</code> (پروتکل اتصال‌گرای TCP) شالوده اصلی اسکنر را تشکیل می‌دهد.
              </p>
              <p>
                متد <code className="text-emerald-300 font-mono">connect_ex()</code> مستقیماً کد خطای سیستمی سطح هسته (Kernel errno) را بدون پرتاب استثنا برمی‌گرداند. مقدار صفر به معنای دریافت بسته SYN-ACK و باز بودن قطعی پورت است.
              </p>
            </div>
          )}
        </div>

        {/* Card 2: TCP 3-Way Handshake & Port States */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h3>2. TCP 3-Way Handshake & Tri-State Logic</h3>
          </div>

          {(langView === 'both' || langView === 'en') && (
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <h4 className="font-semibold text-white">Three Distinct Port States:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-emerald-300">OPEN:</strong> Target daemon replies with <code className="font-mono">SYN-ACK</code>. Scanner sends <code className="font-mono">ACK</code>. Connection is fully established.</li>
                <li><strong className="text-rose-300">CLOSED:</strong> Target OS has no listening process bound to the port and replies with a <code className="font-mono">RST (Reset)</code> segment.</li>
                <li><strong className="text-amber-300">FILTERED:</strong> Intermediate firewall or security rule silently drops the <code className="font-mono">SYN</code> packet, causing a socket timeout.</li>
              </ul>
            </div>
          )}

          {(langView === 'both' || langView === 'fa') && (
            <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800 leading-relaxed font-['Vazirmatn']" dir="rtl">
              <h4 className="font-semibold text-white">حالات سه‌گانه وضعیت پورت‌ها:</h4>
              <ul className="list-disc pr-4 space-y-1">
                <li><strong className="text-emerald-300">پورت باز (OPEN):</strong> سرور با پکت <code className="font-mono">SYN-ACK</code> پاسخ می‌دهد و آماده تبادل داده است.</li>
                <li><strong className="text-rose-300">پورت بسته (CLOSED):</strong> میزبان روشن است اما سرویسی روی پورت فعال نبوده و پکت <code className="font-mono">RST</code> پس می‌فرستد.</li>
                <li><strong className="text-amber-300">فیلترشده (FILTERED):</strong> فایروال یا لیست دسترسی (ACL) پکت را بی‌صدا حذف (DROP) می‌کند و مهلت زمانی منقضی می‌شود.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Card 3: Multi-Threading & GIL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <h3>3. ThreadPoolExecutor & GIL in I/O Bound Tasks</h3>
          </div>

          {(langView === 'both' || langView === 'en') && (
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <h4 className="font-semibold text-white">Why Threading is Blazing Fast:</h4>
              <p>
                The Global Interpreter Lock (GIL) limits Python bytecode execution to one thread per CPU core. 
                However, socket calls are <strong>I/O-bound</strong>: while awaiting network latency and remote responses, Python automatically releases the GIL.
              </p>
              <p>
                Using <code className="text-yellow-300 font-mono">concurrent.futures.ThreadPoolExecutor(max_workers=100)</code> allows 100 simultaneous network connections, reducing total scan time from 15 minutes to under 2 seconds.
              </p>
            </div>
          )}

          {(langView === 'both' || langView === 'fa') && (
            <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800 leading-relaxed font-['Vazirmatn']" dir="rtl">
              <h4 className="font-semibold text-white">چندنخی و اثر قفل سراسری مفسر (GIL):</h4>
              <p>
                اسکن پورت کاری از نوع I/O-Bound است. پایتون هنگام انتظار برای پاسخ کارت شبکه، قفل GIL را آزاد می‌کند. بنابراین نخ‌های همزمان می‌توانند بدون هیچ تداخلی صدها پورت را در کسری از ثانیه بررسی کنند.
              </p>
              <p>
                استفاده از <code className="text-yellow-300 font-mono">ThreadPoolExecutor</code> موجب مدیریت هوشمند استخر نخ‌ها و جلوگیری از اتلاف حافظه می‌شود.
              </p>
            </div>
          )}
        </div>

        {/* Card 4: Service Banner Grabbing */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Terminal className="w-4 h-4" />
            <h3>4. Service Banner Grabbing Techniques</h3>
          </div>

          {(langView === 'both' || langView === 'en') && (
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <h4 className="font-semibold text-white">Protocol Identification:</h4>
              <p>
                Once a port is open, the scanner identifies running software versions via:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Passive Banners:</strong> SSH, FTP, and SMTP automatically send welcome strings upon connection.</li>
                <li><strong>Active Probes:</strong> Web servers receive a standard <code className="font-mono">HEAD / HTTP/1.1</code> request to elicit <code className="font-mono">Server: nginx/Apache</code> headers without loading entire webpages.</li>
              </ul>
            </div>
          )}

          {(langView === 'both' || langView === 'fa') && (
            <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800 leading-relaxed font-['Vazirmatn']" dir="rtl">
              <h4 className="font-semibold text-white">تکنیک استخراج بنر (Banner Grabbing):</h4>
              <p>
                پس از باز شدن پورت، اسکریپت با دو شیوه هوشمند هویت نرم‌افزار را استخراج می‌کند:
              </p>
              <ul className="list-disc pr-4 space-y-1">
                <li><strong>بنر غیرفعال (Passive):</strong> خواندن پیام خوش‌آمدگویی پروتکل‌های SSH، FTP و SMTP بلافاصله پس از اتصال.</li>
                <li><strong>پراب فعال (Active):</strong> ارسال درخواست استاندارد <code className="font-mono">HEAD</code> به وب‌سرورها جهت دریافت نگارش نرم‌افزار بدون بارگذاری کل سایت.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Security & Ethical Attribution Card */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Ethical Reconnaissance & Academic Attribution</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            This project is engineered strictly for educational, defensive audit, and cyber security academic research. 
            Unauthorized scanning against systems without explicit written consent is strictly prohibited.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-purple-500/40 px-5 py-3 rounded-xl text-center shadow-lg">
          <span className="text-[11px] text-slate-400 block font-mono">PROJECT LEAD & INSTRUCTOR</span>
          <span className="text-sm font-bold text-amber-300 block mt-0.5">
            امیرسامان پیرایش فر
          </span>
          <span className="text-xs text-slate-300 font-mono block">
            Amir Saman Pirayeshfar
          </span>
        </div>
      </div>
    </div>
  );
};
