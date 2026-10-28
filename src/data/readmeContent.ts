// Raw content of README.md for viewing and downloading
export const README_MD_CONTENT = `# 🔍 Advanced Multi-Threaded Network Port Scanner & Service Banner Grabber (Python 3)
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

Unlike complex frameworks requiring heavy dependencies, this utility relies primarily on Python's robust native standard libraries (\`socket\`, \`concurrent.futures\`, \`ipaddress\`, \`argparse\`), making it ultra-portable, easy to audit, and deeply instructional for cybersecurity students and systems engineers.

---

## Deep Dive: TCP 3-Way Handshake
At the transport layer of the OSI model, TCP guarantees reliable, ordered packet delivery via the **TCP Three-Way Handshake**:
- **SYN (Synchronize):** Client sends a SYN segment with an initial sequence number.
- **SYN-ACK (Synchronize-Acknowledge):** If the port is OPEN, server acknowledges and sends its own sequence number.
- **ACK (Acknowledge):** Client confirms connection is ESTABLISHED.
- If closed, the server immediately returns a **RST (Reset)** segment (\`ECONNREFUSED\`).
- If filtered by a firewall, packets are dropped and \`socket.timeout\` occurs.

---

## Concurrency: ThreadPoolExecutor in I/O Bound Tasks
Network scanning is an I/O-bound task. While waiting for socket packets, Python releases the Global Interpreter Lock (GIL). A pool of 100 threads can scan 1,000 ports in seconds instead of 16+ minutes sequentially.

---

## Prerequisites & Installation
\`\`\`bash
# Install optional terminal color styling
pip install -r requirements.txt

# Run scanner with built-in help
python3 scanner.py --help
\`\`\`

---

# 🇮🇷 بخش آموزشی جامع به زبان فارسی (Educational Persian)

## معرفی کلی پروژه و فلسفه طراحی
این پروژه یک اسکنر پورت شبکه (Network Port Scanner) کامل، ماژولار و مبتنی بر پایتون ۳ است که با رویکرد آموزشی و صنعتی طراحی شده است تا دانشجویان مفاهیم سوکت پروگرمینگ، تردینگ و هندشیک تی‌سی‌پی را به صورت عملی فرا بگیرند.

## مبانی برنامه‌نویسی سوکت در پایتون
سوکت ترکیبی از IP و Port است که امکان ارتباط پروسه‌ها را در شبکه فراهم می‌سازد. در این اسکریپت از \`socket.socket(socket.AF_INET, socket.SOCK_STREAM)\` و متد پرسرعت \`connect_ex()\` استفاده شده است که کد خطای سوکت (errno) را برمی‌گرداند.

## دست‌تکانی سه‌مرحله‌ای (TCP 3-Way Handshake)
برای برقراری نشست مطمئن در لایه انتقال:
۱. ارسال پکت SYN توسط کلاینت
۲. پاسخ SYN-ACK توسط سرور (در صورت باز بودن پورت)
۳. ارسال تاییدیه نهایی ACK توسط کلاینت

در صورت بسته بودن پورت، پکت RST برگشت داده می‌شود. اگر فایروال پکت را DROP کند، مهلت زمانی Timeout منقضی خواهد شد.

---

# 👨‍🏫 Creator Attribution / شناسنامه مدرس و طراح

> **طراح، توسعه‌دهنده و مدرس:** امیرسامان پیرایش فر (Amir Saman Pirayeshfar)
> Designed, Developed, and Instructed by: **Amir Saman Pirayeshfar**
`;
