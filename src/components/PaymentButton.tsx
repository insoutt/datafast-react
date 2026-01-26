import axios from "axios";
import type { CheckoutData } from "../utils/types.js";
import { getScriptUrl } from "../utils/helpers.js";
import { cva, type VariantProps } from "class-variance-authority";
import Spinner from "../icons/Spinner.js";
import { useState } from "react";
import CreditCard from "../icons/CreditCard.js";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const createCheckoutId = () => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    axios.post(url, checkoutData).then((response) => {
      setIsSuccess(true);
      setIsError(false);
      onSuccess({
        checkoutId: response.data.data.id,
        scriptUrl: getScriptUrl(isTest, response.data.data.id)
      });
    }).catch((error) => {
      setIsSuccess(false);
      setIsError(true);
      onError(error);
    }).finally(() => {
      setIsLoading(false);
    });
  };
  return <button onClick={createCheckoutId} className={ButtonVariant({ variant, disabled: isLoading })}>
    {isLoading
      ? <Spinner className="df-size-4 df-animate-spin" />
      : <CreditCard className="df-size-4" />
    }
    {text}
  </button>;
};

const ButtonVariant = cva('df-px-4 df-py-2 df-rounded-md df-flex df-items-center df-gap-1', {
  variants: {
    variant: {
      primary: 'df-bg-primary df-text-white',
      dark: 'df-bg-gray-800 df-text-white',
    },
    disabled: {
      true: 'df-opacity-50',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});