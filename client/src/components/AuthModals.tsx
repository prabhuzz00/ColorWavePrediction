import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export default function AuthModals({
  isLoginOpen,
  isRegisterOpen,
  onLoginClose,
  onRegisterClose,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    mobile: '',
    referralCode: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.login(loginData);
      
      if (response.error) {
        toast({
          title: 'Login Failed',
          description: response.message,
          variant: 'destructive',
        });
      } else {
        login(response.user, response.token);
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        onLoginClose();
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.register({
        username: registerData.username,
        password: registerData.password,
        mobile: registerData.mobile,
      });
      
      if (response.error) {
        toast({
          title: 'Registration Failed',
          description: response.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Successful',
          description: 'Please login with your credentials.',
        });
        onRegisterClose();
        onSwitchToLogin();
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
        <DialogContent className="bg-dark-card border-dark-border w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Login</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-white">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                required
                className="bg-dark-bg border-dark-border text-white mt-2"
                placeholder="Enter username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-dark-bg border-dark-border text-white mt-2"
                placeholder="Enter password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-accent-blue hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <button
              onClick={onSwitchToRegister}
              className="text-accent-blue hover:underline"
            >
              Don't have an account? Register
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={onRegisterClose}>
        <DialogContent className="bg-dark-card border-dark-border w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Register</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="reg-username" className="text-sm font-medium text-white">
                Username
              </Label>
              <Input
                id="reg-username"
                type="text"
                required
                className="bg-dark-bg border-dark-border text-white mt-2"
                placeholder="Choose username"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="mobile" className="text-sm font-medium text-white">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                required
                className="bg-dark-bg border-dark-border text-white mt-2"
                placeholder="Enter mobile number"
                value={registerData.mobile}
                onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="reg-password" className="text-sm font-medium text-white">
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                required
                className="bg-dark-bg border-dark-border text-white mt-2"
                placeholder="Create password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="referral" className="text-sm font-medium text-white">
                Referral Code (Optional)
              </Label>
              <Input
                id="referral"
                type="text"
                className="bg-dark-bg border-dark-border text-white mt-2"
                placeholder="Enter referral code"
                value={registerData.referralCode}
                onChange={(e) => setRegisterData({ ...registerData, referralCode: e.target.value })}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-bull-green hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <button
              onClick={onSwitchToLogin}
              className="text-accent-blue hover:underline"
            >
              Already have an account? Login
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
