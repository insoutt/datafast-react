import { DTF_ORIGIN } from '../utils/constants.js';
import type { MessageStatus } from '../utils/types.js';

interface ListenMessageEvent {
  // data: ;
  popupIsReady: () => void;
  onPaymentSuccess: (data: Record<string, any>) => void;
  onPaymentError: (error: Record<string, any>) => void;
}

interface Message {
  status: MessageStatus;
  data: Record<string, any>;
  action: string;
  origin: string;
}
interface UsePopupProps {
  onClosePopup?: () => void;
}
export const usePopup = ({ onClosePopup }: UsePopupProps = {}) => {
  let handler: ((event: MessageEvent<Message>) => void) | null = null;

  const setupListener = ({
    popupIsReady,
    onPaymentSuccess,
    onPaymentError,
  }: ListenMessageEvent) => {
    handler = (event: MessageEvent<Message>) => {
      // if (event.origin !== 'https://cards.test') return; // verify origin!
      // if (event.data?.type === 'payment:success') {
      //   // update UI, refetch, etc.
      // }
      console.log('event received2', event.data);
      switch (event.data.action) {
        case 'popupIsReady':
          popupIsReady();
          break;
        case 'successPayment':
          onPaymentSuccess(event.data.data);
          break;
        case 'errorPayment':
          onPaymentError(event.data.data);
          break;
        case 'closePopup':
          onClosePopup?.();
          break;
      }
    };
    window.addEventListener('message', handler);
  };

  const open = (url: string) => {
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      'PaymentPopup',
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`,
    );
    if (!popup) {
      console.error('Popup blocked');
      return;
    }
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer);
        console.log('Popup closed');
        onClosePopup?.();
      }
    }, 500);
  };

  const removeListener = () => {
    if (handler) {
      window.removeEventListener('message', handler);
      handler = null;
      return;
    }
    console.warn('No handler to remove');
  };

  const notifyPopupIsReady = () => {
    sendMessage('success', 'popupIsReady', {
      message: 'popup opened',
    });
  };

  const notifySuccessPayment = (data: Record<string, any>) => {
    sendMessage('success', 'successPayment', data);
  };

  const notifyPaymentError = (error: Record<string, any>) => {
    sendMessage('error', 'errorPayment', error);
  };

  const notifyClosePopup = () => {
    sendMessage('success', 'closePopup', {});
  };

  const sendMessage = (
    status: MessageStatus,
    action: string,
    data: Record<string, any>,
  ) => {
    window.opener?.postMessage(
      {
        status,
        data,
        action,
        origin: DTF_ORIGIN,
      },
      // 'https://cards.test' // restrict target origin – never use '*' for sensitive data
    );
  };

  return {
    setupListener,
    open,
    removeListener,
    notifyPopupIsReady,
    notifySuccessPayment,
    notifyPaymentError,
    notifyClosePopup,
  };
};
