import UserProfile from '../UserProfile';

export default function UserProfileExample() {
  // todo: remove mock functionality
  const mockUser = {
    id: "1",
    displayName: "Alex Streamer",
    email: "alex@example.com",
    points: 2750,
    isAdmin: false,
    photoURL: undefined // Will show initials
  };

  const mockAdminUser = {
    id: "2", 
    displayName: "Stream Admin",
    email: "admin@streamchannel.com",
    points: 50000,
    isAdmin: true,
    photoURL: undefined
  };

  const handleSignOut = () => {
    console.log('Mock sign out triggered');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Regular User Profile</h3>
        <div className="max-w-md">
          <UserProfile user={mockUser} onSignOut={handleSignOut} />
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-semibold">Admin User Profile</h3>
        <div className="max-w-md">
          <UserProfile user={mockAdminUser} onSignOut={handleSignOut} />
        </div>
      </div>
    </div>
  );
}