"use client";

import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
  ),
});

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const modules = {
  toolbar: [["bold", "italic", "underline"], ["link"], ["blockquote"]],
};

const formats = ["bold", "italic", "underline", "link", "blockquote"];

const Editor = ({ value, onChange, placeholder, disabled }: EditorProps) => {
  const { mode } = useThemeMode();
  const quillModules = useMemo(() => modules, []);

  useEffect(() => {
    const editorContainer = document.querySelector(".ql-editor") as HTMLElement;
    if (editorContainer) {
      editorContainer.style.minHeight = "100px";
    }
  }, []);

  return (
    <div className={`transition-colors ${mode === "dark" ? "dark" : ""}`}>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={quillModules}
        formats={formats}
      />
    </div>
  );
};

export default Editor;
