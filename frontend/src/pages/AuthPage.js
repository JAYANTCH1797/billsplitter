import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Receipt, Users, PieChart, ArrowRight } from 'lucide-react';

const AuthPage = () => {
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
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Receipt className="w-8 h-8" strokeWidth={1.5} />
            <span className="text-2xl font-bold tracking-tight">SplitSync</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Split bills.<br />
            Stay friends.
          </h1>
          
          <p className="text-lg text-background/70 max-w-md">
            The simplest way to track shared expenses with friends, roommates, and travel groups.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Create Groups</h3>
              <p className="text-sm text-background/60">Organize expenses by trips, apartments, or events</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center flex-shrink-0">
              <PieChart className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Split Any Way</h3>
              <p className="text-sm text-background/60">Equal, unequal, by parts, or percentages</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Settle Up</h3>
              <p className="text-sm text-background/60">See who owes what and track payments</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-background/40">
          © 2024 SplitSync. All rights reserved.
        </p>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Receipt className="w-8 h-8" strokeWidth={1.5} />
            <span className="text-2xl font-bold tracking-tight">SplitSync</span>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
              <CardDescription>Sign in or create an account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        data-testid="login-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        data-testid="login-password-input"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-full btn-active" 
                      disabled={isLoading}
                      data-testid="login-submit-btn"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        data-testid="register-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        data-testid="register-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        data-testid="register-password-input"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-full btn-active" 
                      disabled={isLoading}
                      data-testid="register-submit-btn"
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
