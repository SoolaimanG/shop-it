import { useState } from "react";
import { motion } from "framer-motion";
import { ScreenSize } from "@/components/screen-size";
import { SuggestedForYou } from "@/components/suggested-for-you";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Loader2, Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../types";

const search = z.object({
  orderId: z.string(),
});

export default function Order() {
  const form = useForm<z.infer<typeof search>>({
    resolver: zodResolver(search),
  });
  const n = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: z.infer<typeof search>) => {
    setIsSearching(true);

    n(PATHS.ORDER_DETAIL + e.orderId);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-100 to-white pt-16 md:pt-20 pb-5">
      <ScreenSize className="flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            View Your Order Details
          </h2>
          <Text className="text-center text-gray-600 mb-8">
            Enter your order ID below to track your purchase and view detailed
            information about your order status, shipping, and more.
          </Text>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSearch)}
              className="flex items-center gap-2 w-full justify-center"
            >
              <FormField
                name="orderId"
                render={({ field }) => (
                  <FormItem className="w-full max-w-md">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your Order ID"
                        className="py-6 px-4 text-lg rounded-full border-2 border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="py-6 px-8 rounded-full text-white font-semibold text-lg transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                disabled={isSearching}
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <SuggestedForYou />
        </motion.div>
      </ScreenSize>
    </div>
  );
}
