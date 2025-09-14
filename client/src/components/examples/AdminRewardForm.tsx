import AdminRewardForm from '../AdminRewardForm';

export default function AdminRewardFormExample() {
  const handleSubmit = (rewardData: any) => {
    console.log('Mock reward submission:', rewardData);
  };

  // todo: remove mock functionality
  const existingReward = {
    title: "Chat Highlight",
    description: "Highlight your message in chat with special colors",
    cost: 300,
    isActive: true,
    actionType: "chat_message",
    actionConfig: { duration: 30 }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Create New Reward Form</h3>
        <AdminRewardForm onSubmit={handleSubmit} />
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-semibold">Edit Existing Reward Form</h3>
        <AdminRewardForm 
          onSubmit={handleSubmit} 
          initialData={existingReward}
          isEditing={true}
        />
      </div>
    </div>
  );
}