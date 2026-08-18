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
        name: "subtitle",
        type: "input",
        required: false,
      },
      {
        name: "project_type",
        type: "select",
        required: true,
      },
      {
        name: "role",
        type: "select",
        required: true,
      },
      {
        name: "image",
        type: "upload",
        required: true,
      },
      {
        name: "images",
        type: "image_upload",
        required: false,
      },
      {
        name: "description",
        type: "editor",
        required: false,
      },
      {
        name: "api_documentation",
        type: "input",
        placeholder: "https://postman.co/...",
        required: false,
      },
      {
        name: "features",
        type: "input",
        isList: true,
        required: false,
      },
      {
        name: "highlights",
        type: "input",
        isList: true,
        required: false,
      },
      {
        name: "challenges",
        type: "editor",
        required: false,
      },
      {
        name: "solutions",
        type: "editor",
        required: false,
      },
      {
        name: "story",
        type: "editor",
        required: false,
      },
      {
        name: "outcomes",
        type: "input",
        isList: true,
        required: false,
      },
      {
        name: "skills",
        type: "select_multiple",
        required: true,
      },
      {
        name: "repo_links",
        type: "input",
        isList: true,
        icon: "GithubOutlined",
        placeholder: "https://github.com/username/repo",
      },
      {
        name: "web_link",
        type: "input",
        placeholder: "https://example.com",
      },
    ],
  },
];
