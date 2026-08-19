import { FormLayout } from "@/models/form";

export const formLayout: FormLayout[] = [
  {
    key: "main",
    items: [
      {
        name: "education_type",
        type: "select",
        required: true,
      },
      {
        name: "school",
        type: "input",
        required: true,
      },
      {
        name: "degree",
        type: "input",
        required: false,
        dependencies: ["education_type"],
        hiddenWhen: { field: "education_type", notEquals: "FORMAL" },
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
