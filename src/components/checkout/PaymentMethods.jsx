import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createPayment } from '../../utils/api';

export default function PaymentMethods({ orderId, amount, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (data) => {
      if (data.bkashURL) {
        window.open(data.bkashURL, '_blank');
      } else if (data.callBackUrl) {
        window.open(data.callBackUrl, '_blank');
      }
      onPaymentSuccess(data);
    }
  });

  const handlePayment = async () => {
    if (selectedMethod === 'cod') {
      onPaymentSuccess({ method: 'cod' });
      return;
    }

    setIsProcessing(true);
    try {
      await paymentMutation.mutateAsync({
        method: selectedMethod,
        orderId,
        amount
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment Method</h3>
      
      <div className="space-y-3">
        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-background">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={selectedMethod === 'cod'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium">Cash on Delivery</div>
            <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
          </div>
          <div className="text-2xl">💵</div>
        </label>

        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-background">
          <input
            type="radio"
            name="payment"
            value="bkash"
            checked={selectedMethod === 'bkash'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium">bKash</div>
            <div className="text-sm text-muted-foreground">Pay securely with bKash mobile banking</div>
          </div>
          <div className="w-12 h-8 bg-pink-600 rounded flex items-center justify-center text-background text-xs font-bold">
            bKash
          </div>
        </label>

        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-background">
          <input
            type="radio"
            name="payment"
            value="nagad"
            checked={selectedMethod === 'nagad'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium">Nagad</div>
            <div className="text-sm text-muted-foreground">Pay with Nagad digital wallet</div>
          </div>
          <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center text-background text-xs font-bold">
            Nagad
          </div>
        </label>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full btn-primary"
      >
        {isProcessing ? 'Processing...' : 
         selectedMethod === 'cod' ? 'Place Order' : 
         `Pay ৳${amount} with ${selectedMethod.toUpperCase()}`}
      </button>
    </div>
  );
}