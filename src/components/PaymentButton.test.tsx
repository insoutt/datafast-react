// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { PaymentButton } from './PaymentButton.js';
import { getScriptUrl } from '../utils/helpers.js';

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}));

vi.mock('../utils/helpers.js', async () => {
  const actual = await vi.importActual<typeof import('../utils/helpers.js')>(
    '../utils/helpers.js',
  );
  return { ...actual, getScriptUrl: vi.fn() };
});

const checkoutData = {
  customer: {
    givenName: 'Jane',
    surname: 'Doe',
    email: 'jane@example.com',
    phone: '555-0000',
    identificationDocId: '0102030405',
  },
  cart: {
    items: [
      {
        name: 'Plan Pro',
        description: 'Monthly subscription',
        val_base0: 0,
        val_baseimp: 10,
        val_iva: 1.2,
        quantity: 1,
      },
    ],
  },
};

describe('PaymentButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it('posts checkout data and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const response = { data: { data: { id: 'checkout_123' } } };

    vi.mocked(axios.post).mockResolvedValueOnce(response as any);
    vi.mocked(getScriptUrl).mockReturnValueOnce(
      'https://example.com/paymentWidgets.js?checkoutId=checkout_123',
    );

    const { getByRole } = render(
      <PaymentButton
        url="https://api.example.com/checkout"
        checkoutData={checkoutData}
        onSuccess={onSuccess}
        onError={onError}
      />,
    );

    fireEvent.click(getByRole('button', { name: /pagar con tarjeta/i }));

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.example.com/checkout',
      checkoutData,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        checkoutId: 'checkout_123',
      });
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('shows a spinner while the request is pending', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    let resolvePost: ((value: unknown) => void) | undefined;

    const pendingPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });

    vi.mocked(axios.post).mockReturnValueOnce(pendingPromise as Promise<any>);

    const { container, getByRole } = render(
      <PaymentButton
        url="https://api.example.com/checkout"
        checkoutData={checkoutData}
        onSuccess={onSuccess}
        onError={onError}
      />,
    );

    fireEvent.click(getByRole('button', { name: /pagar con tarjeta/i }));

    expect(container.querySelector('svg.df-animate-spin')).not.toBeNull();

    resolvePost?.({ data: { data: { id: 'checkout_456' } } });

    await waitFor(() => {
      expect(container.querySelector('svg.df-animate-spin')).toBeNull();
    });
  });

  it('calls onError when the request fails', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const error = new Error('Network failure');

    vi.mocked(axios.post).mockRejectedValueOnce(error);

    const { getByRole } = render(
      <PaymentButton
        url="https://api.example.com/checkout"
        checkoutData={checkoutData}
        onSuccess={onSuccess}
        onError={onError}
      />,
    );

    fireEvent.click(getByRole('button', { name: /pagar con tarjeta/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
