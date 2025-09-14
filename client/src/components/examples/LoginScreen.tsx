import LoginScreen from '../LoginScreen';

export default function LoginScreenExample() {
  const handleGoogleSignIn = () => {
    console.log('Mock Google sign in triggered');
  };

  return (
    <div>
      <LoginScreen onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
}