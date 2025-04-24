import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isLogin
                ? 'bg-emerald-800 text-amber-100'
                : 'text-emerald-800 hover:text-emerald-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              !isLogin
                ? 'bg-emerald-800 text-amber-100'
                : 'text-emerald-800 hover:text-emerald-900'
            }`}
          >
            Sign Up
          </button>
        </div>
        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
} 