import RewardCard from '../RewardCard';

export default function RewardCardExample() {
  // todo: remove mock functionality
  const mockRewards = [
    {
      id: "1",
      title: "Chat Message",
      description: "Display a custom message in chat for 30 seconds",
      cost: 100,
      isActive: true,
      actionType: "chat_message",
      userPoints: 1500
    },
    {
      id: "2", 
      title: "Sound Effect",
      description: "Play your favorite sound effect on stream",
      cost: 250,
      isActive: true,
      actionType: "sound_effect",
      userPoints: 1500
    },
    {
      id: "3",
      title: "Screen Effect",
      description: "Trigger a cool visual effect on the streamer's screen",
      cost: 500,
      isActive: true,
      actionType: "screen_effect",
      userPoints: 1500
    },
    {
      id: "4",
      title: "Premium Highlight",
      description: "Highlight your next message with premium styling",
      cost: 750,
      isActive: false,
      actionType: "custom",
      userPoints: 1500
    },
    {
      id: "5",
      title: "Expensive Reward",
      description: "A reward that costs more than user has",
      cost: 2000,
      isActive: true,
      actionType: "custom",
      userPoints: 1500
    }
  ];

  const handleRedeem = (rewardId: string) => {
    console.log(`Mock redeem triggered for reward: ${rewardId}`);
  };

  return (
    <div className="p-6">
      <h3 className="mb-6 text-lg font-semibold">Reward Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRewards.map((reward) => (
          <RewardCard
            key={reward.id}
            id={reward.id}
            title={reward.title}
            description={reward.description}
            cost={reward.cost}
            isActive={reward.isActive}
            actionType={reward.actionType}
            userPoints={reward.userPoints}
            onRedeem={handleRedeem}
          />
        ))}
      </div>
    </div>
  );
}