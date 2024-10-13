import { OrderDetails } from "@/components/order-details";
import { ScreenSize } from "@/components/screen-size";
import { useParams } from "react-router-dom";

const OrderDetail = () => {
  const { orderId } = useParams() as { orderId: string };
  return (
    <div className="py-16 md:pt-20 pb-5 h-fit w-screen">
      <ScreenSize className="flex items-center justify-center mt-5">
        <OrderDetails orderId={orderId} className="md:w-[50%] w-[90%]" />
      </ScreenSize>
    </div>
  );
};

export default OrderDetail;
