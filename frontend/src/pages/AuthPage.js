import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Zap, Users, PieChart, ArrowRight, Receipt } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await register(registerName, registerEmail, registerPassword);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Marquee Banner */}
      <div className="bg-foreground text-background py-2 overflow-hidden border-b-3 border-foreground marquee-container">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-mono text-xs sm:text-sm mx-4 sm:mx-8 flex items-center gap-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" /> SPLIT BILLS WITH FRIENDS 
              <span className="text-yellow-400">★</span> NO MORE AWKWARD MONEY TALKS
              <span className="text-yellow-400">★</span> TRACK WHO OWES WHAT
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-40px)]">
        {/* Hero Section - Now visible on all screens */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative">
          {/* Decorative elements - Hidden on mobile, shown on larger screens */}
          <div className="hidden sm:flex absolute top-10 sm:top-20 right-10 sm:right-20 w-20 h-20 sm:w-32 sm:h-32 brutal-card-yellow transform rotate-12 items-center justify-center z-10">
            <span className="text-4xl sm:text-6xl">💸</span>
          </div>
          <div className="hidden sm:flex absolute bottom-20 sm:bottom-40 right-20 sm:right-40 w-16 h-16 sm:w-24 sm:h-24 brutal-card-lime transform -rotate-6 items-center justify-center z-10">
            <span className="text-2xl sm:text-4xl">🤝</span>
          </div>

          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-16 animate-enter">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-foreground flex items-center justify-center">
                <Receipt className="w-5 h-5 sm:w-7 sm:h-7 text-background" strokeWidth={2.5} />
              </div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">SPLITSYNC</span>
            </div>
            
            {/* Main headline */}
            <div className="max-w-lg">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[0.9] mb-4 sm:mb-6 animate-enter delay-1">
                SPLIT<br />
                <span className="inline-block brutal-card-yellow px-2 sm:px-4 py-1 transform -rotate-1">BILLS.</span><br />
                STAY<br />
                <span className="inline-block brutal-card-lime px-2 sm:px-4 py-1 transform rotate-1">FRIENDS.</span>
              </h1>
              
              <p className="text-base sm:text-xl text-muted-foreground max-w-md animate-enter delay-2">
                The no-nonsense way to track shared expenses. 
                Equal splits, custom amounts, percentages — we do it all.
              </p>
            </div>
          </div>

          {/* Features - Stack on mobile, row on desktop */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 lg:mt-0 animate-enter delay-3">
            <div className="brutal-card p-3 sm:p-4 wiggle-hover">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" strokeWidth={2.5} />
              <h3 className="font-bold text-xs sm:text-sm uppercase">Groups</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Trips, roommates, events</p>
            </div>
            
            <div className="brutal-card p-3 sm:p-4 wiggle-hover">
              <PieChart className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" strokeWidth={2.5} />
              <h3 className="font-bold text-xs sm:text-sm uppercase">Split Any Way</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Equal, parts, or %</p>
            </div>
            
            <div className="brutal-card p-3 sm:p-4 wiggle-hover">
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" strokeWidth={2.5} />
              <h3 className="font-bold text-xs sm:text-sm uppercase">Settle Up</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">See who owes who</p>
            </div>
          </div>
        </div>

        {/* Auth form section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-foreground">
          <div className="w-full max-w-md">
            <div className="brutal-card bg-background p-6 sm:p-8 animate-enter delay-4">
              {/* Tab switcher */}
              <div className="flex border-3 border-foreground mb-6 sm:mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 sm:py-3 font-bold uppercase text-xs sm:text-sm transition-colors ${
                    isLogin 
                      ? 'bg-foreground text-background' 
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                  data-testid="login-tab"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 sm:py-3 font-bold uppercase text-xs sm:text-sm transition-colors border-l-3 border-foreground ${
                    !isLogin 
                      ? 'bg-foreground text-background' 
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                  data-testid="register-tab"
                >
                  Sign Up
                </button>
              </div>

              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-bold uppercase text-xs tracking-wider">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11 sm:h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                      data-testid="login-email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-bold uppercase text-xs tracking-wider">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 sm:h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                      data-testid="login-password-input"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="brutal-btn w-full h-12 sm:h-14 text-sm sm:text-base"
                    disabled={isLoading}
                    data-testid="login-submit-btn"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="font-bold uppercase text-xs tracking-wider">Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="h-11 sm:h-12 border-3 border-foreground rounded-none text-sm focus:ring-0"
                      data-testid="register-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="font-bold uppercase text-xs tracking-wider">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="h-11 sm:h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                      data-testid="register-email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="font-bold uppercase text-xs tracking-wider">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="h-11 sm:h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                      data-testid="register-password-input"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="brutal-btn w-full h-12 sm:h-14 text-sm sm:text-base"
                    disabled={isLoading}
                    data-testid="register-submit-btn"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account →'}
                  </button>
                </form>
              )}

              <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-6 font-mono">
                NO CREDIT CARD REQUIRED • FREE FOREVER
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
