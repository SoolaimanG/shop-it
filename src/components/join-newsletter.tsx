//import { CalendarDaysIcon, HandRaisedIcon } from '@heroicons/react/24/outline'

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { useForm } from "react-hook-form";
import { Label } from "./ui/label";
import { newsLetterData } from "../../data";
import { BackgroundWithLights } from "./background-with-lights";

export default function JoinNewsLetter() {
  const form = useForm();

  return (
    <div className="relative isolate overflow-hidden bg-primary py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Subscribe to our newsletter.
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              {newsLetterData.description}
            </p>
            <Form {...form}>
              <form className="mt-6 flex max-w-md gap-x-4">
                <Label htmlFor="email-address" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="off"
                  className="text-white rounded-none"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="rounded-none"
                >
                  Subscribe
                </Button>
              </form>
            </Form>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
            {newsLetterData.reasons.map((reason, idx) => (
              <div key={idx} className="flex flex-col items-start">
                <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                  <reason.icon
                    aria-hidden="true"
                    className="h-6 w-6 text-white"
                  />
                </div>
                <dt className="mt-4 font-semibold text-white">
                  {reason.header}
                </dt>
                <dd className="mt-2 leading-7 text-gray-400">
                  {reason.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <BackgroundWithLights />
    </div>
  );
}
