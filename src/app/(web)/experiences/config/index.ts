import { FormLayout } from "@/models/form";

export const formLayout: FormLayout[] = [
  {
    key: "main",
    items: [
      {
        name: "job_title",
        type: "input",
        required: true,
      },
      {
        name: "company_name",
        type: "input",
        required: true,
      },
      {
        name: "employment_type",
        type: "select",
        required: true,
      },
      {
        name: "description",
        type: "editor",
        required: false,
      },
      {
        name: "images",
        type: "image_upload",
        required: false,
      },
      {
        name: "period",
        type: "date_range",
        required: true,
      },
      {
        name: "is_present",
        type: "switch",
        required: false,
      },
    ],
  },
];
