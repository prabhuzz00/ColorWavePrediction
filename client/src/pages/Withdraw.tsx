import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Banknote, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export default function Withdraw() {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    amount: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const minWithdrawAmount = 500;
  const maxWithdrawAmount = user?.balance || 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to withdraw',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    
    if (amount < minWithdrawAmount) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum withdrawal amount is ₹${minWithdrawAmount}`,
        variant: 'destructive',
      });
      return;
    }

    if (amount > maxWithdrawAmount) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough balance for this withdrawal',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.accountNumber || !formData.ifscCode || !formData.accountHolder) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill all bank details',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.withdraw({
        username: user.username,
        amount,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        accountHolder: formData.accountHolder,
      });

      if (response.error) {
        toast({
          title: 'Withdrawal Failed',
          description: response.message,
          variant: 'destructive',
        });
      } else {
        // Update local balance
        updateBalance((user.balance || 0) - amount);
        
        toast({
          title: 'Withdrawal Submitted',
          description: 'Your withdrawal request has been submitted successfully. It will be processed within 24-48 hours.',
        });
        
        // Reset form
        setFormData({
          amount: '',
          accountNumber: '',
          ifscCode: '',
          accountHolder: '',
        });
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Failed to submit withdrawal request. Please try again.',
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
          <h1 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h1>
          <p className="text-gray-400">Transfer your winnings to your bank account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Withdrawal Form */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Banknote className="w-5 h-5 mr-2" />
                Withdrawal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Balance Info */}
              <div className="p-4 bg-dark-bg rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-2xl font-bold text-white">
                    ₹{user?.balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Min: ₹{minWithdrawAmount} | Max: ₹{maxWithdrawAmount.toFixed(2)}
                </div>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                {/* Amount */}
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-white">
                    Withdrawal Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    required
                    min={minWithdrawAmount}
                    max={maxWithdrawAmount}
                    placeholder={`Enter amount (min ₹${minWithdrawAmount})`}
                    className="bg-dark-bg border-dark-border text-white mt-2"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>

                {/* Account Number */}
                <div>
                  <Label htmlFor="accountNumber" className="text-sm font-medium text-white">
                    Bank Account Number *
                  </Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    required
                    placeholder="Enter account number"
                    className="bg-dark-bg border-dark-border text-white mt-2"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <Label htmlFor="ifscCode" className="text-sm font-medium text-white">
                    IFSC Code *
                  </Label>
                  <Input
                    id="ifscCode"
                    type="text"
                    required
                    placeholder="Enter IFSC code"
                    className="bg-dark-bg border-dark-border text-white mt-2"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <Label htmlFor="accountHolder" className="text-sm font-medium text-white">
                    Account Holder Name *
                  </Label>
                  <Input
                    id="accountHolder"
                    type="text"
                    required
                    placeholder="Enter full name as per bank records"
                    className="bg-dark-bg border-dark-border text-white mt-2"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-bear-red hover:bg-red-600 text-white py-3"
                  disabled={isProcessing || !formData.amount || parseFloat(formData.amount) < minWithdrawAmount}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      Withdraw ₹{formData.amount || '0'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions & Info */}
          <div className="space-y-6">
            {/* Processing Info */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Withdrawal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-dark-bg rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Processing Time</h4>
                    <p className="text-gray-400 text-sm">
                      Withdrawals are processed within 24-48 hours on working days
                    </p>
                  </div>
                  
                  <div className="p-3 bg-dark-bg rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Bank Transfer</h4>
                    <p className="text-gray-400 text-sm">
                      Funds will be transferred directly to your bank account via NEFT/IMPS
                    </p>
                  </div>
                  
                  <div className="p-3 bg-dark-bg rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Verification</h4>
                    <p className="text-gray-400 text-sm">
                      Bank details are verified for security. First withdrawal may take longer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Minimum withdrawal amount is ₹{minWithdrawAmount}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Ensure bank details are correct to avoid delays
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    No charges for withdrawals above ₹1000
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Contact support if amount not received within 48 hours
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Account holder name must match your registered name
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
