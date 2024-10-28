export enum PATHS {
  HOME = "/",
  ABOUT = "#about",
  COLLECTIONS = "/collections/",
  PRODUCTS = "/products/",
  MYACCOUNT = "/my-account/",
  SETTINGS = PATHS.MYACCOUNT + "#settings",
  API_DOMAIN = "https://aunty-zaliya-website-backend.vercel.app/",
  LOGIN = "#login",
  DASHBOARD = "/admin/dashboard/",
  CUSTOMERS = "/admin/customers/",
  ORDERS = "/admin/orders/",
  ADMINPRODUCTS = "/admin/products/",
  CREATE_NEW_PRODUCT = "/admin/products/",
  EDIT_PRODUCT = "/admin/products/",
  ORDER = "/track-order/",
  ORDER_DETAIL = "/order-details/",
  ADMIN_CAMPAIGN = "/admin/campaign/",
}

export type IPromotion = {
  discountPercentage: number;
  applicableTo: "AllProducts" | "SelectedProducts";
  productIds?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export enum LOCALSTORAGEKEYS {
  "adminMessage" = "adminMessage",
  "cart" = "cart",
}

export type CartItem = IProduct & { quantity: number; color?: string };

export type IBanner = {
  message: string;
  description?: string;
  productId: string;
};

export type ICollection = {
  _id?: string;
  createdAt?: string;
  image: string;
  name: string;
  slug: string;
  remainingInStock: number;
};

export type IProduct = {
  imgs: string[];
  name: string;
  price: number;
  _id?: string;
  stock: number;
  hasDiscount: boolean;
  discountedPrice: number;
  availableColors: string[];
  collection: string;
  rating: number;
  description?: string;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
//

export type IBuySet = {
  completeSetId: string;
  products: string[];
};

export type IUserRole = "user" | "admin" | "superuser";

export type IProductFilter = "001" | "002" | "003" | "004" | "005" | "006";

export type IUser = {
  _id?: string;
  name: string;
  avatar?: string;
  email: string;
  address: {
    state: string;
  };
  totalSpent: number;
  role: IUserRole;
  createdAt?: string;
  recentOrder: {
    orders: number;
    products: IOrder[];
  };
};

export type AdminMessage = {
  id?: string;
  title: string;
  message: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type IPaymentStatus = "Pending" | "Paid" | "Failed";

export type IOrderStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";

export type IOrderProducts = (IProduct & { colorPrefrence: string })[];

export type IOrder = {
  _id?: string;
  items: IOrderProducts;
  orderDate: Date | string | number;
  totalAmount: number;
  address: {
    state: string;
    address: string;
  };
  paymentStatus: IPaymentStatus;
  orderStatus: IOrderStatus;
  deliveryFee: number;
  paymentLink: string;
  customer: {
    name?: string;
    phoneNumber?: string;
    email: string;
    note?: string;
  };
};
export type IExpenseInsight = {
  collection: string;
  amountSpent: number;
  fill: string;
};

export interface apiResponse<T = any> {
  status: string;
  message: string;
  data: T;
}

export type IDashBoardContent = {
  revenue: number;
  users: number;
  thisMonthSales: number;
  salesChangePercentage: number;
  thisMonthUsers: number;
  thisWeekSales: number;
  weeklySalesChangePercentage: number;
};

export type ISalesOverview = {
  name: string;
  total: number;
};

export type IUseStore = {
  user?: IUser;
  setUser: (user: IUser) => void;
  cart: CartItem[];
  addItemToCart: (item: CartItem) => void;
  removeItemFromCart: (productId: string) => void;
  initializeCart: (items: CartItem[]) => void;
  updateItemQuantity: (productId: string, newQuantity: number) => void;
};
