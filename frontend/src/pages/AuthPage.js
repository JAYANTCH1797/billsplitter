import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Receipt } from 'lucide-react';

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
      toast.success('Welcome to SplitSync!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col">

      {/* Header bar */}
      <div className="bg-background border-b-3 border-foreground px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 border-2 border-foreground flex items-center justify-center hover:bg-muted transition-colors"
          data-testid="auth-back-btn"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center">
            <Receipt className="w-4 h-4 text-background" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">SPLITSYNC</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Title block */}
          <div className="mb-8 text-center animate-enter">
            <h1 className="text-3xl sm:text-4xl font-bold text-background mb-2">
              {isLogin ? 'Welcome back.' : 'Join the crew.'}
            </h1>
            <p className="text-background/60 text-sm font-mono">
              {isLogin
                ? 'Sign in to see who owes you.'
                : 'Takes 30 seconds. Free forever.'}
            </p>
          </div>

          {/* Card */}
          <div className="brutal-card bg-background p-6 sm:p-8 animate-enter delay-1">

            {/* Tab switcher */}
            <div className="flex border-3 border-foreground mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 font-bold uppercase text-xs transition-colors ${isLogin
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-muted'
                  }`}
                data-testid="login-tab"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 font-bold uppercase text-xs transition-colors border-l-3 border-foreground ${!isLogin
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-muted'
                  }`}
                data-testid="register-tab"
              >
                Sign Up
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="font-bold uppercase text-xs tracking-wider">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="font-bold uppercase text-xs tracking-wider">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                    data-testid="login-password-input"
                  />
                </div>
                <button
                  type="submit"
                  className="brutal-btn w-full h-13 text-sm mt-2"
                  disabled={isLoading}
                  data-testid="login-submit-btn"
                >
                  {isLoading ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="register-name" className="font-bold uppercase text-xs tracking-wider">Your Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Jayant"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="h-12 border-3 border-foreground rounded-none text-sm focus:ring-0"
                    data-testid="register-name-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-email" className="font-bold uppercase text-xs tracking-wider">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                    data-testid="register-email-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-password" className="font-bold uppercase text-xs tracking-wider">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="h-12 border-3 border-foreground rounded-none font-mono text-sm focus:ring-0"
                    data-testid="register-password-input"
                  />
                </div>
                <button
                  type="submit"
                  className="brutal-btn w-full h-13 text-sm mt-2"
                  disabled={isLoading}
                  data-testid="register-submit-btn"
                >
                  {isLoading ? 'Creating account...' : 'Create Account →'}
                </button>
              </form>
            )}

            <p className="text-center text-[10px] text-muted-foreground mt-5 font-mono">
              NO CREDIT CARD REQUIRED • FREE FOREVER
            </p>
          </div>

          {/* Switch prompt */}
          <p className="text-center text-background/60 text-xs mt-5 font-mono animate-enter delay-2">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-background font-bold underline underline-offset-2"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
