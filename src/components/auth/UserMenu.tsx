import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/utils';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user || !profile) {
    return null;
  }

  const displayName = profile.username || profile.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-full transition-all",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isOpen && "bg-gray-100 dark:bg-gray-800"
        )}
      >
        <Avatar className="h-8 w-8">
          {profile.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={displayName} />
          )}
          <AvatarFallback className="bg-accent-orange text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
          {displayName}
        </span>
        <FiChevronDown className={cn(
          "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-56 rounded-lg shadow-lg",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "z-50 overflow-hidden"
        )}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={displayName} />
                )}
                <AvatarFallback className="bg-accent-orange text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // Future: Navigate to profile page
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "rounded-md transition-colors"
              )}
            >
              <FiUser className="h-4 w-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm",
                "text-red-600 dark:text-red-400",
                "hover:bg-red-50 dark:hover:bg-red-900/20",
                "rounded-md transition-colors"
              )}
            >
              <FiLogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

