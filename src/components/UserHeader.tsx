import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Coins, LogOut } from 'lucide-react';

const UserHeader: React.FC = () => {
  const { user, credits, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="glass-panel rounded-lg px-3 py-1.5 flex items-center gap-2">
        <Coins className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {credits !== null ? credits : '...'} credits
        </span>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
      <Button variant="ghost" size="iconSm" onClick={signOut} title="Sign out">
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserHeader;
