import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'signin' | 'signup';
}

export function AuthDialog({ open, onOpenChange, initialTab = 'signin' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signIn, signUp } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSuccess(false);
  };

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      if (activeTab === 'signin') {
        const { error: signInError } = await signIn({ email, password });
        if (signInError) {
          setError(signInError.message || 'Failed to sign in. Please check your credentials.');
        } else {
          setSuccess(true);
          setTimeout(() => {
            onOpenChange(false);
            resetForm();
          }, 1000);
        }
      } else {
        const { error: signUpError } = await signUp({ email, password, username: username || undefined });
        if (signUpError) {
          setError(signUpError.message || 'Failed to sign up. Please try again.');
        } else {
          setSuccess(true);
          setTimeout(() => {
            onOpenChange(false);
            resetForm();
          }, 1000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Music App</DialogTitle>
          <DialogDescription>
            {activeTab === 'signin'
              ? 'Sign in to your account to like tracks and save your preferences.'
              : 'Create a new account to get started.'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-medium transition-colors border-b-2",
              activeTab === 'signin'
                ? "border-accent-orange text-accent-orange"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-medium transition-colors border-b-2",
              activeTab === 'signup'
                ? "border-accent-orange text-accent-orange"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username (optional)
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full"
            />
            {activeTab === 'signup' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">
                {activeTab === 'signin' ? 'Signed in successfully!' : 'Account created successfully!'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password || (activeTab === 'signup' && password.length < 6)}
            className="w-full"
          >
            {loading ? 'Please wait...' : activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

