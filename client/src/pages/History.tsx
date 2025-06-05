import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History as HistoryIcon, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Bet, Transaction, Recharge, Withdrawal } from '@/lib/types';

export default function History() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('betting');

  // Fetch betting history
  const {
    data: bettingHistory = [],
    isLoading: bettingLoading,
  } = useQuery<Bet[]>({
    queryKey: ['/api/bets', user?.username],
    enabled: !!user && activeTab === 'betting',
  });

  // Fetch recharge history
  const {
    data: rechargeHistory = [],
    isLoading: rechargeLoading,
  } = useQuery<Recharge[]>({
    queryKey: ['/api/recharge/history', user?.username],
    enabled: !!user && activeTab === 'recharge',
  });

  // Fetch withdrawal history
  const {
    data: withdrawalHistory = [],
    isLoading: withdrawalLoading,
  } = useQuery<Withdrawal[]>({
    queryKey: ['/api/withdraw/history', user?.username],
    enabled: !!user && activeTab === 'withdrawal',
  });

  // Fetch transaction history
  const {
    data: transactionHistory = [],
    isLoading: transactionLoading,
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', user?.username],
    enabled: !!user && activeTab === 'transactions',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPeriod = (period: number) => {
    return period.toString().slice(-6);
  };

  const getBetStatusBadge = (bet: Bet) => {
    if (bet.status === 'pending') {
      return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Pending</Badge>;
    }
    if (bet.result === 'success') {
      return <Badge variant="outline" className="bg-bull-green/20 text-bull-green border-bull-green/30">Win</Badge>;
    }
    return <Badge variant="outline" className="bg-bear-red/20 text-bear-red border-bear-red/30">Loss</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        variant: 'outline' as const, 
        className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: AlertCircle
      },
      'success': { 
        variant: 'outline' as const, 
        className: 'bg-bull-green/20 text-bull-green border-bull-green/30',
        icon: CheckCircle
      },
      'completed': { 
        variant: 'outline' as const, 
        className: 'bg-bull-green/20 text-bull-green border-bull-green/30',
        icon: CheckCircle
      },
      'failed': { 
        variant: 'outline' as const, 
        className: 'bg-bear-red/20 text-bear-red border-bear-red/30',
        icon: XCircle
      },
      'rejected': { 
        variant: 'outline' as const, 
        className: 'bg-bear-red/20 text-bear-red border-bear-red/30',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="bg-dark-bg p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32 bg-gray-600" />
            <Skeleton className="h-6 w-20 bg-gray-600" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24 bg-gray-600" />
            <Skeleton className="h-3 w-16 bg-gray-600" />
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="text-center py-12">
      <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg mobile-padding">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
            <HistoryIcon className="w-6 h-6 mr-2" />
            Transaction History
          </h1>
          <p className="text-gray-400">View all your trading and financial activities</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-dark-card border border-dark-border">
            <TabsTrigger 
              value="betting" 
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-white text-gray-400"
            >
              Betting
            </TabsTrigger>
            <TabsTrigger 
              value="recharge"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-white text-gray-400"
            >
              Recharge
            </TabsTrigger>
            <TabsTrigger 
              value="withdrawal"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-white text-gray-400"
            >
              Withdrawal
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-white text-gray-400"
            >
              All Transactions
            </TabsTrigger>
          </TabsList>

          {/* Betting History */}
          <TabsContent value="betting" className="mt-6">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Betting History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bettingLoading ? (
                  <LoadingSkeleton />
                ) : bettingHistory.length === 0 ? (
                  <EmptyState 
                    title="No Betting History"
                    description="You haven't placed any bets yet. Start trading to see your betting history here."
                  />
                ) : (
                  <div className="space-y-3">
                    {bettingHistory.map((bet: Bet) => (
                      <div key={bet.id} className="bg-dark-bg p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                              bet.number !== undefined ? (
                                bet.number % 2 === 0 ? 'bg-chart-red' : 'bg-chart-green'
                              ) : 'bg-gray-600'
                            }`}>
                              {bet.number !== undefined ? bet.number : '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                Period: {formatPeriod(bet.period)}
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatDate(bet.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              bet.result === 'success' ? 'text-bull-green' : 
                              bet.result === 'fail' ? 'text-bear-red' : 'text-gray-400'
                            }`}>
                              {bet.result === 'success' ? '+' : ''}₹{
                                bet.result === 'success' ? (bet.amount * 1.95).toFixed(2) : 
                                bet.result === 'fail' ? bet.amount.toFixed(2) : bet.amount.toFixed(2)
                              }
                            </div>
                            <div className="text-xs text-gray-400">
                              Bet: ₹{bet.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${
                                bet.ans === 'green' ? 'bg-bull-green/20 text-bull-green border-bull-green/30' : 
                                'bg-bear-red/20 text-bear-red border-bear-red/30'
                              }`}
                            >
                              {bet.ans === 'green' ? (
                                <>
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  UP
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  DOWN
                                </>
                              )}
                            </Badge>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{bet.gameType}</span>
                          </div>
                          {getBetStatusBadge(bet)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recharge History */}
          <TabsContent value="recharge" className="mt-6">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Recharge History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rechargeLoading ? (
                  <LoadingSkeleton />
                ) : rechargeHistory.length === 0 ? (
                  <EmptyState 
                    title="No Recharge History"
                    description="You haven't made any recharges yet. Add funds to your wallet to start trading."
                  />
                ) : (
                  <div className="space-y-3">
                    {rechargeHistory.map((recharge: Recharge) => (
                      <div key={recharge.id} className="bg-dark-bg p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">
                              {recharge.upi ? 'UPI Payment' : 'Bank Transfer'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatDate(recharge.createdAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-bull-green font-semibold">
                              +₹{recharge.amount.toFixed(2)}
                            </div>
                            {getStatusBadge(recharge.status)}
                          </div>
                        </div>
                        {recharge.utr && (
                          <div className="text-sm text-gray-400">
                            UTR: {recharge.utr}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal History */}
          <TabsContent value="withdrawal" className="mt-6">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  Withdrawal History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalLoading ? (
                  <LoadingSkeleton />
                ) : withdrawalHistory.length === 0 ? (
                  <EmptyState 
                    title="No Withdrawal History"
                    description="You haven't made any withdrawals yet. Win some trades and withdraw your profits."
                  />
                ) : (
                  <div className="space-y-3">
                    {withdrawalHistory.map((withdrawal: Withdrawal) => (
                      <div key={withdrawal.id} className="bg-dark-bg p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">Bank Transfer</div>
                            <div className="text-sm text-gray-400">
                              {formatDate(withdrawal.createdAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-bear-red font-semibold">
                              -₹{withdrawal.amount.toFixed(2)}
                            </div>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                        </div>
                        {withdrawal.accountNumber && (
                          <div className="text-sm text-gray-400">
                            Account: ***{withdrawal.accountNumber.slice(-4)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Transactions */}
          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  All Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionLoading ? (
                  <LoadingSkeleton />
                ) : transactionHistory.length === 0 ? (
                  <EmptyState 
                    title="No Transaction History"
                    description="You haven't made any transactions yet. Start trading to see your transaction history here."
                  />
                ) : (
                  <div className="space-y-3">
                    {transactionHistory.map((transaction: Transaction) => (
                      <div key={transaction.id} className="bg-dark-bg p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">
                              {transaction.reason}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatDate(transaction.createdAt)}
                            </div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.type === 'add' ? 'text-bull-green' : 'text-bear-red'
                          }`}>
                            {transaction.type === 'add' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
