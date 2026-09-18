# Canonical Information Architecture & Content Model

**Author**: Frontend Architect & Experience Director  
**Status**: Canonical & Authoritative  
**Source of Truth**: [`js/core/content.js`](file:///home/yoge/WebstormProjects/portfolio-webpage/js/core/content.js)  

---

## 1. The Canonical 8-Chapter Model

Every navigation system (desktop and mobile), DOM section, heading, tag, telemetry HUD display, camera state, and environmental lighting preset is driven strictly by this unified 8-chapter specification:

| Chapter No. | Canonical ID | DOM Target | Navigation Label | Section Sub-Heading / Tag | Purpose & Content | 3D World Scene State | Narrative Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `prologue` | `#prologue` | `01 Prologue` | `Chapter 01 // Archival Portal` | Architectural threshold, identity, and 4-metric summary ledger | Monolithic graphite gate, central brass rail extending 160m | **Enter**: The inspector arrives at the subterranean verification archive |
| **02** | `origin` | `#origin` | `02 Origin` | `Chapter 02 // Foundation & Philosophy` | Engineering philosophy, academic ledger (Panimalar, 9.37 CGPA), intern experience | Flanking monolithic stone ledger pillars with raking bronze wash | **Discover**: Formative foundations and engineering ethics |
| **03** | `discovery` | `#discovery` | `03 Discovery` | `Chapter 03 // Peer-Reviewed Research` | ICISD'26 conference research on fake recruitment detection via Neuro-Symbolic ML | Rotating DistilBERT core, faceted brass nucleus, 3 anomaly rings | **Inspect**: The central analytical breakthrough in fraud detection |
| **04** | `quests` | `#quests` | `04 Quests` | `Chapter 04 // Exhibition Plinths` | 3 Major production systems (Fake Job Detection, Digital Diary, Expense Tracker) + Secondary Works | Alternating alcove plinths stepping forward on brass tracks | **Encounter**: Tangible production artifacts deployed in real environments |
| **05** | `arena` | `#arena` | `05 Arena` | `Chapter 05 // Competitive Proving Grounds` | High-stakes hackathons (Naan Mudhalvan, Web-A-Thon, Hack4Purpose) | Low-slung overhead industrial steel/bronze trusses, pulsing hazard lights | **Crucible**: Verification under intense temporal and competitive constraints |
| **06** | `capability` | `#capability` | `06 Capability` | `Chapter 06 // Technical Arsenal` | Calibrated skills matrix, enterprise tool stack, and verified certifications | Ruled modular instrumentation panels and floating certification slabs | **Instrument**: Calibrated inventory of production tools and verified skills |
| **07** | `path` | `#path` | `07 Path` | `Chapter 07 // Milestone Chronology` | Chronological career, academic, and publication milestones | Guide rail beacon pylons emitting cascading golden light waves | **Journey**: Spatial passage through time from secondary school to publication |
| **08** | `contact` | `#contact` | `08 Contact` | `Chapter 08 // Horizon Atrium` | Open communication channels, GitHub, LinkedIn, and credentials download | Monumental brass gateway aperture looking out into infinity | **Arrival**: The destination, resolution, and open collaboration terminal |

---

## 2. Architecture & Data Flow

```text
               js/core/content.js (CANONICAL SOURCE OF TRUTH)
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  DESKTOP & MOBILE NAV           DOM STRUCTURE               3D WORLD & HUD
  ├── #nav (01..08)              ├── <section id="...">      ├── Chapter Atmospheres
  ├── #sheet (01..08)            ├── data-chapter="..."      ├── Camera Waypoints
  └── Active Link Highlight      ├── data-idx="CH. 01..08"   ├── Telemetry HUD Readout
                                 └── Tag & Headings          └── Progress Indicator
                                      │
                                      ▼
                        js/core/validator.js
                     (Fails fast on any naming,
                      number, or ID mismatch)
```

---

## 3. Structural Rules & Zero-Drift Policy

1. **Strict ID Alignment**:
   - Section IDs must match canonical IDs exactly: `#prologue`, `#origin`, `#discovery`, `#quests`, `#arena`, `#capability`, `#path`, `#contact`.
   - Legacy drifted IDs (`#top`, `#about`, `#research`, `#work`) are deprecated and replaced.
2. **Strict Number Alignment**:
   - Every chapter number in the navigation (`01` through `08`) must match the section tag (`Chapter 01` through `Chapter 08`) and the HUD readout (`CH. 01` through `CH. 08`).
   - A visitor clicking `02 Origin` will arrive at `Chapter 02 // Foundation & Philosophy` with HUD showing `CH. 02 ORIGIN`.
3. **Automated Enforcement**:
   - The validator in `js/core/validator.js` executes on initialization and during test suite runs. Any discrepancy between config, DOM, nav, or world throws a hard `Error`.
