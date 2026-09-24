/**
 * PORTFOLIO CONTENT
 * -----------------
 * Transcribed from the existing repository (index.html, css/, js/) so that no
 * meaningful information is lost. Nothing here is invented biography — it is
 * the original portfolio copy, re-organised into the new chapter structure.
 */

export const IDENTITY = {
  firstName: "Yogeshwaran",
  lastName: "Muthuraman",
  role: "Software Engineer · Applied ML Researcher",
  location: "Chennai, Tamil Nadu, India",
  availability: "Open to software & applied-ML roles · Open to relocation",
  email: "yogeshwaranmuthuraman56@gmail.com",
  github: "https://github.com/Yoge-2004",
  resume: "https://github.com/Yoge-2004/portfolio-webpage/raw/master/Yogeshwaran%20Resume.pdf",
  resumeLabel: "Résumé (PDF)",
};

export const HERO_STATS = [
  { value: "9.37", suffix: "", label: "CGPA / 10", note: "B.E. Computer Science" },
  { value: "1", suffix: "", label: "Peer-Reviewed Paper", note: "ICISD'26 proceedings" },
  { value: "13", suffix: "", label: "Public Repositories", note: "github.com/Yoge-2004" },
  { value: "7", suffix: "", label: "Certifications", note: "Verified technical" },
];

export const PILLARS = [
  {
    id: "ml",
    tag: "PILLAR 01",
    title: "Applied Machine Learning",
    body: "Investigating how statistical models distinguish deceptive signals from legitimate communication under extreme class imbalance.",
  },
  {
    id: "fullstack",
    tag: "PILLAR 02",
    title: "Full-Stack Engineering",
    body: "Architecting production backend REST APIs and client interfaces with Java Spring Boot, Python FastAPI, and secure session management.",
  },
  {
    id: "native",
    tag: "PILLAR 03",
    title: "Native Systems & Runtimes",
    body: "Engineering client-side desktop software with JavaFX and relational MySQL storage during my Robowaves developer internship.",
  },
];

export const IDENTITY_RECORDS = [
  {
    label: "Education",
    value: "B.E. Computer Science",
    detail: "Panimalar Engineering College, Chennai · 2022–2026 · CGPA 9.37/10",
  },
  {
    label: "Experience",
    value: "Java Developer Intern",
    detail: "Robowaves, Chennai · June–August 2025 · Java, JavaFX, MySQL",
  },
  {
    label: "Research",
    value: "Published at ICISD'26",
    detail: "Paper ICISD26-408 · SRM Institute of Science & Technology, Vadapalani",
  },
  {
    label: "Availability",
    value: "Software & Applied-ML Roles",
    detail: "Based in Chennai, Tamil Nadu · Open to relocation",
  },
];

export const RESEARCH = {
  intro:
    "Thousands of job seekers fall prey to postings that never existed. My final-year research examined whether an applied ML architecture could flag recruitment fraud before an applicant submits credentials — and provide verifiable reasoning.",
  steps: [
    {
      tag: "STEP 01 // SEMANTIC ENCODING",
      title: "DistilBERT Contextual Embeddings",
      body: "Extracts dense high-dimensional semantic representations from unstructured job descriptions, capturing nuanced deceptive linguistic patterns.",
    },
    {
      tag: "STEP 02 // ANOMALY ISOLATION",
      title: "Isolation Forest Safety Layer",
      body: "Unsupervised safety boundary that isolates structural anomalies unseen in training distributions, detecting zero-day scam variants.",
    },
    {
      tag: "STEP 03 // CLASSIFICATION",
      title: "Stacking Ensemble Classifier",
      body: "Meta-classifier combining semantic and tabular features to overcome the severe 95:5 authentic-to-fraudulent class imbalance.",
    },
  ],
  badges: ["Published ICISD'26", "Peer Reviewed", "Oral Presentation", "Paper ICISD26-408"],
  paperTitle:
    "Fake Job Posting and Online Recruitment Scam Detection Utilizing Machine Learning and Advanced Natural Language Processing Techniques",
  venue:
    "International Conference on Intelligent Systems and Digital Transformation (ICISD'26)",
  venueDetail:
    "SRM Institute of Science and Technology, Vadapalani Campus, Chennai · 6–7 April 2026",
  bodyPrimary:
    "The architecture is hybrid neuro-symbolic. DistilBERT generates contextual semantic embeddings of job postings, an Isolation Forest isolates high-dimensional anomalies unseen in the training distribution, and a Stacking Ensemble makes the final classification. This unsupervised safety layer enables detection of zero-day scams that mimic legitimate recruitment formats.",
  bodySecondary:
    'A critical challenge was extreme class imbalance: the EMSCAD dataset exhibits an authentic-to-fraudulent ratio of 95:5. A naive classifier predicting "genuine" universally achieves 95% accuracy while remaining completely useless. Addressing this imbalance honestly is why our evaluation emphasizes F1-Score and ROC-AUC over superficial metrics.',
  metrics: [
    { value: "99", suffix: "%", label: "Accuracy" },
    { value: "99.00", suffix: "", label: "F1-Score" },
    { value: "99.99", suffix: "", label: "ROC-AUC" },
  ],
  sample: {
    posting:
      "URGENT: Entry-Level Remote Data Verification Assistant. Earn $4,500/week! No technical interview or previous experience needed. Telegram @fast_onboard_support to receive your home-office equipment check immediately.",
    dbert: "99.4%",
    iso: "0.982",
    verdict:
      "Contextual embeddings matched known fraud clusters (unrealistic compensation, off-platform messaging). Isolation Forest mapped posting into extreme outlier distribution.",
  },
  authors: "Yogeshwaran M, Murugavalli S, Thamarai I, Shamini M",
  affiliation: "Department of Computer Science and Engineering, Panimalar Engineering College, Chennai",
};

export const PATH = [
  {
    period: "2019 — 2020",
    title: "Secondary School Certificate (SSLC)",
    detail: "Nav Bharath Vidyalaya, Chennai.",
    note: "Academic Score: 90%",
  },
  {
    period: "2021 — 2022",
    title: "Higher Secondary Certificate (HSC)",
    detail: "Nav Bharath Vidyalaya, Chennai.",
    note: "Academic Score: 91%",
  },
  {
    period: "2022 — 2026",
    title: "B.E. Computer Science and Engineering",
    detail: "Panimalar Engineering College, Chennai.",
    note: "CGPA: 9.37 / 10",
  },
  {
    period: "June — August 2025",
    title: "Java Developer Intern, Robowaves",
    detail:
      "Built the core Library Management System in Java, JavaFX, and MySQL — architected user access controls, book cataloging, and automated audit reporting modules.",
  },
  {
    period: "April 2026",
    title: "Published at ICISD'26",
    detail:
      "Presented fake recruitment scam detection research at SRM Institute of Science and Technology, Vadapalani Campus.",
    note: "Paper Reference: ICISD26-408",
  },
  {
    period: "Present",
    title: "Seeking the Next Engineering Challenge",
    detail:
      "Actively interviewing for software engineering and applied machine learning roles where curiosity, ownership, and rapid shipping compound.",
  },
];

export const ARENA = [
  {
    year: "2026",
    org: "SRM Institute of Science and Technology",
    title: "ICISD'26 — International Conference",
    body: "Delivered an oral presentation on fake recruitment scam detection using hybrid neuro-symbolic ML. Published in the conference proceedings.",
    date: "6–7 April 2026",
  },
  {
    year: "2025",
    org: "IIT Madras Research Park",
    title: "Naan Mudhalvan Hackathon",
    body: "NLP hackathon focused on engineering intelligent text processing and machine learning applications for the Tamil language.",
  },
  {
    year: "2025",
    org: "IEEE SJCE Student Branch",
    title: "Web-A-Thon",
    body: "24-hour international hackathon hosted by St. Joseph's Engineering College, building full-stack web solutions under continuous time constraints.",
    date: "27–28 March 2025",
  },
  {
    year: "2024",
    org: "DPurpose Foundation",
    title: "Hack4Purpose",
    body: "Multi-month nationwide hackathon developing applied technological solutions for sustainable social innovation.",
    date: "February–May 2024",
  },
  {
    year: "·",
    org: "Octanet",
    title: "Mastering MERN Workshop",
    body: "Four-day intensive engineering workshop on MongoDB, Express.js, React, and Node.js architecture.",
    date: "Technical Workshop",
  },
];

/**
 * CHAPTER 06 — THE TECHNICAL WORLD
 * The original chapter rendered as three flat stacked "layers" and was the
 * broken section of the site. It is rebuilt here as a connected system:
 * a core nucleus, three orbital domains, and the leaf technologies that
 * hang off each domain — each linked to the project where it was used.
 */
export const TECH_SYSTEM = {
  core: {
    label: "Core",
    caption: "Languages I think in",
  },
  domains: [
    {
      id: "languages",
      label: "Core Languages",
      caption: "Where everything begins",
      nodes: [
        { name: "Python", note: "Applied ML, PyTorch & NLP systems" },
        { name: "Java 25", note: "Spring Boot & native JavaFX" },
        { name: "C / C++", note: "Algorithmic foundations & memory" },
        { name: "JavaScript", note: "Client state & WebGL integration" },
      ],
    },
    {
      id: "backend",
      label: "Backend & Frameworks",
      caption: "How systems behave",
      nodes: [
        { name: "Spring Boot 3", note: "REST API & enterprise architecture" },
        { name: "FastAPI", note: "Asynchronous REST & OpenAPI spec" },
        { name: "DistilBERT + Isolation Forest", note: "Hybrid NLP & anomaly detection" },
        { name: "JavaFX Desktop", note: "Circulation OS & relational UI" },
      ],
    },
    {
      id: "data",
      label: "Data, Security & Infrastructure",
      caption: "How systems endure",
      nodes: [
        { name: "MySQL & PostgreSQL", note: "Relational schema & indexing" },
        { name: "JWT in HttpOnly Cookies", note: "Zero-framework XSS mitigation" },
        { name: "Docker & Cloud (TCS iON)", note: "Containerization & deployment" },
        { name: "REST Assured & Cucumber", note: "Automated behavioural verification" },
      ],
    },
  ],
};

export const CAPABILITIES = [
  {
    id: "ml-backend",
    domain: "Backend & Machine Learning",
    items: [
      { name: "Java", note: "Library OS, Expense Tracker, internship engineering" },
      { name: "Python", note: "ICISD'26 research, explainable fraud, diary, task app" },
      { name: "Spring Boot", note: "Expense Tracker enterprise REST architecture" },
      { name: "FastAPI", note: "Digital diary service, todo web application" },
    ],
  },
  {
    id: "systems-ui",
    domain: "Interface & Systems",
    items: [
      { name: "JavaFX", note: "Library OS native desktop system" },
      { name: "HTML5 & CSS3", note: "Zero-framework semantic, accessible layouts" },
      { name: "JavaScript (ES6+)", note: "Interactive client systems, WebGL integration" },
      { name: "Jinja2", note: "Server-side templating for secure web platforms" },
    ],
  },
  {
    id: "data-cloud",
    domain: "Data & Quality Engineering",
    items: [
      { name: "MySQL", note: "Relational schema design, transactions, indexing" },
      { name: "PostgreSQL & SQLite", note: "Encrypted storage, SQLAlchemy migrations" },
      { name: "Git & GitHub", note: "Version control, 13 public repositories" },
      { name: "Cucumber & TestNG", note: "REST Assured behavioural test automation" },
    ],
  },
];

export const PROJECTS = [
  {
    id: "fake-job",
    ordinal: "01",
    title: "Fake Job Posting & Recruitment Scam Detection System",
    short: "Scam Detection",
    repo: "github.com/Yoge-2004/fake-job-detection-python",
    href: "https://github.com/Yoge-2004/fake-job-detection-python",
    hue: "signal",
    phases: [
      {
        tag: "PHASE 01 // THE CRISIS",
        label: "The Problem",
        body: "Online job seekers fall victim to fraudulent recruitment postings that harvest identity credentials. The EMSCAD benchmark has an extreme 95:5 class imbalance — a naive classifier predicting \"authentic\" blindly scores 95% accuracy while remaining entirely useless.",
      },
      {
        tag: "PHASE 02 // ARCHITECTURE",
        label: "The Engineering Approach",
        body: "Architected a hybrid neuro-symbolic pipeline combining DistilBERT contextual embeddings for deep semantic representation, an Isolation Forest safety boundary to detect out-of-distribution zero-day scams, and a Stacking Ensemble classifier.",
      },
      {
        tag: "PHASE 03 // OUTCOME",
        label: "The Result",
        body: "Validated at 99% accuracy, 99.00 F1-score and 99.99% ROC-AUC. Published at ICISD'26 (SRM Institute of Science & Technology) and deployed as a live cloud inspection dashboard with instant explainability reasoning.",
      },
    ],
    stack: ["Python", "NLP", "DistilBERT", "Isolation Forest", "Stacking Ensemble", "Hugging Face", "ICISD'26"],
    telemetry: [
      { label: "Accuracy", value: "99%" },
      { label: "F1-Score", value: "99.00" },
      { label: "ROC-AUC", value: "99.99" },
    ],
    caption: "A machine taught to recognise a lie.",
  },
  {
    id: "digital-diary",
    ordinal: "02",
    title: "Private Digital Diary Platform",
    short: "Digital Diary",
    repo: "github.com/Yoge-2004/digital-diary-application",
    href: "https://github.com/Yoge-2004/digital-diary-application",
    hue: "diary",
    phases: [
      {
        tag: "PHASE 01 // THE CRISIS",
        label: "The Problem",
        body: "Modern single-page web applications routinely store JWT authentication tokens in localStorage or client memory, leaving confidential user journals vulnerable to client-side XSS token exfiltration.",
      },
      {
        tag: "PHASE 02 // ARCHITECTURE",
        label: "The Engineering Approach",
        body: "Engineered a zero-framework platform using Python FastAPI, Jinja2 and vanilla JavaScript over SQLAlchemy. Authentication relies on cryptographically signed JWT access & refresh tokens stored strictly in HttpOnly, SameSite cookies with zero script exposure.",
      },
      {
        tag: "PHASE 03 // OUTCOME",
        label: "The Result",
        body: "Complete mitigation of XSS token hijacking. Features granular emotional telemetry, mood analytics, archival pinning, and time-decayed sharing tokens over an automated OpenAPI backend.",
      },
    ],
    stack: ["FastAPI", "SQLAlchemy", "PostgreSQL", "JWT HttpOnly", "Jinja2", "Bcrypt"],
    telemetry: [
      { label: "XSS Exposure", value: "0%" },
      { label: "Auth Latency", value: "<14ms" },
      { label: "Storage", value: "Encrypted" },
    ],
    caption: "Private by construction, not by promise.",
  },
  {
    id: "expense-tracker",
    ordinal: "03",
    title: "Expense Tracker & Budget Engine",
    short: "Budget Engine",
    repo: "github.com/Yoge-2004/expense-tracker",
    href: "https://github.com/Yoge-2004/expense-tracker",
    hue: "ledger",
    phases: [
      {
        tag: "PHASE 01 // THE CRISIS",
        label: "The Problem",
        body: "Tracking multi-stream income, dynamic category budgeting, and capital allocation across disparate spreadsheets leads to ledger drift and lack of audit validation.",
      },
      {
        tag: "PHASE 02 // ARCHITECTURE",
        label: "The Engineering Approach",
        body: "Architected an enterprise layered REST backend in Java 25 and Spring Boot (Controller → Service → Repository pattern) backed by a normalized MySQL relational database with transactional balance enforcement.",
      },
      {
        tag: "PHASE 03 // OUTCOME",
        label: "The Result",
        body: "Shipped full financial audit reports, category limit alerts, sub-50ms REST API response latency, and continuous deployment to Netlify web hosting.",
      },
    ],
    stack: ["Java 25", "Spring Boot 3", "RESTful API", "MySQL", "Netlify", "Maven"],
    telemetry: [
      { label: "API Latency", value: "<48ms" },
      { label: "ACID Integrity", value: "100%" },
      { label: "Test Coverage", value: "92%" },
    ],
    caption: "Money that has to balance, every time.",
  },
];

export const SECONDARY_SYSTEMS = [
  {
    ordinal: "01",
    title: "Library Management System",
    body: "Engineered during the Robowaves developer internship. Complete JavaFX desktop application with MySQL relational storage covering circulation, member authentication, cataloging, and administrative audit reports. Distributed with native installers.",
    stack: ["Java", "JavaFX", "MySQL", "Maven"],
  },
  {
    ordinal: "02",
    title: "Explainable Fraud Alert System",
    body: "Transaction scoring pipeline providing interpretable machine learning verdicts. Incorporates SHAP and LIME explanatory vectors, webhook alerting, and containerized Docker execution.",
    stack: ["Python", "SHAP", "LIME", "Docker"],
  },
  {
    ordinal: "03",
    title: "Task Management Web App",
    body: "FastAPI and SQLModel service with session-cookie authentication and bcrypt credential hashing. Real-time deadline validation and asynchronous background email notification pipelines.",
    stack: ["FastAPI", "SQLModel", "Bcrypt", "SMTP"],
  },
  {
    ordinal: "04",
    title: "Smart City Guide",
    body: "Interactive urban directory mapping municipal infrastructure, healthcare networks, and transit nodes. Engineered with a Java core and responsive web frontend.",
    stack: ["Java", "HTML5", "CSS3"],
  },
  {
    ordinal: "05",
    title: "REST Assured Automation Framework",
    body: "API test suite executing automated verification against the Petstore Swagger spec. Implements Cucumber Gherkin scenarios, TestNG runner architecture, and multi-format test reporting.",
    stack: ["Java", "REST Assured", "Cucumber", "TestNG"],
  },
  {
    ordinal: "06",
    title: "Java Desktop Quiz Application",
    body: "Interactive assessment desktop software with multi-topic catalogs, precision timer enforcement, and instant scoring diagnostics. Designed for extensible question datasets.",
    stack: ["Java", "Swing / JavaFX"],
  },
];

export const MINDSET = [
  { stage: "Question", body: "Start from the failure mode, not the feature." },
  { stage: "Explore", body: "Read the data before trusting the model." },
  { stage: "Build", body: "Ship something inspectable early." },
  { stage: "Break", body: "Test the assumption that hurts." },
  { stage: "Refine", body: "Measure honestly, including the boring metrics." },
  { stage: "Ship", body: "A model without an interface is an unverifiable claim." },
];
