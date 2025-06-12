import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Plus, Minus } from 'lucide-react';
import { PeriodInfo, Bet } from '@/lib/types';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function BettingPanel() {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const { lastMessage } = useWebSocket('/ws', user?.username);
  
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  
  const [periodInfo, setPeriodInfo] = useState<PeriodInfo>({
    current: Math.floor(Date.now() / 120000),
    next: Math.floor(Date.now() / 120000) + 1,
    countdown: 120,
    bettingActive: true
  });

  const betAmounts = [10, 50, 100, 500, 1000, 5000];

  // Period countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPeriodInfo(prev => {
        let newCountdown = prev.countdown - 1;

        if (newCountdown <= 0) {
          newCountdown = 120;
          return {
            current: prev.next,
            next: prev.next + 1,
            countdown: newCountdown,
            bettingActive: true
          };
        }

        return {
          ...prev,
          countdown: newCountdown,
          bettingActive: newCountdown > 60 // close betting after 1 minute
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'priceUpdate') {
      const newData = lastMessage.data;
      setPeriodInfo({
        current: newData.period,
        next: newData.period + 1,
        countdown: newData.countdown || 120,
        bettingActive: newData.bettingActive !== false
      });
    }
    
    if (lastMessage?.type === 'newPeriod') {
      const newData = lastMessage.data;
      setPeriodInfo({
        current: newData.period,
        next: newData.period + 1,
        countdown: newData.countdown,
        bettingActive: newData.bettingActive
      });
    }
    
    if (lastMessage?.type === 'bettingClosed') {
      setPeriodInfo(prev => ({
        ...prev,
        bettingActive: false
      }));
    }
    
    if (lastMessage?.type === 'gameResult') {
      // Refresh user balance and betting history when game result is announced
      if (user) {
        // Trigger a refetch of user bets
        setTimeout(() => {
          window.location.reload(); // Simple way to refresh data
        }, 2000);
      }
    }
  }, [lastMessage, user]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    setSelectedAmount(isNaN(numValue) ? 0 : numValue);
  };

  const handlePlaceBet = async (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to place bets',
        variant: 'destructive',
      });
      return;
    }

    if (!periodInfo.bettingActive) {
      toast({
        title: 'Betting Closed',
        description: 'Betting is closed for this period',
        variant: 'destructive',
      });
      return;
    }

    if (selectedAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please select a bet amount',
        variant: 'destructive',
      });
      return;
    }

    if (selectedAmount > (user.balance || 0)) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough balance to place this bet',
        variant: 'destructive',
      });
      return;
    }

    setIsPlacingBet(true);
    
    try {
      const response = await api.placeBet({
        username: user.username,
        period: periodInfo.current,
        amount: selectedAmount,
        direction,
        gameType: 'FastParity'
      });

      if (response.error) {
        toast({
          title: 'Bet Failed',
          description: response.message,
          variant: 'destructive',
        });
      } else {
        // Update local balance
        updateBalance((user.balance || 0) - selectedAmount);
        
        // Add to current bets
        setCurrentBets(prev => [...prev, {
          ...response.bet,
          direction,
          potential: selectedAmount * 1.92
        }]);

        toast({
          title: 'Bet Placed',
          description: `Successfully placed ₹${selectedAmount} on ${direction.toUpperCase()}`,
        });

        // Reset amount selection
        setSelectedAmount(0);
        setCustomAmount('');
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Failed to place bet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Period Info */}
      <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Current Period</h2>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-accent-blue">
                {periodInfo.current}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-mono text-white">
                  {formatCountdown(periodInfo.countdown)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Next Period</div>
            <div className="text-lg font-semibold text-white">
              {periodInfo.next}
            </div>
          </div>
        </div>
        
        {/* Betting Status */}
        <div className="flex items-center justify-center">
          {periodInfo.bettingActive ? (
            <div className="bg-bull-green px-4 py-2 rounded-full text-sm font-semibold text-white">
              <ArrowUp className="w-4 h-4 inline mr-2" />
              Betting Active
            </div>
          ) : (
            <div className="bg-bear-red px-4 py-2 rounded-full text-sm font-semibold text-white">
              <Minus className="w-4 h-4 inline mr-2" />
              Betting Closed
            </div>
          )}
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-3">Wallet</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Balance:</span>
            <span className="font-semibold text-lg text-white">
              ₹{user?.balance?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Bonus:</span>
            <span className="text-yellow-400 font-semibold">
              ₹{user?.bonus?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Betting Interface */}
      <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-3">Place Bet</h3>
        
        {/* Amount Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Bet Amount</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {betAmounts.map(amount => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                size="sm"
                className={`text-sm transition-colors ${
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
            placeholder="Custom amount"
            className="bg-dark-bg border-dark-border text-white"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
          />
        </div>

        {/* Direction Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            className="bg-bull-green hover:bg-green-600 text-white font-semibold py-6 bet-button"
            onClick={() => handlePlaceBet('up')}
            disabled={!periodInfo.bettingActive || isPlacingBet || selectedAmount <= 0}
          >
            <ArrowUp className="w-5 h-5 mr-2" />
            <div>
              <div>UP</div>
              <div className="text-xs opacity-80 mt-1">Win: 1.92x</div>
            </div>
          </Button>
          <Button
            className="bg-bear-red hover:bg-red-600 text-white font-semibold py-6 bet-button"
            onClick={() => handlePlaceBet('down')}
            disabled={!periodInfo.bettingActive || isPlacingBet || selectedAmount <= 0}
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            <div>
              <div>DOWN</div>
              <div className="text-xs opacity-80 mt-1">Win: 1.92x</div>
            </div>
          </Button>
        </div>

        {/* Current Bets */}
        {currentBets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-400">Current Period Bets</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentBets.map((bet, index) => (
                <div key={index} className="bg-dark-bg p-2 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className={bet.ans === 'green' ? 'text-bull-green' : 'text-bear-red'}>
                      {bet.ans === 'green' ? 'UP' : 'DOWN'}
                    </span>
                    <span className="font-semibold text-white">₹{bet.amount}</span>
                  </div>
                  <div className="text-gray-400 mt-1">
                    Potential: ₹{(bet.amount * 1.92).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
