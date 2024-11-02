import { useState } from "react";
import { Loader2, Mail, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { store } from "@/lib/utils";

const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
});

export default function NewsletterManagement() {
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const query = useQueryClient();

  const { data } = useQuery({
    queryKey: ["news-letter-subscribers", searchTerm],
    queryFn: () => store.getNewsLetterSubscribers(20, searchTerm),
  });

  const { data: subscribers = [] } = data || {};

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  async function onSubmit(_: z.infer<typeof emailSchema>) {
    try {
      setIsLoading(true);

      await store.sendEmailToSubscribers(
        _.subject,
        _.content,
        selectedSubscribers
      );
      toast({ title: "Email sent successfully to users" });
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const removeSubscriber = async (ids: string[]) => {
    try {
      const res = await store.deleteSubsciber(ids);
      query.invalidateQueries({
        queryKey: ["news-letter-subscribers", searchTerm],
      });
      toast({ title: res.message });
    } catch (err) {
      toast({ title: "Something went wrong: server", variant: "destructive" });
    }
  };

  const toggleAllSubscribers = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers?.map((sub) => sub.email));
    }
  };

  const handleCheckboxChange = (subscriberId: string, checked: boolean) => {
    const subscriber = subscribers.find((sub) => sub?._id === subscriberId);
    if (subscriber) {
      if (checked) {
        setSelectedSubscribers((prev) => [...prev, subscriber.email]);
      } else {
        setSelectedSubscribers((prev) =>
          prev.filter((email) => email !== subscriber.email)
        );
      }
    }
  };

  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Management</CardTitle>
          <CardDescription>
            Manage your newsletter subscribers and send emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[300px]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Dialog
                open={isEmailDialogOpen}
                onOpenChange={setIsEmailDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={selectedSubscribers.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Mail className="mr-2 h-4 w-4" /> Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Send Newsletter Email</DialogTitle>
                    <DialogDescription>
                      Compose your email to send to {selectedSubscribers.length}{" "}
                      selected subscribers.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter email subject"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter email content"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Email"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                disabled={!selectedSubscribers.length}
                className="w-full sm:w-auto"
                onClick={() => removeSubscriber(selectedSubscribers)}
              >
                Delete Selected
              </Button>
            </div>
          </div>
          {subscribers?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No subscribers found
            </div>
          ) : (
            <div className="rounded-md border p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedSubscribers.length === subscribers?.length
                        }
                        onCheckedChange={toggleAllSubscribers}
                        aria-label="Select all subscribers"
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers?.map((subscriber) => (
                    <TableRow key={subscriber?._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSubscribers.includes(
                            subscriber.email
                          )}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              subscriber._id!,
                              checked as boolean
                            )
                          }
                          aria-label={`Select ${subscriber.email}`}
                        />
                      </TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubscriber([subscriber?._id!])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
