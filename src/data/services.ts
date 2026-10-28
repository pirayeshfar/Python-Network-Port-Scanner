export interface ServiceInfo {
  port: number;
  service: string;
  category: 'web' | 'remote' | 'database' | 'mail' | 'network' | 'cache' | 'dev';
  description: string;
  defaultBanner?: string;
}

export const KNOWN_SERVICES: Record<number, ServiceInfo> = {
  21: { port: 21, service: 'FTP', category: 'network', description: 'File Transfer Protocol', defaultBanner: '220 (vsFTPd 3.0.5) Ready' },
  22: { port: 22, service: 'SSH', category: 'remote', description: 'Secure Shell Remote Access', defaultBanner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6' },
  23: { port: 23, service: 'Telnet', category: 'remote', description: 'Unencrypted Text Communications', defaultBanner: 'Welcome to Linux Terminal' },
  25: { port: 25, service: 'SMTP', category: 'mail', description: 'Simple Mail Transfer Protocol', defaultBanner: '220 mail.cyber-lab.io ESMTP Postfix' },
  53: { port: 53, service: 'DNS', category: 'network', description: 'Domain Name System', defaultBanner: 'BIND 9.18.1' },
  80: { port: 80, service: 'HTTP', category: 'web', description: 'HyperText Transfer Protocol', defaultBanner: 'HTTP/1.1 200 OK | Server: nginx/1.22.1' },
  110: { port: 110, service: 'POP3', category: 'mail', description: 'Post Office Protocol v3', defaultBanner: '+OK Dovecot ready' },
  143: { port: 143, service: 'IMAP', category: 'mail', description: 'Internet Message Access Protocol', defaultBanner: '* OK IMAP4rev1 server ready' },
  443: { port: 443, service: 'HTTPS', category: 'web', description: 'HTTP Secure over TLS/SSL', defaultBanner: 'HTTP/1.1 200 OK | TLSv1.3' },
  445: { port: 445, service: 'SMB', category: 'network', description: 'Microsoft-DS Active Directory / Samba', defaultBanner: 'SMBv3 Dialect Negotiation' },
  993: { port: 993, service: 'IMAPS', category: 'mail', description: 'IMAP over SSL/TLS', defaultBanner: '* OK Dovecot TLS' },
  1433: { port: 1433, service: 'MS-SQL', category: 'database', description: 'Microsoft SQL Server Database', defaultBanner: 'Microsoft SQL Server 2022' },
  1521: { port: 1521, service: 'Oracle-DB', category: 'database', description: 'Oracle Database Listener', defaultBanner: 'Oracle TNS Listener 19.3' },
  3000: { port: 3000, service: 'React/Vite Dev', category: 'dev', description: 'Node.js / Vite Development Server', defaultBanner: 'HTTP/1.1 200 OK | Vite Dev Engine' },
  3306: { port: 3306, service: 'MySQL', category: 'database', description: 'MySQL Relational Database', defaultBanner: '8.0.35-MySQL Community Server' },
  3389: { port: 3389, service: 'RDP', category: 'remote', description: 'Remote Desktop Protocol', defaultBanner: 'Remote Desktop Connection Provider' },
  5432: { port: 5432, service: 'PostgreSQL', category: 'database', description: 'PostgreSQL Relational Database', defaultBanner: 'PostgreSQL 16.1 on x86_64-linux' },
  5900: { port: 5900, service: 'VNC', category: 'remote', description: 'Virtual Network Computing', defaultBanner: 'RFB 003.008 (VNC Protocol)' },
  6379: { port: 6379, service: 'Redis', category: 'cache', description: 'Redis In-Memory Key-Value Store', defaultBanner: 'redis_version:7.2.4 | standalone' },
  8000: { port: 8000, service: 'HTTP-Dev', category: 'dev', description: 'Django/FastAPI Development Server', defaultBanner: 'HTTP/1.1 200 OK | Python/3.11' },
  8080: { port: 8080, service: 'HTTP-Proxy', category: 'web', description: 'Apache Tomcat / Proxy Gateway', defaultBanner: 'HTTP/1.1 200 OK | Apache-Coyote/1.1' },
  8443: { port: 8443, service: 'HTTPS-Alt', category: 'web', description: 'Alternative HTTPS Administrative Port', defaultBanner: 'HTTP/1.1 200 OK | Admin Panel' },
  9200: { port: 9200, service: 'Elasticsearch', category: 'database', description: 'Elasticsearch Search Engine & REST API', defaultBanner: '{"name":"node-1","cluster_name":"elastic"}' },
  27017: { port: 27017, service: 'MongoDB', category: 'database', description: 'MongoDB Document Database', defaultBanner: 'MongoDB wire protocol v5.0.22' }
};

export interface TargetPreset {
  id: string;
  name: string;
  address: string;
  description: string;
  openPorts: number[];
  closedPorts: number[];
  filteredPorts: number[];
}

export const TARGET_PRESETS: TargetPreset[] = [
  {
    id: 'local',
    name: '127.0.0.1 (Localhost Engine)',
    address: '127.0.0.1',
    description: 'Current local development environment running Vite web server on port 3000.',
    openPorts: [3000, 80],
    closedPorts: [21, 23, 25, 110, 143, 3306, 5432, 6379],
    filteredPorts: [445, 135]
  },
  {
    id: 'scanme',
    name: 'scanme.nmap.org (Authorized Remote Host)',
    address: 'scanme.nmap.org',
    description: 'Famous authorized security test server provided by Fyodor and the Nmap project.',
    openPorts: [22, 80, 9929, 31337],
    closedPorts: [21, 23, 25, 53, 110, 143, 443, 3306, 8080],
    filteredPorts: [135, 139, 445]
  },
  {
    id: 'gateway',
    name: '192.168.1.1 (Edge Router / Gateway)',
    address: '192.168.1.1',
    description: 'Standard home or enterprise perimeter gateway router with web admin interface.',
    openPorts: [53, 80, 443, 8080],
    closedPorts: [21, 22, 23, 3306, 5432],
    filteredPorts: [135, 445]
  },
  {
    id: 'dbserver',
    name: '10.0.4.15 (Internal Enterprise Database)',
    address: '10.0.4.15',
    description: 'Internal backend data layer hosting relational databases, cache, and monitoring.',
    openPorts: [22, 3306, 5432, 6379, 9200],
    closedPorts: [21, 23, 80, 443, 8080],
    filteredPorts: [1433, 27017]
  }
];
