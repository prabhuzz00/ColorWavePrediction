import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthModals from '@/components/AuthModals';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Award, 
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function Landing() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-accent-blue">FastParity</span> Trading
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of real-time color prediction trading with professional candlestick charts and instant payouts
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-bull-green hover:bg-green-600 text-white px-8 py-4 text-lg"
                onClick={() => setIsRegisterOpen(true)}
              >
                Start Trading Now
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white px-8 py-4 text-lg"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose FastParity?</h2>
            <p className="text-gray-400 text-lg">Professional trading platform with advanced features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-bull-green mb-4" />
                <CardTitle className="text-white">Real-time Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Professional candlestick charts with live price movements and technical indicators
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <Zap className="w-12 h-12 text-accent-blue mb-4" />
                <CardTitle className="text-white">Instant Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Win up to 1.95x your investment with instant payouts within minutes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <Shield className="w-12 h-12 text-yellow-500 mb-4" />
                <CardTitle className="text-white">Secure & Fair</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Advanced security measures and fair trading algorithms ensure transparency
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-500 mb-4" />
                <CardTitle className="text-white">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Round-the-clock customer support to assist you with all your trading needs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <Award className="w-12 h-12 text-orange-500 mb-4" />
                <CardTitle className="text-white">Bonus System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Referral bonuses, daily rewards, and special promotions for active traders
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-pink-500 mb-4" />
                <CardTitle className="text-white">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Detailed trading history, performance analytics, and trend analysis tools
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Trading Works</h2>
            <p className="text-gray-400 text-lg">Simple steps to start your trading journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Register & Deposit</h3>
              <p className="text-gray-400">Create your account and add funds to start trading</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-bull-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Predict Direction</h3>
              <p className="text-gray-400">Choose UP or DOWN based on chart analysis within 40 seconds</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Win & Withdraw</h3>
              <p className="text-gray-400">Win 1.95x your bet amount and withdraw instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-accent-blue/20 to-bull-green/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Start Trading?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of traders already making profits with FastParity
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-bull-green hover:bg-green-600 text-white px-8 py-4 text-lg"
              onClick={() => setIsRegisterOpen(true)}
            >
              <ArrowUp className="w-5 h-5 mr-2" />
              Create Account
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-dark-bg px-8 py-4 text-lg"
              onClick={() => setIsLoginOpen(true)}
            >
              <ArrowDown className="w-5 h-5 mr-2" />
              Login Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 FastParity. All rights reserved. Trade responsibly.
          </p>
        </div>
      </footer>

      {/* Auth Modals */}
      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onRegisterClose={() => setIsRegisterOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}
