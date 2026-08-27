<a name="readme-top"></a>

<div align="center">
  <a href="https://github.com/harbanery/admin-portfolio">
    <img src="./public/logo.png" alt="Logo" width="80">
  </a>

  <h1 align="center">Admin Portfolio — Raihan Yusuf</h1>

  <p align="center">
    Secure admin dashboard for my personal portfolio — content management, authentication, and media handling.
    <br />
    <br />
    <a href="https://www.linkedin.com/in/raihan-yusuf" target="_blank">View LinkedIn</a>
  </p>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [The Story](#the-story)
- [Usage](#usage)
  - [Features](#features)
  - [Project Structure](#project-structure)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## About The Project

The companion application behind my portfolio website. Every section the public site renders — personal profile, experiences, projects, certifications, educations, publications, and CV files — is curated here. Content lives in a PostgreSQL database managed through **Prisma ORM**, while images and documents are stored in **Cloudinary** under per-menu folders with orphan-asset cleanup. Access is gated by a single-password authentication flow with 12-hour sessions and per-IP rate limiting, so the dashboard stays private even while the portfolio itself is public.

### Built With

[![Next][Next.js]][Next-url]
[![TypeScript][TypeScript]][TypeScript-url]
[![Tailwind][Tailwind]][Tailwind-url]
[![Ant Design][Ant Design]][Ant-url]
[![Prisma][Prisma]][Prisma-url]
[![PostgreSQL][PostgreSQL]][PostgreSQL-url]

## The Story

When I started building my portfolio, the original plan was to combine the portfolio pages and the admin dashboard into a single application — one codebase serving both the public site and its management panel. In practice that turned out to be much harder than expected: shared layouts, routing, and authentication concerns kept colliding, and every new feature made the coupling worse. After fighting those obstacles for a while, I decided to split them apart and build the admin as its own application. That decision gave this project room to grow — authentication, media management, bilingual UI, and import workflows — while the public portfolio stays lean, and both connect through the same database.

## Usage

### Features

- **Next.js App Router** with the Next.js 16 proxy (middleware replacement) protecting every admin page and API route.
- **Single-password authentication** — bcrypt hashing, opaque session tokens stored as SHA-256 hashes, `httpOnly` cookie, and a **12-hour session** TTL recorded in the database.
- **Rate limiting** per IP via a `LoginAttempt` table: 5 failed attempts block login for 15 minutes.
- **Password generator (development only)** — the old password is deleted, a strong new one is randomized server-side, delivered through a rich HTML email via **Nodemailer** SMTP, and all active sessions are revoked.
- **Full CRUD** for personal, experiences, projects, certifications, educations, publications, and CV — including primary-CV selection and ACTIVE/NONACTIVE toggles.
- **Dashboard** with content statistics and charts (Recharts).
- **Cloudinary media management** — uploads land in per-menu folders (`admin-portfolio/projects`, `admin-portfolio/experiences`, …), and assets are deleted from Cloudinary when a record is removed or its file is replaced.
- **PDF delivery proxy** (`/api/file`) that serves PDFs stored with a masked extension and guards against SSRF by allow-listing the account's Cloudinary host.
- **Excel import** (SheetJS) with template download for bulk data entry.
- **Drag-and-drop reordering** (dnd-kit) for projects and similar ordered content.
- **Bilingual UI** (Indonesian/English) with a runtime language toggle, plus light/dark theme switching.
- **Analytics** with Vercel Analytics.
- **Linting** with **ESLint** for maintaining code quality.

### Project Structure

```
src/
├── app/          # Routes & pages (App Router) — (web) admin pages, api/, login/
├── assets/       # Global styles
├── components/   # UI components (admin, custom, locale, theme, vercel)
├── config/       # Environment variables & app constants
├── helpers/      # Pure helper functions
├── models/       # Shared form & domain types
├── server/       # Server-only code (db, auth, email, cloudinary)
├── utils/        # Utilities (fonts)
└── proxy.ts      # Route protection proxy (Next.js 16)
```

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

## Contact

If you have any questions or inquiries regarding this project, feel free to contact me at [ryusuf05@gmail.com](mailto:ryusuf05@gmail.com)

## Acknowledgements

Feel free to check it out:

- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Cloudinary](https://cloudinary.com/)
- [Nodemailer](https://nodemailer.com/)
- [dnd-kit](https://dndkit.com/)
- [Recharts](https://recharts.org/)
- [SheetJS](https://sheetjs.com/)
- [Vercel](https://vercel.com/)
- [Img Shields](https://shields.io)
- [Choose an Open Source License](https://choosealicense.com/)

<!-- MARKDOWN LINKS & IMAGES -->

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Tailwind]: https://img.shields.io/badge/tailwindcss-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Ant Design]: https://img.shields.io/badge/Ant_Design-1677ff?style=for-the-badge&logo=antdesign&logoColor=white
[Ant-url]: https://ant.design/
[Prisma]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
