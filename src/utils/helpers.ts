import { BASE_URL_PROD, BASE_URL_TEST } from './constants.js';

export const getScriptUrl = (isTest: boolean, checkoutId: string) => {
  const baseUrl = isTest ? BASE_URL_TEST : BASE_URL_PROD;
  return `${baseUrl}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
};

export const getInnerText = (className: string): string | null => {
  const element = document.querySelector(className);
  if (element) {
    return (element as HTMLElement).innerText;
  }
  return null;
};
