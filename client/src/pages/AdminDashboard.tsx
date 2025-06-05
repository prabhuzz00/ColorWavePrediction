import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';

interface GameMonitorData {
  period: number;
  countdown: number;
  bets: {
    red: { count: number; amount: number };
    green: { count: number; amount: number };
    total: { count: number; amount: number };
  };
  canManuallySetResult: boolean;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [gameData, setGameData] = useState<GameMonitorData | null>(null);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { lastMessage } = useWebSocket('/ws');

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      setLocation('/admin/login');
      return;
    }
    fetchData();
  }, [adminToken]);

  useEffect(() => {
    const interval = setInterval(fetchGameData, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchGameData(),
      fetchRecharges(),
      fetchWithdrawals()
    ]);
  };

  const fetchGameData = async () => {
    try {
      const response = await fetch('/api/admin/game-monitor', {
        headers: { admintoken: adminToken || '' }
      });
      const data = await response.json();
      setGameData(data);
    } catch (error) {
      console.error('Failed to fetch game data');
    }
  };

  const fetchRecharges = async () => {
    try {
      const response = await fetch('/api/admin/recharges', {
        headers: { admintoken: adminToken || '' }
      });
      const data = await response.json();
      setRecharges(data);
    } catch (error) {
      console.error('Failed to fetch recharges');
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        headers: { admintoken: adminToken || '' }
      });
      const data = await response.json();
      setWithdrawals(data);
    } catch (error) {
      console.error('Failed to fetch withdrawals');
    }
  };

  const updateRechargeStatus = async (id: number, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/recharges/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          admintoken: adminToken || ''
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Recharge ${status} successfully`,
        });
        fetchRecharges();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update recharge status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: number, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          admintoken: adminToken || ''
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Withdrawal ${status} successfully`,
        });
        fetchWithdrawals();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update withdrawal status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setGameResult = async (color: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/set-result', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          admintoken: adminToken || ''
        },
        body: JSON.stringify({ color })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Game result set to ${color}`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to set game result',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set game result',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="border-dark-border text-white">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="bg-dark-card border-dark-border">
            <TabsTrigger value="monitor" className="text-white">Live Game Monitor</TabsTrigger>
            <TabsTrigger value="recharges" className="text-white">Recharges</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-white">Withdrawals</TabsTrigger>
          </TabsList>

          {/* Live Game Monitor */}
          <TabsContent value="monitor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white">Current Period: {gameData?.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{gameData?.countdown}s</div>
                      <div className="text-gray-400">Time Remaining</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-chart-red/20 p-4 rounded-lg">
                        <div className="text-chart-red font-semibold">RED BETS</div>
                        <div className="text-white text-xl">₹{gameData?.bets.red.amount || 0}</div>
                        <div className="text-gray-400">{gameData?.bets.red.count || 0} bets</div>
                      </div>
                      <div className="bg-chart-green/20 p-4 rounded-lg">
                        <div className="text-chart-green font-semibold">GREEN BETS</div>
                        <div className="text-white text-xl">₹{gameData?.bets.green.amount || 0}</div>
                        <div className="text-gray-400">{gameData?.bets.green.count || 0} bets</div>
                      </div>
                    </div>

                    <div className="border-t border-dark-border pt-4">
                      <div className="text-gray-400">Total Volume</div>
                      <div className="text-white text-xl">₹{gameData?.bets.total.amount || 0}</div>
                      <div className="text-gray-400">{gameData?.bets.total.count || 0} total bets</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white">Manual Result Control</CardTitle>
                </CardHeader>
                <CardContent>
                  {gameData?.canManuallySetResult ? (
                    <div className="space-y-4">
                      <div className="text-gray-400 text-sm">
                        You can manually set the winning color for this period
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          onClick={() => setGameResult('red')}
                          className="bg-chart-red hover:bg-red-600 text-white"
                          disabled={loading}
                        >
                          Set RED Win
                        </Button>
                        <Button
                          onClick={() => setGameResult('green')}
                          className="bg-chart-green hover:bg-green-600 text-white"
                          disabled={loading}
                        >
                          Set GREEN Win
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400">
                        Result already calculated or less than 19 seconds remaining
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recharges */}
          <TabsContent value="recharges">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white">Recharge Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-dark-border">
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">UPI</TableHead>
                      <TableHead className="text-gray-400">UTR</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recharges.map((recharge) => (
                      <TableRow key={recharge.id} className="border-dark-border">
                        <TableCell className="text-white">{recharge.username}</TableCell>
                        <TableCell className="text-white">₹{recharge.amount}</TableCell>
                        <TableCell className="text-white">{recharge.upi}</TableCell>
                        <TableCell className="text-white">{recharge.utr}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={recharge.status === 'approved' ? 'default' : 
                                   recharge.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {recharge.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(recharge.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {recharge.status === 'pending' && (
                            <div className="space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updateRechargeStatus(recharge.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={loading}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateRechargeStatus(recharge.id, 'rejected')}
                                disabled={loading}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="withdrawals">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-dark-border">
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">Account</TableHead>
                      <TableHead className="text-gray-400">IFSC</TableHead>
                      <TableHead className="text-gray-400">Holder</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="border-dark-border">
                        <TableCell className="text-white">{withdrawal.username}</TableCell>
                        <TableCell className="text-white">₹{withdrawal.amount}</TableCell>
                        <TableCell className="text-white">{withdrawal.accountNumber}</TableCell>
                        <TableCell className="text-white">{withdrawal.ifscCode}</TableCell>
                        <TableCell className="text-white">{withdrawal.accountHolder}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={withdrawal.status === 'paid' ? 'default' : 
                                   withdrawal.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {withdrawal.status === 'pending' && (
                            <div className="space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updateWithdrawalStatus(withdrawal.id, 'paid')}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={loading}
                              >
                                Mark Paid
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                                disabled={loading}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}