# 🔍 Advanced Multi-Threaded Network Port Scanner & Service Banner Grabber (Python 3)
### اسکنر پیشرفته و چندنخی پورت‌های شبکه و استخراج بنر سرویس‌ها (پایتون ۳)

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-purple.svg)](https://github.com)
[![Topic](https://img.shields.io/badge/CyberSecurity-Network%20Reconnaissance-red.svg)](https://github.com)

---

## 📑 Table of Contents / فهرست مطالب
1. [English Documentation](#-english-documentation)
   - [Overview & Architecture](#overview--architecture)
   - [Deep Dive: TCP 3-Way Handshake](#deep-dive-tcp-3-way-handshake)
   - [Concurrency: ThreadPoolExecutor in I/O Bound Tasks](#concurrency-threadpoolexecutor-in-io-bound-tasks)
   - [Service Banner Grabbing Mechanics](#service-banner-grabbing-mechanics)
   - [Prerequisites & Installation](#prerequisites--installation)
   - [CLI Parameters & Usage](#cli-parameters--usage)
   - [Practical Real-World Examples](#practical-real-world-examples)
   - [Legal & Ethical Disclaimer](#legal--ethical-disclaimer)
2. [بخش آموزشی جامع به زبان فارسی (Educational Persian)](#-بخش-آموزشی-جامع-به-زبان-فارسی-educational-persian)
   - [معرفی کلی پروژه و فلسفه طراحی](#معرفی-کلی-پروژه-و-فلسفه-طراحی)
   - [مبانی برنامه‌نویسی سوکت (Socket Programming) در پایتون](#مبانی-برنامه‌نویسی-سوکت-socket-programming-در-پایتون)
   - [تشریح دست‌تکانی سه‌مرحله‌ای (TCP 3-Way Handshake)](#تشریح-دست‌تکانی-سه‌مرحله‌ای-tcp-3-way-handshake)
   - [تحلیل حالات سه‌گانه پورت: باز، بسته، فیلترشده](#تحلیل-حالات-سه‌گانه-پورت-باز-بسته-فیلترشده)
   - [چندنخی (Multi-Threading) و اثر قفل سراسری مفسر (GIL)](#چندنخی-multi-threading-و-اثر-قفل-سراسری-مفسر-gil)
   - [تکنیک بنر گرابینگ (Banner Grabbing) و شناسایی سرویس](#تکنیک-بنر-گرابینگ-banner-grabbing-و-شناسایی-سرویس)
   - [راهنمای جامع نصب و اجرای اسکریپت](#راهنمای-جامع-نصب-و-اجرای-اسکریپت)
   - [اصول اخلاقی و الزامات قانونی در تست نفوذ](#اصول-اخلاقی-و-الزامات-قانونی-در-تست-نفوذ)
3. [Creator Attribution / شناسنامه مدرس و طراح](#-creator-attribution--شناسنامه-مدرس-و-طراح)

---

# 🌐 English Documentation

## Overview & Architecture

The **Network Port Scanner** is an educational, production-ready reconnaissance tool engineered in Python 3. It provides high-speed, reliable port scanning and service banner identification across individual IP addresses, hostnames, and CIDR subnet blocks.

Unlike complex frameworks requiring heavy dependencies or C-extensions, this utility relies primarily on Python's robust native standard libraries (`socket`, `concurrent.futures`, `ipaddress`, `argparse`), making it ultra-portable, easy to audit, and deeply instructional for cybersecurity students and systems engineers.

```
                              ┌─────────────────────────┐
                              │ Target Input (IP/CIDR)  │
                              └────────────┬────────────┘
                                           │
                             Resolve Target (DNS / CIDR)
                                           │
                              ┌────────────▼────────────┐
                              │ Port Specification (-p) │
                              └────────────┬────────────┘
                                           │
                                ┌──────────▼──────────┐
                                │ ThreadPoolExecutor  │
                                │ (e.g., 100 Workers) │
                                └────┬──────┬──────┬──┘
                                     │      │      │
                        ┌────────────┘      │      └────────────┐
                        ▼                   ▼                   ▼
                  [Thread #1]          [Thread #2]         [Thread #N]
                  Port 22/TCP          Port 80/TCP         Port 443/TCP
                        │                   │                   │
                  socket.connect_ex()  socket.connect_ex() socket.connect_ex()
                        │                   │                   │
                        └──────────┬────────┴──────────┬────────┘
                                   │                   │
                            [If Port Open]      [If Port Closed]
                                   │                   │
                        Banner Grab (HTTP/SSH)     Record State
                                   │                   │
                                   └─────────┬─────────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │ Terminal Output / │
                                   │ JSON / CSV Export │
                                   └───────────────────┘
```

---

## Deep Dive: TCP 3-Way Handshake

At the transport layer of the OSI model, TCP guarantees reliable, ordered packet delivery. Initiating communication requires a three-step negotiation known as the **TCP Three-Way Handshake**:

```
Client (Scanner)                           Target Host (Server)
   |                                              |
   | ----------- [1] SYN (Synchronize) ---------> |
   |                                              |
   | <--- [2] SYN-ACK (Synchronize-Acknowledge) - |  (Port is OPEN)
   |                                              |
   | ------------ [3] ACK (Acknowledge) --------> |
   |                                              |
[Connection Established: Port Open & Active]
   |
   | ---------------- [4] RST / FIN ------------> |  (Clean socket tear-down)
```

### Port States Detected:
1. **OPEN (`connect_ex == 0`):** The target system replied with `SYN-ACK`. The port is actively bound to an application daemon listening for connections.
2. **CLOSED (`connect_ex == errno.ECONNREFUSED`):** The target system immediately replied with a `RST` (Reset) packet, indicating the host is up, but no process is listening on that port.
3. **FILTERED / TIMEOUT (`socket.timeout`):** No packet response was received before the timeout elapsed. This typically indicates a stateful packet firewall (such as `iptables`, `nftables`, or a network ACL) silently dropped the incoming `SYN` segment (`DROP` target).

---

## Concurrency: ThreadPoolExecutor in I/O Bound Tasks

A sequential scanner scanning 1,000 ports with a 1.0-second timeout would take up to **1,000 seconds (~16.6 minutes)** if most ports are filtered.

### Why Threads in Python Despite the GIL?
Python features the Global Interpreter Lock (GIL), which prevents multiple native OS threads from executing Python bytecode simultaneously on multiple CPU cores. 

However, network port scanning is strictly an **I/O-Bound (Input/Output)** task, not a CPU-bound task. When a thread issues `socket.connect_ex()` or `socket.recv()`, Python releases the GIL while waiting for the operating system kernel to handle network packets and round-trip latency. Therefore, `concurrent.futures.ThreadPoolExecutor` provides tremendous concurrency:
- 100 worker threads can inspect 1,000 ports in **a few seconds** instead of minutes.
- Built-in graceful handling prevents socket descriptor exhaustion.

---

## Service Banner Grabbing Mechanics

Identifying open ports is only the first phase of network reconnaissance. A security engineer must determine **what daemon or version** is running behind the port to evaluate vulnerability profiles.

`scanner.py` applies a dual-mode heuristic banner grabber:
1. **Listen-First Services (Passive Greeting):** Services like SSH (`SSH-2.0-OpenSSH...`), FTP (`220 ProFTPD...`), and SMTP (`220 mail.example.com ESMTP...`) proactively transmit a welcome banner immediately after handshake completion.
2. **Probe-First Services (Active Interrogation):** Web daemons (HTTP/HTTPS) and cache databases (Redis, Memcached) remain silent until a request arrives. The scanner sends an RFC-compliant `HEAD / HTTP/1.1` probe or protocol heartbeat to trigger informative responses containing `Server: Apache/2.4.52`, `Server: nginx/1.22`, or application version strings.

---

## Prerequisites & Installation

### Requirements
- Python 3.8+ (Available across Linux, macOS, and Windows)
- Standard libraries: `socket`, `argparse`, `sys`, `concurrent.futures`, `ipaddress`, `csv`, `json`, `time`
- Optional visual styling: `colorama` (the script automatically falls back to native ANSI codes or plain text if not installed).

### Setup
```bash
# Clone or download the repository
git clone https://github.com/example/python-port-scanner.git
cd python-port-scanner

# Optional: Install colorama for cross-platform colored terminal UI
pip install -r requirements.txt
```

---

## CLI Parameters & Usage

```bash
python3 scanner.py [-h] [-p PORTS] [--top {20,100,1000}] [-t THREADS]
                   [-w TIMEOUT] [--no-banner] [-q] [--json FILEPATH]
                   [--csv FILEPATH] target
```

| Argument | Description | Default |
| :--- | :--- | :--- |
| `target` | Positional argument: Target IPv4, Hostname, or CIDR Subnet | *Required* |
| `-p`, `--ports` | Specific ports (`80`), ranges (`1-1024`), or comma-lists (`21,22,80,443`) | Top 100 ports |
| `--top` | Well-known port presets (`20`, `100`, or `1000`) | `100` |
| `-t`, `--threads`| Maximum concurrent worker threads in pool | `100` |
| `-w`, `--timeout`| Socket timeout in seconds per connection attempt | `1.0s` |
| `--no-banner` | Disables banner grabbing for maximum scanning velocity | Disabled |
| `-q`, `--quiet` | Suppresses live progress ticker (summary report only) | Disabled |
| `--json` | Writes scan results to a formatted JSON document | `None` |
| `--csv` | Writes scan results to a structured CSV spreadsheet | `None` |

---

## Practical Real-World Examples

### 1. Scan Common Top 20 Ports on Localhost
```bash
python3 scanner.py 127.0.0.1 --top 20
```

### 2. Deep Scan Port Range 1-1024 on an Authorized Server
```bash
python3 scanner.py scanme.nmap.org -p 1-1024 -t 150 -w 0.75
```

### 3. Targeted Web & Database Ports with Export to JSON
```bash
python3 scanner.py 192.168.1.50 -p 80,443,3000,3306,5432,6379,8080 --json audit_report.json
```

### 4. Scan a CIDR Subnet with Structured CSV Output
```bash
python3 scanner.py 192.168.1.0/28 -p 22,80,443,445 --csv network_inventory.csv -t 50
```

---

## Legal & Ethical Disclaimer

> **⚠️ CRITICAL SECURITY NOTICE:**
> Port scanning without explicit, documented authorization from the network or system owner is illegal and considered hostile behavior in many jurisdictions. 
> This tool is developed strictly for **academic, educational, defensive, and authorized audit purposes**. Always test on authorized lab environments (such as localhost, private lab subnets, or dedicated testing hosts like `scanme.nmap.org`).

---

# 🇮🇷 بخش آموزشی جامع به زبان فارسی (Educational Persian)

## معرفی کلی پروژه و فلسفه طراحی

این پروژه یک **اسکنر پورت شبکه (Network Port Scanner)** کامل، ماژولار و مبتنی بر پایتون ۳ است که با رویکرد **آموزشی و صنعتی** طراحی شده است. هدف از ایجاد این برنامه، آشنایی عمیق دانشجویان، توسعه‌دهندگان و علاقه‌مندان به حوزه امنیت سایبری با نحوه کارکرد پروتکل‌های شبکه در لایه‌های پایین، برنامه‌نویسی سوکت (Socket Programming)، مدیریت همزمانی و نخ‌ها (Concurrency & Multi-Threading) و متدهای شناسایی سرویس‌ها (Service Banner Grabbing) می‌باشد.

---

## مبانی برنامه‌نویسی سوکت (Socket Programming) در پایتون

در مدل مفهومی OSI و معماری TCP/IP، **سوکت (Socket)** به عنوان نقطه پایانی (Endpoint) ارتباطات دوطرفه بین دو گره در شبکه شناخته می‌شود. هر سوکت از ترکیب یک **آدرس IP** (مشخص‌کننده میزبان) و یک **شماره پورت** (مشخص‌کننده سرویس یا پردازه) تشکیل می‌شود.

در پایتون، ماژول استاندارد `socket` امکان دسترسی به توابع سیستمی هسته سیستم‌عامل (Kernel Socket API) را فراهم می‌کند:

```python
import socket

# ۱. ایجاد شیء سوکت مبتنی بر پروتکل IPv4 و لایه انتقال TCP
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# ۲. تعیین مهلت زمانی برای جلوگیری از قفل شدن نخ برنامه
s.settimeout(1.0)

# ۳. تلاش برای برقراری ارتباط (Connect)
# تابع connect_ex بر خلاف connect، در صورت شکست استثنا (Exception) پرتاب نمی‌کند
# بلکه کد خطای سیستمی (errno) را برمی‌گرداند؛ مقدار 0 نشان‌دهنده موفقیت کامل است.
status_code = s.connect_ex(('127.0.0.1', 80))

if status_code == 0:
    print("پورت ۸۰ باز است!")
else:
    print(f"پورت بسته یا فیلتر است. کد خطا: {status_code}")

# ۴. آزادسازی سوکت و منابع سیستمی
s.close()
```

### پارامترهای کلیدی تابع سوکت:
- **`AF_INET` (Address Family):** مشخص می‌کند که آدرس‌دهی شبکه از نسخه چهارم پروتکل اینترنت (`IPv4`) استفاده می‌کند.
- **`SOCK_STREAM` (Socket Type):** نشان‌دهنده استفاده از پروتکل مبتنی بر جریان داده‌های متوالی و اتصال‌گرا یعنی **TCP** است (در مقابل `SOCK_DGRAM` که برای پروتکل بدون‌اتصال UDP به کار می‌رود).
- **`connect_ex()`:** متدی فوق‌العاده سریع و استاندارد در زبان C و پایتون که کد خطای سوکت (`errno`) را خروجی می‌دهد و از سربار اضافی مدیریت استثناها (Try-Except Overhead) جلوگیری می‌کند.

---

## تشریح دست‌تکانی سه‌مرحله‌ای (TCP 3-Way Handshake)

پروتکل TCP برای تضمین درستی ارسال داده‌ها و همگام‌سازی شماره توالی بایت‌ها (Sequence Numbers) پیش از ارسال هرگونه داده تجاری، یک گفتگوی سه‌مرحله‌ای موسوم به **3-Way Handshake** را اجرا می‌کند:

```
کلاینت (اسکنر ما)                                  سرور (میزبان هدف)
       |                                                 |
       | ---------- [1] ارسال بسته SYN ----------------> |  (درخواست شروع اتصال با Sequence Number اولیه)
       |                                                 |
       | <--- [2] پاسخ بسته SYN-ACK (در صورت باز بودن) - |  (تایید درخواست + ارسال Sequence سرور)
       |                                                 |
       | ---------- [3] ارسال بسته ACK ----------------> |  (تایید نهایی کلاینت و آغاز نشست معتبر)
       |                                                 |
   [اتصال برقرار شد - پورت باز و سرویس پاسخگو است]
```

### چه اتفاقی می‌افتد وقتی پورت باز نیست؟
1. **پورت بسته (Closed Port):**
   پشته شبکه سیستم هدف بررسی می‌کند که آیا برنامه‌ای روی پورت درخواستی گوش می‌دهد یا خیر. وقتی هیچ پردازه‌ای ثبت نشده باشد، هسته سیستم‌عامل فوراً یک بسته با پرچم **`RST` (Reset)** به کلاینت پس می‌فرستد. این پاسخ باعث می‌شود `connect_ex` بلافاصله خطای `ECONNREFUSED` بدهد.
2. **پورت فیلترشده (Filtered / Dropped by Firewall):**
   اگر یک دیواره آتش (Firewall) در مسیر یا روی سیستم هدف بسته `SYN` اولیه را مسدود کند (`DROP`)، هیچ پاسخی بازنمی‌گردد. کلاینت تا پایان مهلت زمانی (`timeout`) منتظر مانده و سپس خطای زمان انقضا (`socket.timeout`) ثبت می‌کند.

---

## چندنخی (Multi-Threading) و اثر قفل سراسری مفسر (GIL)

یکی از چالش‌های بزرگ دانشجویان در درک پایتون، موضوع **Global Interpreter Lock (GIL)** است. سوال رایج این است: *«اگر پایتون به دلیل GIL در هر لحظه فقط یک بایت‌کد را اجرا می‌کند، چرا چندنخی سرعت اسکن پورت را صدها برابر می‌کند؟»*

### تفاوت وظایف CPU-Bound با I/O-Bound:
- در برنامه‌های محاسباتی سنگین (مانند رندر تصویر یا رمزنگاری سنگین)، نخ‌ها دائماً پردازنده را اشغال می‌کنند و GIL اجازه موازی‌سازی واقعی در چند هسته را نمی‌دهد.
- اما در **اسکن پورت**، بیش از ۹۹ درصد زمان صرف **انتظار برای رفت و برگشت پکت در کابل یا امواج شبکه (Network I/O Latency)** می‌شود. پایتون به صورت خودکار هنگام فرخوانی توابع I/O هسته سیستم‌عامل، قفل GIL را آزاد می‌کند.
- در نتیجه، وقتی نخ شماره ۱ در حال انتظار برای پاسخ پورت ۸۰ است، نخ‌های ۲ تا ۱۰۰ می‌توانند همزمان پکت‌های پورت‌های دیگر را ارسال کنند!

در این پروژه از کلاس پیشرفته `concurrent.futures.ThreadPoolExecutor` استفاده شده است که یک استخر نخ (Thread Pool) حرفه‌ای با مدیریت صف وظایف ایجاد می‌کند و از مصرف بی‌رویه حافظه و باز شدن بی‌پایان فایل‌دسکریپتورها جلوگیری می‌نماید.

---

## تکنیک بنر گرابینگ (Banner Grabbing) و شناسایی سرویس

صرفاً دانستن این که یک پورت باز است، برای یک متخصص امنیت کافی نیست. اطلاع از اینکه دقیقاً چه سرویسی و چه نگارشی (Version) پشت پورت فعال است، گام حیاتی فاز ارزیابی آسیب‌پذیری است.

در این اسکریپت، تابع `_grab_service_banner` از دو استراتژی هوشمند استفاده می‌کند:
1. **پروتکل‌های پیش‌سلام (Listen-First):** سرویس‌هایی مانند SSH، FTP و SMTP به محض دریافت دست‌تکانی، پیام خوش‌آمدگویی شامل نگارش نرم‌افزار را بدون نیاز به ارسال درخواست می‌فرستند:
   ```text
   SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6
   220 (vsFTPd 3.0.5)
   ```
2. **پروتکل‌های مبتنی بر تقاضا (Request-First):** وب‌سرورها تا زمانی که درخواستی دریافت نکنند، داده‌ای ارسال نمی‌کنند. اسکریپت با ارسال یک پراب سبک `HEAD / HTTP/1.1`، هدرهای استاندارد حاوی نام سرور را دریافت و تمیزکاری می‌کند:
   ```text
   HTTP/1.1 200 OK | Server: nginx/1.18.0
   ```

---

## راهنمای جامع نصب و اجرای اسکریپت

### نیازمندی‌ها
- مفسر استاندارد پایتون (نسخه ۳.۸ به بالا).
- وابستگی اختیاری: کتابخانه `colorama` برای رنگ‌آمیزی متون ترمینال در کنسول ویندوز و لینوکس.

### دستورات راه‌اندازی در لینوکس / مک / ویندوز
```bash
# نصب بسته اختیاری رنگ‌آمیزی محیط ترمینال
pip install colorama

# مشاهده منوی راهنمای کامل اسکریپت
python3 scanner.py --help
```

### نمونه‌های کاربردی دستورات:

#### ۱. اسکن سریع ۲۰ پورت معروف روی لوکال‌هاست:
```bash
python3 scanner.py 127.0.0.1 --top 20
```

#### ۲. اسکن بازه پورت‌های سیستمی (۱ تا ۱۰۲۴) با ۱۰۰ نخ همزمان:
```bash
python3 scanner.py 192.168.1.1 -p 1-1024 -t 100 -w 0.5
```

#### ۳. اسکن پورت‌های حساس پایگاه داده و ذخیره گزارش در قالب فایل JSON:
```bash
python3 scanner.py 192.168.1.100 -p 3306,5432,6379,27017 --json db_report.json
```

#### ۴. اسکن یک ساب‌نت کامل بر پایه نمادگذاری CIDR و خروجی اکسل/CSV:
```bash
python3 scanner.py 192.168.1.0/28 -p 22,80,443 --csv subnet_audit.csv
```

---

## اصول اخلاقی و الزامات قانونی در تست نفوذ

> **توجه اخلاقی بسیار مهم:**
> ارسال بسته‌های اسکن پورت به سرورها و شبکه‌هایی که مالکیت آنها در اختیار شما نیست یا مجوز کتبی تست نفوذ از سازمان مربوطه دریافت نکرده‌اید، رفتاری غیرقانونی و نقض حریم امنیتی تلقی می‌شود. این ابزار با اهداف ارتقای دانش فنی، نظارت بر شبکه‌های داخلی شخصی، ارزیابی وضعیت امنیتی خود و آموزش دانشگاهی عرضه شده است.

---

# 👨‍🏫 Creator Attribution / شناسنامه مدرس و طراح

> **طراح، توسعه‌دهنده و مدرس:** امیرسامان پیرایش فر (Amir Saman Pirayeshfar)
>
> Designed, Developed, and Instructed by: **Amir Saman Pirayeshfar**
