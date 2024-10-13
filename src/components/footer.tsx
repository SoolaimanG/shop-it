import { appConfigs, navLinks, socialMediaLinks } from "../../data";
import { BackgroundWithLights } from "./background-with-lights";
import { Link } from "react-router-dom";
import { Text } from "./text";
import { ScreenSize } from "./screen-size";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const Footer = () => {
  return (
    <div className="w-screen mt-4 flex items-center justify-center flex-wrap bg-primary text-accent px-2 py-10">
      <BackgroundWithLights />
      <ScreenSize className="flex items-center flex-col gap-3 justify-center">
        <div className="flex gap-4">
          {navLinks.map((nav, idx) => (
            <Link key={idx} to={nav.link} className="w-fit">
              <Text className="w-fit text-xl font-semibold hover:text-white transition delay-75 ease-linear">
                {nav.name}
              </Text>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-12">
          {socialMediaLinks.map((link, idx) => (
            <Link key={idx} to={link.link} className="w-fit">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <link.icon
                      size={25}
                      className="text-primary-foreground/60 hover:text-accent transition-all ease-linear delay-75"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{link.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          ))}
        </div>
        <Text className="font-semibold">
          &copy; {appConfigs.name}, Inc. All rights reserved.
        </Text>
      </ScreenSize>
    </div>
  );
};
