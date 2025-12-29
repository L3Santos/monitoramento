# replit.md

## Overview

This is a **System Monitoring Dashboard** application called "MAQUINA CONCILIACAO" - a real-time system monitoring solution with a focus on tracking AnyDesk remote connections, system resources (CPU/RAM), running processes, services, and network connections.

The application consists of two main components:
1. **Local Agent (Python)** - A collector script (`coletor.py`) that runs on Ubuntu machines to gather system metrics and AnyDesk session data
2. **Web Dashboard (React/Express)** - A modern dashboard that displays the collected data with a terminal/hacker aesthetic

The interface is primarily in **Portuguese (Brazilian)**.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript using Vite as the build tool
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management with automatic polling (3-second intervals for real-time data)
- **Tailwind CSS** with custom dark theme (terminal/matrix green aesthetic)
- **Shadcn/ui** components (New York style) built on Radix UI primitives
- **Recharts** for data visualization (CPU/memory history charts)
- **Framer Motion** for animations and page transitions

The frontend follows a page-based structure with a shared `DashboardLayout` component that provides sidebar navigation. Key pages include:
- VisaoGeral (Overview) - System summary with metrics cards
- AnyDesk - Remote connection monitoring
- Servicos (Services) - System service status
- Processos (Processes) - Top resource-consuming processes
- Rede (Network) - Active network connections
- Historico (History) - Performance charts over time

### Backend Architecture
- **Express.js** server with TypeScript
- **File-based storage** using JSON files in `/dados` directory (currently active)
- **PostgreSQL schema defined** via Drizzle ORM (prepared for future database migration)
- Simple REST API pattern with endpoints for data collection and retrieval

Key API endpoints:
- `POST /api/coletar` - Receives data from the Python agent
- `GET /api/status` - Returns current system snapshot
- `GET /api/anydesk/historico` - Returns AnyDesk session history
- `GET /api/metricas/historico` - Returns CPU/memory metrics history

### Data Flow
1. Python agent collects system data every 3 seconds
2. Agent POSTs to `/api/coletar` endpoint
3. Server stores data in memory (current snapshot) and JSON files (history)
4. Dashboard polls `/api/status` every 3 seconds for real-time updates

### Storage Layer
Currently uses **file-based JSON storage** (`ArmazenamentoArquivo` class) with three data files:
- `dados/sessoes_anydesk.json` - AnyDesk session records
- `dados/metricas_sistema.json` - CPU/memory metrics history
- `dados/eventos_sistema.json` - System event logs

Database schema is defined in Drizzle for PostgreSQL migration when `DATABASE_URL` is configured.

## External Dependencies

### Database
- **PostgreSQL** - Schema defined via Drizzle ORM, requires `DATABASE_URL` environment variable
- **Drizzle Kit** - For database migrations (`npm run db:push`)

### Python Agent Dependencies (for the collector script)
- `psutil` - System and process monitoring
- `requests` - HTTP client for API communication

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `express` / `express-session` - Web server framework
- `@tanstack/react-query` - Async state management
- `recharts` - Chart library
- `framer-motion` - Animation library
- `date-fns` - Date formatting (with Portuguese locale)
- `zod` - Schema validation
- Full Radix UI primitive suite for accessible components

### Build Tools
- `vite` - Frontend bundler with HMR
- `esbuild` - Server bundling for production
- `tsx` - TypeScript execution for development