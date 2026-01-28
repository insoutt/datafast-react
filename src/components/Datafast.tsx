import { useEffect, useState, type PropsWithChildren } from 'react';
import ShieldCheck from '../icons/ShieldCheck.js';
import type { WpwlOptions } from '../utils/types.js';
import { getInnerText } from '../utils/helpers.js';

interface Props extends PropsWithChildren {
  scriptUrl: string;
  callbackUrl: string;

  // Settings
  title?: string;
  description?: string;
  rememberCard?: boolean;
  rememberCardText?: string;
  amount?: number;
  type?: 'redirection' | 'inline';
  availableBrands?: string[];
  config?: Omit<WpwlOptions, 'style'>;
}

export function Datafast({
  scriptUrl,
  callbackUrl,
  config,
  title = 'Información de pago',
  description = 'Ingresa los datos de tu tarjeta',
  rememberCard = false,
  rememberCardText = 'Recordar tarjeta para futuras compras',
  amount = 0,
  type = 'redirection',
  availableBrands = ['VISA', 'MASTER', 'AMEX'],
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setConfig();

    const loadingObserver = setupLoading();
    const script = setupScript();

    window.addEventListener('message', onMessage, false);

    return () => {
      script.remove();
      loadingObserver.disconnect();
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const setConfig = () => {
    const defaultConfig: WpwlOptions = {
      locale: 'es',
      showCVVHint: true,
    };

    if (type === 'inline') {
      defaultConfig.paymentTarget = 'wp_iframe_response';
      // Define que la página de respuesta (shopperResultUrl) se cargue en el iframe
      defaultConfig.shopperResultTarget = 'wp_iframe_response';
      // Tu URL de respuesta normal (esta se cargará DENTRO del iframe)
      defaultConfig.shopperResultUrl = callbackUrl;
    }

    const customConfig = {
      ...defaultConfig,
      ...config,
    };

    // @ts-ignore
    window.wpwlOptions = {
      ...customConfig,
      style: 'plain',
      onReady: (data: {
        containerKey: string;
        ccMethods:    string[];
      }[]) => {
        console.log('ready DatafastBox');

        const cardHolderGroup = document.querySelector(
          '.wpwl-group-cardHolder',
        );
        const expiryGroup = document.querySelector('.wpwl-group-expiry');
        const cardCvvGroup = document.querySelector('.wpwl-group-cvv');

        if (cardHolderGroup && expiryGroup && cardCvvGroup) {
          const wrapper = document.createElement('div');
          wrapper.className = 'df-flex wpwl-wrapper df-gap-2 mt-2';
          wrapper.appendChild(expiryGroup);
          wrapper.appendChild(cardCvvGroup);
          cardHolderGroup.appendChild(wrapper);
        }

        const cardContainer = document.querySelectorAll(
          '.wpwl-group-registration',
        );
        if (cardContainer) {
          cardContainer.forEach((container) => {
            const checkbox = container.querySelectorAll(
              '.wpwl-wrapper-registration-registrationId',
            )[0];
            const registrationNumber = getInnerText(
              '.wpwl-wrapper-registration-number',
            )?.replace('**', '');
            // @ts-ignore
            const expiryDate = getInnerText(
              '.wpwl-wrapper-registration-expiry',
            )?.replace('**', '');
            const holderName = getInnerText(
              '.wpwl-wrapper-registration-holder',
            );
            const brand = container.querySelector(
              '.wpwl-wrapper-registration-brand',
            );
            const details = container.querySelector(
              '.wpwl-wrapper-registration-details',
            );

            if (checkbox && brand && details) {
              checkbox.innerHTML =
                `<div class="flex items-center gap-2">` +
                checkbox.innerHTML +
                `
                <div class="flex h-10 w-16 ml-2 items-center justify-center rounded bg-white">
                    ${brand.innerHTML}
                </div>
                <div>
                  <div class="sm:truncate text-sm font-mono"><sup><span class="hidden sm:inline">**** ****</span> ****</sup> ${registrationNumber}</div>
                  <div class="sm:truncate text-xs">
                    <span>${holderName}</span>
                    <span> - Vence ${expiryDate}</span>
                  </div>
                </div>
              </div>`;
              brand.remove();
              details.remove();
            }
          });
        }

        const datafastHtml =
          '<div class="dt-poweredby"><img src="https://www.datafast.com.ec/images/verified.png" style="display:block;margin:0 auto; width:100%;"><div/>';
        const wpwlFormCard = document.querySelector('form.wpwl-form-card');
        const wpwlButton = wpwlFormCard?.querySelector('.wpwl-button');
        wpwlButton?.insertAdjacentHTML('beforebegin', datafastHtml);

        if (rememberCard) {
          // Remember card checkbox
          const createRegistrationHtml = `
              <div class="wpwl--remember-box">
                  <div class="wpwl--header">
                      <input id="remember" type="checkbox" name="createRegistration" class="wpwl--checkbox"/>
                      <label class="wpwl--remember-label" for="remember">
                          ${rememberCardText}
                      </label>
                  </div>
              </div>
          `;
          const form = document.querySelector('form.wpwl-form-card');
          // @ts-ignore
          const button = form.querySelector('.wpwl-button');
          button?.insertAdjacentHTML('beforebegin', createRegistrationHtml);
        }

        config?.onReady?.(data);
      },
      onBeforeSubmitCard: (event: any) => {
        if (config?.onBeforeSubmitCard) {
          return config?.onBeforeSubmitCard(event);
        }
        // @ts-ignore
        if (document.querySelector('.wpwl-control-cardHolder')?.value === '') {
          document
            .querySelector('.wpwl-control-cardHolder')
            ?.classList.add('wpwl-has-error');
          const errorHint = document.createElement('div');
          errorHint.className = 'wpwl-hint wpwl-hint-cardHolderError';
          errorHint.textContent = 'Nombre del titular de la tarjeta no válido';
          document.querySelector('.wpwl-control-cardHolder')?.after(errorHint);
          const payButton = document.querySelector('.wpwl-button-pay');
          payButton?.classList.add('wpwl-button-error');
          payButton?.setAttribute('disabled', 'disabled');
          return false;
        } else {
          return true;
        }
      },
    };
  };

  const onMessage = (event: any) => {
    if (typeof event?.data?.status !== 'undefined') {
      console.log('received from', event.data);
    }
  };

  const setupLoading = () => {
    const observer = new MutationObserver((mutations) => {
      const container = document.getElementById('wpwl-registrations');
      const spinner = container?.querySelector('.spinner');
      if (spinner && !spinner.hasAttribute('data-modified')) {
        setIsLoading(true);
        console.log('Spinner detected', spinner);
        spinner.setAttribute('data-modified', 'true');
        // @ts-ignore
        spinner.style.top = '45%';
        spinner.innerHTML = `
        <div class="df-flex df-items-center df-justify-center">
          <div>
            <div class="df-bg-white df-rounded-full df-p-8 dark:df-bg-zinc-900" role="status">
              Cargando...
            </div>
          </div>
        </div>
        `;
      } else if (!spinner) {
        setIsLoading(false);
        // console.log('Spinner not found');
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  };

  const setupScript = () => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);
    return script;
  };

  const onSubmit = (event: any) => {
    event?.preventDefault();
    console.log('submit', event);
  };

  return (
    <div className="df-min-h-screen df-border df-bg-white dark:df-bg-zinc-900">
      {isLoading && (
        <div className="df-h-screen df-w-full df-absolute df-top-0 df-left-0 df-bg-black/50 df-z-50 df-flex df-items-center df-justify-center" />
      )}
      <div className="df-w-full df-max-w-lg df-rounded-lg df-border df-border-zinc-200 dark:df-border-zinc-700 df-bg-card df-mx-auto df-bg-white dark:df-bg-zinc-900">
        {/* Header */}
        <div className="df-border-b df-border-zinc-200 dark:df-border-zinc-700 df-p-6">
          <div className="df-flex df-items-center df-justify-between">
            <div>
              <h2 className="df-text-lg df-font-semibold df-tracking-tight">
                {title}
              </h2>
              <p className="df-mt-1 df-text-sm df-text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="df-flex df-items-center df-gap-1 df-rounded-full df-bg-zinc-100 dark:df-bg-zinc-700 df-px-3 df-py-1.5 df-text-xs df-text-muted-foreground">
              <ShieldCheck className="df-size-3.5 df-text-green-600" />
              <span>Seguro</span>
            </div>
          </div>
        </div>
        <div className="df-p-4">
          <form
            action={callbackUrl}
            onSubmit={onSubmit}
            className="paymentWidgets"
            data-brands={availableBrands.join(' ')}
          />
        </div>

        {type === 'inline' && (
          <div>
            <iframe name="wp_iframe_response" id="wp_iframe_response"></iframe>
          </div>
        )}

        {/* Order Summary */}
        {amount > 0 && (
          <div className="df-rounded-lg df-bg-gray-50 df-p-4">
            <div className="df-flex df-items-center df-justify-between">
              <span className="df-text-sm df-text-muted-foreground">
                Total a pagar
              </span>
              <span className="df-text-xl df-font-semibold df-text-foreground">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
