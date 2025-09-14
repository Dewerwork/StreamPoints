import { useEffect, useState } from "react";
import { Router, Route, Switch, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Coins, Trophy, Star, Zap, Shield, Sword, Crown, Users, Play, LogOut, ChevronDown, Home, Settings, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminPanel from "./components/AdminPanel";
import TransactionHistory from "./pages/TransactionHistory";
import type { Reward, RewardCategory } from "@shared/schema";

// Icon mapping for rewards
const getRewardIcon = (title: string) => {
  if (title.includes('Unit') || title.includes('Army')) return <Sword className="w-6 h-6" />;
  if (title.includes('Tactical') || title.includes('Advice')) return <Shield className="w-6 h-6" />;
  if (title.includes('Lore') || title.includes('Question')) return <Star className="w-6 h-6" />;
  if (title.includes('Showcase') || title.includes('Feature')) return <Trophy className="w-6 h-6" />;
  if (title.includes('Discord') || title.includes('VIP')) return <Crown className="w-6 h-6" />;
  if (title.includes('Game') || title.includes('Session')) return <Users className="w-6 h-6" />;
  if (title.includes('Video') || title.includes('Request')) return <Play className="w-6 h-6" />;
  return <Zap className="w-6 h-6" />;
};

// Home Page Component
function HomePage() {
  const [location, setLocation] = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await signIn();
      setLocation('/dashboard');
      toast({
        title: "Welcome to OnePageMore!",
        description: "Successfully signed in with Google.",
      });
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" data-testid="home-page">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-purple-500/30 bg-gray-800/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OnePageMore Channel Points</h1>
                  <p className="text-sm text-gray-300">Community Rewards System</p>
                </div>
              </div>
              <Button 
                onClick={() => setLocation('/login')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-signin-header"
              >
                Sign In
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="mx-auto w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-8">
              <Coins className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6" data-testid="text-hero-title">Welcome to OnePageMore</h1>
            <h2 className="text-3xl text-purple-300 mb-8" data-testid="text-hero-subtitle">Channel Point System</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12" data-testid="text-hero-description">
              Earn points by watching our streams, participating in chat, and engaging with the OnePageMore community. 
              Redeem your points for exclusive content, army showcases, and special perks!
            </p>
            <Button 
              onClick={() => setLocation('/login')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3"
              data-testid="button-get-started"
            >
              Get Started with Google
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gray-800/90 border-purple-500/30 text-center" data-testid="card-feature-watch">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Play className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Watch & Earn</h3>
                <p className="text-gray-300">Automatically earn points while watching live streams and video content</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/90 border-purple-500/30 text-center" data-testid="card-feature-rewards">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Exclusive Rewards</h3>
                <p className="text-gray-300">Redeem points for army showcases, custom content, and VIP perks</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/90 border-purple-500/30 text-center" data-testid="card-feature-community">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Community Features</h3>
                <p className="text-gray-300">Join private games, get Discord VIP status, and influence content</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="bg-gradient-to-r from-purple-800/90 to-blue-800/90 border-purple-500/30 max-w-2xl mx-auto" data-testid="card-cta">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Join the Community?</h3>
                <p className="text-purple-200 mb-6">Sign in with your Google account to start earning channel points and unlock exclusive rewards!</p>
                <Button 
                  onClick={() => setLocation('/login')}
                  className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8 py-3"
                  data-testid="button-signin-cta"
                >
                  Sign In with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// Login Page Component
function LoginPage() {
  const [location, setLocation] = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await signIn();
      setLocation('/dashboard');
      toast({
        title: "Welcome to OnePageMore!",
        description: "Successfully signed in with Google.",
      });
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" data-testid="login-page">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-purple-500/30 bg-gray-800/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OnePageMore Channel Points</h1>
                  <p className="text-sm text-gray-300">Community Rewards System</p>
                </div>
              </div>
              <Button 
                onClick={() => setLocation('/')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                data-testid="button-back-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center p-4 py-16">
          <Card className="w-full max-w-md bg-gray-800/90 border-purple-500/30" data-testid="card-login">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Sign In to Continue</CardTitle>
              <p className="text-gray-300">Connect your Google account to access your channel points and rewards!</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-signin-google"
              >
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { user, signOut } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();

  // Query for current user profile to get updated points after redemption
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
  });

  // Use currentUser from query if available, otherwise fall back to auth context
  const displayUser = currentUser || user;

  const { data: categories = [] } = useQuery<RewardCategory[]>({
    queryKey: ['/api/categories'],
    enabled: !!user,
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery<(Reward & { category?: RewardCategory })[]>({
    queryKey: ['/api/rewards/with-categories'],
    enabled: !!user,
  });

  const filteredRewards = selectedCategory === 'All' 
    ? rewards 
    : rewards.filter(reward => reward.category?.name === selectedCategory);

  const categoryOptions = ['All', ...categories.map(cat => cat.name)];

  const handlePurchase = async (rewardId: string, cost: number) => {
    if (!displayUser) return;
    
    if (displayUser.points < cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${cost - displayUser.points} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', `/api/rewards/${rewardId}/redeem`, {});
      toast({
        title: "Reward Redeemed!",
        description: "Your reward has been successfully redeemed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/with-categories'] });
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setLocation('/');
      toast({
        title: "Signed Out",
        description: "Thanks for using OnePageMore!",
      });
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" data-testid="dashboard-page">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-purple-500/30 bg-gray-800/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OnePageMore Channel Points</h1>
                  <p className="text-sm text-gray-300">Community Rewards System</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors" data-testid="dropdown-user-menu">
                    <div className="text-right">
                      <p className="text-sm text-gray-300">Signed in as</p>
                      <div className="flex items-center space-x-1">
                        <p className="font-medium text-white" data-testid="text-username">{displayUser?.displayName}</p>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <Avatar>
                      <AvatarImage src={displayUser?.photoURL} alt={displayUser?.displayName} />
                      <AvatarFallback className="bg-purple-600 text-white" data-testid="avatar-fallback">
                        {displayUser?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-gray-800 border-gray-600">
                  {/* User info header */}
                  <div className="px-2 py-1.5 text-sm text-gray-400 border-b border-gray-600">
                    <div className="font-medium text-white">{displayUser?.displayName}</div>
                    <div className="text-xs">{displayUser?.email}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {displayUser?.isOwner && (
                        <Badge variant="default" className="bg-red-600/80 text-white text-xs">
                          <Crown className="w-2 h-2 mr-1" />
                          Owner
                        </Badge>
                      )}
                      {displayUser?.isAdmin && !displayUser?.isOwner && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="w-2 h-2 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {displayUser?.isPremium && !displayUser?.isAdmin && !displayUser?.isOwner && (
                        <Badge variant="secondary" className="bg-yellow-600/50 text-yellow-100 text-xs">
                          <Crown className="w-2 h-2 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Navigation items */}
                  <DropdownMenuItem 
                    onClick={() => setLocation('/')}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white cursor-pointer"
                    data-testid="button-dashboard"
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => setLocation('/transactions')}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white cursor-pointer"
                    data-testid="button-transaction-history"
                  >
                    <History className="mr-2 h-4 w-4" />
                    <span>Transaction History</span>
                  </DropdownMenuItem>

                  {displayUser?.isAdmin && (
                    <DropdownMenuItem 
                      onClick={() => setLocation('/admin')}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white cursor-pointer"
                      data-testid="button-admin-panel"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}

                  <div className="border-t border-gray-600 my-1"></div>
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-300 hover:bg-gray-700 hover:text-red-200 focus:bg-gray-700 focus:text-red-200 cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8 bg-gradient-to-r from-purple-800/90 to-blue-800/90 border-purple-500/30" data-testid="card-points-balance">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Your Channel Points</h2>
                  <p className="text-purple-200">Earn points by watching streams and participating in chat!</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <Coins className="w-8 h-8 text-yellow-400" />
                    <span className="text-4xl font-bold text-white" data-testid="text-points-balance">
                      {displayUser?.points?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-600/50 text-purple-100" data-testid="badge-user-tier">
                    {displayUser?.isOwner ? 'Owner' : displayUser?.isAdmin ? 'Admin' : displayUser?.isPremium ? 'Premium' : 'Community Member'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500" 
                    : "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50"
                  }
                  data-testid={`button-category-${category.toLowerCase()}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {rewardsLoading ? (
            <div className="text-center py-8" data-testid="loading-rewards">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-300">Loading rewards...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRewards.map((reward) => (
                <Card key={reward.id} className="bg-gray-800/90 border-gray-600 hover:border-purple-500/50 transition-all duration-200" data-testid={`card-reward-${reward.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400">
                          {getRewardIcon(reward.title)}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg leading-tight" data-testid={`text-reward-title-${reward.id}`}>
                            {reward.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {reward.category && (
                              <Badge 
                                variant="outline" 
                                className="text-xs border-gray-500 text-gray-400"
                                data-testid={`badge-category-${reward.id}`}
                              >
                                {reward.category.name}
                              </Badge>
                            )}
                            {reward.tier === 'premium' && (
                              <Badge 
                                variant="outline" 
                                className="text-xs border-yellow-500 text-yellow-400"
                                data-testid={`badge-premium-${reward.id}`}
                              >
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 text-sm mb-4" data-testid={`text-reward-description-${reward.id}`}>
                      {reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-white" data-testid={`text-reward-cost-${reward.id}`}>
                          {reward.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchase(reward.id, reward.cost)}
                      disabled={!user || user.points < reward.cost || !reward.isActive}
                      className={`w-full ${
                        user && user.points >= reward.cost && reward.isActive
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                      data-testid={`button-redeem-${reward.id}`}
                    >
                      {!reward.isActive ? "Unavailable" :
                       !user || user.points < reward.cost ? "Not Enough Points" : "Redeem"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="mt-8 bg-gray-800/90 border-gray-600" data-testid="card-how-to-earn">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>How to Earn Channel Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Play className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-medium text-white mb-2">Watch Streams</h3>
                  <p className="text-sm text-gray-300">Earn 10 points every 5 minutes while watching live</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-medium text-white mb-2">Chat Participation</h3>
                  <p className="text-sm text-gray-300">Get bonus points for active chat participation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium text-white mb-2">Special Events</h3>
                  <p className="text-sm text-gray-300">Earn extra points during special stream events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

// Protected Admin Route Component
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="loading-admin">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return <>{children}</>;
}

// Main App Content with Routing
function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="loading-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OnePageMore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="app-root">
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/login">
            {user ? <Dashboard /> : <LoginPage />}
          </Route>
          <Route path="/dashboard">
            {user ? <Dashboard /> : <LoginPage />}
          </Route>
          <Route path="/admin">
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          </Route>
          <Route path="/transactions">
            {user ? <TransactionHistory /> : <LoginPage />}
          </Route>
          <Route>
            {user ? <Dashboard /> : <HomePage />}
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="onepagemore-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;