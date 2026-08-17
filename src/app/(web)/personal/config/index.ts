import { FormLayout } from "@/interfaces/form";

export const formLayout: FormLayout[] = [
  {
    key: "main",
    titleKey: "personal.section.main",
    items: [
      {
        name: "name",
        type: "input",
        required: true,
      },
      {
        name: "about",
        type: "editor",
      },
    ],
  },
  {
    key: "images",
    titleKey: "personal.section.images",
    items: [
      {
        name: "images",
        type: "image_upload",
      },
    ],
  },
  {
    key: "skills",
    titleKey: "personal.section.skills",
    items: [
      {
        name: "skills",
        type: "select_multiple",
        required: true,
      },
    ],
  },
  {
    key: "contact",
    titleKey: "personal.section.contact",
    items: [
      {
        name: "contacts",
        type: "contact_list",
        isList: true,
      },
    ],
  },
];
