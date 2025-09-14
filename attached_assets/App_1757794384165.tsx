import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Coins, Trophy, Star, Zap, Shield, Sword, Crown, Users, Play, LogOut, ChevronDown, Home } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

// Mock user data
const mockUser = {
  id: '1',
  name: 'Commander Steel',
  avatar: 'https://images.unsplash.com/photo-1669471370385-b80e44398074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwZnV0dXJpc3RpYyUyMHNwYWNlJTIwbWFyaW5lcyUyMHdhcmZhcmV8ZW58MXx8fHwxNzU2NDcyOTk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  channelPoints: 1250,
  email: 'commander.steel@youtube.com'
};

// Mock rewards data
const mockRewards = [
  {
    id: '1',
    title: 'Custom Unit Name',
    description: 'Have your custom unit featured in a battle report',
    cost: 500,
    icon: <Sword className="w-6 h-6" />,
    category: 'Content',
    availability: 'Unlimited'
  },
  {
    id: '2',
    title: 'Tactical Advice Request',
    description: 'Ask for specific tactical advice in next video',
    cost: 200,
    icon: <Shield className="w-6 h-6" />,
    category: 'Interaction',
    availability: '5 remaining'
  },
  {
    id: '3',
    title: 'Lore Question Priority',
    description: 'Get your lore question answered first',
    cost: 150,
    icon: <Star className="w-6 h-6" />,
    category: 'Interaction',
    availability: 'Unlimited'
  },
  {
    id: '4',
    title: 'Army Showcase Feature',
    description: 'Submit your army for detailed showcase video',
    cost: 800,
    icon: <Trophy className="w-6 h-6" />,
    category: 'Content',
    availability: '2 remaining'
  },
  {
    id: '5',
    title: 'Discord VIP Role',
    description: 'Get special VIP status in Discord server',
    cost: 300,
    icon: <Crown className="w-6 h-6" />,
    category: 'Perks',
    availability: 'Unlimited'
  },
  {
    id: '6',
    title: 'Private Game Session',
    description: 'Join a private multiplayer game session',
    cost: 1000,
    icon: <Users className="w-6 h-6" />,
    category: 'Content',
    availability: '1 remaining'
  },
  {
    id: '7',
    title: 'Video Request',
    description: 'Request a specific army or faction review',
    cost: 400,
    icon: <Play className="w-6 h-6" />,
    category: 'Content',
    availability: 'Unlimited'
  },
  {
    id: '8',
    title: 'Exclusive Behind-the-Scenes',
    description: 'Access to exclusive BTS content for one month',
    cost: 250,
    icon: <Zap className="w-6 h-6" />,
    category: 'Perks',
    availability: 'Unlimited'
  }
];

function App() {
  const [user, setUser] = useState(mockUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'dashboard'>('home');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Content', 'Interaction', 'Perks'];

  const filteredRewards = selectedCategory === 'All' 
    ? mockRewards 
    : mockRewards.filter(reward => reward.category === selectedCategory);

  const handleLogin = () => {
    // Mock login - in real implementation, this would redirect to YouTube OAuth
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    toast.success('Successfully signed in with YouTube!');
  };

  const handlePurchase = (rewardId: string, cost: number) => {
    if (user.channelPoints >= cost) {
      setUser(prev => ({
        ...prev,
        channelPoints: prev.channelPoints - cost
      }));
      alert('Reward purchased successfully!');
    } else {
      alert('Insufficient channel points!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
    setUser(mockUser); // Reset user data
    toast.success('Successfully logged out. Thanks for using the channel point system!');
  };

  // Home Page
  if (currentPage === 'home') {
    return (
      <>
        <Toaster />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="border-b border-purple-500/30 bg-gray-800/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Grimdark Future Channel Points</h1>
                    <p className="text-sm text-gray-300">OnePage Rules Community Rewards</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentPage('login')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <div className="mx-auto w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-8">
                <Coins className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-6">Welcome to Grimdark Future</h1>
              <h2 className="text-3xl text-purple-300 mb-8">Channel Point System</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                Earn points by watching our streams, participating in chat, and engaging with the OnePage Rules community. 
                Redeem your points for exclusive content, army showcases, and special perks!
              </p>
              <Button 
                onClick={() => setCurrentPage('login')}
                className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3"
              >
                Get Started with YouTube
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-gray-800/90 border-purple-500/30 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Play className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Watch & Earn</h3>
                  <p className="text-gray-300">Automatically earn points while watching live streams and video content</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/90 border-purple-500/30 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Exclusive Rewards</h3>
                  <p className="text-gray-300">Redeem points for army showcases, custom content, and VIP perks</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/90 border-purple-500/30 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Community Features</h3>
                  <p className="text-gray-300">Join private games, get Discord VIP status, and influence content</p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-purple-800/90 to-blue-800/90 border-purple-500/30 max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to Join the Battle?</h3>
                  <p className="text-purple-200 mb-6">Sign in with your YouTube account to start earning channel points and unlock exclusive rewards!</p>
                  <Button 
                    onClick={() => setCurrentPage('login')}
                    className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8 py-3"
                  >
                    Sign In with YouTube
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      </>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <>
        <Toaster />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="border-b border-purple-500/30 bg-gray-800/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Grimdark Future Channel Points</h1>
                    <p className="text-sm text-gray-300">OnePage Rules Community Rewards</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentPage('home')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-center p-4 py-16">
            <Card className="w-full max-w-md bg-gray-800/90 border-purple-500/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Sign In to Continue</CardTitle>
                <p className="text-gray-300">Connect your YouTube account to access your channel points and rewards!</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Sign in with YouTube
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Dashboard Page (when logged in)
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-purple-500/30 bg-gray-800/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Grimdark Future Channel Points</h1>
                  <p className="text-sm text-gray-300">OnePage Rules Community Rewards</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors">
                    <div className="text-right">
                      <p className="text-sm text-gray-300">Signed in as</p>
                      <div className="flex items-center space-x-1">
                        <p className="font-medium text-white">{user.name}</p>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-600">
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Channel Points Balance */}
          <Card className="mb-8 bg-gradient-to-r from-purple-800/90 to-blue-800/90 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Your Channel Points</h2>
                  <p className="text-purple-200">Earn points by watching streams and participating in chat!</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <Coins className="w-8 h-8 text-yellow-400" />
                    <span className="text-4xl font-bold text-white">{user.channelPoints.toLocaleString()}</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-600/50 text-purple-100">
                    Battle-ready Commander
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500" 
                    : "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRewards.map((reward) => (
              <Card key={reward.id} className="bg-gray-800/90 border-gray-600 hover:border-purple-500/50 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400">
                        {reward.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg leading-tight">{reward.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className="mt-1 text-xs border-gray-500 text-gray-400"
                        >
                          {reward.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-sm mb-4">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-white">{reward.cost.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-gray-400">{reward.availability}</span>
                  </div>

                  <Button
                    onClick={() => handlePurchase(reward.id, reward.cost)}
                    disabled={user.channelPoints < reward.cost}
                    className={`w-full ${
                      user.channelPoints >= reward.cost
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {user.channelPoints >= reward.cost ? "Redeem" : "Not Enough Points"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How to Earn Points */}
          <Card className="mt-8 bg-gray-800/90 border-gray-600">
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
    </>
  );
}

export default App;