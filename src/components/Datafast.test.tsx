// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Datafast } from './Datafast.js';

const baseProps = {
  scriptUrl: 'https://example.com/paymentWidgets.js',
  callbackUrl: 'https://example.com/callback',
};

describe('Datafast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders header and form with callback action', () => {
    const { getByText, container } = render(
      <Datafast
        {...baseProps}
        title="Pago seguro"
        description="Ingresa tu tarjeta"
      />,
    );

    expect(getByText('Pago seguro')).toBeTruthy();
    expect(getByText('Ingresa tu tarjeta')).toBeTruthy();

    const form = container.querySelector('form.paymentWidgets');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('action')).toBe(baseProps.callbackUrl);
    expect(form?.getAttribute('data-brands')).toBe('VISA MASTER AMEX');
  });

  it('sets wpwlOptions and manages script tag lifecycle', () => {
    const { unmount } = render(
      <Datafast
        {...baseProps}
        config={{
          locale: 'en',
          showCVVHint: false,
          labels: { cardNumber: 'Card number' },
        }}
      />,
    );

    const options = (window as any).wpwlOptions;
    expect(options).toBeTruthy();
    expect(options.locale).toBe('en');
    expect(options.showCVVHint).toBe(false);
    expect(options.labels).toEqual({ cardNumber: 'Card number' });
    expect(options.shopperResultUrl).toBe(baseProps.callbackUrl);

    const script = document.querySelector(
      `script[src="${baseProps.scriptUrl}"]`,
    );
    expect(script).not.toBeNull();

    unmount();

    const removedScript = document.querySelector(
      `script[src="${baseProps.scriptUrl}"]`,
    );
    expect(removedScript).toBeNull();
  });

  it('renders iframe and amount summary when inline', () => {
    const { container, getByText } = render(
      <Datafast {...baseProps} type="inline" amount={12.5} />,
    );

    expect(container.querySelector('iframe#wp_iframe_response')).not.toBeNull();
    expect(getByText('Total a pagar')).toBeTruthy();
    expect(getByText('$12.50')).toBeTruthy();
  });
});
