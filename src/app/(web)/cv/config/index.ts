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
        name: "file_url",
        type: "input",
        placeholder: "https://drive.google.com/...",
        required: true,
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
