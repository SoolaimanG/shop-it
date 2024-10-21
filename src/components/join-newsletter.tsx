import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { useForm } from "react-hook-form";
import { newsLetterData } from "../../data";
import { BackgroundWithLights } from "./background-with-lights";
import { errorMessageAndStatus, store } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const newsLetterSchema = z.object({
  email: z.string().email(),
});

export default function JoinNewsLetter() {
  const form = useForm<z.infer<typeof newsLetterSchema>>({
    resolver: zodResolver(newsLetterSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof newsLetterSchema>) {
    try {
      const res = await store.joinNewsLetter(values.email);

      toast({
        title: "Success",
        description: res.message,
      });
      form.reset();
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  }

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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 flex max-w-md gap-x-4 items-center"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="email-address"
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="off"
                          required
                          className="text-white rounded-none"
                          {...field}
                        />
                      </FormControl>
                      {/*<FormMessage />*/}
                    </FormItem>
                  )}
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
