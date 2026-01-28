export interface CheckoutData {
  customer: Customer;
  cart: Cart;
}

export interface Cart {
  items: Item[];
}

export interface Item {
  name: string;
  description: string;
  val_base0: number;
  val_baseimp: number;
  val_iva: number;
  quantity: number;
}

export interface Customer {
  givenName: string;
  surname: string;
  email: string;
  phone: string;
  identificationDocId: string;
}

export interface WpwlOptions {
  // --- Configuración General ---
  locale?: string; // Ej: "es", "en", "de"
  paymentTarget?: string;
  shopperResultTarget?: string;
  shopperResultUrl?: string;
  numberFormatting?: boolean;
  autofocus?: string;
  disableSubmitOnEnter?: boolean;
  useSummaryPage?: boolean;
  showTaxNumberField?: boolean;
  showBirthDate?: boolean;
  showLabels?: boolean;
  showPlaceholders?: boolean;

  // --- Callbacks de Ciclo de Vida ---
  onReady?: (data: {
    containerKey: string;
    ccMethods:    string[];
  }[]) => void;
  onAfterSubmit?: () => void;
  onError?: (error: {
    brand: string;
    name: 'InvalidCheckoutIdError' | 'PciIframeSubmitError' | 'PciIframeCommunicationError' | 'WidgetError' | string;
    message: string | object;
    event?: any
  }) => void;
  onBeforeSubmitCard?: (event: any) => void;
  onSaveTransactionData?: (data: any) => void;
  onChangeBrand?: (brand: string) => void;
  onDetectBrand?: (brands: string[], activeBrand: string, cardClassParameter: string) => void;
  onLoadThreeDIframe?: () => void;

  // --- Callbacks de Interacción de UI ---
  onBlurCardNumber?: (isValid: boolean) => void;
  onBlurSecurityCode?: (isValid: boolean) => void;
  onBlurCardHolder?: (isValid: boolean) => void;
  onBlurExpiryDate?: (isValid: boolean) => void;
  onReadyIframeCommunication?: (data: { $iframe: any }) => void;
  onFocusIframeCommunication?: (data: { $iframe: any }) => void;
  onBlurIframeCommunication?: (data: { $iframe: any }) => void;

  // --- Configuración de Tarjetas ---
  requireCvv?: boolean;
  allowEmptyCvv?: boolean;
  maskCvv?: boolean;
  showCVVHint?: boolean;
  allowEmptyCardHolderName?: boolean;
  brandDetection?: boolean;
  brandDetectionType?: 'regex' | 'bin';
  brandDetectionPriority?: string[]; // Ej: ["VISA", "MASTER"]
  disableCardExpiryDateValidation?: boolean;

  // --- Registros (One-Click / Tokenización) ---
  registrations?: {
    requireCvv?: boolean;
    hideInitialPaymentForms?: boolean;
  };
  showOneClickWidget?: boolean;
  hideOtherPaymentButton?: boolean;

  // --- Personalización de Textos (I18n) ---
  labels?: {
    accountBank?: string;
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    brand?: string;
    cancel?: string;
    cardHolder?: string;
    cardNumber?: string;
    country?: string;
    pin?: string;
    cvv?: string;
    expiryDate?: string;
    submit?: string;
    applyNow?: string;
    nextStep?: string;
    givenName?: string;
    surname?: string;
    learnMore?: string;
    mmyy?: string;
    ddmmyyyy?: string;
    register?: string;
    billingAddress?: string;
    showOtherPaymentMethods?: string;
    cvvHelp?: string;
    cvvHint?: string;
    cvvHintAmex?: string;
    cvvHintMaestro?: string;
  };

  errorMessages?: {
    pinError?: string;
    pinEmptyError?: string;
    accountBankError?: string;
    accountHolderError?: string;
    accountNumberError?: string;
    cardHolderError?: string;
    cardNumberError?: string;
    cardBinError?: string;
    cvvError?: string;
    expiryMonthError?: string;
    expiryYearError?: string;
  }

  // --- UI ---
  spinner?: {
    lines?: number;
    length?: number;
    width?: number;
    radius?: number;
    scale?: number;
    corners?: number;
    speed?: number;
    rotate?: number;
    animation?: string;
    direction?: number;
    color?: string;
    fadeColor?: string | string[], // CSS color or array of colors
    top?: string;
    left?: string;
    shadow?: string;
    zIndex?: number;
    className?: string;
    position?: string;
  };

  iframeStyles?: {
    'card-number-placeholder'?: Record<string, string>;
    'cvv-placeholder'?: Record<string, string>;
  };
}

export type MessageStatus = 'success' | 'error' | 'ping';
export interface Message {
  status: MessageStatus;
  data: Record<string, any>;
  origin: string;
}
