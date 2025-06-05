import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChartLine, 
  Wallet, 
  History, 
  User, 
  Gift, 
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-react';

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Trade', icon: ChartLine },
    { path: '/recharge', label: 'Recharge', icon: Wallet },
    { path: '/withdraw', label: 'Withdraw', icon: Wallet },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-dark-card border-b border-dark-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-xl font-bold text-accent-blue cursor-pointer">FastParity</h1>
            </Link>
            <div className="hidden md:flex items-center space-x-2 bg-dark-bg px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-bull-green rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Live Trading</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="hidden md:flex items-center space-x-4 bg-dark-bg px-4 py-2 rounded-lg">
              <div className="text-sm">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white font-semibold ml-2">
                  ₹{user.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 bg-dark-bg hover:bg-gray-700"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent-blue text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm">{user.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-dark-card border-dark-border">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/recharge" className="flex items-center">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex items-center">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-border" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-400 focus:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <button className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  isActive ? 'text-accent-blue' : 'text-gray-400 hover:text-white'
                }`}>
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </button>
              </Link>
            );
          })}
          
          {/* Bonus Tab */}
          <button className="flex flex-col items-center py-3 px-2 text-gray-400 hover:text-white transition-colors">
            <Gift className="w-5 h-5 mb-1" />
            <span className="text-xs">Bonus</span>
          </button>
        </div>
      </div>
    </>
  );
}
