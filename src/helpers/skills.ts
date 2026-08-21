/**
 * Master skill data format with name, category, and color properties
 * Based on the portfolio project structure
 */
export interface Skill {
  name: string;
  category: string[];
  color?: string;
}

export const masterSkillsMap: Record<string, Skill> = {
  // Languages
  javascript: {
    name: "JavaScript",
    category: ["language", "frontend"],
    color: "#F7DF1E",
  },
  typescript: {
    name: "TypeScript",
    category: ["language", "frontend"],
    color: "#3178C6",
  },
  golang: {
    name: "Golang",
    category: ["language", "backend"],
    color: "#00ADD8",
  },
  php: {
    name: "PHP",
    category: ["language", "backend"],
    color: "#777BB4",
  },
  python: {
    name: "Python",
    category: ["language", "backend"],
    color: "#3776AB",
  },
  java: {
    name: "Java",
    category: ["language", "backend"],
    color: "#007396",
  },
  css: {
    name: "CSS",
    category: ["language", "frontend"],
    color: "#1572B6",
  },

  // Frontend Frameworks
  react: {
    name: "React.js",
    category: ["framework", "frontend"],
    color: "#61DAFB",
  },
  next: {
    name: "Next.js",
    category: ["framework", "frontend"],
    color: "#000000",
  },
  vue: {
    name: "Vue",
    category: ["framework", "frontend"],
    color: "#4FC08D",
  },
  angular: {
    name: "Angular",
    category: ["framework", "frontend"],
    color: "#DD0031",
  },

  // Backend Frameworks
  node: {
    name: "Node.js",
    category: ["framework", "backend"],
    color: "#339933",
  },
  express: {
    name: "Express",
    category: ["framework", "backend"],
    color: "#000000",
  },
  nestjs: {
    name: "NestJS",
    category: ["framework", "backend"],
    color: "#E0234E",
  },
  laravel: {
    name: "Laravel",
    category: ["framework", "backend"],
    color: "#FF2D20",
  },
  codeigniter: {
    name: "CodeIgniter",
    category: ["framework", "backend"],
    color: "#EF4223",
  },
  fiber: {
    name: "Fiber",
    category: ["framework", "backend"],
    color: "#00A8FF",
  },

  // Libraries
  antd: {
    name: "Ant Design",
    category: ["library", "ui"],
    color: "#1890FF",
  },
  tailwind: {
    name: "Tailwind CSS",
    category: ["library", "ui"],
    color: "#38BDF8",
  },
  materialui: {
    name: "Material UI",
    category: ["library", "ui"],
    color: "#0081CB",
  },
  axios: {
    name: "Axios",
    category: ["library", "http"],
    color: "#5A29E4",
  },
  reactquery: {
    name: "React Query",
    category: ["library", "state"],
    color: "#FF4154",
  },
  gorm: {
    name: "GORM",
    category: ["library", "database"],
    color: "#00A1DB",
  },
  socket: {
    name: "Socket.io-client",
    category: ["library", "websocket"],
    color: "#010101",
  },
  cloudinary: {
    name: "Cloudinary",
    category: ["library", "cloud"],
    color: "#3448C5",
  },
  nextintl: {
    name: "next-intl",
    category: ["library", "i18n"],
    color: "#000000",
  },
  redux: {
    name: "Redux",
    category: ["library", "state"],
    color: "#764ABC",
  },

  // Databases
  postgre: {
    name: "PostgreSQL",
    category: ["database"],
    color: "#336791",
  },
  mariadb: {
    name: "MariaDB",
    category: ["database"],
    color: "#003545",
  },
  mysql: {
    name: "MySQL",
    category: ["database"],
    color: "#4479A1",
  },
  mongodb: {
    name: "MongoDB",
    category: ["database"],
    color: "#47A248",
  },
  redis: {
    name: "Redis",
    category: ["database", "cache"],
    color: "#DC382D",
  },
  sql: {
    name: "SQL",
    category: ["database"],
    color: "#003B57",
  },
  prisma: {
    name: "Prisma",
    category: ["database", "orm"],
    color: "#0C344B",
  },

  // Tools
  git: {
    name: "Git",
    category: ["tool", "version-control"],
    color: "#F05032",
  },
  gitlab: {
    name: "GitLab",
    category: ["tool", "version-control"],
    color: "#FC6D26",
  },
  github: {
    name: "GitHub",
    category: ["tool", "version-control"],
    color: "#181717",
  },
  jira: {
    name: "Jira",
    category: ["tool", "project-management"],
    color: "#0052CC",
  },
  slack: {
    name: "Slack",
    category: ["tool", "communication"],
    color: "#4A154B",
  },
  postman: {
    name: "Postman",
    category: ["tool", "api-testing"],
    color: "#FF6C37",
  },
  swagger: {
    name: "Swagger API",
    category: ["tool", "api-documentation"],
    color: "#85EA2D",
  },
  eslint: {
    name: "ESLint",
    category: ["tool", "linting"],
    color: "#4B32C3",
  },
  jest: {
    name: "Jest",
    category: ["tool", "testing"],
    color: "#99424F",
  },
  sonarqube: {
    name: "SonarQube",
    category: ["tool", "code-quality"],
    color: "#4E9BCD",
  },
  docker: {
    name: "Docker",
    category: ["tool", "containers"],
    color: "#2496ED",
  },
  kubernetes: {
    name: "Kubernetes",
    category: ["tool", "containers"],
    color: "#326CE5",
  },
  pm2: {
    name: "PM2",
    category: ["tool", "process-manager"],
    color: "#2B037A",
  },
  xampp: {
    name: "XAMPP",
    category: ["tool", "server"],
    color: "#FB7A24",
  },
  phpmyadmin: {
    name: "phpMyAdmin",
    category: ["tool", "database"],
    color: "#6C78AF",
  },
  minio: {
    name: "MinIO",
    category: ["tool", "storage"],
    color: "#C72E49",
  },
  figma: {
    name: "Figma",
    category: ["tool", "design"],
    color: "#F24E1E",
  },
  cicd: {
    name: "CI/CD",
    category: ["methodology", "devops"],
    color: "#FF6B6B",
  },

  // Platforms
  vercel: {
    name: "Vercel",
    category: ["platform", "deployment"],
    color: "#000000",
  },
  aws: {
    name: "AWS",
    category: ["platform", "cloud"],
    color: "#FF9900",
  },
  gcp: {
    name: "GCP",
    category: ["platform", "cloud"],
    color: "#4285F4",
  },

  // Methodologies & Concepts
  i18n: {
    name: "i18n",
    category: ["methodology", "internationalization"],
    color: "#4ECDC4",
  },
  pwa: {
    name: "Progressive Web Applications (PWAs)",
    category: ["methodology", "web"],
    color: "#5D6D7E",
  },
  testing: {
    name: "Unit Testing",
    category: ["methodology", "testing"],
    color: "#28B463",
  },
  tdd: {
    name: "TDD",
    category: ["methodology", "testing"],
    color: "#27AE60",
  },
  cleanarc: {
    name: "Clean Architecture",
    category: ["methodology", "architecture"],
    color: "#7D3C98",
  },
  microservices: {
    name: "Microservices",
    category: ["methodology", "architecture"],
    color: "#E67E22",
  },
  codesplit: {
    name: "Code Splitting",
    category: ["methodology", "optimization"],
    color: "#3498DB",
  },
  jwt: {
    name: "JWT",
    category: ["methodology", "security"],
    color: "#D35400",
  },
  aescbc: {
    name: "AES-CBC Encryption",
    category: ["methodology", "security"],
    color: "#C0392B",
  },
  cryptography: {
    name: "Cryptography",
    category: ["methodology", "security"],
    color: "#9B59B6",
  },
  oop: {
    name: "OOP",
    category: ["methodology", "programming"],
    color: "#1ABC9C",
  },

  // Soft Skills
  self: {
    name: "Self",
    category: ["soft-skill", "personal"],
    color: "#F39C12",
  },
  growth: {
    name: "Growth Mindset",
    category: ["soft-skill", "personal"],
    color: "#E74C3C",
  },
  publicspeaking: {
    name: "Public Speaking",
    category: ["soft-skill", "communication"],
    color: "#9B59B6",
  },
  personalbranding: {
    name: "Personal Branding",
    category: ["soft-skill", "career"],
    color: "#3498DB",
  },
  selfmanagement: {
    name: "Self-Management",
    category: ["soft-skill", "personal"],
    color: "#1ABC9C",
  },
  timemanagement: {
    name: "Time Management",
    category: ["soft-skill", "productivity"],
    color: "#27AE60",
  },
  reflection: {
    name: "Reflection",
    category: ["soft-skill", "personal"],
    color: "#F1C40F",
  },
  lifeplan: {
    name: "Life Plan",
    category: ["soft-skill", "planning"],
    color: "#E67E22",
  },
  workethic: {
    name: "Work Ethic",
    category: ["soft-skill", "professional"],
    color: "#34495E",
  },

  // Additional Skills
  graphql: {
    name: "GraphQL",
    category: ["language", "api"],
    color: "#E10098",
  },
  restapi: {
    name: "REST API",
    category: ["methodology", "api"],
    color: "#009688",
  },
  uiux: {
    name: "UI/UX",
    category: ["design", "user-experience"],
    color: "#FF4081",
  },
  flutter: {
    name: "Flutter",
    category: ["framework", "mobile"],
    color: "#02569B",
  },
  reactnative: {
    name: "React Native",
    category: ["framework", "mobile"],
    color: "#61DAFB",
  },
};

/**
 * Get skill data by key or name (case insensitive)
 */
export const getSkillData = (key: string): Skill | null => {
  const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
  return masterSkillsMap[normalizedKey] || null;
};

/**
 * Legacy compatibility: simple skills list
 */
export const skillsList = Object.values(masterSkillsMap).map(
  (skill) => skill.name,
);

/**
 * Legacy compatibility: simple skills options
 */
export const skillsOptions = Object.entries(masterSkillsMap).map(
  ([key, skill]) => ({
    label: skill.name,
    value: key,
    color: skill.color,
  }),
);

/**
 * Get skills by category
 */
export const getSkillsByCategory = (category: string): Skill[] => {
  return Object.values(masterSkillsMap).filter((skill) =>
    skill.category.includes(category.toLowerCase()),
  );
};

/**
 * Get all unique categories
 */
export const getAllCategories = (): string[] => {
  const categories = new Set<string>();
  Object.values(masterSkillsMap).forEach((skill) => {
    skill.category.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
};
