import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Gift, History, Settings } from "lucide-react";
import UserProfile from "./UserProfile";
import RewardCard from "./RewardCard";
import TransactionHistory from "./TransactionHistory";
import AdminRewardForm from "./AdminRewardForm";
import ThemeToggle from "./ThemeToggle";

interface DashboardProps {
  user: {
    id: string;
    displayName: string;
    email: string;
    points: number;
    isAdmin: boolean;
    photoURL?: string;
  };
  onSignOut: () => void;
}

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("rewards");
  
  // todo: remove mock functionality
  const mockRewards = [
    {
      id: "1",
      title: "Chat Message Highlight",
      description: "Highlight your next message in chat with special colors",
      cost: 100,
      isActive: true,
      actionType: "chat_message"
    },
    {
      id: "2",
      title: "Sound Effect",
      description: "Play your favorite sound effect on stream",
      cost: 250,
      isActive: true,
      actionType: "sound_effect"
    },
    {
      id: "3",
      title: "Screen Effect",
      description: "Trigger a cool visual effect on the streamer's screen",
      cost: 500,
      isActive: true,
      actionType: "screen_effect"
    },
    {
      id: "4",
      title: "Custom Emote",
      description: "Unlock a custom emote for 24 hours",
      cost: 750,
      isActive: false,
      actionType: "custom"
    }
  ];

  const mockTransactions = [
    {
      id: "1",
      amount: 500,
      type: "earned" as const,
      description: "Watched stream for 30 minutes",
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: "2",
      amount: -250,
      type: "spent" as const,
      description: "Redeemed Sound Effect reward",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: "3",
      amount: 1000,
      type: "admin_added" as const,
      description: "Bonus points for participating in event",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
  ];

  const handleRedeemReward = (rewardId: string) => {
    console.log(`Redeeming reward with ID: ${rewardId}`);
  };

  const handleCreateReward = (rewardData: any) => {
    console.log('Creating new reward:', rewardData);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">StreamPoints</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" data-testid="button-help">
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile Sidebar */}
          <div className="lg:col-span-1">
            <UserProfile user={user} onSignOut={onSignOut} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3" data-testid="tabs-navigation">
                <TabsTrigger value="rewards" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Rewards
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
                {user.isAdmin && (
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="rewards" className="mt-6" data-testid="tab-rewards">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Available Rewards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {mockRewards.map((reward) => (
                        <RewardCard
                          key={reward.id}
                          id={reward.id}
                          title={reward.title}
                          description={reward.description}
                          cost={reward.cost}
                          isActive={reward.isActive}
                          actionType={reward.actionType}
                          userPoints={user.points}
                          onRedeem={handleRedeemReward}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6" data-testid="tab-history">
                <TransactionHistory transactions={mockTransactions} />
              </TabsContent>

              {user.isAdmin && (
                <TabsContent value="admin" className="mt-6" data-testid="tab-admin">
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Admin Panel</h2>
                    <AdminRewardForm onSubmit={handleCreateReward} />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}