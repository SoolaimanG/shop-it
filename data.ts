import {
  CalendarDaysIcon,
  FileText,
  LayoutDashboard,
  Megaphone,
  PercentIcon,
  ShoppingBag,
  Users,
} from "lucide-react";
import { PATHS } from "./types";
import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook";
import { IoLogoWhatsapp } from "@react-icons/all-files/io/IoLogoWhatsapp";
import { MdEmail } from "@react-icons/all-files/md/MdEmail";
import { z } from "zod";

export const navLinks = [
  {
    name: "Home",
    link: PATHS.HOME,
  },
  {
    name: "Products",
    link: PATHS.PRODUCTS,
  },
  {
    name: "Collections",
    link: PATHS.COLLECTIONS,
  },
  {
    name: "About",
    link: PATHS.ABOUT,
  },
  {
    name: "Order",
    link: PATHS.ORDER,
  },
];

export const defaultProductDecription =
  "This Product does not have a descripton but its 100% certain it's available as seen in image";

export const newsLetterData = {
  description:
    "Join our newsletter for the latest updates on new arrivals, exclusive discounts, and special offers. Stay ahead of the trends and never miss out on our top deals!",
  reasons: [
    {
      header: "Update on new products",
      description:
        "Stay informed about our latest product releases and exclusive launches.",
      icon: CalendarDaysIcon,
    },
    {
      header: "Exclusive Discounts",
      description:
        "Receive special discount codes and early access to sales, available only to our subscribers.",
      icon: PercentIcon,
    },
  ],
};

export const appConfigs = {
  name: "ShopIt",
  establishmentDate: 2024,
  mission:
    "To empower individuals to express their unique style through carefully curated, sustainable fashion choices",
  features: [
    "Curated Collections: Each item is hand-picked by our expert stylists.",
    "Sustainability Focus: We prioritize eco-friendly materials and ethical manufacturing.",
    "Inclusive Sizing: Our products cater to all body types and sizes.",
    "Customer-First Approach: Your satisfaction is our top priority.",
  ],
  supportEmails: [
    "suleimaangee@gmail.com",
    "zaliyasule@gmail.com",
    "+2348036317990",
  ],
  deliveryFee: 5000,
  maxPaymentForFlutterwave: 50000,
  shopAccountNumbers: [
    {
      bank: "Opay",
      name: "Zaliya Suleiman",
      number: "8036317990",
    },
    {
      bank: "First Bank",
      name: "Zaliya Suleiman",
      number: "3006462764",
    },
  ],
};

export const socialMediaLinks = [
  {
    icon: FaFacebook,
    name: "Reach Out On FaceBook",
    link: "",
  },
  {
    icon: IoLogoWhatsapp,
    name: `WhatsApp`,
    link: `https://wa.me/${appConfigs.supportEmails[2]}?text=Hello`,
  },
  {
    icon: MdEmail,
    name: "Send us an email",
    link: `mailto:${appConfigs.supportEmails[1]}`,
  },
];

export type IProductFilter = "001" | "002" | "003";

export const productsFilters: { name: string; id: IProductFilter }[] = [
  {
    id: "001",
    name: "Cheapest",
  },
  {
    id: "002",
    name: "Most expensive",
  },
  {
    id: "003",
    name: "Bestseller",
  },
];

export const addressSchema = z.object({
  address: z.string(),
  defaultAddress: z.boolean().optional(),
});

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    collection: z.string().min(1, "Collection is required"),
    price: z.coerce.number().positive("Price must be positive"),
    stock: z.coerce
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),
    hasDiscount: z.boolean().optional(),
    availableColors: z.string().min(1, "At least one color must be specified"),
    rating: z.coerce
      .number()
      .min(0, "Rating cannot be negative")
      .max(5, "Rating cannot exceed 5"),
    isNew: z.boolean().optional(),
    multiplyDelivery: z.boolean().optional(),
    discountedPrice: z.coerce
      .number()
      .positive("Discounted price must be positive")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.hasDiscount) {
        return (
          data.discountedPrice !== undefined &&
          data.discountedPrice < data.price
        );
      }
      return true;
    },
    {
      message:
        "Discounted price is required and must be less than the original price when hasDiscount is true",
      path: ["discountedPrice"],
    }
  )
  .refine(
    (data) => {
      if (data.discountedPrice !== undefined) {
        return data.hasDiscount === true;
      }
      return true;
    },
    {
      message: "hasDiscount must be true when a discounted price is provided",
      path: ["hasDiscount"],
    }
  )
  .transform((data) => {
    if (data.discountedPrice !== undefined && !data.hasDiscount) {
      return { ...data, hasDiscount: true };
    }
    return data;
  });
//
export const dashboardNavItems = [
  { name: "Dashboard", href: PATHS.DASHBOARD, icon: LayoutDashboard },
  { name: "Customers", href: PATHS.CUSTOMERS, icon: Users },
  { name: "Products", href: PATHS.ADMINPRODUCTS, icon: ShoppingBag },
  { name: "Orders", href: PATHS.ORDERS, icon: FileText },
  { name: "Campaign", href: PATHS.ADMIN_CAMPAIGN, icon: Megaphone },
];

export const orderSchema = z.object({
  orderId: z.string().optional(),
  orderDate: z.date(),
  totalAmount: z.number().min(0),
  deliveryFee: z.number().min(0),
  paymentStatus: z.enum(["Pending", "Paid", "Failed"]),
  orderStatus: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]),
  address: z.object({
    state: z.string(),
  }),
  "customer.name": z.string().optional(),
  "customer.phoneNumber": z.string().optional(),
  "customer.email": z.string().email(),
  "customer.note": z.string().optional(),
});
