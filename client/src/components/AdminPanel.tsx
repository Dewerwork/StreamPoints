import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Gift, FolderOpen, BarChart3, Plus, Edit, Trash2, Shield, Crown, Coins } from "lucide-react";
import type { User, Reward, RewardCategory } from "@shared/schema";

// Types from schema
interface AdminUser extends User {
  totalEarned?: number;
  totalSpent?: number;
  redemptionCount?: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("users");
  const [isCreateRewardOpen, setIsCreateRewardOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState<User | null>(null);
  const [pointAction, setPointAction] = useState<'give' | 'remove' | 'set'>('give');
  const [pointAmount, setPointAmount] = useState('');
  const [pointDescription, setPointDescription] = useState('');

  // Fetch admin data
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });
  
  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: allRewards = [], isLoading: rewardsLoading } = useQuery<Reward[]>({
    queryKey: ['/api/rewards/all'],
  });

  const { data: adminCategories = [], isLoading: categoriesLoading } = useQuery<RewardCategory[]>({
    queryKey: ['/api/admin/categories'],
  });

  // Mutations
  const togglePremiumMutation = useMutation({
    mutationFn: async ({ userId, isPremium }: { userId: string; isPremium: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/premium`, { isPremium });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User premium status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update premium status",
        variant: "destructive",
      });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await apiRequest('PUT', `/api/owner/users/${userId}/admin`, { isAdmin });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive",
      });
    },
  });

  const toggleOwnerMutation = useMutation({
    mutationFn: async ({ userId, isOwner }: { userId: string; isOwner: boolean }) => {
      const response = await apiRequest('PUT', `/api/owner/users/${userId}/owner`, { isOwner });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User owner status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update owner status",
        variant: "destructive",
      });
    },
  });

  // Point management mutations
  const givePointsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/give-points`, { amount, description });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "Points given successfully",
      });
      setSelectedUserForPoints(null);
      setPointAmount('');
      setPointDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to give points",
        variant: "destructive",
      });
    },
  });

  const removePointsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/remove-points`, { amount, description });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "Points removed successfully",
      });
      setSelectedUserForPoints(null);
      setPointAmount('');
      setPointDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove points",
        variant: "destructive",
      });
    },
  });

  const setPointsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/set-points`, { amount, description });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "Points set successfully",
      });
      setSelectedUserForPoints(null);
      setPointAmount('');
      setPointDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set points",
        variant: "destructive",
      });
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      const response = await apiRequest('POST', '/api/admin/rewards', rewardData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/all'] });
      setIsCreateRewardOpen(false);
      toast({
        title: "Success",
        description: "Reward created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reward",
        variant: "destructive",
      });
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/rewards/${rewardId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/all'] });
      toast({
        title: "Success",
        description: "Reward deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reward",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const response = await apiRequest('POST', '/api/admin/categories', categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      setIsCreateCategoryOpen(false);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/categories/${categoryId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleCreateReward = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const rewardData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      cost: parseInt(formData.get('cost') as string),
      categoryId: formData.get('categoryId') as string || null,
      tier: formData.get('tier') as string,
      isActive: formData.get('isActive') === 'on',
      actionType: formData.get('actionType') as string,
      actionConfig: {
        message: formData.get('actionMessage') as string,
      },
      availability: formData.get('availability') as string || 'Unlimited',
    };

    createRewardMutation.mutate(rewardData);
  };

  const handleCreateCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || '',
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    };

    createCategoryMutation.mutate(categoryData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" data-testid="admin-panel">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-admin-title">
              OnePageMore Admin Panel
            </h1>
            <p className="text-gray-300">Manage users, rewards, and categories for the channel points system</p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border-gray-600" data-testid="tabs-admin">
              <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-users">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="points" className="flex items-center gap-2" data-testid="tab-points">
                <Coins className="w-4 h-4" />
                Points
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2" data-testid="tab-rewards">
                <Gift className="w-4 h-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2" data-testid="tab-categories">
                <FolderOpen className="w-4 h-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-analytics">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Users Management */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-gray-800/90 border-gray-600" data-testid="card-users-management">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">User Management</CardTitle>
                  <Badge variant="secondary" className="bg-purple-600/50 text-purple-100">
                    {users.length} Users
                  </Badge>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8" data-testid="loading-users">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading users...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Points</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-gray-600" data-testid={`row-user-${user.id}`}>
                            <TableCell className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                                <AvatarFallback className="bg-purple-600 text-white text-sm">
                                  {user.displayName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white font-medium" data-testid={`text-user-name-${user.id}`}>
                                {user.displayName}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-300" data-testid={`text-user-email-${user.id}`}>
                              {user.email}
                            </TableCell>
                            <TableCell className="text-white font-mono" data-testid={`text-user-points-${user.id}`}>
                              {user.points.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {user.isOwner && (
                                  <Badge variant="default" className="bg-red-600/80 text-white text-xs" data-testid={`badge-owner-${user.id}`}>
                                    <Crown className="w-3 h-3 mr-1" />
                                    Owner
                                  </Badge>
                                )}
                                {user.isAdmin && (
                                  <Badge variant="destructive" className="text-xs" data-testid={`badge-admin-${user.id}`}>
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                {user.isPremium && (
                                  <Badge variant="secondary" className="bg-yellow-600/50 text-yellow-100 text-xs" data-testid={`badge-premium-${user.id}`}>
                                    <Crown className="w-3 h-3 mr-1" />
                                    Premium
                                  </Badge>
                                )}
                                {!user.isOwner && !user.isAdmin && !user.isPremium && (
                                  <Badge variant="outline" className="text-gray-400 border-gray-500 text-xs" data-testid={`badge-regular-${user.id}`}>
                                    Regular
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {/* Premium toggle (available to admin and owner) */}
                                <Button
                                  size="sm"
                                  variant={user.isPremium ? "destructive" : "default"}
                                  onClick={() => togglePremiumMutation.mutate({
                                    userId: user.id,
                                    isPremium: !user.isPremium
                                  })}
                                  disabled={togglePremiumMutation.isPending}
                                  data-testid={`button-toggle-premium-${user.id}`}
                                >
                                  {user.isPremium ? "Remove Premium" : "Make Premium"}
                                </Button>
                                
                                {/* Owner-level controls */}
                                {currentUser?.isOwner && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant={user.isAdmin ? "destructive" : "secondary"}
                                      onClick={() => toggleAdminMutation.mutate({
                                        userId: user.id,
                                        isAdmin: !user.isAdmin
                                      })}
                                      disabled={toggleAdminMutation.isPending}
                                      data-testid={`button-toggle-admin-${user.id}`}
                                    >
                                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                                    </Button>
                                    
                                    {user.id !== currentUser.id && (
                                      <Button
                                        size="sm"
                                        variant={user.isOwner ? "destructive" : "outline"}
                                        onClick={() => toggleOwnerMutation.mutate({
                                          userId: user.id,
                                          isOwner: !user.isOwner
                                        })}
                                        disabled={toggleOwnerMutation.isPending}
                                        data-testid={`button-toggle-owner-${user.id}`}
                                      >
                                        {user.isOwner ? "Remove Owner" : "Make Owner"}
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Point Management */}
            <TabsContent value="points" className="space-y-6">
              <Card className="bg-gray-800/90 border-gray-600" data-testid="card-points-management">
                <CardHeader>
                  <CardTitle className="text-white">Point Management</CardTitle>
                  <p className="text-gray-300">Give, remove, or set points for users</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* User Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="user-select" className="text-gray-300">Select User</Label>
                      <Select 
                        value={selectedUserForPoints?.id || ''} 
                        onValueChange={(userId) => {
                          const user = users.find(u => u.id === userId);
                          setSelectedUserForPoints(user || null);
                        }}
                      >
                        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white" data-testid="select-user-points">
                          <SelectValue placeholder="Choose a user to manage points" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id} className="text-white hover:bg-gray-600">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.photoURL || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.displayName}</span>
                                <span className="text-gray-400">({user.points} points)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedUserForPoints && (
                      <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedUserForPoints.photoURL || undefined} />
                            <AvatarFallback className="text-xs">
                              {selectedUserForPoints.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{selectedUserForPoints.displayName}</p>
                            <p className="text-gray-400 text-sm">Current points: {selectedUserForPoints.points.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Action Selection */}
                        <div className="space-y-2">
                          <Label className="text-gray-300">Action</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={pointAction === 'give' ? 'default' : 'outline'}
                              onClick={() => setPointAction('give')}
                              data-testid="button-action-give"
                            >
                              Give Points
                            </Button>
                            <Button
                              size="sm"
                              variant={pointAction === 'remove' ? 'default' : 'outline'}
                              onClick={() => setPointAction('remove')}
                              data-testid="button-action-remove"
                            >
                              Remove Points
                            </Button>
                            <Button
                              size="sm"
                              variant={pointAction === 'set' ? 'default' : 'outline'}
                              onClick={() => setPointAction('set')}
                              data-testid="button-action-set"
                            >
                              Set Points
                            </Button>
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                          <Label htmlFor="point-amount" className="text-gray-300">
                            {pointAction === 'set' ? 'New Point Balance' : 'Amount'}
                          </Label>
                          <Input
                            id="point-amount"
                            type="number"
                            min="0"
                            value={pointAmount}
                            onChange={(e) => setPointAmount(e.target.value)}
                            placeholder={pointAction === 'set' ? 'Enter new total points' : 'Enter amount'}
                            className="bg-gray-700 border-gray-600 text-white"
                            data-testid="input-point-amount"
                          />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2">
                          <Label htmlFor="point-description" className="text-gray-300">Reason</Label>
                          <Textarea
                            id="point-description"
                            value={pointDescription}
                            onChange={(e) => setPointDescription(e.target.value)}
                            placeholder="Enter reason for point adjustment..."
                            className="bg-gray-700 border-gray-600 text-white"
                            data-testid="textarea-point-description"
                          />
                        </div>

                        {/* Execute Button */}
                        <Button
                          onClick={() => {
                            const amount = parseInt(pointAmount);
                            if (!amount || amount <= 0) {
                              toast({
                                title: "Invalid Amount",
                                description: "Please enter a valid positive number",
                                variant: "destructive",
                              });
                              return;
                            }
                            if (!pointDescription.trim()) {
                              toast({
                                title: "Missing Description",
                                description: "Please provide a reason for this action",
                                variant: "destructive",
                              });
                              return;
                            }

                            const data = {
                              userId: selectedUserForPoints.id,
                              amount,
                              description: pointDescription.trim()
                            };

                            console.log('Point management data being sent:', data);

                            if (pointAction === 'give') {
                              givePointsMutation.mutate(data);
                            } else if (pointAction === 'remove') {
                              removePointsMutation.mutate(data);
                            } else if (pointAction === 'set') {
                              setPointsMutation.mutate(data);
                            }
                          }}
                          disabled={givePointsMutation.isPending || removePointsMutation.isPending || setPointsMutation.isPending}
                          className="w-full"
                          data-testid="button-execute-point-action"
                        >
                          {pointAction === 'give' && 'Give Points'}
                          {pointAction === 'remove' && 'Remove Points'}
                          {pointAction === 'set' && 'Set Points'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Management */}
            <TabsContent value="rewards" className="space-y-6">
              <Card className="bg-gray-800/90 border-gray-600" data-testid="card-rewards-management">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Reward Management</CardTitle>
                  <Dialog open={isCreateRewardOpen} onOpenChange={setIsCreateRewardOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-create-reward">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Reward
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Reward</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateReward} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input name="title" required className="bg-gray-700 border-gray-600" data-testid="input-reward-title" />
                          </div>
                          <div>
                            <Label htmlFor="cost">Cost (Points)</Label>
                            <Input name="cost" type="number" required className="bg-gray-700 border-gray-600" data-testid="input-reward-cost" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea name="description" required className="bg-gray-700 border-gray-600" data-testid="input-reward-description" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="categoryId">Category</Label>
                            <Select name="categoryId">
                              <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-reward-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="">No Category</SelectItem>
                                {adminCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="tier">Tier</Label>
                            <Select name="tier" defaultValue="common">
                              <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-reward-tier">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="common">Common</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="actionType">Action Type</Label>
                            <Select name="actionType" defaultValue="chat_message">
                              <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-action-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="chat_message">Chat Message</SelectItem>
                                <SelectItem value="sound_effect">Sound Effect</SelectItem>
                                <SelectItem value="screen_effect">Screen Effect</SelectItem>
                                <SelectItem value="music_control">Music Control</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="availability">Availability</Label>
                            <Input name="availability" defaultValue="Unlimited" className="bg-gray-700 border-gray-600" data-testid="input-reward-availability" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="actionMessage">Action Message/Config</Label>
                          <Input name="actionMessage" placeholder="Custom message or config" className="bg-gray-700 border-gray-600" data-testid="input-action-message" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch name="isActive" defaultChecked data-testid="switch-reward-active" />
                          <Label htmlFor="isActive">Active</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateRewardOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createRewardMutation.isPending} data-testid="button-submit-reward">
                            {createRewardMutation.isPending ? "Creating..." : "Create Reward"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {rewardsLoading ? (
                    <div className="text-center py-8" data-testid="loading-rewards">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading rewards...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Cost</TableHead>
                          <TableHead className="text-gray-300">Tier</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allRewards.map((reward) => (
                          <TableRow key={reward.id} className="border-gray-600" data-testid={`row-reward-${reward.id}`}>
                            <TableCell>
                              <div>
                                <span className="text-white font-medium" data-testid={`text-reward-title-${reward.id}`}>
                                  {reward.title}
                                </span>
                                <p className="text-gray-400 text-sm" data-testid={`text-reward-description-${reward.id}`}>
                                  {reward.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-white font-mono" data-testid={`text-reward-cost-${reward.id}`}>
                              {reward.cost.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={reward.tier === 'premium' ? 'secondary' : 'outline'}
                                className={reward.tier === 'premium' ? 'bg-yellow-600/50 text-yellow-100' : 'text-gray-400 border-gray-500'}
                                data-testid={`badge-reward-tier-${reward.id}`}
                              >
                                {reward.tier}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={reward.isActive ? 'default' : 'secondary'}
                                className={reward.isActive ? 'bg-green-600/50 text-green-100' : 'bg-gray-600/50 text-gray-300'}
                                data-testid={`badge-reward-status-${reward.id}`}
                              >
                                {reward.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" data-testid={`button-edit-reward-${reward.id}`}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteRewardMutation.mutate(reward.id)}
                                  disabled={deleteRewardMutation.isPending}
                                  data-testid={`button-delete-reward-${reward.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Management */}
            <TabsContent value="categories" className="space-y-6">
              <Card className="bg-gray-800/90 border-gray-600" data-testid="card-categories-management">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Category Management</CardTitle>
                  <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-create-category">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-600 text-white">
                      <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input name="name" required className="bg-gray-700 border-gray-600" data-testid="input-category-name" />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea name="description" className="bg-gray-700 border-gray-600" data-testid="input-category-description" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="icon">Icon (Lucide name)</Label>
                            <Input name="icon" defaultValue="tag" className="bg-gray-700 border-gray-600" data-testid="input-category-icon" />
                          </div>
                          <div>
                            <Label htmlFor="color">Color (Hex)</Label>
                            <Input name="color" defaultValue="#8b5cf6" className="bg-gray-700 border-gray-600" data-testid="input-category-color" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="sortOrder">Sort Order</Label>
                          <Input name="sortOrder" type="number" defaultValue="0" className="bg-gray-700 border-gray-600" data-testid="input-category-sort" />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-submit-category">
                            {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="text-center py-8" data-testid="loading-categories">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading categories...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">Name</TableHead>
                          <TableHead className="text-gray-300">Description</TableHead>
                          <TableHead className="text-gray-300">Icon</TableHead>
                          <TableHead className="text-gray-300">Color</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminCategories.map((category) => (
                          <TableRow key={category.id} className="border-gray-600" data-testid={`row-category-${category.id}`}>
                            <TableCell className="text-white font-medium" data-testid={`text-category-name-${category.id}`}>
                              {category.name}
                            </TableCell>
                            <TableCell className="text-gray-300" data-testid={`text-category-description-${category.id}`}>
                              {category.description || 'No description'}
                            </TableCell>
                            <TableCell className="text-gray-300" data-testid={`text-category-icon-${category.id}`}>
                              {category.icon}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                  data-testid={`color-category-${category.id}`}
                                />
                                <span className="text-gray-300 font-mono text-sm">{category.color}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" data-testid={`button-edit-category-${category.id}`}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                                  disabled={deleteCategoryMutation.isPending}
                                  data-testid={`button-delete-category-${category.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800/90 border-gray-600" data-testid="card-stat-users">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-300">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white" data-testid="text-stat-total-users">
                      {users.length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/90 border-gray-600" data-testid="card-stat-rewards">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-300">Total Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white" data-testid="text-stat-total-rewards">
                      {allRewards.length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/90 border-gray-600" data-testid="card-stat-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-300">Premium Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white" data-testid="text-stat-premium-users">
                      {users.filter(u => u.isPremium).length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/90 border-gray-600" data-testid="card-stat-categories">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-300">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white" data-testid="text-stat-total-categories">
                      {adminCategories.length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}