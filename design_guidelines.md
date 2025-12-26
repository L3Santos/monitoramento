# Real-Time Monitoring System - Terminal/Hacker Aesthetic Design Guidelines

## Design Approach
**Reference-Based**: Terminal interfaces, Matrix aesthetic, monitoring dashboards (Grafana, Datadog) with creative terminal/hacker twist. Raw functionality meets cyberpunk minimalism.

## Typography System
**Primary Font**: Space Mono or JetBrains Mono (monospace) via Google Fonts
- Headers: 600 weight, uppercase, tracking-wider
- Body/Data: 400 weight, tabular-nums
- Code blocks: 400 weight, preserve whitespace
- Glitch effect headers: Split into layers with slight offset

**Hierarchy**:
- H1: text-4xl md:text-5xl font-semibold uppercase
- H2: text-2xl md:text-3xl font-semibold uppercase
- H3: text-xl md:text-2xl uppercase
- Body: text-sm md:text-base
- Data/Code: text-xs md:text-sm font-mono
- Labels: text-xs uppercase tracking-widest

## Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12
**Grid Strategy**: Asymmetric, broken-grid layouts with intentional misalignment
- Main dashboard: 3-column grid (1fr 2fr 1fr) on desktop
- Cards: Varying heights, overlapping elements
- Terminal windows: Full-width sections breaking grid
- Status sidebar: Fixed 300px width, scrollable

## Component Library

### Core Cards
**Terminal Window Cards**: 
- Sharp corners (rounded-none)
- Thin borders (border-2)
- Header bar with window controls (• • •)
- Content padding: p-4 to p-6
- Drop shadow with offset: shadow-[4px_4px_0px_0px]

**Data Display Cards**:
- Scanline overlay effect (repeating-linear-gradient)
- Monospace data in grid format
- Timestamp headers (HH:MM:SS format)
- Blinking cursor indicators

### Status Visualizations
**Creative Status Bars**:
- ASCII progress bars: [████████--] 80%
- Bracket-based meters: ▐█████░░░░░▌
- Terminal-style lists with > prefixes
- Vertical bars using Unicode blocks (█ ▓ ▒ ░)
- Percentage displays: <50%> wrapped in brackets

**Live Metrics**:
- Scrolling log output windows
- Matrix-style cascading characters
- Hexadecimal value displays
- Binary state indicators (0/1 toggles)

### Navigation
**Command Bar**:
- Top-fixed position, h-16
- Input field styled as terminal prompt: "> _"
- Quick action buttons as terminal commands
- Breadcrumb as file path: /dashboard/metrics/cpu

**Sidebar Navigation**:
- Tree-structure file browser style
- Collapsible sections with [+] [-] indicators
- Active state with > prefix marker
- Nested items with └── └── connectors

### Data Tables
**Terminal Table Format**:
- Monospace alignment, border-collapse
- Row separators with ─── characters
- Column headers with ║ dividers
- Zebra striping via opacity variations
- Hover state: slight elevation, shadow

### Interactive Elements
**Buttons**:
- Sharp rectangular (rounded-none)
- Border-2 with offset shadow
- Uppercase text, tracking-wide
- States: normal → border glow → active pressed

**Form Inputs**:
- Terminal-style: border-2, sharp corners
- Prefix with "> " prompt character
- Focus state: animated border pulse
- Monospace input text

### Overlays/Modals
**Alert Panels**:
- ASCII art borders using box-drawing characters
- Blinking warning indicators: [!] markers
- Fixed positioning with backdrop blur
- Stack with z-index hierarchy

## Layout Specifications

**Dashboard Grid**:
- Left Sidebar: 300px fixed, system status tree
- Center Panel: flex-1, main metrics grid (2x2 to 3x3 cards)
- Right Panel: 280px, live activity feed
- Bottom: Full-width terminal log window, h-64

**Asymmetric Principles**:
- Offset cards by 4px-8px intentionally
- Mix card sizes: some spanning 2 columns
- Break alignment every 3rd element
- Diagonal section dividers using transform: skew

## Images
**No traditional hero image**. Replace with:
- Animated ASCII art logo/banner at page top
- Matrix rain background effect (purely decorative)
- System architecture diagram in terminal-style wireframe
- All imagery should be diagram/schematic style, not photography

## Special Effects (Minimal Use)
- Cursor blink animation on input fields
- Scanline overlay (static or slow crawl)
- Glitch effect on critical alerts only
- Data stream cascade on log outputs

**Performance Note**: Limit animations to 2-3 elements simultaneously. Prioritize data update smoothness over decorative effects.