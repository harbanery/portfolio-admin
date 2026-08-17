"use client";

import { Spin } from "antd";

const LoaderPage = () => {
  return (
    <div className="flex justify-center items-center min-h-[50vh] w-full">
      <Spin size="large" />
    </div>
  );
};

export default LoaderPage;
