import axios from 'axios';
import type { CheckoutData } from '../utils/types.js';
import { cva, type VariantProps } from 'class-variance-authority';
import Spinner from '../icons/Spinner.js';
import { useCallback, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import CreditCard from '../icons/CreditCard.js';
interface SuccessData {
  checkoutId: string;
}

type PaymentButtonRenderProps = {
  isLoading: boolean;
  createCheckout: () => void;
};
interface BasePaymentButtonProps extends VariantProps<typeof ButtonVariant> {
  url: string;
  checkoutData: CheckoutData;
  publicToken: string;
  checkoutUrl: string;
  onError: (error: Error) => void;
  onClose?: () => void;
  text?: string;
  children?: (props: PaymentButtonRenderProps) => ReactNode;
}

interface StandardProps extends BasePaymentButtonProps {
  type?: 'standard';
  onSuccess: (data: SuccessData) => void;
}

export type PaymentButtonProps = StandardProps;

export const PaymentButton = (props: PaymentButtonProps) => {
  const {
    url,
    checkoutData,
    onError,
    text = 'Pagar con tarjeta',
    variant,
    onClose,
    onSuccess,
    publicToken,
    checkoutUrl,
    children,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [sandboxFrameSrc, setSandboxFrameSrc] = useState<string | null>(null);

  const closeSandbox = useCallback(() => {
    setSandboxFrameSrc(null);
    onClose?.();
  }, []);

  const openSandbox = useCallback(
    (data: { checkoutId: string }) => {
      setSandboxFrameSrc(checkoutUrl.replace(':id', data.checkoutId));
    },
    [checkoutUrl],
  );

  const createCheckout = () => {
    setIsLoading(true);
    axios
      .post(url, checkoutData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${publicToken}`,
        },
      })
      .then((response) => {
        const checkoutId = response.data.data.id as string;
        openSandbox({ checkoutId });
        onSuccess({ checkoutId });
      })
      .catch((error) => onError(error))
      .finally(() => setIsLoading(false));
  };

  const sandboxModal =
    sandboxFrameSrc && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="df-fixed df-inset-0 df-z-[9999] df-flex df-items-center df-justify-center df-bg-black/50 df-p-4"
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Checkout"
              className="df-relative df-flex df-h-[min(90vh,700px)] df-w-full df-max-w-lg df-flex-col df-overflow-hidden df-rounded-lg df-bg-white df-shadow-lg df-border df-border-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="df-flex df-items-center df-justify-end">
                <button
                  type="button"
                  onClick={closeSandbox}
                  className="df-flex df-h-8 df-w-8 df-items-center df-justify-center df-rounded-md df-text-gray-600 hover:df-bg-gray-100"
                  aria-label="Cerrar"
                >
                  x
                </button>
              </div>
              <iframe
                title="Checkout"
                src={sandboxFrameSrc}
                className="df-h-full df-w-full df-flex-1 df-border-0"
                allow="payment *"
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  if (children) {
    return (
      <>
        {sandboxModal}
        {children({
          isLoading,
          createCheckout,
        })}
      </>
    );
  }

  return (
    <>
      {sandboxModal}
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
    </>
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
