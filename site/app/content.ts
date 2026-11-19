// Portfolio content, carried over unchanged from the previous version of the site (resume-based; see site/resume.tex).
// Edit content here; layout lives in page.tsx.
export const email = "addromit2307@gmail.com";
export const resumeUrl = "./Romit-Addagatla-Resume.pdf";
export const projects = [
  {
    "id": "jobapply",
    "number": "01",
    "category": "AGENTIC AI",
    "title": "JobApply",
    "subtitle": "AI job search and resume tailoring, from CLI to web UI.",
    "color": "lime",
    "description": "A multi-agent CLI that searches five job boards, scores job fit, and tailors resumes and cover letters for each role, with a web UI.",
    "details": [
      "Worked on a checkpointed pipeline with a deduplication ledger for job search, fit scoring, and application tailoring.",
      "Supports pluggable LLM providers: Gemini, OpenAI, Anthropic, and Ollama. Built with LangGraph, FastAPI, React, SQLite, and Pydantic."
    ],
    "tags": [
      "LangGraph",
      "FastAPI",
      "React",
      "SQLite",
      "Pydantic"
    ],
    "link": "https://github.com/romit-23/jobapply"
  },
  {
    "id": "research-reader",
    "number": "02",
    "category": "AI RESEARCH TOOLS",
    "title": "Research Reader",
    "subtitle": "PDF annotation and AI-powered paper exploration.",
    "color": "blue",
    "description": "A full-stack paper reader with PDF highlights and comments, Markdown notes with export, and AI explanations, Q&A, and summaries.",
    "details": [
      "Built PDF annotation and Markdown note-taking with export for reading and exploring research papers.",
      "Supports Gemini, OpenAI, Anthropic, Groq, DeepSeek, and Ollama. Built with React, TypeScript, PDF.js, FastAPI, SQLAlchemy, and JWT."
    ],
    "tags": [
      "React",
      "TypeScript",
      "PDF.js",
      "FastAPI",
      "SQLAlchemy",
      "JWT"
    ],
    "link": "https://github.com/romit-23/research-reader"
  },
  {
    "id": "fraud",
    "number": "03",
    "category": "MACHINE LEARNING",
    "title": "Financial Fraud Detection System",
    "subtitle": "Finding the signal in 6.3M transactions.",
    "color": "peach",
    "description": "A machine learning model built on 6.3 million transactions with a 0.13% fraud rate, using Random Forest, XGBoost, and SMOTE to handle class imbalance.",
    "details": [
      "Engineered domain-specific features to improve precision and recall.",
      "Evaluated models on high-volume structured transaction data using AUC-ROC and F1 metrics."
    ],
    "tags": [
      "Random Forest",
      "XGBoost",
      "SMOTE",
      "AUC-ROC",
      "F1"
    ],
    "link": "https://github.com/romit-23/Fraud-Detection-Model"
  },
  {
    "id": "guardnet",
    "number": "04",
    "category": "COMPUTER VISION",
    "title": "GuardNet",
    "subtitle": "Real-time violence detection in public surveillance.",
    "color": "violet",
    "description": "A hybrid deep learning model combining ConvNeXt-Tiny, LSTM, and attention for real-time CCTV violence detection. Published at IEEE.",
    "details": [
      "Combines spatial feature extraction, temporal modeling, and attention for violence detection in CCTV footage.",
      "Built using PyTorch, ConvNeXt, LSTM, OpenCV, and CUDA."
    ],
    "tags": [
      "PyTorch",
      "ConvNeXt",
      "LSTM",
      "OpenCV",
      "CUDA"
    ],
    "link": "https://github.com/romit-23/GuardNet",
    "publication": "https://ieeexplore.ieee.org/document/11284226"
  }
];
export type Project = (typeof projects)[number];
export const experience = [
  {
    "role": "Python AI Engineer",
    "company": "Arcitech.ai",
    "place": "Navi Mumbai",
    "period": "Feb 2026 — Present",
    "current": true,
    "bullets": [
      "Shipped production multi-agent AI systems with LangChain, LangGraph, and LangSmith for orchestration, monitoring, and latency optimization.",
      "Designed clickable AI suggestion cards as a first-class response pattern, improving discoverability and engagement.",
      "Built LLM-ready web-scraping pipelines replacing unreliable PDFs, a scalable foundation for RAG; audited APIs and fixed production data-quality issues.",
      "Drove a GPT model upgrade through benchmark analysis and re-engineered an image upscaling pipeline, fixing hallucination defects and delivering native 2K/4K output."
    ],
    "tags": [
      "Multi-agent systems",
      "LangGraph",
      "LangSmith",
      "Production AI"
    ]
  },
  {
    "role": "Python AI Intern",
    "company": "Arcitech.ai",
    "place": "Navi Mumbai",
    "period": "Dec 2025 — Feb 2026",
    "current": false,
    "bullets": [
      "Built ADFactors, a multi-agent PR generation system with LangChain and LangGraph; integrated compliance agents, web search, and PDF generation.",
      "Monitored agents with LangSmith and cut pipeline latency by replacing high-latency reasoning models with task-optimized alternatives.",
      "Developed REST APIs with FastAPI, PostgreSQL, and pgvector; built RAG systems with persistent memory for context-aware retrieval."
    ],
    "tags": [
      "LangChain",
      "FastAPI",
      "PostgreSQL",
      "pgvector"
    ]
  },
  {
    "role": "AI/ML Intern",
    "company": "Annam.ai · IIT Ropar",
    "place": "Center of Excellence in Digital Agriculture",
    "period": "Aug 2025 — Oct 2025",
    "current": false,
    "bullets": [
      "Applied MLOps with MLflow; deployed models with FastAPI and Docker; researched computer vision with PyTorch and Transformers for agricultural imagery and explored LLMs for automation."
    ],
    "tags": [
      "MLOps",
      "MLflow",
      "PyTorch",
      "Transformers"
    ]
  }
];
export const toolkit = [
  {
    "id": "ai",
    "name": "Agentic AI & ML",
    "groups": [
      {
        "label": "AGENTIC AI & ORCHESTRATION",
        "skills": [
          "LangChain",
          "LangGraph",
          "LangSmith",
          "Multi-agent systems",
          "RAG",
          "Semantic search"
        ]
      },
      {
        "label": "LLMs & GENERATIVE AI",
        "skills": [
          "GPT-4",
          "Llama-3",
          "Claude 3",
          "Mistral-7B",
          "Generative AI",
          "Prompt engineering"
        ]
      },
      {
        "label": "ML FRAMEWORKS & DATA",
        "skills": [
          "PyTorch",
          "TensorFlow",
          "Keras",
          "Scikit-learn",
          "Transformers",
          "SpaCy",
          "NLTK",
          "NumPy",
          "Pandas"
        ]
      }
    ]
  },
  {
    "id": "backend",
    "name": "Backend & data",
    "groups": [
      {
        "label": "LANGUAGES",
        "skills": [
          "Python",
          "JavaScript",
          "TypeScript",
          "SQL",
          "Bash",
          "HTML"
        ]
      },
      {
        "label": "APIS & DATABASES",
        "skills": [
          "FastAPI",
          "Django",
          "PostgreSQL",
          "pgvector",
          "MySQL",
          "FAISS",
          "SQLite",
          "SQLAlchemy",
          "Pydantic",
          "JWT"
        ]
      },
      {
        "label": "VISUALIZATION",
        "skills": [
          "Matplotlib",
          "Seaborn",
          "Plotly",
          "Tableau"
        ]
      }
    ]
  },
  {
    "id": "engineering",
    "name": "Tools & deployment",
    "groups": [
      {
        "label": "TOOLS & PLATFORMS",
        "skills": [
          "Docker",
          "AWS",
          "Git",
          "GitHub",
          "React",
          "PDF.js"
        ]
      },
      {
        "label": "MLOPS & INFERENCE",
        "skills": [
          "MLflow",
          "CUDA",
          "OpenCV",
          "Hugging Face"
        ]
      },
      {
        "label": "RETRIEVAL & SCORING",
        "skills": [
          "FAISS",
          "Mistral-7B",
          "Random Forest",
          "XGBoost",
          "SMOTE"
        ]
      }
    ]
  }
];

export const links = {
  github: "https://github.com/romit-23",
  linkedin: "https://linkedin.com/in/romit-addagatla",
  ieee: "https://ieeexplore.ieee.org/document/11284226",
};

// Copy that previously lived inline in page.tsx, kept word for word.
export const profile = {
  name: "Romit Addagatla",
  role: "Python AI Engineer",
  location: "Mumbai, India",
  current: "Arcitech.ai",
  heroLines: ["Production AI, from retrieval to autonomous agents.", "I build multi-agent workflows, RAG pipelines, and REST APIs."],
  aboutLead: "An AI engineer in Mumbai with hands-on production experience building multi-agent systems, autonomous workflows, and RAG pipelines.",
  aboutBody: "I design and ship AI systems with LangChain, LangGraph, and LangSmith, and build REST APIs deployed at scale with FastAPI and Docker. My work focuses on orchestration, real-time monitoring, context-aware retrieval, and reliable data pipelines.",
  specialties: ["Agentic AI", "Multi-agent systems", "RAG", "Semantic search", "Production APIs"],
};

export const education = {
  degree: "B.Tech in Artificial Intelligence and Machine Learning",
  school: "SIES Graduate School of Technology",
  period: "2021 — 2025",
  focus: ["Artificial intelligence", "Machine learning"],
};
