import { FormLayout } from "@/models/form";

export const formLayout: FormLayout[] = [
  {
    key: "main",
    items: [
      {
        name: "school",
        type: "input",
        required: true,
      },
      {
        name: "degree",
        type: "input",
        required: true,
      },
      {
        name: "field",
        type: "input",
        required: true,
      },
      {
        name: "period",
        type: "date_range",
        required: true,
      },
      {
        name: "grade",
        type: "input",
        required: false,
      },
      {
        name: "description",
        type: "editor",
        required: false,
      },
      {
        name: "courses",
        type: "select_multiple",
        required: false,
      },
    ],
  },
];
