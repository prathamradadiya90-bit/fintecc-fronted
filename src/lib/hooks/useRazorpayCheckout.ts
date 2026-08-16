import { useCallback } from 'react';

// Declare Razorpay on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  orderId: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function useRazorpayCheckout() {
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiateCheckout = useCallback(
    async (options: RazorpayOptions): Promise<RazorpaySuccessResponse> => {
      return new Promise(async (resolve, reject) => {
        const isLoaded = await loadRazorpayScript();
        
        if (!isLoaded) {
          reject(new Error('Razorpay SDK failed to load. Are you online?'));
          return;
        }

        const optionsForRazorpay = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: options.amount,
          currency: options.currency,
          name: options.name || 'Fintecc',
          description: options.description || 'Subscription Payment',
          order_id: options.orderId,
          handler: function (response: RazorpaySuccessResponse) {
            resolve(response);
          },
          prefill: options.prefill,
          theme: {
            color: '#00C2B3',
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled by user.'));
            },
          },
        };

        const paymentObject = new window.Razorpay(optionsForRazorpay);
        paymentObject.on('payment.failed', function (response: any) {
          reject(new Error(response.error.description || 'Payment failed.'));
        });
        paymentObject.open();
      });
    },
    [loadRazorpayScript]
  );

  return { initiateCheckout };
}
