"use client";

import { useEffect, useState } from "react";
import DashboardDecorator, { type DashboardData } from "./decorator";
import LoaderPage from "@/components/admin/loader";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();
        if (result.success) setData(result.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  if (fetching) return <LoaderPage />;

  return <DashboardDecorator data={data} />;
}
