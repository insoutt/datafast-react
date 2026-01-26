import axios from "axios";
import type { CheckoutData } from "../utils/types.js";
import { getScriptUrl } from "../utils/helpers.js";
import { cva, type VariantProps } from "class-variance-authority";

interface SuccessData {
  checkoutId: string;
  scriptUrl: string;
}
interface PaymentButtonProps extends VariantProps<typeof ButtonVariant> {
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
  isTest,
  variant,
}: PaymentButtonProps) => {
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
  return <button onClick={createCheckoutId} className={ButtonVariant({ variant })}>
    {text}
  </button>;
};

const ButtonVariant = cva('df-px-4 df-py-2 df-rounded-md', {
  variants: {
    variant: {
      primary: 'df-bg-blue-500 df-text-white',
      secondary: 'df-bg-gray-500 df-text-white',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});