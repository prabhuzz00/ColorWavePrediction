import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Wallet, ArrowRight } from 'lucide-react';

export default function Recharge() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [utr, setUtr] = useState<string>('');
  const [upi, setUpi] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const rechargeAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const paymentMethods = [
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'paytm', label: 'Paytm', icon: Wallet },
    { value: 'phonepe', label: 'PhonePe', icon: Smartphone },
    { value: 'gpay', label: 'Google Pay', icon: Smartphone },
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    setSelectedAmount(isNaN(numValue) ? 0 : numValue);
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to recharge',
        variant: 'destructive',
      });
      return;
    }

    if (selectedAmount < 100) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum recharge amount is ₹100',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: 'Payment Method Required',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return;
    }

    if (!utr) {
      toast({
        title: 'UTR Required',
        description: 'Please enter the UTR/Transaction ID',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.recharge({
        username: user.username,
        amount: selectedAmount,
        upi: upi || paymentMethod,
        utr,
      });

      if (response.error) {
        toast({
          title: 'Recharge Failed',
          description: response.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Recharge Submitted',
          description: 'Your recharge request has been submitted successfully. It will be processed within 5-10 minutes.',
        });
        
        // Reset form
        setSelectedAmount(0);
        setCustomAmount('');
        setPaymentMethod('');
        setUtr('');
        setUpi('');
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Failed to submit recharge request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg mobile-padding">
      <Navigation />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Recharge Wallet</h1>
          <p className="text-gray-400">Add funds to your trading wallet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recharge Form */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Add Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecharge} className="space-y-6">
                {/* Amount Selection */}
                <div>
                  <Label className="text-sm font-medium text-white mb-3 block">
                    Select Amount
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {rechargeAmounts.map(amount => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedAmount === amount ? "default" : "outline"}
                        className={`transition-colors ${
                          selectedAmount === amount 
                            ? 'bg-accent-blue hover:bg-blue-600 text-white' 
                            : 'bg-dark-bg hover:bg-gray-600 border-dark-border text-white'
                        }`}
                        onClick={() => handleAmountSelect(amount)}
                      >
                        ₹{amount >= 1000 ? `${amount / 1000}K` : amount}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    className="bg-dark-bg border-dark-border text-white"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="text-sm font-medium text-white mb-3 block">
                    Payment Method
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-dark-bg border-dark-border text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-border">
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value} className="text-white">
                          <div className="flex items-center">
                            <method.icon className="w-4 h-4 mr-2" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* UPI ID (optional) */}
                <div>
                  <Label htmlFor="upi" className="text-sm font-medium text-white">
                    UPI ID (Optional)
                  </Label>
                  <Input
                    id="upi"
                    type="text"
                    placeholder="yourname@upi"
                    className="bg-dark-bg border-dark-border text-white mt-2"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                  />
                </div>

                {/* UTR/Transaction ID */}
                <div>
                  <Label htmlFor="utr" className="text-sm font-medium text-white">
                    UTR/Transaction ID *
                  </Label>
                  <Input
                    id="utr"
                    type="text"
                    required
                    placeholder="Enter UTR or Transaction ID"
                    className="bg-dark-bg border-dark-border text-white mt-2"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the UTR/Transaction ID from your payment app
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-bull-green hover:bg-green-600 text-white py-3"
                  disabled={isProcessing || selectedAmount < 100}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      Recharge ₹{selectedAmount}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-dark-bg rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Step 1: Make Payment</h4>
                  <p className="text-gray-400 text-sm">
                    Use any UPI app to make payment to our UPI ID: <span className="text-accent-blue">fastparity@upi</span>
                  </p>
                </div>
                
                <div className="p-3 bg-dark-bg rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Step 2: Get UTR</h4>
                  <p className="text-gray-400 text-sm">
                    After successful payment, copy the UTR/Transaction ID from your payment app
                  </p>
                </div>
                
                <div className="p-3 bg-dark-bg rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Step 3: Submit Details</h4>
                  <p className="text-gray-400 text-sm">
                    Fill this form with the amount and UTR to complete the recharge
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-2">Important Notes:</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• Minimum recharge: ₹100</li>
                  <li>• Processing time: 5-10 minutes</li>
                  <li>• Double-check UTR before submission</li>
                  <li>• Contact support if amount not credited within 30 minutes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
