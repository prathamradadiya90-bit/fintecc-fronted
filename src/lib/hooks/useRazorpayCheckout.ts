import { useCallback } from 'react';

// Declare Razorpay on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Options for initiating a Razorpay Subscription checkout.
 * Backend now uses Razorpay Subscriptions (not Orders).
 */
export interface RazorpaySubscriptionOptions {
  /** Razorpay Subscription ID (sub_xxx) from the backend */
  subscriptionId: string;
  /** Razorpay API key returned by the backend */
  key: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface RazorpaySubscriptionSuccessResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
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

  /**
   * Opens the Razorpay checkout for a subscription.
   * In test/mock mode (subscriptionId starts with "mock_"), renders a simulated
   * payment modal so the flow can be tested without a real Razorpay account.
   */
  const initiateCheckout = useCallback(
    async (options: RazorpaySubscriptionOptions): Promise<RazorpaySubscriptionSuccessResponse> => {
      return new Promise(async (resolve, reject) => {
        // Mock mode: triggered when backend isn't connected to a real Razorpay account
        if (options.subscriptionId.startsWith('mock_') || options.subscriptionId.startsWith('sub_mock')) {
          const overlay = document.createElement('div');
          overlay.style.cssText =
            'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:99999;display:flex;justify-content:center;align-items:center;';

          const modal = document.createElement('div');
          modal.style.cssText =
            'background:#fff;padding:30px;border-radius:12px;width:420px;box-shadow:0 8px 32px rgba(0,0,0,0.25);text-align:center;font-family:sans-serif;';

          modal.innerHTML = `
            <div style="background:#00C2B3;color:white;padding:16px;border-radius:8px 8px 0 0;margin:-30px -30px 20px -30px;font-weight:bold;font-size:16px;">
              Mock Payment Gateway (Test Mode)
            </div>
            <h2 style="margin:0 0 8px 0;color:#333;font-size:18px;">${options.name || 'Fintecc'}</h2>
            <p style="color:#666;margin-bottom:8px;font-size:14px;">${options.description || 'Subscription Payment'}</p>
            <p style="color:#999;margin-bottom:24px;font-size:12px;">Subscription: ${options.subscriptionId}</p>
          `;

          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = 'display:flex;justify-content:space-between;gap:12px;';

          const cancelBtn = document.createElement('button');
          cancelBtn.innerText = 'Cancel';
          cancelBtn.style.cssText =
            'flex:1;padding:12px;border:1px solid #ccc;background:#f9f9f9;border-radius:8px;cursor:pointer;color:#333;font-size:14px;';
          cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            reject(new Error('Payment cancelled by user.'));
          };

          const payBtn = document.createElement('button');
          payBtn.innerText = 'Pay Now (Success)';
          payBtn.style.cssText =
            'flex:1;padding:12px;border:none;background:#00C2B3;color:white;border-radius:8px;cursor:pointer;font-weight:bold;font-size:14px;';
          payBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve({
              razorpay_subscription_id: options.subscriptionId,
              razorpay_payment_id: 'pay_mock_' + Date.now(),
              razorpay_signature: 'mock_signature',
            });
          };

          buttonContainer.appendChild(cancelBtn);
          buttonContainer.appendChild(payBtn);
          modal.appendChild(buttonContainer);
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          return;
        }

        const isLoaded = await loadRazorpayScript();

        if (!isLoaded) {
          reject(new Error('Razorpay SDK failed to load. Are you online?'));
          return;
        }

        const razorpayOptions = {
          key: options.key,
          subscription_id: options.subscriptionId,
          name: options.name || 'Fintecc',
          description: options.description || 'Subscription Payment',
          handler: function (response: RazorpaySubscriptionSuccessResponse) {
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

        const paymentObject = new window.Razorpay(razorpayOptions);
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
