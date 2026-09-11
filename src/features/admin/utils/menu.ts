export const menuKeys = [
  "dashboard",
  "personal",
  "experiences",
  "projects",
  "certifications",
  "educations",
  "publications",
  "cv",
] as const;

export type MenuKey = (typeof menuKeys)[number];

export const menuAdminConfig = [
  { key: "dashboard", link: "/", icon: "DashboardOutlined", active: true },
  { key: "personal", link: "/personal", icon: "UserOutlined", active: true },
  {
    key: "experiences",
    link: "/experiences",
    icon: "HistoryOutlined",
    active: true,
  },
  { key: "projects", link: "/projects", icon: "ProjectOutlined", active: true },
  {
    key: "certifications",
    link: "/certifications",
    icon: "SafetyCertificateOutlined",
    active: true,
  },
  {
    key: "educations",
    link: "/educations",
    icon: "ReadOutlined",
    active: true,
  },
  {
    key: "publications",
    link: "/publications",
    icon: "BookOutlined",
    active: true,
  },
  { key: "cv", link: "/cv", icon: "FileTextOutlined", active: true },
];

export const menuRole = [
  { label: "Full Stack Developer", value: "fullstack" },
  { label: "Frontend Developer", value: "frontend" },
  { label: "Backend Developer", value: "backend" },
  { label: "Mobile Developer", value: "mobile" },
  { label: "DevOps Engineer", value: "devops" },
  { label: "UI/UX Designer", value: "designer" },
  { label: "Data Engineer", value: "data" },
];

export const menuProjectType = [
  { label: "Personal", value: "personal" },
  { label: "Internal/Company", value: "internal" },
  { label: "Client", value: "client" },
];

export const menuPublicationType = [
  { label: "Journal", value: "JOURNAL" },
  { label: "Conference", value: "CONFERENCE" },
  { label: "Book", value: "BOOK" },
  { label: "Preprint", value: "PREPRINT" },
  { label: "Other", value: "OTHER" },
];

export const menuContactType = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "GitHub", value: "github" },
  { label: "Instagram", value: "instagram" },
  { label: "Website", value: "website" },
  { label: "Other", value: "other" },
];

/** Daftar posisi/jabatan IT untuk field "open to" pada Personal. */
export const menuOpenToRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Senior Frontend Developer",
  "Senior Backend Developer",
  "Senior Full Stack Engineer",
  "Web Developer",
  "Mobile Developer",
  "Android Developer",
  "iOS Developer",
  "Flutter Developer",
  "React Native Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Engineer",
  "Cloud Architect",
  "Data Engineer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Business Intelligence Developer",
  "QA Engineer",
  "Automation Test Engineer",
  "Software Tester",
  "Embedded Systems Engineer",
  "IoT Engineer",
  "Game Developer",
  "Unity Developer",
  "UI/UX Designer",
  "Product Designer",
  "Business Analyst",
  "System Analyst",
  "IT Consultant",
  "IT Support",
  "System Administrator",
  "Network Engineer",
  "Security Engineer",
  "Cybersecurity Analyst",
  "Penetration Tester",
  "Database Administrator",
  "Software Architect",
  "Technical Lead",
  "Engineering Manager",
  "Scrum Master",
  "Product Manager",
  "Project Manager",
  "CTO",
  "IT Instructor",
  "Researcher",
];
