import axios from 'axios';
import type { CheckoutData } from '../utils/types.js';
import { getScriptUrl } from '../utils/helpers.js';
import { cva, type VariantProps } from 'class-variance-authority';
import Spinner from '../icons/Spinner.js';
import { useState, type ReactNode } from 'react';
import CreditCard from '../icons/CreditCard.js';

interface SuccessData {
  checkoutId: string;
  scriptUrl: string;
}

type PaymentButtonRenderProps = {
  isLoading: boolean;
  createCheckout: () => void;
};

interface PaymentButtonProps extends VariantProps<typeof ButtonVariant> {
  url: string;
  checkoutData: CheckoutData;
  onSuccess: (data: SuccessData) => void;
  onError: (error: Error) => void;
  text?: string;
  isTest: boolean;
  children?: (props: PaymentButtonRenderProps) => ReactNode;
}

export const PaymentButton = ({
  url,
  checkoutData,
  onSuccess,
  onError,
  text = 'Pagar con tarjeta',
  isTest = true,
  variant,
  children,
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckout = () => {
    setIsLoading(true);
    axios
      .post(url, checkoutData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then((response) => {
        onSuccess({
          checkoutId: response.data.data.id,
          scriptUrl: getScriptUrl(isTest, response.data.data.id),
        });
      })
      .catch((error) => onError(error))
      .finally(() => setIsLoading(false));
  };

  if (children) {
    return children({
      isLoading,
      createCheckout,
    });
  }

  return (
    <button
      onClick={createCheckout}
      className={ButtonVariant({ variant, disabled: isLoading })}
    >
      {isLoading ? (
        <Spinner className="df-size-4 df-animate-spin" />
      ) : (
        <CreditCard className="df-size-4" />
      )}
      {text}
    </button>
  );
};

const ButtonVariant = cva(
  'df-px-4 df-py-2 df-rounded-md df-flex df-items-center df-gap-1',
  {
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
  },
);
