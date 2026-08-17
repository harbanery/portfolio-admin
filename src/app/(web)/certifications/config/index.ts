import { FormLayout } from "@/interfaces/form";

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
        name: "issuer",
        type: "input",
        required: true,
      },
      {
        name: "issue_date",
        type: "date",
        required: true,
      },
      {
        name: "expiry_date",
        type: "date",
        required: false,
      },
      {
        name: "credential_id",
        type: "input",
        required: false,
      },
      {
        name: "credential_url",
        type: "input",
        placeholder: "https://...",
        required: false,
      },
      {
        name: "image",
        type: "upload",
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
