import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import { PATHS } from "../types";
import Products from "./pages/products";
import Collections from "./pages/collections";
import { AppProvider } from "./components/app-provider";
import MyAccount from "./pages/my-account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { ProtectedPage } from "./components/protected-route";
import DashBoard from "./pages/admin/dashboard";
import { Customers } from "./pages/admin/customers";
import AdminProducts from "./pages/admin/admin-products";
import CreateProductPage from "./pages/admin/create-new-products";
import AdminOrder from "./pages/admin/admin-order";
import Order from "./pages/order";
import OrderDetail from "./pages/order-detail";
import AdminCampaign from "./pages/admin/admin-campaign";
import ProductDetails from "./pages/product-details";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route
            path={PATHS.HOME}
            element={
              <AppProvider>
                <Home />
              </AppProvider>
            }
          />
          <Route
            path={PATHS.PRODUCTS}
            element={
              <AppProvider>
                <Products />
              </AppProvider>
            }
          />
          <Route
            path={PATHS.COLLECTIONS}
            element={
              <AppProvider>
                <Collections />
              </AppProvider>
            }
          />
          <Route
            path={PATHS.ORDER}
            element={
              <AppProvider>
                <Order />
              </AppProvider>
            }
          />
          <Route
            path={PATHS.ORDER_DETAIL + ":orderId"}
            element={
              <AppProvider>
                <OrderDetail />
              </AppProvider>
            }
          />
          <Route
            path={PATHS.PRODUCTS + ":productId"}
            element={
              <AppProvider>
                <ProductDetails />
              </AppProvider>
            }
          />
          <Route
            path={PATHS.MYACCOUNT}
            element={
              <AppProvider showFooter={false}>
                <ProtectedPage canView={["user", "superuser", "admin"]}>
                  <MyAccount />
                </ProtectedPage>
              </AppProvider>
            }
          />
          <Route
            path={PATHS.DASHBOARD}
            element={
              <AppProvider navBarType="admin" showFooter={false}>
                <ProtectedPage canView={["admin", "superuser"]}>
                  <DashBoard />
                </ProtectedPage>
              </AppProvider>
            }
          />
          <Route
            path={PATHS.CUSTOMERS}
            element={
              <AppProvider navBarType="admin" showFooter={false}>
                <ProtectedPage canView={["admin", "superuser"]}>
                  <Customers />
                </ProtectedPage>
              </AppProvider>
            }
          />
          <Route
            path={PATHS.ADMINPRODUCTS}
            element={
              <AppProvider navBarType="admin" showFooter={false}>
                <ProtectedPage canView={["admin", "superuser"]}>
                  <AdminProducts />
                </ProtectedPage>
              </AppProvider>
            }
          />
          <Route
            path={PATHS.ADMIN_CAMPAIGN}
            element={
              <AppProvider navBarType="admin" showFooter={false}>
                <ProtectedPage canView={["admin", "superuser"]}>
                  <AdminCampaign />
                </ProtectedPage>
              </AppProvider>
            }
          />
          <Route
            path={PATHS.CREATE_NEW_PRODUCT + ":id"}
            element={
              <AppProvider navBarType="admin" showFooter={false}>
                <ProtectedPage canView={["admin", "superuser"]}>
                  <CreateProductPage />
                </ProtectedPage>
              </AppProvider>
            }
          />
          <Route
            path={PATHS.ORDERS}
            element={
              <AppProvider navBarType="admin" showFooter={false}>
                <ProtectedPage canView={["admin", "superuser"]}>
                  <AdminOrder />
                </ProtectedPage>
              </AppProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
