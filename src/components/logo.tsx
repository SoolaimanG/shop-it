import { appConfigs } from "../../data";
import { FC } from "react";

export const Logo: FC<{}> = () => {
  return (
    <div className="flex items-center">
      <a href="/" className="flex-shrink-0 flex items-center">
        <span className="text-2xl font-semibold text-gray-900">
          {appConfigs.name}
        </span>
      </a>
    </div>
  );
};
