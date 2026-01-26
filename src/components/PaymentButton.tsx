import axios from "axios";
import type { CheckoutData } from "../utils/types.js";
import { getScriptUrl } from "../utils/helpers.js";

interface SuccessData {
  checkoutId: string;
  scriptUrl: string;
}
interface PaymentButtonProps {
  url: string;
  checkoutData: CheckoutData;
  onSuccess: (data: SuccessData) => void;
  onError: (error: Error) => void;
  text?: string;
  isTest: boolean;
}

export const PaymentButton = ({
  url, checkoutData,
  onSuccess,
  onError,
  text = 'Pagar con tarjeta',
  isTest }: PaymentButtonProps) => {
  const createCheckoutId = () => {
    axios.post(url, checkoutData).then((response) => {
      onSuccess({
        checkoutId: response.data.data.id,
        scriptUrl: getScriptUrl(isTest, response.data.data.id)
      });
    }).catch((error) => {
      onError(error);
    });
  };
  return <button onClick={createCheckoutId}>
    {text}
  </button>;
};