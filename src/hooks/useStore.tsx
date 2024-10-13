import { checkDuplicates } from "@/lib/utils";
import { IUseStore } from "../../types";
import { create } from "zustand";

export const useStore = create<IUseStore>((set) => ({
  cart: [],
  user: undefined,
  setUser: (user) => {
    set((state) => ({
      ...state,
      user,
    }));
  },
  initializeCart(cart) {
    set((state) => ({
      ...state,
      cart: [
        ...state.cart,
        ...cart.filter(
          (item) => !checkDuplicates(state.cart, "_id", item._id!)
        ),
      ],
    }));
  },
  addItemToCart(item) {
    set((state) => ({
      ...state,
      cart: checkDuplicates(state.cart, "_id", item._id!)
        ? state.cart
        : [...state.cart, item],
    }));
  },
  removeItemFromCart(productId) {
    set((state) => ({
      ...state,
      cart: state.cart.filter((item) => item._id !== productId),
    }));
  },
  updateItemQuantity(productId, newQuantity) {
    set((state) => ({
      ...state,
      cart: state.cart.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(newQuantity, item.stock)),
            }
          : item
      ),
    }));
  },
}));
