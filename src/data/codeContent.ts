// Verbatim raw content of the Python project files for display and download

export const SCANNER_PY_CODE = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
                    PRODUCTION & EDUCATIONAL NETWORK PORT SCANNER
================================================================================
A robust, high-performance, multi-threaded network scanner developed in Python 3.
Features socket-based TCP connect scanning, CIDR subnet support, banner grabbing,
custom port specifications, concurrent thread pooling, and report exporting.

طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar)
================================================================================
"""

import argparse
import concurrent.futures
import csv
import datetime
import ipaddress
import json
import socket
import sys
import time
from typing import Dict, List, Optional, Set, Tuple

# Terminal color aesthetics with automatic ANSI fallback
try:
    from colorama import Fore, Style, init as colorama_init
    colorama_init(autoreset=True)
    HAS_COLORAMA = True
except ImportError:
    HAS_COLORAMA = False

    class _AnsiColor:
        def __init__(self):
            self.enabled = sys.stdout.isatty()
            self.BLACK = "\\033[30m" if self.enabled else ""
            self.RED = "\\033[91m" if self.enabled else ""
            self.GREEN = "\\033[92m" if self.enabled else ""
            self.YELLOW = "\\033[93m" if self.enabled else ""
            self.BLUE = "\\033[94m" if self.enabled else ""
            self.MAGENTA = "\\033[95m" if self.enabled else ""
            self.CYAN = "\\033[96m" if self.enabled else ""
            self.WHITE = "\\033[97m" if self.enabled else ""
            self.RESET = "\\033[0m" if self.enabled else ""

        def __getattr__(self, name: str) -> str:
            return getattr(self, name.upper(), "")

    class _AnsiStyle:
        def __init__(self):
            self.enabled = sys.stdout.isatty()
            self.BRIGHT = "\\033[1m" if self.enabled else ""
            self.DIM = "\\033[2m" if self.enabled else ""
            self.NORMAL = "\\033[22m" if self.enabled else ""
            self.RESET_ALL = "\\033[0m" if self.enabled else ""

        def __getattr__(self, name: str) -> str:
            return getattr(self, name.upper(), "")

    Fore = _AnsiColor()   # type: ignore
    Style = _AnsiStyle()  # type: ignore


# ==============================================================================
# COMMON SERVICES & TOP PORT PRESETS
# ==============================================================================

WELL_KNOWN_SERVICES: Dict[int, str] = {
    20: "FTP-Data",
    21: "FTP (File Transfer)",
    22: "SSH (Secure Shell)",
    23: "Telnet",
    25: "SMTP (Simple Mail Transfer)",
    43: "WHOIS",
    53: "DNS (Domain Name System)",
    67: "DHCP (Server)",
    68: "DHCP (Client)",
    69: "TFTP",
    80: "HTTP (World Wide Web)",
    88: "Kerberos",
    110: "POP3 (Post Office Protocol)",
    111: "RPCBind",
    123: "NTP (Network Time Protocol)",
    135: "MS-RPC",
    137: "NetBIOS Name Service",
    138: "NetBIOS Datagram Service",
    139: "NetBIOS Session Service",
    143: "IMAP (Internet Message Access)",
    161: "SNMP (Simple Network Mgmt)",
    162: "SNMP-Trap",
    179: "BGP (Border Gateway Protocol)",
    389: "LDAP",
    443: "HTTPS (HTTP Secure / SSL)",
    445: "Microsoft-DS / SMB",
    465: "SMTPS (SMTP over SSL)",
    514: "Syslog",
    587: "SMTP (Message Submission)",
    636: "LDAPS (LDAP over SSL)",
    873: "Rsync",
    993: "IMAPS (IMAP over SSL)",
    995: "POP3S (POP3 over SSL)",
    1080: "SOCKS Proxy",
    1433: "Microsoft SQL Server",
    1521: "Oracle Database",
    1723: "PPTP VPN",
    2049: "NFS (Network File System)",
    2082: "cPanel",
    2083: "cPanel SSL",
    2181: "Apache ZooKeeper",
    3000: "Node.js / Vite / React Dev Server",
    3306: "MySQL Database",
    3389: "RDP (Remote Desktop)",
    5000: "Flask / Docker Registry",
    5432: "PostgreSQL Database",
    5672: "RabbitMQ",
    5900: "VNC (Virtual Network Computing)",
    6379: "Redis Key-Value Store",
    6443: "Kubernetes API Server",
    8000: "HTTP Dev Server / Django",
    8080: "HTTP-Proxy / Apache Tomcat",
    8443: "HTTPS Alternate",
    8888: "Jupyter Notebook / HTTP Alt",
    9000: "SonarQube / PHP-FPM",
    9090: "Prometheus Web UI",
    9200: "Elasticsearch REST API",
    9300: "Elasticsearch Cluster",
    11211: "Memcached",
    27017: "MongoDB Database"
}

TOP_20_PORTS: List[int] = [
    21, 22, 23, 25, 53, 80, 110, 111, 135, 139,
    143, 443, 445, 993, 995, 1723, 3306, 3389, 5900, 8080
]

TOP_100_PORTS: List[int] = sorted(list(set(
    TOP_20_PORTS + [
        7, 9, 13, 20, 26, 37, 43, 50, 67, 68, 69, 79, 81, 88, 102, 113,
        119, 123, 137, 138, 161, 162, 177, 179, 201, 264, 389, 427, 465,
        500, 513, 514, 515, 520, 523, 548, 554, 587, 631, 636, 873, 902,
        990, 1080, 1433, 1521, 1900, 2000, 2049, 2082, 2083, 2121, 2181,
        3000, 3128, 3268, 3306, 3389, 4443, 5000, 5060, 5222, 5357, 5432,
        5672, 5800, 5900, 6000, 6379, 6443, 6667, 7001, 8000, 8008, 8080,
        8081, 8443, 8888, 9000, 9090, 9200, 9300, 10000, 11211, 27017
    ]
)))


# ==============================================================================
# DATA STRUCTURES
# ==============================================================================

class PortScanResult:
    """Represents the discovery result for a scanned port."""
    def __init__(
        self,
        ip: str,
        port: int,
        is_open: bool,
        service: str,
        banner: Optional[str] = None,
        latency_ms: Optional[float] = None,
        error_msg: Optional[str] = None
    ):
        self.ip = ip
        self.port = port
        self.is_open = is_open
        self.service = service
        self.banner = banner or ""
        self.latency_ms = latency_ms or 0.0
        self.error_msg = error_msg or ""

    def to_dict(self) -> Dict:
        return {
            "ip": self.ip,
            "port": self.port,
            "state": "open" if self.is_open else "closed",
            "service": self.service,
            "banner": self.banner,
            "latency_ms": round(self.latency_ms, 2)
        }


# ==============================================================================
# CORE SCANNER ENGINE
# ==============================================================================

class NetworkScanner:
    def __init__(self, timeout: float = 1.0, threads: int = 100, grab_banner: bool = True):
        self.timeout = timeout
        self.threads = threads
        self.grab_banner = grab_banner

    @staticmethod
    def resolve_target(target_input: str) -> List[str]:
        target_input = target_input.strip()

        if "/" in target_input:
            try:
                network = ipaddress.ip_network(target_input, strict=False)
                num_hosts = network.num_addresses
                if num_hosts > 1024:
                    print(f"{Fore.YELLOW}[!] Warning: Subnet contains {num_hosts} addresses. Scanning first 256 only.{Style.RESET_ALL}")
                    return [str(ip) for ip in list(network.hosts())[:256]]
                return [str(ip) for ip in network.hosts()]
            except ValueError as e:
                raise ValueError(f"Invalid CIDR subnet representation '{target_input}': {e}")

        try:
            ipaddress.ip_address(target_input)
            return [target_input]
        except ValueError:
            pass

        try:
            resolved_ip = socket.gethostbyname(target_input)
            return [resolved_ip]
        except socket.gaierror as e:
            raise ValueError(f"Could not resolve hostname '{target_input}': {e}")

    @staticmethod
    def parse_port_specs(port_arg: Optional[str], top_arg: Optional[int]) -> List[int]:
        if top_arg:
            if top_arg == 20:
                return TOP_20_PORTS
            elif top_arg == 100:
                return TOP_100_PORTS
            elif top_arg == 1000:
                return list(range(1, 1001))
            else:
                return list(range(1, min(65535, top_arg) + 1))

        if not port_arg:
            return TOP_100_PORTS

        ports: Set[int] = set()
        segments = port_arg.split(",")
        for seg in segments:
            seg = seg.strip()
            if not seg:
                continue
            if "-" in seg:
                try:
                    parts = seg.split("-")
                    if len(parts) != 2:
                        raise ValueError
                    start, end = int(parts[0]), int(parts[1])
                    if start > end or start < 1 or end > 65535:
                        raise ValueError
                    for p in range(start, end + 1):
                        ports.add(p)
                except ValueError:
                    raise ValueError(f"Invalid port range expression: '{seg}'. Format: start-end (1-65535)")
            else:
                try:
                    p = int(seg)
                    if p < 1 or p > 65535:
                        raise ValueError
                    ports.add(p)
                except ValueError:
                    raise ValueError(f"Invalid single port value: '{seg}'. Must be an integer 1-65535.")

        sorted_ports = sorted(list(ports))
        if not sorted_ports:
            raise ValueError("No valid ports specified to scan.")
        return sorted_ports

    def _grab_service_banner(self, ip: str, port: int) -> str:
        banner = ""
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(min(self.timeout, 1.5))

        try:
            s.connect((ip, port))

            # Strategy 1: Listen for initial welcome message
            try:
                raw_data = s.recv(1024)
                if raw_data:
                    banner = raw_data.decode("utf-8", errors="ignore").strip()
            except socket.timeout:
                pass

            # Strategy 2: Active probe
            if not banner:
                if port in (80, 8080, 8000, 8443, 3000, 5000):
                    http_probe = f"HEAD / HTTP/1.1\\r\\nHost: {ip}\\r\\nUser-Agent: PortScanner/2.0\\r\\nConnection: close\\r\\n\\r\\n"
                    s.sendall(http_probe.encode("ascii"))
                elif port in (6379, 11211):
                    s.sendall(b"INFO\\r\\n")
                else:
                    s.sendall(b"\\r\\n\\r\\n")

                try:
                    raw_data = s.recv(1024)
                    if raw_data:
                        decoded = raw_data.decode("utf-8", errors="ignore").strip()
                        first_line = decoded.splitlines()[0] if decoded else ""
                        banner = first_line[:80]
                except socket.timeout:
                    pass

        except Exception:
            pass
        finally:
            try:
                s.close()
            except Exception:
                pass

        cleaned = "".join(c if (32 <= ord(c) < 127) else " " for c in banner).strip()
        return cleaned[:80]

    def scan_port(self, ip: str, port: int) -> PortScanResult:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(self.timeout)

        start_time = time.perf_counter()
        is_open = False
        error_msg = ""
        latency_ms = 0.0

        try:
            code = s.connect_ex((ip, port))
            latency_ms = (time.perf_counter() - start_time) * 1000.0

            if code == 0:
                is_open = True
            else:
                is_open = False
        except socket.timeout:
            is_open = False
            error_msg = "Timeout (filtered/firewalled)"
        except socket.error as e:
            is_open = False
            error_msg = str(e)
        finally:
            try:
                s.close()
            except Exception:
                pass

        service = WELL_KNOWN_SERVICES.get(port, "Unknown Service")
        banner = ""

        if is_open and self.grab_banner:
            banner = self._grab_service_banner(ip, port)

        return PortScanResult(
            ip=ip,
            port=port,
            is_open=is_open,
            service=service,
            banner=banner,
            latency_ms=latency_ms,
            error_msg=error_msg
        )

    def scan_target(self, ip: str, ports: List[int], quiet: bool = False) -> List[PortScanResult]:
        results: List[PortScanResult] = []
        total_ports = len(ports)
        completed = 0
        open_count = 0

        if not quiet:
            print(f"\\n{Fore.CYAN}---> Commencing Scan on Host: {Fore.WHITE}{Style.BRIGHT}{ip}{Style.RESET_ALL}")
            print(f"{Fore.CYAN}---> Port Count: {Fore.YELLOW}{total_ports} ports | Threads: {Fore.YELLOW}{self.threads} | Socket Timeout: {Fore.YELLOW}{self.timeout}s{Style.RESET_ALL}\\n")

        with concurrent.futures.ThreadPoolExecutor(max_workers=self.threads) as executor:
            future_to_port = {executor.submit(self.scan_port, ip, port): port for port in ports}

            for future in concurrent.futures.as_completed(future_to_port):
                completed += 1
                try:
                    res = future.result()
                    if res.is_open:
                        open_count += 1
                        results.append(res)
                        if not quiet:
                            banner_info = f" | Banner: {Fore.MAGENTA}{res.banner}{Style.RESET_ALL}" if res.banner else ""
                            sys.stdout.write(
                                f"\\r{Fore.GREEN}[+] OPEN PORT: {Style.BRIGHT}{res.port:<5}{Style.RESET_ALL} "
                                f"{Fore.CYAN}{res.service:<22}{Style.RESET_ALL} "
                                f"({res.latency_ms:.1f}ms){banner_info}\\n"
                            )
                            sys.stdout.flush()
                except Exception:
                    pass

                if not quiet and sys.stdout.isatty():
                    percent = (completed / total_ports) * 100
                    bar_length = 25
                    filled = int(bar_length * completed // total_ports)
                    bar = "=" * filled + "-" * (bar_length - filled)
                    sys.stdout.write(
                        f"\\r{Fore.BLUE}[Progress] [{bar}] {percent:5.1f}% | Scanned: {completed}/{total_ports} | Open: {open_count}{Style.RESET_ALL}"
                    )
                    sys.stdout.flush()

        if not quiet and sys.stdout.isatty():
            sys.stdout.write("\\r" + " " * 80 + "\\r")
            sys.stdout.flush()

        results.sort(key=lambda x: x.port)
        return results


# ==============================================================================
# REPORT EXPORTERS
# ==============================================================================

def export_json(all_results: Dict[str, List[PortScanResult]], filepath: str) -> None:
    data = {
        "metadata": {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "scanner": "Python Network Port Scanner",
            "instructor": "امیرسامان پیرایش فر (Amir Saman Pirayeshfar)"
        },
        "hosts": {
            ip: [res.to_dict() for res in res_list]
            for ip, res_list in all_results.items()
        }
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"{Fore.GREEN}[✓] Scan results successfully saved to JSON: {filepath}{Style.RESET_ALL}")


def export_csv(all_results: Dict[str, List[PortScanResult]], filepath: str) -> None:
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Host IP", "Port", "State", "Service Name", "Latency (ms)", "Banner"])
        for ip, res_list in all_results.items():
            for res in res_list:
                writer.writerow([
                    res.ip,
                    res.port,
                    "OPEN" if res.is_open else "CLOSED",
                    res.service,
                    f"{res.latency_ms:.2f}",
                    res.banner
                ])
    print(f"{Fore.GREEN}[✓] Scan results successfully saved to CSV: {filepath}{Style.RESET_ALL}")


# ==============================================================================
# CLI PRESENTATION & BANNER
# ==============================================================================

def print_banner() -> None:
    banner_text = f"""
{Fore.CYAN}================================================================================{Style.RESET_ALL}
{Fore.GREEN}{Style.BRIGHT}        _   _      _                      _      ____                                 
       | \\ | | ___| |___      _____  _ __| | __ / ___|  ___ __ _ _ __  _ __   ___ _ __ 
       |  \\| |/ _ \\ __\\ \\ /\\ / / _ \\| '__| |/ / \\___ \\ / __/ _\` | '_ \\| '_ \\ / _ \\ '__|
       | |\\  |  __/ |_ \\ V  V / (_) | |  |   <   ___) | (_| (_| | | | | | | |  __/ |   
       |_| \\_|\\___|\\__| \\_/\\_/ \\___/|_|  |_|\\_\\ |____/ \\___\\__,_|_| |_|_| |_|\\___|_|   
{Fore.YELLOW}             Python 3 Multi-Threaded Network & Security Port Scanner             {Style.RESET_ALL}
{Fore.CYAN}================================================================================{Style.RESET_ALL}
{Fore.WHITE}طراح، توسعه‌دهنده و مدرس: {Fore.YELLOW}{Style.BRIGHT}امیرسامان پیرایش فر (Amir Saman Pirayeshfar){Style.RESET_ALL}
{Fore.CYAN}================================================================================{Style.RESET_ALL}
"""
    print(banner_text)


def print_summary_table(ip: str, results: List[PortScanResult], duration: float) -> None:
    print(f"\\n{Fore.GREEN}{'='*80}{Style.RESET_ALL}")
    print(f"{Fore.GREEN}{Style.BRIGHT}SCAN REPORT FOR HOST: {Fore.WHITE}{ip} {Fore.GREEN}(Scan Duration: {duration:.2f}s){Style.RESET_ALL}")
    print(f"{Fore.GREEN}{'='*80}{Style.RESET_ALL}")

    if not results:
        print(f"{Fore.YELLOW}[!] No open ports were found in the scanned range on host {ip}.{Style.RESET_ALL}\\n")
        return

    header = f"{'PORT':<8} {'STATE':<8} {'SERVICE':<24} {'LATENCY':<12} {'BANNER / VERSION'}"
    print(f"{Fore.CYAN}{Style.BRIGHT}{header}{Style.RESET_ALL}")
    print(f"{Fore.BLUE}{'-'*80}{Style.RESET_ALL}")

    for res in results:
        port_col = f"{res.port}/tcp"
        state_col = "OPEN"
        service_col = res.service[:22]
        latency_col = f"{res.latency_ms:.1f} ms"
        banner_col = res.banner[:36] if res.banner else "-"

        print(
            f"{Fore.WHITE}{Style.BRIGHT}{port_col:<8}{Style.RESET_ALL} "
            f"{Fore.GREEN}{state_col:<8}{Style.RESET_ALL} "
            f"{Fore.YELLOW}{service_col:<24}{Style.RESET_ALL} "
            f"{Fore.MAGENTA}{latency_col:<12}{Style.RESET_ALL} "
            f"{Fore.WHITE}{banner_col}{Style.RESET_ALL}"
        )
    print(f"{Fore.BLUE}{'-'*80}{Style.RESET_ALL}")
    print(f"{Fore.GREEN}Total Open Ports Detected: {Style.BRIGHT}{len(results)}{Style.RESET_ALL}\\n")


# ==============================================================================
# MAIN CLI INTERFACE
# ==============================================================================

def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Production-grade, Multi-Threaded Network Port Scanner & Banner Grabber in Python 3.",
        epilog="طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar)",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("target", help="Target IP address, hostname, or CIDR subnet (e.g., 192.168.1.0/28).")
    parser.add_argument("-p", "--ports", help="Custom ports: '80', '1-1024', or '21,22,80,443,3306'.")
    parser.add_argument("--top", type=int, choices=[20, 100, 1000], help="Fast presets (20, 100, or 1000).")
    parser.add_argument("-t", "--threads", type=int, default=100, help="Worker threads (default: 100).")
    parser.add_argument("-w", "--timeout", type=float, default=1.0, help="Socket timeout (default: 1.0s).")
    parser.add_argument("--no-banner", action="store_true", help="Disable service banner grabbing.")
    parser.add_argument("-q", "--quiet", action="store_true", help="Quiet mode.")
    parser.add_argument("--json", metavar="FILEPATH", help="Export JSON report.")
    parser.add_argument("--csv", metavar="FILEPATH", help="Export CSV report.")

    return parser


def main() -> None:
    print_banner()
    parser = build_argument_parser()
    args = parser.parse_args()

    try:
        targets = NetworkScanner.resolve_target(args.target)
    except ValueError as e:
        print(f"{Fore.RED}[!] Target Error: {e}{Style.RESET_ALL}")
        sys.exit(1)

    try:
        ports = NetworkScanner.parse_port_specs(args.ports, args.top)
    except ValueError as e:
        print(f"{Fore.RED}[!] Port Specification Error: {e}{Style.RESET_ALL}")
        sys.exit(1)

    print(f"{Fore.GREEN}[*] Target Host(s) to Scan: {Fore.WHITE}{len(targets)} host(s){Style.RESET_ALL}")
    print(f"{Fore.GREEN}[*] Target Port Count: {Fore.WHITE}{len(ports)} ports per host{Style.RESET_ALL}")
    print(f"{Fore.GREEN}[*] Multi-Threading Concurrency: {Fore.WHITE}{args.threads} threads{Style.RESET_ALL}")
    print(f"{Fore.GREEN}[*] Banner Grabbing: {Fore.WHITE}{'Disabled' if args.no_banner else 'Enabled'}{Style.RESET_ALL}")

    scanner = NetworkScanner(
        timeout=args.timeout,
        threads=args.threads,
        grab_banner=(not args.no_banner)
    )

    all_results: Dict[str, List[PortScanResult]] = {}
    overall_start = time.perf_counter()

    try:
        for idx, host_ip in enumerate(targets, 1):
            if len(targets) > 1:
                print(f"\\n{Fore.YELLOW}=== [{idx}/{len(targets)}] Initiating Inspection on {host_ip} ==={Style.RESET_ALL}")
            
            host_start = time.perf_counter()
            host_results = scanner.scan_target(host_ip, ports, quiet=args.quiet)
            host_duration = time.perf_counter() - host_start

            all_results[host_ip] = host_results
            print_summary_table(host_ip, host_results, host_duration)

    except KeyboardInterrupt:
        print(f"\\n\\n{Fore.RED}[!] Scan interrupted by user (Ctrl+C). Generating partial report...{Style.RESET_ALL}")

    total_duration = time.perf_counter() - overall_start
    total_open = sum(len(res) for res in all_results.values())
    print(f"{Fore.CYAN}[*] Entire Scan Completed in: {Fore.WHITE}{total_duration:.2f} seconds{Style.RESET_ALL}")
    print(f"{Fore.CYAN}[*] Cumulative Open Ports Discovered: {Fore.WHITE}{total_open}{Style.RESET_ALL}")

    if args.json:
        export_json(all_results, args.json)
    if args.csv:
        export_csv(all_results, args.csv)

    print(f"\\n{Fore.CYAN}{'='*80}{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}{Style.BRIGHT}طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar){Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*80}{Style.RESET_ALL}\\n")


if __name__ == "__main__":
    main()
`;

export const REQUIREMENTS_TXT_CODE = `# ==============================================================================
# Python Network Port Scanner - Dependencies
# طراح، توسعه‌دهنده و مدرس: امیرسامان پیرایش فر (Amir Saman Pirayeshfar)
# ==============================================================================

# Cross-platform colored terminal text output (optional, script gracefully falls back to plain text if absent)
colorama>=0.4.6
`;
