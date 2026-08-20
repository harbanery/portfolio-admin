import { FormLayout } from "@/models/form";

export const formLayout: FormLayout[] = [
  {
    key: "main",
    items: [
      {
        name: "name",
        type: "input",
        required: true,
      },
      {
        name: "file_type",
        type: "select",
        required: true,
      },
      {
        name: "file_url",
        type: "input",
        placeholder: "https://drive.google.com/...",
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
        name: "description",
        type: "textarea",
        required: false,
      },
      {
        name: "is_primary",
        type: "switch",
        required: false,
      },
    ],
  },
];
