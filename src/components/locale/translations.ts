/** Type for supported locales. */
export type Locale = "id" | "en";

/** Dictionary type: flat key -> value per locale. */
export type TranslationDict = Record<string, string>;

export const LOCALES: Locale[] = ["id", "en"];

export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_LABELS: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

const id: TranslationDict = {
  // Common
  "common.loading": "Memuat...",
  "common.add": "Tambah",
  "common.edit": "Ubah",
  "common.save": "Simpan",
  "common.cancel": "Batal",
  "common.delete": "Hapus",
  "common.yes": "Ya",
  "common.no": "Tidak",
  "common.close": "Tutup",
  "common.detail": "Detail",
  "common.status": "Status",
  "common.active": "Aktif",
  "common.inactive": "Nonaktif",
  "common.activate": "Aktifkan",
  "common.deactivate": "Nonaktifkan",
  "common.actions": "Aksi",
  "common.created": "Dibuat",
  "common.updated": "Diubah",
  "common.search": "Cari",
  "common.optional": "opsional",
  "common.required": "wajib",
  "common.allContactsAdded": "Semua kontak sudah ditambahkan",
  "common.addContact": "Tambah Kontak",
  "common.contactType": "Tipe kontak",
  "common.contactValue": "Nilai kontak",
  "common.addField": "Tambah {field}",
  "common.present": "Saat ini",
  "common.noExpiry": "Tidak ada kedaluwarsa",
  "common.openLink": "Buka tautan",
  "common.primary": "Utama",
  "common.website": "Website",

  // Validation & notification
  "validation.required": "{field} wajib diisi.",
  "notif.success": "Berhasil",
  "notif.error": "Gagal",
  "notif.validationError": "Validasi Gagal",
  "notif.saveSuccess": "{entity} berhasil disimpan",
  "notif.saveFailed": "{entity} gagal disimpan",
  "notif.deleteSuccess": "{entity} berhasil dihapus",
  "notif.deleteFailed": "{entity} gagal dihapus",
  "notif.toggleSuccess": "Status {entity} berubah menjadi {status}",
  "notif.toggleFailed": "Gagal mengubah status {entity}",
  "notif.fetchFailed": "Gagal memuat data",
  "notif.confirmDelete": "Yakin ingin menghapus {entity} ini?",
  "notif.confirmSave": "Yakin ingin menyimpan perubahan?",
  "notif.confirmToggle":
    "Yakin ingin {action} {entity} ini?",

  // Menu
  "menu.dashboard": "Dashboard",
  "menu.personal": "Personal",
  "menu.experiences": "Experiences",
  "menu.projects": "Projects",
  "menu.certifications": "Certifications",
  "menu.educations": "Educations",
  "menu.cv": "CV",

  // Header & footer
  "header.toggleSider": "Tampilkan/sembunyikan menu",
  "footer.copyright": "© {year} Admin Portfolio. Semua hak dilindungi.",

  // Theme & language
  "theme.light": "Mode Terang",
  "theme.dark": "Mode Gelap",
  "theme.enableLight": "Aktifkan mode terang",
  "theme.enableDark": "Aktifkan mode gelap",
  "language.select": "Pilih bahasa",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.description": "Ringkasan konten portfolio Anda",
  "dashboard.stat.personal": "Data Personal",
  "dashboard.stat.projectsActive": "Project Aktif",
  "dashboard.stat.projectsTotal": "Total Project",
  "dashboard.stat.experiences": "Experience",
  "dashboard.stat.certifications": "Certification",
  "dashboard.stat.educations": "Education",
  "dashboard.stat.cv": "CV",
  "dashboard.chart.activity": "Aktivitas Project (6 Bulan Terakhir)",
  "dashboard.chart.activityBar": "Project Dibuat",
  "dashboard.chart.status": "Status Project",
  "dashboard.recent": "Project Terbaru",
  "dashboard.empty": "Belum ada data",

  // Projects
  "projects.title": "Project",
  "projects.description": "Kelola project portfolio Anda",
  "projects.add": "Tambah Project",
  "projects.empty": "Belum ada project. Klik \"Tambah Project\" untuk membuat.",
  "projects.detail": "Detail Project",
  "projects.dragHint": "Tarik ikon untuk mengubah urutan",

  // Experiences
  "experiences.title": "Experience",
  "experiences.description": "Kelola pengalaman kerja Anda",
  "experiences.add": "Tambah Experience",
  "experiences.empty": "Belum ada experience. Klik \"Tambah Experience\" untuk membuat.",
  "experiences.detail": "Detail Experience",

  // Certifications
  "certifications.title": "Certification",
  "certifications.description": "Kelola sertifikasi Anda",
  "certifications.add": "Tambah Certification",
  "certifications.empty": "Belum ada sertifikasi. Klik \"Tambah Certification\" untuk membuat.",
  "certifications.detail": "Detail Certification",

  // Educations
  "educations.title": "Education",
  "educations.description": "Kelola riwayat pendidikan Anda",
  "educations.add": "Tambah Education",
  "educations.empty": "Belum ada pendidikan. Klik \"Tambah Education\" untuk membuat.",
  "educations.detail": "Detail Education",

  // Personal
  "personal.title": "Personal",
  "personal.description": "Kelola profil pribadi Anda",
  "personal.empty": "Belum ada data personal. Isi form untuk menyimpan.",
  "personal.section.main": "Utama",
  "personal.section.images": "Gambar",
  "personal.section.skills": "Skill",
  "personal.section.contact": "Kontak",

  // CV
  "cv.title": "CV",
  "cv.description": "Kelola file CV Anda",
  "cv.add": "Tambah CV",
  "cv.empty": "Belum ada CV. Klik \"Tambah CV\" untuk membuat.",
  "cv.detail": "Detail CV",

  // Table columns
  "col.title": "Judul",
  "col.subtitle": "Subjudul",
  "col.role": "Peran",
  "col.jobTitle": "Posisi",
  "col.company": "Perusahaan",
  "col.issuer": "Penerbit",
  "col.issueDate": "Tanggal Terbit",
  "col.expiryDate": "Tanggal Kedaluwarsa",
  "col.school": "Sekolah/Kampus",
  "col.degree": "Gelar",
  "col.field": "Bidang",
  "col.period": "Periode",
  "col.name": "Nama",
  "col.file": "File",
  "col.description": "Deskripsi",
  "col.skills": "Skill",

  // Form fields (shared across entities)
  "form.title": "Judul",
  "form.subtitle": "Subjudul",
  "form.project_type": "Tipe Project",
  "form.client_name": "Nama Klien",
  "form.company_name": "Nama Perusahaan",
  "form.role": "Peran",
  "form.image": "Gambar Utama",
  "form.images": "Gambar Tambahan",
  "form.description": "Deskripsi",
  "form.api_documentation": "Dokumentasi API",
  "form.features": "Fitur",
  "form.highlights": "Highlight",
  "form.challenges": "Tantangan",
  "form.solutions": "Solusi",
  "form.story": "Cerita",
  "form.outcomes": "Hasil",
  "form.skills": "Skill",
  "form.repo_links": "Repository",
  "form.web_link": "Website",
  "form.job_title": "Posisi",
  "form.period": "Periode",
  "form.is_present": "Masih Bekerja di Sini",
  "form.issuer": "Penerbit",
  "form.issue_date": "Tanggal Terbit",
  "form.expiry_date": "Tanggal Kedaluwarsa",
  "form.credential_id": "ID Kredensial",
  "form.credential_url": "URL Kredensial",
  "form.school": "Sekolah/Kampus",
  "form.degree": "Gelar",
  "form.field": "Bidang",
  "form.grade": "Nilai",
  "form.name": "Nama",
  "form.about": "Tentang",
  "form.contacts": "Kontak",
  "form.file_url": "URL File",
  "form.is_primary": "CV Utama",

  // Upload
  "upload.hint": "Klik atau seret file ke area ini untuk unggah",
  "upload.subHint":
    "Hanya mendukung unggahan gambar dengan ukuran maksimal 2MB.",
  "upload.tooLarge": "Ukuran file {name} melebihi 2MB.",
  "upload.invalidType": "{name} bukan file gambar.",

  // Options
  "option.project.personal": "Personal",
  "option.project.internal": "Internal/Perusahaan",
  "option.project.client": "Klien",
  "option.role.fullstack": "Full Stack Developer",
  "option.role.frontend": "Frontend Developer",
  "option.role.backend": "Backend Developer",
  "option.role.mobile": "Mobile Developer",
  "option.role.devops": "DevOps Engineer",
  "option.role.designer": "UI/UX Designer",
  "option.role.data": "Data Engineer",
  "option.contact.email": "Email",
  "option.contact.phone": "Telepon",
  "option.contact.whatsapp": "WhatsApp",
  "option.contact.linkedin": "LinkedIn",
  "option.contact.github": "GitHub",
  "option.contact.instagram": "Instagram",
  "option.contact.website": "Website",
  "option.contact.other": "Lainnya",
};

const en: TranslationDict = {
  // Common
  "common.loading": "Loading...",
  "common.add": "Add",
  "common.edit": "Edit",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.yes": "Yes",
  "common.no": "No",
  "common.close": "Close",
  "common.detail": "Detail",
  "common.status": "Status",
  "common.active": "Active",
  "common.inactive": "Inactive",
  "common.activate": "Activate",
  "common.deactivate": "Deactivate",
  "common.actions": "Actions",
  "common.created": "Created",
  "common.updated": "Updated",
  "common.search": "Search",
  "common.optional": "optional",
  "common.required": "required",
  "common.allContactsAdded": "All contacts added",
  "common.addContact": "Add Contact",
  "common.contactType": "Contact type is required",
  "common.contactValue": "Contact value is required",
  "common.addField": "Add {field}",
  "common.present": "Present",
  "common.noExpiry": "No expiry",
  "common.openLink": "Open link",
  "common.primary": "Primary",
  "common.website": "Website",

  // Validation & notification
  "validation.required": "{field} is required.",
  "notif.success": "Success",
  "notif.error": "Error",
  "notif.validationError": "Validation Error",
  "notif.saveSuccess": "{entity} saved successfully",
  "notif.saveFailed": "Failed to save {entity}",
  "notif.deleteSuccess": "{entity} deleted successfully",
  "notif.deleteFailed": "Failed to delete {entity}",
  "notif.toggleSuccess": "{entity} status changed to {status}",
  "notif.toggleFailed": "Failed to toggle {entity} status",
  "notif.fetchFailed": "Failed to fetch data",
  "notif.confirmDelete": "Are you sure you want to delete this {entity}?",
  "notif.confirmSave": "Are you sure you want to save?",
  "notif.confirmToggle": "Are you sure you want to {action} this {entity}?",

  // Menu
  "menu.dashboard": "Dashboard",
  "menu.personal": "Personal",
  "menu.experiences": "Experiences",
  "menu.projects": "Projects",
  "menu.certifications": "Certifications",
  "menu.educations": "Educations",
  "menu.cv": "CV",

  // Header & footer
  "header.toggleSider": "Toggle menu",
  "footer.copyright": "© {year} Admin Portfolio. All rights reserved.",

  // Theme & language
  "theme.light": "Light Mode",
  "theme.dark": "Dark Mode",
  "theme.enableLight": "Enable light mode",
  "theme.enableDark": "Enable dark mode",
  "language.select": "Select language",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.description": "Overview of your portfolio content",
  "dashboard.stat.personal": "Personal Info",
  "dashboard.stat.projectsActive": "Active Projects",
  "dashboard.stat.projectsTotal": "Total Projects",
  "dashboard.stat.experiences": "Experiences",
  "dashboard.stat.certifications": "Certifications",
  "dashboard.stat.educations": "Educations",
  "dashboard.stat.cv": "CVs",
  "dashboard.chart.activity": "Project Activity (Last 6 Months)",
  "dashboard.chart.activityBar": "Projects Created",
  "dashboard.chart.status": "Project Status",
  "dashboard.recent": "Recent Projects",
  "dashboard.empty": "No data yet",

  // Projects
  "projects.title": "Project",
  "projects.description": "Manage your projects",
  "projects.add": "Add Project",
  "projects.empty": "No projects yet. Click \"Add Project\" to create one.",
  "projects.detail": "Project Detail",
  "projects.dragHint": "Drag the icon to reorder",

  // Experiences
  "experiences.title": "Experience",
  "experiences.description": "Manage your work experiences",
  "experiences.add": "Add Experience",
  "experiences.empty":
    "No experiences yet. Click \"Add Experience\" to create one.",
  "experiences.detail": "Experience Detail",

  // Certifications
  "certifications.title": "Certification",
  "certifications.description": "Manage your certifications",
  "certifications.add": "Add Certification",
  "certifications.empty":
    "No certifications yet. Click \"Add Certification\" to create one.",
  "certifications.detail": "Certification Detail",

  // Educations
  "educations.title": "Education",
  "educations.description": "Manage your education history",
  "educations.add": "Add Education",
  "educations.empty":
    "No educations yet. Click \"Add Education\" to create one.",
  "educations.detail": "Education Detail",

  // Personal
  "personal.title": "Personal",
  "personal.description": "Manage your personal profile",
  "personal.empty": "No personal data yet. Fill the form to save.",
  "personal.section.main": "Main",
  "personal.section.images": "Images",
  "personal.section.skills": "Skills",
  "personal.section.contact": "Contact",

  // CV
  "cv.title": "CV",
  "cv.description": "Manage your CV files",
  "cv.add": "Add CV",
  "cv.empty": "No CV yet. Click \"Add CV\" to create one.",
  "cv.detail": "CV Detail",

  // Table columns
  "col.title": "Title",
  "col.subtitle": "Subtitle",
  "col.jobTitle": "Job Title",
  "col.role": "Role",
  "col.company": "Company",
  "col.issuer": "Issuer",
  "col.issueDate": "Issue Date",
  "col.expiryDate": "Expiry Date",
  "col.school": "School",
  "col.degree": "Degree",
  "col.field": "Field",
  "col.period": "Period",
  "col.name": "Name",
  "col.file": "File",
  "col.description": "Description",
  "col.skills": "Skills",

  // Form fields (shared across entities)
  "form.title": "Title",
  "form.subtitle": "Subtitle",
  "form.project_type": "Project Type",
  "form.client_name": "Client Name",
  "form.company_name": "Company Name",
  "form.role": "Role",
  "form.image": "Main Image",
  "form.images": "Additional Images",
  "form.description": "Description",
  "form.api_documentation": "API Documentation",
  "form.features": "Features",
  "form.highlights": "Highlights",
  "form.challenges": "Challenges",
  "form.solutions": "Solutions",
  "form.story": "Story",
  "form.outcomes": "Outcomes",
  "form.skills": "Skills",
  "form.repo_links": "Repository",
  "form.web_link": "Website",
  "form.job_title": "Job Title",
  "form.period": "Period",
  "form.is_present": "Currently Working Here",
  "form.issuer": "Issuer",
  "form.issue_date": "Issue Date",
  "form.expiry_date": "Expiry Date",
  "form.credential_id": "Credential ID",
  "form.credential_url": "Credential URL",
  "form.school": "School",
  "form.degree": "Degree",
  "form.field": "Field",
  "form.grade": "Grade",
  "form.name": "Name",
  "form.about": "About",
  "form.contacts": "Contacts",
  "form.file_url": "File URL",
  "form.is_primary": "Primary CV",

  // Upload
  "upload.hint": "Click or drag file to this area to upload",
  "upload.subHint": "Support for image uploads only, max size 2MB.",
  "upload.tooLarge": "File {name} exceeds 2MB.",
  "upload.invalidType": "{name} is not an image file.",

  // Options
  "option.project.personal": "Personal",
  "option.project.internal": "Internal/Company",
  "option.project.client": "Client",
  "option.role.fullstack": "Full Stack Developer",
  "option.role.frontend": "Frontend Developer",
  "option.role.backend": "Backend Developer",
  "option.role.mobile": "Mobile Developer",
  "option.role.devops": "DevOps Engineer",
  "option.role.designer": "UI/UX Designer",
  "option.role.data": "Data Engineer",
  "option.contact.email": "Email",
  "option.contact.phone": "Phone",
  "option.contact.whatsapp": "WhatsApp",
  "option.contact.linkedin": "LinkedIn",
  "option.contact.github": "GitHub",
  "option.contact.instagram": "Instagram",
  "option.contact.website": "Website",
  "option.contact.other": "Other",
};

export const TRANSLATIONS: Record<Locale, TranslationDict> = { id, en };

export function translate(
  dict: TranslationDict,
  key: string,
  params?: Record<string, string | number>,
): string {
  let str = dict[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}
