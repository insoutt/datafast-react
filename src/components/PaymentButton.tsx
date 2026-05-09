import axios from 'axios';
import type { CheckoutData } from '../utils/types.js';
import { cva, type VariantProps } from 'class-variance-authority';
import Spinner from '../icons/Spinner.js';
import { useEffect, useState, type ReactNode } from 'react';
import CreditCard from '../icons/CreditCard.js';
import { usePopup } from '../hooks/usePopup.js';

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
  onError: (error: Error) => void;
  text?: string;
  children?: (props: PaymentButtonRenderProps) => ReactNode;
}

interface StandardProps extends BasePaymentButtonProps {
  type?: 'standard';
  onSuccess: (data: SuccessData) => void;
}

interface PopupProps extends BasePaymentButtonProps {
  type: 'popup';
  onClosePopup: () => void;
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
  popupUrl: (data: SuccessData) => string;
}

type Props = StandardProps | PopupProps;

export const PaymentButton = (props: Props) => {
  const {
    url,
    checkoutData,
    onError,
    text = 'Pagar con tarjeta',
    variant,
    children,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const {setupListener, removeListener, open} = usePopup({
    onClosePopup: () => {
      console.log("onClosePopup");
    },
  })

  useEffect(() => {
    if(props.type !== 'popup') return;
    setupListener({
      popupIsReady: () => {
        console.log("popupIsReady");
        // props.onPopupIsReady();
      },
      onPaymentSuccess: (data) => {
        props.onPaymentSuccess(data);
      },
      onPaymentError: (error) => {
        props.onPaymentError(error);
      },
    });
    return () => {
      removeListener();
    };
  }, [props.type]);

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
        if(props.type === 'popup') {
          open(props.popupUrl({
            checkoutId: response.data.data.id,
          }));
        } else {
          props.onSuccess({
            checkoutId: response.data.data.id,
          });
        }
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
