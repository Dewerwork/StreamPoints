import TransactionHistory from '../TransactionHistory';

export default function TransactionHistoryExample() {
  // todo: remove mock functionality
  const mockTransactions = [
    {
      id: "1",
      amount: 500,
      type: "earned" as const,
      description: "Watched stream for 30 minutes",
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: "2", 
      amount: -250,
      type: "spent" as const,
      description: "Redeemed Sound Effect reward",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: "3",
      amount: 1000,
      type: "admin_added" as const,
      description: "Bonus points for participating in event",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: "4",
      amount: 200,
      type: "transfer" as const,
      description: "Received points from StreamerBuddy123",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: "5",
      amount: -100,
      type: "spent" as const,
      description: "Redeemed Chat Message highlight",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    },
    {
      id: "6",
      amount: 750,
      type: "earned" as const,
      description: "Weekly loyalty bonus",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Transaction History - With Data</h3>
        <TransactionHistory transactions={mockTransactions} />
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-semibold">Transaction History - Empty State</h3>
        <TransactionHistory transactions={[]} />
      </div>
    </div>
  );
}