export interface CapstoneProject {
  title: string;
  description: string;
  deliverables: string[];
}

export interface InternshipTrack {
  id: string;
  title: string;
  shortTitle: string;
  category: 'data_ai' | 'development' | 'qa_marketing';
  tagline: string;
  description: string;
  icon: string;
  badgeColor: string;
  popular?: boolean;
  skills: string[];
  duration: string;
  stipend: string;
  vacancies: number;
  mode: string;
  prerequisites: string[];
  tools: string[];
  capstoneProject: CapstoneProject;
  careerRoles: string[];
}

export const itplPrograms: InternshipTrack[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    shortTitle: "Data Analyst",
    category: "data_ai",
    tagline: "Analyze & visualize insights",
    description: "Master data visualization, statistical exploration, SQL transformations, and interactive dashboarding to turn raw numbers into actionable business insights.",
    icon: "analytics",
    badgeColor: "from-[#cc0000] to-[#00113a]",
    popular: true,
    skills: [
      "SQL",
      "Python",
      "Tableau",
      "PowerBI",
      "Excel Advanced",
      "Statistical Analysis",
      "ETL Pipelines",
      "Data Storytelling"
    ],
    duration: "3 Months | 6 Months | 11 Months",
    stipend: "₹8,000 - ₹15,000 / mo Performance-based",
    vacancies: 8,
    mode: "Hybrid / Sangli",
    prerequisites: [
      "Basic mathematics or statistics aptitude",
      "Curiosity for data patterns",
      "Open to all engineering, BCA, MCA, BSC, BCom grads"
    ],
    tools: [
      "PostgreSQL",
      "Python (Pandas/NumPy)",
      "Power BI",
      "Tableau",
      "Jupyter Lab",
      "Git/GitHub"
    ],
    capstoneProject: {
      title: "Enterprise Omni-Channel Sales & Churn Analytics Dashboard",
      description: "Design and deploy an interactive multi-tab PowerBI & Tableau executive suite analyzing 500,000+ real transaction records with automated customer retention predictions.",
      deliverables: [
        "Automated SQL data warehouse pipelines",
        "Executive KPI dashboard",
        "Customer cohort & retention breakdown",
        "Comprehensive project presentation for interview portfolio"
      ]
    },
    careerRoles: [
      "Junior Data Analyst",
      "BI Developer",
      "Business Operations Analyst",
      "Marketing Data Specialist"
    ]
  },
  {
    id: "data-science",
    title: "Data Science",
    shortTitle: "Data Science",
    category: "data_ai",
    tagline: "Machine learning & predictive models",
    description: "Dive deep into machine learning algorithms, statistical modeling, neural networks, Natural Language Processing, and generative AI systems using real enterprise datasets.",
    icon: "neurology",
    badgeColor: "from-[#00113a] to-[#cc0000]",
    popular: true,
    skills: [
      "Machine Learning",
      "Deep Learning",
      "NLP",
      "Predictive Modeling",
      "Python",
      "Scikit-Learn",
      "TensorFlow/PyTorch",
      "Model Deployment"
    ],
    duration: "3 Months | 6 Months | 11 Months",
    stipend: "₹10,000 - ₹18,000 / mo Performance-based",
    vacancies: 6,
    mode: "Hybrid / Sangli",
    prerequisites: [
      "Proficiency in Python programming",
      "Fundamental Linear Algebra and Probability",
      "Familiarity with standard libraries"
    ],
    tools: [
      "Python 3.11",
      "Scikit-Learn",
      "PyTorch",
      "HuggingFace",
      "FastAPI",
      "MLflow",
      "Docker",
      "Streamlit"
    ],
    capstoneProject: {
      title: "End-to-End AI Predictive Maintenance & Defect Classification Engine",
      description: "Build a production-ready ML/Deep Learning pipeline with FastAPI endpoints and Streamlit monitoring that detects industrial machine failures 48 hours before breakdown.",
      deliverables: [
        "Trained XGBoost & Deep Learning models",
        "FastAPI inference microservice",
        "Model drift monitoring UI",
        "Published GitHub open-source repository"
      ]
    },
    careerRoles: [
      "Associate Data Scientist",
      "ML Engineer Trainee",
      "AI Research Assistant",
      "Predictive Modeling Specialist"
    ]
  },
  {
    id: "website-development",
    title: "Website Development",
    shortTitle: "Web Dev",
    category: "development",
    tagline: "Frontend & backend modern architecture",
    description: "Build responsive, scalable, modern web applications from scratch using React 19, TypeScript, Next.js, Node.js, Express, and cloud databases with industry code reviews.",
    icon: "language",
    badgeColor: "from-[#cc0000] to-[#001f5c]",
    popular: true,
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Next.js",
      "Express",
      "Tailwind CSS",
      "PostgreSQL/MongoDB",
      "REST & GraphQL"
    ],
    duration: "3 Months | 6 Months | 11 Months",
    stipend: "₹8,000 - ₹16,000 / mo Performance-based",
    vacancies: 10,
    mode: "Hybrid / Sangli",
    prerequisites: [
      "Basic knowledge of HTML, CSS, and modern JavaScript (ES6+)",
      "Understanding of web fundamentals",
      "Eager to build real web apps"
    ],
    tools: [
      "VS Code",
      "React 19",
      "TypeScript",
      "Next.js 15",
      "Tailwind CSS",
      "Docker",
      "Vercel / Cloud Run",
      "GitHub Actions"
    ],
    capstoneProject: {
      title: "High-Performance SaaS Workspace with Real-time Collaboration",
      description: "Architect a full-stack SaaS platform featuring secure authentication, team workspaces, live document collaboration with WebSockets, and Stripe payment gateway.",
      deliverables: [
        "Responsive mobile-first web app",
        "RESTful backend API server",
        "Cloud database schemas and migrations",
        "CI/CD pipeline with live deployed URL"
      ]
    },
    careerRoles: [
      "Full Stack Developer Trainee",
      "Frontend React Engineer",
      "Node.js Backend Developer",
      "UI/UX Web Implementer"
    ]
  },
  {
    id: "app-development",
    title: "App Development",
    shortTitle: "App Dev",
    category: "development",
    tagline: "iOS & Android native and hybrid apps",
    description: "Create engaging, high-performance mobile experiences for both iOS and Android platforms using Flutter, Dart, React Native, Firebase backend, and offline-first state architecture.",
    icon: "smartphone",
    badgeColor: "from-[#00113a] to-[#cc0000]",
    skills: [
      "Flutter",
      "React Native",
      "Dart",
      "iOS & Android SDKs",
      "State Management (Bloc/Redux)",
      "Firebase",
      "REST APIs",
      "Play Store Deployment"
    ],
    duration: "3 Months | 6 Months | 11 Months",
    stipend: "₹8,000 - ₹15,000 / mo Performance-based",
    vacancies: 6,
    mode: "Hybrid / Sangli",
    prerequisites: [
      "Object-Oriented Programming basics (Java, C++, or Dart)",
      "Basic UI understanding",
      "Desire to build mobile applications"
    ],
    tools: [
      "Android Studio",
      "Xcode",
      "Flutter SDK",
      "React Native CLI",
      "Firebase Suite",
      "Postman",
      "Figma to Code"
    ],
    capstoneProject: {
      title: "On-Demand Hyperlocal Delivery & Tracking Mobile Application",
      description: "Develop a cross-platform mobile application for real-time order tracking, live GPS location updates, push notifications, and payment processing.",
      deliverables: [
        "Complete Flutter/React Native source code",
        "APK/AAB build for Google Play Store",
        "Firebase backend integration",
        "Recorded video walkthrough and documentation"
      ]
    },
    careerRoles: [
      "Flutter Developer",
      "React Native Engineer",
      "Junior Mobile Application Developer",
      "Android App Specialist"
    ]
  },
  {
    id: "software-testing",
    title: "Software Testing",
    shortTitle: "Software Testing",
    category: "qa_marketing",
    tagline: "QA & Automation excellence",
    description: "Ensure software quality and zero-defect reliability through thorough manual testing methodologies, automated test scripts (Selenium, Cypress, Playwright), API validation, and performance tests.",
    icon: "bug_report",
    badgeColor: "from-[#cc0000] to-[#00113a]",
    skills: [
      "Selenium",
      "Cypress",
      "Playwright",
      "Manual Testing",
      "API Testing (Postman)",
      "Bug Tracking (Jira)",
      "Test Plan Strategy",
      "CI/CD QA Integration"
    ],
    duration: "3 Months | 6 Months | 11 Months",
    stipend: "₹7,000 - ₹14,000 / mo Performance-based",
    vacancies: 5,
    mode: "Hybrid / Sangli",
    prerequisites: [
      "Attention to detail",
      "Basic programming knowledge in Java, Python, or JavaScript",
      "Understanding of software lifecycle (SDLC/STLC)"
    ],
    tools: [
      "Selenium WebDriver",
      "Cypress.io",
      "Postman",
      "Jira / Bugzilla",
      "Jenkins",
      "Git",
      "Allure Reports"
    ],
    capstoneProject: {
      title: "Automated Regression & Security Quality Suite for Banking App",
      description: "Create a comprehensive automated test framework executing 200+ test scenarios across web and mobile interfaces with automatic daily report generation.",
      deliverables: [
        "Custom Selenium/Cypress automation framework",
        "API test collection in Postman with CI automation",
        "Formal Bug Reports and Traceability Matrix",
        "Live demo execution video"
      ]
    },
    careerRoles: [
      "QA Automation Engineer Trainee",
      "Software Test Engineer",
      "API Testing Specialist",
      "Manual & Functional QA Tester"
    ]
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    shortTitle: "Digital Marketing",
    category: "qa_marketing",
    tagline: "SEO, SEM, social media & growth",
    description: "Drive exponential growth and brand authority through Search Engine Optimization (SEO), Paid Ads (Google & Meta Ads), social media strategy, content marketing, and conversion funnels.",
    icon: "campaign",
    badgeColor: "from-[#001f5c] to-[#cc0000]",
    skills: [
      "SEO / SEM",
      "Google Ads",
      "Meta Ads Manager",
      "Social Media Strategy",
      "Content Marketing",
      "Google Analytics 4",
      "Email Automation",
      "Conversion Rate Optimization"
    ],
    duration: "3 Months | 6 Months | 11 Months",
    stipend: "₹7,000 - ₹14,000 / mo Performance-based",
    vacancies: 5,
    mode: "Hybrid / Sangli",
    prerequisites: [
      "Strong written and verbal communication",
      "Creativity and analytical mindset",
      "Familiarity with major social media channels"
    ],
    tools: [
      "Google Analytics 4",
      "Google Search Console",
      "SEMrush / Ahrefs",
      "Canva Pro",
      "Meta Business Suite",
      "Mailchimp / HubSpot"
    ],
    capstoneProject: {
      title: "Live 360° Multi-Channel Brand Growth & Lead Generation Campaign",
      description: "Plan, budget, and execute a real multi-channel digital marketing campaign resulting in 10,000+ organic impressions and high-converting qualified leads.",
      deliverables: [
        "SEO audit and keyword strategy dossier",
        "Live Meta & Google Ads campaign report",
        "Content calendar and creatives portfolio",
        "ROI and conversion analytics presentation"
      ]
    },
    careerRoles: [
      "Digital Marketing Executive",
      "SEO Specialist",
      "Performance Marketer",
      "Social Media Manager"
    ]
  }
];
