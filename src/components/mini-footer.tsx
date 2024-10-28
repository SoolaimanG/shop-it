import { openWhatsApp } from "@/lib/utils";
import { FC } from "react";
import { Button } from "./ui/button";

export const MiniFooter: FC<{ subject?: string }> = ({
  subject = "Something is wrong with my order",
}) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-3">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          Need help?{" "}
          <Button
            variant="link"
            onClick={() => openWhatsApp(subject)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Contact our support team
          </Button>
        </p>
      </div>
    </footer>
  );
};
