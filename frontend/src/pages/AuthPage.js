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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Marquee Banner */}
      <div className="bg-foreground text-background py-2 overflow-hidden border-b-3 border-foreground">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-mono text-sm mx-8 flex items-center gap-2">
              <Zap className="w-4 h-4" /> SPLIT BILLS WITH FRIENDS 
              <span className="text-yellow-400">★</span> NO MORE AWKWARD MONEY TALKS
              <span className="text-yellow-400">★</span> TRACK WHO OWES WHAT
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-40px)]">
        {/* Left side - Hero */}
        <div className="hidden lg:flex lg:w-1/2 p-8 lg:p-12 flex-col justify-between relative">
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 brutal-card-yellow transform rotate-12 flex items-center justify-center">
            <span className="text-6xl">💸</span>
          </div>
          <div className="absolute bottom-40 right-40 w-24 h-24 brutal-card-lime transform -rotate-6 flex items-center justify-center">
            <span className="text-4xl">🤝</span>
          </div>

          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-16 animate-enter">
              <div className="w-12 h-12 bg-foreground flex items-center justify-center">
                <Receipt className="w-7 h-7 text-background" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-bold tracking-tight">SPLITSYNC</span>
            </div>
            
            {/* Main headline */}
            <div className="max-w-lg">
              <h1 className="text-6xl lg:text-7xl font-bold leading-[0.9] mb-6 animate-enter delay-1">
                SPLIT<br />
                <span className="inline-block brutal-card-yellow px-4 py-1 transform -rotate-1">BILLS.</span><br />
                STAY<br />
                <span className="inline-block brutal-card-lime px-4 py-1 transform rotate-1">FRIENDS.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-md animate-enter delay-2">
                The no-nonsense way to track shared expenses. 
                Equal splits, custom amounts, percentages — we do it all.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 animate-enter delay-3">
            <div className="brutal-card p-4 wiggle-hover">
              <Users className="w-8 h-8 mb-3" strokeWidth={2.5} />
              <h3 className="font-bold text-sm uppercase">Groups</h3>
              <p className="text-xs text-muted-foreground mt-1">Trips, roommates, events</p>
            </div>
            
            <div className="brutal-card p-4 wiggle-hover">
              <PieChart className="w-8 h-8 mb-3" strokeWidth={2.5} />
              <h3 className="font-bold text-sm uppercase">Split Any Way</h3>
              <p className="text-xs text-muted-foreground mt-1">Equal, parts, or %</p>
            </div>
            
            <div className="brutal-card p-4 wiggle-hover">
              <ArrowRight className="w-8 h-8 mb-3" strokeWidth={2.5} />
              <h3 className="font-bold text-sm uppercase">Settle Up</h3>
              <p className="text-xs text-muted-foreground mt-1">See who owes who</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 lg:bg-foreground">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center animate-enter">
              <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                <Receipt className="w-6 h-6 text-background" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold">SPLITSYNC</span>
            </div>

            <div className="brutal-card bg-background p-8 animate-enter delay-1">
              {/* Tab switcher */}
              <div className="flex border-3 border-foreground mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 font-bold uppercase text-sm transition-colors ${
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
                  className={`flex-1 py-3 font-bold uppercase text-sm transition-colors border-l-3 border-foreground ${
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
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-bold uppercase text-xs tracking-wider">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 border-3 border-foreground rounded-none font-mono focus:ring-0"
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
                      className="h-12 border-3 border-foreground rounded-none font-mono focus:ring-0"
                      data-testid="login-password-input"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="brutal-btn w-full h-14 text-base"
                    disabled={isLoading}
                    data-testid="login-submit-btn"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="font-bold uppercase text-xs tracking-wider">Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="h-12 border-3 border-foreground rounded-none focus:ring-0"
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
                      className="h-12 border-3 border-foreground rounded-none font-mono focus:ring-0"
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
                      className="h-12 border-3 border-foreground rounded-none font-mono focus:ring-0"
                      data-testid="register-password-input"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="brutal-btn w-full h-14 text-base"
                    disabled={isLoading}
                    data-testid="register-submit-btn"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account →'}
                  </button>
                </form>
              )}

              <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
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
