import { Button, Result } from "antd";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Result
        status="404"
        title="404"
        subTitle="Page not found"
        extra={
          <Button type="primary" href="/">
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
}
