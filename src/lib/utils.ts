import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { initializeApp } from "firebase/app";
import axios from "axios";
import Cookie from "js-cookie";
import queryString from "query-string";
import {
  AdminMessage,
  apiResponse,
  IBanner,
  IBuySet,
  ICollection,
  IDashBoardContent,
  IExpenseInsight,
  IOrder,
  IProduct,
  IProductFilter,
  IPromotion,
  ISalesOverview,
  IUser,
  IUserRole,
  PATHS,
} from "../../types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "virtudial-4301a.firebaseapp.com",
  projectId: "virtudial-4301a",
  storageBucket: "virtudial-4301a.appspot.com",
  messagingSenderId: "57949473140",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-9C4373PNV3",
};

export const app = initializeApp(firebaseConfig);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = function (amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const isPathMatching = (
  page: string,
  options?: { level: number; pageLevel: number }
) => {
  const { level = 1, pageLevel = 1 } = options || {};

  const path = location.pathname.split("/");
  const _page = page.split("/")[pageLevel];

  const _isCurrentPage = path[level]?.toLowerCase() === _page?.toLowerCase();

  return _isCurrentPage;
};

export const sendMailProps = (
  mailTO: string,
  subject?: string,
  message?: string
) => {
  return `mailto:${mailTO}?subject=${subject}&body=${message}`;
};

export const errorMessageAndStatus = (error: any) => {
  const message = error?.response?.data?.message;
  const status = error?.response?.data?.status;
  const data = error?.response?.data?.data;

  return { message, status, data };
};

export const api = axios.create({ baseURL: PATHS.API_DOMAIN });

export const getCallbackUrl = () => {
  const callbackUrl = queryString.parse(location.search) as {
    callbackUrl: string | null;
  };
  return callbackUrl.callbackUrl;
};

export const checkDuplicates = <T = any>(
  data: T[],
  checkKey: string,
  value: string
) => {
  //@ts-ignore
  const isExisting = data.find((item) => item[checkKey] === value);

  return Boolean(isExisting);
};

export class Store {
  constructor() {}

  // Getter for the access token
  get getAccessToken() {
    return Cookie.get("access-token");
  }

  // Setter for the access token, with a 2-day expiration
  setAccessToken(token: string) {
    const twoDays = 60 * 60 * 24 * 2;
    Cookie.set("access-token", token, { expires: twoDays, sameSite: "strict" });
  }

  // Public Endpoints
  async getBestSellingProduct() {
    const res: { data: apiResponse<IProduct> } = await api.get(
      `/best-selling-product/`
    );
    return res.data;
  }

  async getLatestDiscountedProduct() {
    const res: { data: apiResponse } = await api.get(
      `/latest-discounted-product/`
    );
    return res.data;
  }

  async getCollections() {
    const res: { data: apiResponse<ICollection[]> } = await api.get(
      `/collections/`
    );
    return res.data;
  }

  async calculateItemsPrice(productIds: string[]) {
    const res: { data: apiResponse<{ totalAmount: number }> } = await api.post(
      `/calculate-items-price/`,
      { productIds }
    );
    return res.data;
  }

  async getCollectionProducts(collection: string, page?: number) {
    const q = queryString.stringify({ page });
    const res: { data: apiResponse } = await api.get(
      `/collections/${collection}/?${q}`
    );
    return res.data;
  }

  async getSuggestedForYou(category?: string, size?: number) {
    const q = queryString.stringify({ category, size });
    const res: { data: apiResponse<IProduct[]> } = await api.get(
      `/suggested-for-you/?${q}`
    );
    return res.data;
  }

  async getTopSellers() {
    const res: { data: apiResponse<IProduct[]> } = await api.get(
      `/top-sellers/`
    );
    return res.data;
  }

  async getProductSet() {
    const res: { data: apiResponse } = await api.get(`/product-set/`);
    return res.data;
  }

  async getProducts(
    page?: number,
    filter?: IProductFilter,
    query?: string,
    collection?: string
  ) {
    const q = queryString.stringify({ page, filter, query, collection });
    const res: { data: apiResponse<IProduct[]> } = await api.get(
      `/products/?${q}`
    );
    return res.data;
  }

  async getProduct(productId: string) {
    const res: { data: apiResponse<IProduct> } = await api.get(
      `/products/${productId}`
    );
    return res.data;
  }

  async calculateDeliveryFee(state: string, quantity: number) {
    const q = queryString.stringify({ state, quantity });
    const res: { data: apiResponse<{ price: number }> } = await api.get(
      `/calculate-delivery-price/?${q}`
    );
    return res.data;
  }

  // Authentication & User
  async authenticateUser(accessToken: string) {
    const res: { data: apiResponse<{ token: string } & IUser> } =
      await api.post(`/authenticate-user/`, { accessToken });
    this.setAccessToken(res.data.data.token);
    return res.data;
  }

  //TODO:
  async getUser() {
    const res: { data: apiResponse<IUser> } = await api.get(`/user/`, {
      headers: { Authorization: `${this.getAccessToken}` },
    });
    return res.data;
  }

  async sendOrderReminder(orderId: string) {
    const res: { data: apiResponse } = await api.get(
      `/order-reminder/${orderId}`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async getUsers(page?: number, query?: string, sortRole?: IUserRole) {
    const q = queryString.stringify({ query, page, sortRole });
    const res: { data: apiResponse<{ users: IUser[]; totalUsers: number }> } =
      await api.get(`/users/?${q}`, {
        headers: { Authorization: `${this.getAccessToken}` },
      });
    return res.data;
  }

  async getRecentOrders() {
    const res: { data: apiResponse<IOrder[]> } = await api.get(
      `/recent-orders/`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async getOrderHistories(page?: number, asAdmin = false) {
    const q = queryString.stringify({ page, asAdmin });
    const res: { data: apiResponse<IOrder[]> } = await api.get(
      `/order-histories/?${q}`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async getOrder(orderId: string) {
    const res: { data: apiResponse<IOrder> } = await api.get(
      `/order/${orderId}/`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async getExpenseInsight() {
    const res: {
      data: apiResponse<{
        expenseInsight: IExpenseInsight[];
        totalSpent: number;
      }>;
    } = await api.get(`/expense-insight/`, {
      headers: { Authorization: `${this.getAccessToken}` },
    });
    return res.data;
  }

  async createNewOrder(
    orderData: Pick<IOrder, "address" | "customer"> & {
      products?: { color: string; ids: string }[];
    }
  ) {
    const res: { data: apiResponse<IOrder> } = await api.post(
      `/order/`,
      orderData,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async editAddress({
    asAdmin = false,
    address,
    userId,
  }: {
    address: { state: string; lga: string };
    asAdmin?: boolean;
    userId?: string;
  }) {
    const res: { data: apiResponse<IUser> } = await api.post(
      `/edit-address/`,
      { asAdmin, userId, ...address },
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  // Admin Endpoints
  async addNewProduct(
    productData: IProduct,
    editMode?: boolean,
    productId?: string
  ) {
    const res: { data: apiResponse } = await api.post(
      `/product/`,
      { ...productData, editMode, productId },
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async createCategory(collectionData: ICollection) {
    const res: { data: apiResponse } = await api.post(
      `/category/`,
      collectionData,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async deleteProduct(productId: string) {
    const res: { data: apiResponse } = await api.delete(
      `/product/${productId}/`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async deleteUser(userId: string) {
    const res: { data: apiResponse } = await api.delete(`/user/${userId}/`, {
      headers: { Authorization: `${this.getAccessToken}` },
    });
    return res.data;
  }

  async getDashboardContent() {
    const res: { data: apiResponse<IDashBoardContent> } = await api.get(
      `/dashboard-content/`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async getSalesOverview() {
    const res: { data: apiResponse<ISalesOverview> } = await api.get(
      `/sales-overview/`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async assignModerator(userId: string) {
    const res: { data: apiResponse } = await api.post(
      `/assign-moderator/${userId}/`,
      null,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async editOrder(orderId: string, order: IOrder) {
    const res: { data: apiResponse<IOrder> } = await api.patch(
      `/order/${orderId}/`,
      order,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async cancelOrder(orderId: string) {
    const res: { data: apiResponse<IOrder> } = await api.patch(
      `/cancel-order/${orderId}/`,
      undefined,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async sendMessageToUsers(messageData: AdminMessage) {
    const res: { data: apiResponse } = await api.post(
      `/send-message/`,
      messageData,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async deleteMessage(messageId: string) {
    const res: { data: apiResponse } = await api.delete(
      `/message/${messageId}/`,
      {
        headers: { Authorization: `${this.getAccessToken}` },
      }
    );
    return res.data;
  }

  async createOrEditStorePromotion(payload: Partial<IPromotion>) {
    const res: { data: apiResponse<IPromotion> } = await api.post(
      "/create-or-edit-store-promotion/",
      payload,
      { headers: { Authorization: this.getAccessToken } }
    );

    return res.data;
  }

  async createOrEditStoreBanner(payload: Partial<IBanner>) {
    const res: { data: apiResponse<IPromotion> } = await api.post(
      "/create-or-edit-store-banner/",
      payload,
      { headers: { Authorization: this.getAccessToken } }
    );

    return res.data;
  }

  async getStorePromotion() {
    const res: { data: apiResponse<IPromotion & { products: IProduct[] }> } =
      await api.get("/get-store-promotion/", {
        headers: { Authorization: this.getAccessToken },
      });

    return res.data;
  }

  async createOrEditStoreSet(payload: Partial<IBuySet>) {
    const res: { data: apiResponse<IBanner> } = await api.post(
      "/create-or-edit-store-set/",
      payload,
      { headers: { Authorization: this.getAccessToken } }
    );

    return res.data;
  }

  async getStoreSet() {
    const res: {
      data: apiResponse<{ completeSet: IProduct; products: IProduct[] }>;
    } = await api.get("/get-store-sets/", {
      headers: { Authorization: this.getAccessToken },
    });

    return res.data;
  }

  async getMessage() {
    const res: { data: apiResponse<AdminMessage> } = await api.get(
      "/get-message/",
      {
        headers: { Authorization: this.getAccessToken },
      }
    );

    return res.data;
  }

  async getStoreBanner() {
    const res: { data: apiResponse<IBanner & { product: IProduct }> } =
      await api.get("/get-promo-banner/", {
        headers: { Authorization: this.getAccessToken },
      });

    return res.data;
  }

  async joinNewsLetter(email: string) {
    const res: { data: apiResponse } = await api.post("/join-newsletter/", {
      email,
    });
    return res.data;
  }

  async getStates() {
    const res: { data: apiResponse<string[]> } = await api.get("/get-states/");
    return res.data;
  }

  async getLGAs(state: string) {
    const res: { data: apiResponse<string[]> } = await api.get(
      `/get-lga/${state}`
    );
    return res.data;
  }
}

export const store = new Store();

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const q = queryString.stringify({
    key: "0ef2bec34990f0f48f13b8d08551e8e3",
  });

  const res: { data: { data: { display_url: string } } } = await axios.post(
    `https://api.imgbb.com/1/upload?${q}`,
    formData
  );

  return res.data;
};

export const desc = (name: string) => {
  return `
 This ${name} is the perfect solution for those looking for quality, functionality, and style. Crafted with precision, it offers the perfect balance of durability and elegance, making it ideal for everyday use or special occasions.

Whether you're looking for a product to enhance your daily routine or add a touch of sophistication to your collection,  delivers unmatched versatility. Its sleek design complements any setting, while its robust construction ensures it withstands the test of time.
 `;
};
