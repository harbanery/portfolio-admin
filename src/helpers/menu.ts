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
