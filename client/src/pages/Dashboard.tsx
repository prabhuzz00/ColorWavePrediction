import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TradingChart from '@/components/TradingChart';
import BettingPanel from '@/components/BettingPanel';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { GameResult } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Fetch recent game results
  const { data: gameResults = [] } = useQuery<GameResult[]>({
    queryKey: ['/api/game/results'],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatPeriodNumber = (period: number): string => {
    return period.toString().slice(-4);
  };

  const getResultColor = (result: GameResult): string => {
    // Only red and green results (no violet)
    return result.ans % 2 === 0 ? 'bg-chart-red' : 'bg-chart-green';
  };

  return (
    <div className="min-h-screen bg-dark-bg mobile-padding">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trading Chart Section */}
        <div className="lg:col-span-3">
          <TradingChart gameType="FastParity" />

          {/* Recent Results */}
          <div className="bg-dark-card rounded-lg p-4 mt-4 border border-dark-border">
            <h3 className="text-lg font-semibold text-white mb-3">Recent Results</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {gameResults.slice(0, 10).map((result: GameResult) => (
                <div key={result.id} className="flex flex-col items-center p-2 bg-dark-bg rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    {formatPeriodNumber(result.period)}
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${getResultColor(result)}`}>
                    {result.ans}
                  </div>
                </div>
              ))}
              
              {/* Show loading placeholders if no results */}
              {gameResults.length === 0 && Array.from({ length: 10 }, (_, i) => (
                <div key={`placeholder-${i}`} className="flex flex-col items-center p-2 bg-dark-bg rounded-lg animate-pulse">
                  <div className="text-xs text-gray-400 mb-1">****</div>
                  <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Betting Panel */}
        <BettingPanel />
      </div>
    </div>
  );
}
