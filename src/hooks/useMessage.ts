import { useEffect } from 'react';
import type { Message, MessageStatus } from '../utils/types.js';
import { DTF_ORIGIN } from '../utils/constants.js';

export function useMessage() {
  useEffect(() => {
    window.addEventListener('message', listenMessages, false);

    return () => {
      window.removeEventListener('message', listenMessages, false);
    };
  }, []);

  function listenMessages(event: { data: Message }) {
    if (event?.data?.origin !== DTF_ORIGIN) {
      return;
    }

    switch (event?.data?.status) {
      case 'success':
        onSucessTransaction(event.data.data);
        break;
      case 'error':
        onErrorTransaction(event.data.data);
        break;
    }
  }

  const pingParent = () => {
    sendMessage('ping', {
      status: 'success',
      message: 'pong',
    });
  };

  const onSucessTransaction = (data: Record<string, any>) => {
    sendMessage('success', data);
  };

  const onErrorTransaction = (error: Record<string, any>) => {
    sendMessage('error', error);
  };

  const sendMessage = (status: MessageStatus, data: Record<string, any>) => {
    if (typeof window.parent?.postMessage === 'undefined') {
      throw new Error('window.parent.postMessage is not defined');
    }
    window.parent.postMessage(
      {
        status,
        data,
        origin: DTF_ORIGIN,
      },
      '*',
    );
  };

  return {
    listenMessages,
    pingParent,
    onSucessTransaction,
    onErrorTransaction,
  };
}
