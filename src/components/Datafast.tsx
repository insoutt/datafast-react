import {useEffect, useState, type PropsWithChildren} from "react";

interface Props extends PropsWithChildren {
  scriptUrl: string
  callbackUrl: string
  onReady?: () => void
  onSuccess?: () => void
  onError?: (error: any) => void
  config?: {
    locale?: 'es' | 'en'
    showCVVHint?: boolean
    labels?: {
      accountBank?: string
      accountHolder?: string
      accountNumber?: string
      bankName?: string
      brand?: string
      cancel?: string
      cardHolder?: string
      cardNumber?: string
      country?: string
      pin?: string
      pinError?: string
      pinEmptyError?: string
      cvv?: string
      expiryDate?: string
      submit?: string
      applyNow?: string
      nextStep?: string
      givenName?: string
      surname?: string
      accountBankError?: string
      accountHolderError?: string
      accountNumberError?: string
      cardHolderError?: string
      cardNumberError?: string
      cardBinError?: string
      cvvError?: string
      expiryMonthError?: string
      expiryYearError?: string
      learnMore?: string
      mmyy?: string
      ddmmyyyy?: string
      register?: string
      billingCountryError?: string
      billingStateError?: string
      billingCityError?: string
      billingStreetError?: string
      billingStreetError2?: string
      billingPostCodeError?: string
      billingAddress?: string
      showOtherPaymentMethods?: string
      cvvHelp?: string
      cvvHint?: string
      cvvHintAmex?: string
      cvvHintMaestro?: string
      billingCountryPlaceholder?: string
      billingStatePlaceholder?: string
      billingCityPlaceholder?: string
      billingPostCodePlaceholder?: string
      billingStreet1Placeholder?: string
      billingStreet2Placeholder?: string
      billingStreet2PlaceholderMandatory?: string
  },
    registrations?: {
      requireCvv: boolean
      hideInitialPaymentForms: boolean
    }
  }
}

export function Datafast({scriptUrl, callbackUrl, onReady, onSuccess, onError, config  }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);


  useEffect(() => {
      setConfig();

      const loadingObserver = setupLoading();
      const script = setupScript();
      return () => {
        loadingObserver.disconnect();
        script.remove();
      };
  }, []);

  const setConfig = () => {
    const defaultConfig = {
      locale: "es",
      showCVVHint: true,
    }
    const customConfig = {
      ...defaultConfig,
      ...config,
    }
    // @ts-ignore
    window.wpwlOptions = {
      style: 'plain',
      locale: customConfig.locale,
      showCVVHint: customConfig.showCVVHint,
      labels: customConfig.labels,
      registrations: customConfig.registrations,

      onReady: () => {
        onReady?.();
          console.log('ready DatafastBox');

          const cardContainer = document.querySelectorAll('.wpwl-group-registration');
          if(cardContainer) {
            cardContainer.forEach((container) => {
              const checkbox = container.querySelectorAll('.wpwl-wrapper-registration-registrationId')[0]
              // @ts-ignore
              const registrationNumber = container.querySelectorAll('.wpwl-wrapper-registration-number')[0].innerText.replace('**', '');
              // @ts-ignore
              const expiryDate = container.querySelectorAll('.wpwl-wrapper-registration-expiry')[0].innerText
              // @ts-ignore
              const holderName = container.querySelectorAll('.wpwl-wrapper-registration-holder')[0].innerText
              // @ts-ignore
              const brand = container.querySelectorAll('.wpwl-wrapper-registration-brand')[0]
              const details = container.querySelectorAll('.wpwl-wrapper-registration-details')[0]

              if(checkbox && brand && details) {
                checkbox.innerHTML = `<div class="flex items-center gap-2">` + checkbox.innerHTML + `
                  <div class="flex h-10 w-16 ml-2 items-center justify-center rounded bg-white">
                      ${brand.innerHTML}
                  </div>
                  <div>
                    <div class="sm:truncate text-sm font-mono"><sup><span class="hidden sm:inline">**** ****</span> ****</sup> ${registrationNumber}</div>
                    <div class="sm:truncate text-xs text-gray-700">
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


          const datafastHtml = '<div class="dt-poweredby"><img src="https://www.datafast.com.ec/images/verified.png" style="display:block;margin:0 auto; width:100%;"><div/>';
          const wpwlFormCard = document.querySelector('form.wpwl-form-card');
          const wpwlButton = wpwlFormCard?.querySelector('.wpwl-button');
          wpwlButton?.insertAdjacentHTML('beforebegin', datafastHtml);

          // Remember card checkbox
          const createRegistrationHtml = `
              <div class="wpwl--remember-box">
                  <div class="wpwl--header">
                      <input id="remember" type="checkbox" name="createRegistration" class="wpwl--checkbox"/>
                      <label class="wpwl--remember-label" for="remember">
                          Recordar tarjeta para futuras compras
                      </label>
                  </div>
              </div>
          `;
          const form = document.querySelector('form.wpwl-form-card');
          // @ts-ignore
          const button = form.querySelector('.wpwl-button');
          button?.insertAdjacentHTML('beforebegin', createRegistrationHtml);

      },
      onAfterSubmit: () => {
          console.log('onAfterSubmit Payment');
      },
      onBeforeSubmitCard: () => {
          // @ts-ignore
          if (document.querySelector(".wpwl-control-cardHolder")?.value === "") {
              document.querySelector(".wpwl-control-cardHolder")?.classList.add("wpwl-has-error");
              const errorHint = document.createElement("div");
              errorHint.className = "wpwl-hint wpwl-hint-cardHolderError";
              errorHint.textContent = "Nombre del titular de la tarjeta no válido";
              document.querySelector(".wpwl-control-cardHolder")?.after(errorHint);
              const payButton = document.querySelector(".wpwl-button-pay");
              payButton?.classList.add("wpwl-button-error");
              payButton?.setAttribute("disabled", "disabled");
              return false;
          } else {
              return true;
          }
      },
      onError: (error: any) => {
        onError?.(error);
          console.log('onError Payment', error);
      },
    }
  }

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
            <div class="df-bg-white df-rounded-full df-p-8" role="status">
              Cargando...
            </div>
          </div>
        </div>
        `
      } else if (!spinner) {
        setIsLoading(false);
        console.log('Spinner not found');

      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  const setupScript = () => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);
    return script;
  }

  const total = 0;

  const onSubmit = (event: any) => {
      event?.preventDefault();
      console.log('submit', event);
  }



  return (<div className="df-min-h-screen df-border df-bg-blue-200">
    {isLoading && <div className="df-h-screen df-w-full df-absolute df-top-0 df-left-0 df-bg-black/50 df-z-50 df-flex df-items-center df-justify-center"/>}
    <div className="df-w-full df-max-w-lg df-rounded-lg df-border df-border-border df-bg-card df-mx-auto">
        {/* Header */}
        <div className="df-border-b df-border-border df-p-6">
          <div className="df-flex df-items-center df-justify-between">
            <div>
              <h2 className="df-text-lg df-font-semibold df-tracking-tight df-text-foreground">
                Información de pago
              </h2>
              <p className="df-mt-1 df-text-sm df-text-muted-foreground">
                Ingresa los datos de tu tarjeta
              </p>
            </div>
            <div className="df-flex df-items-center df-gap-1 df-rounded-full df-bg-secondary df-px-3 df-py-1.5 df-text-xs df-text-muted-foreground">
              {/* <ShieldCheck className="size-3.5 text-green-600" /> */}
              <span>Seguro</span>
            </div>
          </div>
        </div>
        <div className="df-p-4">
          <form action={callbackUrl} onSubmit={onSubmit} className="paymentWidgets" data-brands="VISA MASTER AMEX"/>
        </div>

        {/* Order Summary */}
        <div className="df-rounded-lg df-bg-secondary/50 df-p-4">
          <div className="df-flex df-items-center df-justify-between">
            <span className="df-text-sm df-text-muted-foreground">Total a pagar</span>
            <span className="df-text-xl df-font-semibold df-text-foreground">${total.toFixed(2)}</span>
          </div>
        </div>
    </div>
  </div>)
}
