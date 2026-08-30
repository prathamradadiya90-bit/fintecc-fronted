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
        if (options.orderId.startsWith('mock_')) {
          // Create a mock modal directly in the DOM
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100vw';
          overlay.style.height = '100vh';
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          overlay.style.zIndex = '99999';
          overlay.style.display = 'flex';
          overlay.style.justifyContent = 'center';
          overlay.style.alignItems = 'center';
          
          const modal = document.createElement('div');
          modal.style.backgroundColor = '#fff';
          modal.style.padding = '30px';
          modal.style.borderRadius = '10px';
          modal.style.width = '400px';
          modal.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          modal.style.textAlign = 'center';
          modal.style.fontFamily = 'sans-serif';
          
          modal.innerHTML = `
            <div style="background-color: #00C2B3; color: white; padding: 15px; border-radius: 5px 5px 0 0; margin: -30px -30px 20px -30px; font-weight: bold; font-size: 18px;">
              Mock Payment Gateway (Test Mode)
            </div>
            <h2 style="margin: 0 0 10px 0; color: #333;">${options.name || 'Fintecc'}</h2>
            <p style="color: #666; margin-bottom: 20px;">${options.description || 'Subscription Payment'}</p>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px; color: #111;">
              ₹${(options.amount / 100).toFixed(2)}
            </div>
          `;
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.display = 'flex';
          buttonContainer.style.justifyContent = 'space-between';
          buttonContainer.style.gap = '10px';
          
          const cancelBtn = document.createElement('button');
          cancelBtn.innerText = 'Cancel';
          cancelBtn.style.flex = '1';
          cancelBtn.style.padding = '12px';
          cancelBtn.style.border = '1px solid #ccc';
          cancelBtn.style.backgroundColor = '#f9f9f9';
          cancelBtn.style.borderRadius = '5px';
          cancelBtn.style.cursor = 'pointer';
          cancelBtn.style.color = '#333';
          cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            reject(new Error('Payment cancelled by user.'));
          };
          
          const payBtn = document.createElement('button');
          payBtn.innerText = 'Pay Now (Success)';
          payBtn.style.flex = '1';
          payBtn.style.padding = '12px';
          payBtn.style.border = 'none';
          payBtn.style.backgroundColor = '#00C2B3';
          payBtn.style.color = 'white';
          payBtn.style.borderRadius = '5px';
          payBtn.style.cursor = 'pointer';
          payBtn.style.fontWeight = 'bold';
          payBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve({
              razorpay_order_id: options.orderId,
              razorpay_payment_id: 'pay_mock_' + Date.now(),
              razorpay_signature: 'mock_signature'
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
