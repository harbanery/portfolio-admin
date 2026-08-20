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
        name: "file_type",
        type: "select",
        required: true,
      },
      {
        name: "file_url",
        type: "input",
        placeholder: "https://...",
        required: true,
        dependencies: ["file_type"],
        hiddenWhen: { field: "file_type", notEquals: "URL" },
      },
      {
        name: "file_upload",
        type: "file_upload",
        accept:
          ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        required: true,
        dependencies: ["file_type"],
        hiddenWhen: { field: "file_type", notEquals: "UPLOAD" },
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
