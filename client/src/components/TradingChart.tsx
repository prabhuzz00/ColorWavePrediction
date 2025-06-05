import { useEffect, useRef, useState } from 'react';
import { ChartDataPoint, GameResult } from '@/lib/types';
import { useWebSocket } from '@/hooks/useWebSocket';

interface TradingChartProps {
  gameType?: string;
}

export default function TradingChart({ gameType = 'FastParity' }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(1247.83);
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  // Initialize chart with sample data
  useEffect(() => {
    const initialData: ChartDataPoint[] = [];
    const basePrice = 1200;
    const now = Date.now();
    
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now - i * 60000);
      const open = basePrice + (Math.random() - 0.5) * 100;
      const close = open + (Math.random() - 0.5) * 50;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      
      initialData.push({
        period: Math.floor(timestamp.getTime() / 60000),
        timestamp: timestamp.toISOString(),
        open,
        high,
        low,
        close
      });
    }
    
    setChartData(initialData);
    setLastPrice(initialData[initialData.length - 1]?.close || 1247.83);
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'priceUpdate') {
      const newData = lastMessage.data;
      
      setChartData(prev => {
        // Check if this period already exists to avoid duplicates
        const existingIndex = prev.findIndex(item => item.period === newData.period);
        if (existingIndex >= 0) {
          // Update existing candle with real-time data
          const updated = [...prev];
          updated[existingIndex] = {
            period: newData.period,
            timestamp: newData.timestamp,
            open: newData.open,
            high: newData.high,
            low: newData.low,
            close: newData.close
          };
          return updated;
        } else {
          // Add new candle
          const newCandle = {
            period: newData.period,
            timestamp: newData.timestamp,
            open: newData.open,
            high: newData.high,
            low: newData.low,
            close: newData.close
          };
          const updated = [...prev, newCandle];
          return updated.slice(-20); // Keep only last 20 candles
        }
      });
      
      setLastPrice(newData.close);
    }
    
    if (lastMessage?.type === 'candleComplete') {
      const completedCandle = lastMessage.data;
      setChartData(prev => {
        const existingIndex = prev.findIndex(item => item.period === completedCandle.period);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = completedCandle;
          return updated;
        }
        return prev;
      });
    }
    
    if (lastMessage?.type === 'gameResult') {
      const resultData = lastMessage.data;
      setRecentResults(prev => {
        const updated = [resultData, ...prev];
        return updated.slice(0, 10); // Keep only last 10 results
      });
    }
  }, [lastMessage]);

  // Draw candlestick chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, width, height);

    // Calculate chart dimensions
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find price range
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw grid lines
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#B0B0B0';
      ctx.font = '12px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('₹' + price.toFixed(0), padding - 10, y + 4);
    }

    // Vertical grid lines
    const candleWidth = chartWidth / chartData.length;
    for (let i = 0; i < chartData.length; i += 4) {
      const x = padding + candleWidth * i + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw candlesticks
    chartData.forEach((candle, index) => {
      const x = padding + candleWidth * index;
      const centerX = x + candleWidth / 2;
      
      // Calculate y positions
      const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight;
      const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight;
      
      const isBullish = candle.close > candle.open;
      const color = isBullish ? '#00E676' : '#FF5252';
      
      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, highY);
      ctx.lineTo(centerX, lowY);
      ctx.stroke();
      
      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      const bodyWidth = candleWidth * 0.6;
      
      ctx.fillStyle = color;
      ctx.fillRect(centerX - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight || 1);
    });

    // Draw current price line
    if (chartData.length > 0) {
      const currentY = padding + ((maxPrice - lastPrice) / priceRange) * chartHeight;
      
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(width - padding, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(width - padding + 5, currentY - 10, 80, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('₹' + lastPrice.toFixed(2), width - padding + 45, currentY + 4);
    }

  }, [chartData, lastPrice]);

  return (
    <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">FastParity Chart</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Interval:</span>
          <span className="bg-accent-blue px-2 py-1 rounded text-xs font-medium text-white">1m</span>
        </div>
      </div>
      
      {/* Chart Canvas */}
      <div className="relative h-96 w-full chart-container rounded-lg">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Chart Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-chart-green rounded-sm"></div>
            <span className="text-sm text-white">Bull Candle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-chart-red rounded-sm"></div>
            <span className="text-sm text-white">Bear Candle</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          Last Price: <span className="text-white font-semibold">₹{lastPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
