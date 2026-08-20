import { FormLayout } from "@/models/form";

export const formLayout: FormLayout[] = [
  {
    key: "main",
    items: [
      {
        name: "title",
        type: "input",
        required: true,
      },
      {
        name: "authors",
        type: "input",
        isList: true,
        required: true,
        placeholder: "Author name",
      },
      {
        name: "publication_type",
        type: "select",
        required: true,
      },
      {
        name: "publisher",
        type: "input",
        required: false,
      },
      {
        name: "journal_name",
        type: "input",
        required: false,
      },
      {
        name: "publish_date",
        type: "date",
        required: true,
      },
      {
        name: "volume",
        type: "input",
        required: false,
      },
      {
        name: "issue",
        type: "input",
        required: false,
      },
      {
        name: "pages",
        type: "input",
        placeholder: "e.g. 123-145",
        required: false,
      },
      {
        name: "doi",
        type: "input",
        placeholder: "10.1000/xxxx",
        required: false,
      },
      {
        name: "url",
        type: "input",
        placeholder: "https://...",
        required: false,
      },
      {
        name: "pdf_url",
        type: "input",
        placeholder: "https://...pdf",
        required: false,
      },
      {
        name: "scholar_url",
        type: "input",
        placeholder: "https://scholar.google.com/...",
        required: false,
      },
      {
        name: "citations",
        type: "number",
        required: false,
      },
      {
        name: "abstract",
        type: "textarea",
        required: false,
      },
      {
        name: "skills",
        type: "select_multiple",
        required: false,
      },
    ],
  },
];
