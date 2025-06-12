import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertBetSchema, insertRechargeSchema, insertWithdrawalSchema } from "@shared/schema";
import crypto from "crypto";

interface WebSocketWithUser extends WebSocket {
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocketWithUser>();
  
  wss.on('connection', (ws: WebSocketWithUser) => {
    clients.add(ws);
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.username) {
          ws.username = message.username;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  // Broadcast to all connected clients
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Auth endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: true, message: 'Username and password required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: true, message: 'Invalid credentials' });
      }
      
      if (user.status) {
        return res.status(403).json({ error: true, message: 'Account blocked' });
      }
      
      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      await storage.updateUserToken(username, token);
      
      res.json({
        error: false,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          balance: user.balance,
          bonus: user.bonus,
          usercode: user.usercode
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: true, message: 'Internal server error' });
    }
  });
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: true, message: 'Username already exists' });
      }
      
      const user = await storage.createUser(validatedData);
      
      res.json({
        error: false,
        message: 'Registration successful',
        user: {
          id: user.id,
          username: user.username,
          usercode: user.usercode
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: true, message: 'Registration failed' });
    }
  });
  
  // Middleware to verify token
  async function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: true, message: 'Access token required' });
    }
    
    try {
      // Find user by token (simplified - in production use JWT)
      const users = await storage.getUserByUsername(req.body.username || req.query.username);
      if (!users || users.token !== token) {
        return res.status(403).json({ error: true, message: 'Invalid token' });
      }
      
      req.user = users;
      next();
    } catch (error) {
      return res.status(403).json({ error: true, message: 'Invalid token' });
    }
  }
  
  // Game info endpoint
  app.get('/api/game/info', async (req, res) => {
    try {
      const { user: username, per: gameType = 'FastParity' } = req.query;
      
      if (!username) {
        return res.status(400).json({ error: true, message: 'Username required' });
      }
      
      const user = await storage.getUserByUsername(username as string);
      if (!user) {
        return res.status(404).json({ error: true, message: 'User not found' });
      }
      
      const period = await storage.getCurrentPeriod(gameType as string);
      const currentPeriod = period?.period || Date.now();
      
      res.json([
        { balance: user.balance },
        { period: currentPeriod },
        { total1: 0 }, // Placeholder for bet count
        { rech: 0 }, // Placeholder for recharge count
        { trans: 0 } // Placeholder for transaction count
      ]);
    } catch (error) {
      console.error('Game info error:', error);
      res.status(500).json({ error: true, message: 'Failed to get game info' });
    }
  });
  
  // Place bet endpoint
  app.post('/api/game/bet', async (req, res) => {
    try {
      const { username, period, amount, direction, gameType = 'FastParity' } = req.body;
      
      if (!username || !period || !amount || !direction) {
        return res.status(400).json({ error: true, message: 'Missing required fields' });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: true, message: 'User not found' });
      }
      
        if ((user.balance ?? 0) < amount) {
          return res.status(400).json({ error: true, message: 'Insufficient balance' });
        }
      
      // Convert direction to answer format
      const ans = direction === 'up' ? 'green' : 'red';
      
      const bet = await storage.placeBet({
        username,
        period,
        amount,
        ans,
        gameType
      });
      
      // Update user balance
        await storage.updateUserBalance(username, (user.balance ?? 0) - amount);
      
      // Create transaction record
      await storage.createTransaction({
        username,
        reason: `${gameType} bet placed`,
        amount: -amount,
        type: 'subtract'
      });
      
      // Broadcast bet placed
      broadcast({
        type: 'betPlaced',
        bet: {
          username,
          amount,
          direction,
          period
        }
      });
      
      res.json({
        error: false,
        message: 'Bet placed successfully',
        bet
      });
    } catch (error) {
      console.error('Bet placement error:', error);
      res.status(500).json({ error: true, message: 'Failed to place bet' });
    }
  });
  
  // Get game results
  app.get('/api/game/results', async (req, res) => {
    try {
      const { gameType = 'FastParity', limit = 20 } = req.query;
      
      const results = await storage.getGameResults(gameType as string, Number(limit));
      
      res.json(results);
    } catch (error) {
      console.error('Results error:', error);
      res.status(500).json({ error: true, message: 'Failed to get results' });
    }
  });
  
  // Get chart data
  app.get('/api/game/chart', async (req, res) => {
    try {
      const { gameType = 'FastParity', limit = 20 } = req.query;
      
      const chartData = await storage.getChartData(gameType as string, Number(limit));
      
      res.json(chartData);
    } catch (error) {
      console.error('Chart data error:', error);
      res.status(500).json({ error: true, message: 'Failed to get chart data' });
    }
  });
  
  // Recharge endpoints
  app.post('/api/recharge', async (req, res) => {
    try {
      const validatedData = insertRechargeSchema.parse(req.body);
      
      const recharge = await storage.createRecharge(validatedData);
      
      res.json({
        error: false,
        message: 'Recharge request submitted',
        recharge
      });
    } catch (error) {
      console.error('Recharge error:', error);
      res.status(500).json({ error: true, message: 'Recharge failed' });
    }
  });
  
  app.get('/api/recharge/history/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const { limit = 50 } = req.query;
      
      const recharges = await storage.getRechargesByUser(username, Number(limit));
      
      res.json(recharges);
    } catch (error) {
      console.error('Recharge history error:', error);
      res.status(500).json({ error: true, message: 'Failed to get recharge history' });
    }
  });
  
  // Withdrawal endpoints
  app.post('/api/withdraw', async (req, res) => {
    try {
      const validatedData = insertWithdrawalSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(404).json({ error: true, message: 'User not found' });
      }
      
      if ((user.balance ?? 0) < validatedData.amount) {
        return res.status(400).json({ error: true, message: 'Insufficient balance' });
      }
      
      const withdrawal = await storage.createWithdrawal(validatedData);
      
      // Update user balance
      await storage.updateUserBalance(
        validatedData.username,
        (user.balance ?? 0) - validatedData.amount
      );
      
      // Create transaction record
      await storage.createTransaction({
        username: validatedData.username,
        reason: 'Withdrawal request',
        amount: -validatedData.amount,
        type: 'subtract'
      });
      
      res.json({
        error: false,
        message: 'Withdrawal request submitted',
        withdrawal
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ error: true, message: 'Withdrawal failed' });
    }
  });
  
  app.get('/api/withdraw/history/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const { limit = 50 } = req.query;
      
      const withdrawals = await storage.getWithdrawalsByUser(username, Number(limit));
      
      res.json(withdrawals);
    } catch (error) {
      console.error('Withdrawal history error:', error);
      res.status(500).json({ error: true, message: 'Failed to get withdrawal history' });
    }
  });
  
  // Transaction history
  app.get('/api/transactions/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const { limit = 50 } = req.query;
      
      const transactions = await storage.getTransactionsByUser(username, Number(limit));
      
      res.json(transactions);
    } catch (error) {
      console.error('Transaction history error:', error);
      res.status(500).json({ error: true, message: 'Failed to get transaction history' });
    }
  });
  
  // Bet history
  app.get('/api/bets/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const { limit = 50 } = req.query;
      
      const bets = await storage.getBetsByUser(username, Number(limit));
      
      res.json(bets);
    } catch (error) {
      console.error('Bet history error:', error);
      res.status(500).json({ error: true, message: 'Failed to get bet history' });
    }
  });
  
  // Game simulation with real-time price fluctuation
  const PERIOD_SECONDS = 120;
  const BETTING_CLOSE = PERIOD_SECONDS / 2;
  let priceInterval: NodeJS.Timeout;
  let currentPeriod = Math.floor(Date.now() / (PERIOD_SECONDS * 1000));
  let currentCandle = {
    period: currentPeriod,
    open: 1200,
    high: 1200,
    low: 1200,
    close: 1200,
    timestamp: new Date().toISOString()
  };
  let countdown = PERIOD_SECONDS;
  let resultCalculated = false;
  let resultColor: 'green' | 'red' | 'green_doji' | 'red_doji' | null = null;
  
  function startGameSimulation() {
    if (priceInterval) clearInterval(priceInterval);

    // Initialize current period
    currentPeriod = Math.floor(Date.now() / (PERIOD_SECONDS * 1000));
    countdown = PERIOD_SECONDS - (Math.floor(Date.now() / 1000) % PERIOD_SECONDS);
    
    // Get initial price from last candle
    storage.getChartData('FastParity', 1).then(data => {
      const lastPrice = data[0]?.close || 1200;
      currentCandle = {
        period: currentPeriod,
        open: lastPrice,
        high: lastPrice,
        low: lastPrice,
        close: lastPrice,
        timestamp: new Date().toISOString()
      };
    });
    
    // Real-time price fluctuation every second
    priceInterval = setInterval(async () => {
      countdown--;
      
      if (countdown <= 0) {
        // Finalize candle and apply final price based on result
        const diff = Math.random() * 100 + 50;
        if (!resultColor) resultColor = Math.random() > 0.5 ? 'green' : 'red';

        let finalPrice = currentCandle.open;
        if (resultColor === 'green') finalPrice += diff;
        else if (resultColor === 'red') finalPrice -= diff;
        else if (resultColor === 'green_doji' || resultColor === 'red_doji') finalPrice += (Math.random() - 0.5) * 10;

        currentCandle.close = finalPrice;
        currentCandle.high = Math.max(currentCandle.high, finalPrice);
        currentCandle.low = Math.min(currentCandle.low, finalPrice);

        await storage.addChartData({
          period: currentCandle.period,
          timestamp: new Date(currentCandle.timestamp),
          open: currentCandle.open,
          high: currentCandle.high,
          low: currentCandle.low,
          close: currentCandle.close,
          gameType: 'FastParity'
        });

        broadcast({
          type: 'candleComplete',
          data: currentCandle
        });

        const resultNumber = Math.floor(Math.random() * 9) + 1;
        await storage.createGameResult({
          period: currentCandle.period,
          ans: resultNumber,
          num: Math.round(currentCandle.close),
          color: resultColor,
          color2: null,
          gameType: 'FastParity'
        });

        const periodBets = await storage.getBetsByPeriod(currentCandle.period, 'FastParity');
        for (const bet of periodBets) {
          let payout = 0;
          const betColor = bet.ans === 'green' || bet.ans === 'up' ? 'green' : 'red';
          if (resultColor === 'green' && betColor === 'green') payout = bet.amount * 1.92;
          if (resultColor === 'red' && betColor === 'red') payout = bet.amount * 1.92;
          if (resultColor === 'green_doji' && betColor === 'green') payout = bet.amount * 1.3;
          if (resultColor === 'red_doji' && betColor === 'red') payout = bet.amount * 1.3;

          await storage.updateBetResult(String(bet.id), payout > 0 ? 'win' : 'loss', payout);

          if (payout > 0) {
            await storage.updateUserBalance(bet.username, payout);
            await storage.createTransaction({
              username: bet.username,
              reason: `Bet win - Period ${currentCandle.period}`,
              amount: payout,
              type: 'credit'
            });
          }
        }

        broadcast({
          type: 'gameResult',
          data: {
            period: currentCandle.period,
            ans: resultNumber,
            num: Math.round(currentCandle.close),
            color: resultColor,
            gameType: 'FastParity'
          }
        });

        currentPeriod++;
        countdown = PERIOD_SECONDS;
        resultCalculated = false;
        resultColor = null;
        currentCandle = {
          period: currentPeriod,
          open: currentCandle.close,
          high: currentCandle.close,
          low: currentCandle.close,
          close: currentCandle.close,
          timestamp: new Date().toISOString()
        };

        broadcast({
          type: 'newPeriod',
          data: {
            period: currentPeriod,
            countdown: PERIOD_SECONDS,
            bettingActive: true
          }
        });

        return;
      }

      if (countdown === BETTING_CLOSE && !resultCalculated) {
        resultCalculated = true;

        const periodBets = await storage.getBetsByPeriod(currentCandle.period, 'FastParity');
        const buyTotal = periodBets
          .filter(b => b.ans === 'green' || b.ans === 'up')
          .reduce((s, b) => s + b.amount, 0);
        const sellTotal = periodBets
          .filter(b => b.ans === 'red' || b.ans === 'down')
          .reduce((s, b) => s + b.amount, 0);

        if (buyTotal === 0 && sellTotal === 0) {
          resultColor = Math.random() > 0.5 ? 'green' : 'red';
        } else if (buyTotal > sellTotal) {
          resultColor = 'red';
        } else if (sellTotal > buyTotal) {
          resultColor = 'green';
        } else {
          resultColor = Math.random() > 0.5 ? 'green_doji' : 'red_doji';
        }

        broadcast({
          type: 'bettingClosed',
          data: { period: currentCandle.period }
        });
      }

      const volatility = resultCalculated ? 15 : 5;
      const bias = resultColor === 'green' || resultColor === 'green_doji' ? 0.5 : resultColor === 'red' || resultColor === 'red_doji' ? -0.5 : 0;
      const priceChange = (Math.random() - 0.5 + bias) * volatility;
      currentCandle.close += priceChange;
      currentCandle.high = Math.max(currentCandle.high, currentCandle.close);
      currentCandle.low = Math.min(currentCandle.low, currentCandle.close);
      
      // Broadcast live price update
      broadcast({
        type: 'priceUpdate',
        data: {
          ...currentCandle,
          countdown,
          bettingActive: countdown > BETTING_CLOSE,
          resultCalculated
        }
      });
      
    }, 1000); // Update every second
  }
  
  // Admin authentication middleware
  function adminAuth(req: any, res: any, next: any) {
    const { admintoken } = req.headers;
    if (admintoken !== 'admin123') {
      return res.status(401).json({ error: true, message: 'Unauthorized admin access' });
    }
    next();
  }

  // Admin login
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (username === 'admin' && password === 'admin123') {
        res.json({ 
          error: false, 
          message: 'Admin login successful',
          token: 'admin123'
        });
      } else {
        res.status(401).json({ error: true, message: 'Invalid admin credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: true, message: 'Admin login failed' });
    }
  });

  // Admin - Get all recharge requests
  app.get('/api/admin/recharges', adminAuth, async (req, res) => {
    try {
      const recharges = await storage.getAllRecharges();
      res.json(recharges);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch recharges' });
    }
  });

  // Admin - Update recharge status
  app.put('/api/admin/recharges/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await storage.updateRechargeStatus(id, status);
      
      if (status === 'approved') {
        const recharge = await storage.getRechargeById(id);
        if (recharge) {
          await storage.updateUserBalance(recharge.username, recharge.amount);
          await storage.createTransaction({
            username: recharge.username,
            reason: `Recharge approved - ${recharge.utr}`,
            amount: recharge.amount,
            type: 'credit'
          });
        }
      }
      
      res.json({ error: false, message: 'Recharge status updated' });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to update recharge' });
    }
  });

  // Admin - Get all withdrawal requests
  app.get('/api/admin/withdrawals', adminAuth, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch withdrawals' });
    }
  });

  // Admin - Update withdrawal status
  app.put('/api/admin/withdrawals/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await storage.updateWithdrawalStatus(id, status);
      res.json({ error: false, message: 'Withdrawal status updated' });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to update withdrawal' });
    }
  });

  // Admin - Get live game monitor data
  app.get('/api/admin/game-monitor', adminAuth, async (req, res) => {
    try {
      const currentBets = await storage.getBetsByPeriod(currentPeriod, 'FastParity');
      
      const redBets = currentBets.filter(bet => bet.ans === 'down');
      const greenBets = currentBets.filter(bet => bet.ans === 'up');
      
      const redTotal = redBets.reduce((sum, bet) => sum + bet.amount, 0);
      const greenTotal = greenBets.reduce((sum, bet) => sum + bet.amount, 0);
      
      res.json({
        period: currentPeriod,
        countdown,
        bets: {
          red: { count: redBets.length, amount: redTotal },
          green: { count: greenBets.length, amount: greenTotal },
          total: { count: currentBets.length, amount: redTotal + greenTotal }
        },
        canManuallySetResult: countdown > 19
      });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch game monitor data' });
    }
  });

  // Admin - Manually set winning color
  app.post('/api/admin/set-result', adminAuth, async (req, res) => {
    try {
      const { color } = req.body;
      
      if (countdown <= 19) {
        return res.status(400).json({ error: true, message: 'Cannot set result after 19 seconds' });
      }
      
      resultCalculated = true;
      const resultNumber = color === 'red' ? 2 : 1;
      
      const dramaticChange = (Math.random() * 100) + 50;
      const targetPrice = color === 'green' 
        ? currentCandle.close + dramaticChange 
        : currentCandle.close - dramaticChange;
      
      currentCandle.close = targetPrice;
      currentCandle.high = Math.max(currentCandle.high, targetPrice);
      currentCandle.low = Math.min(currentCandle.low, targetPrice);
      
      await storage.createGameResult({
        period: currentCandle.period,
        ans: resultNumber,
        num: Math.round(targetPrice),
        color,
        color2: null,
        gameType: 'FastParity'
      });
      
      broadcast({
        type: 'gameResult',
        data: {
          period: currentCandle.period,
          ans: resultNumber,
          num: Math.round(targetPrice),
          color,
          gameType: 'FastParity'
        }
      });
      
      res.json({ error: false, message: `Result set to ${color} for period ${currentCandle.period}` });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to set result' });
    }
  });

  // Start game simulation
  startGameSimulation();
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return httpServer;
}
