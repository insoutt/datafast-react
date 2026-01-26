import { BASE_URL_PROD, BASE_URL_TEST } from "./constants.js";


export const getScriptUrl = (isTest: boolean, checkoutId: string) => {
  const baseUrl = isTest ? BASE_URL_TEST : BASE_URL_PROD;
  return `${baseUrl}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
};