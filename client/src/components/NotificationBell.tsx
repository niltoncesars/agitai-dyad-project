import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface NotificationBellProps {
  onOpenCenter?: () => void;
}

export function NotificationBell({ onOpenCenter }: NotificationBellProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get unread notification count
  const { data: countData, refetch } = trpc.notifications.getUnreadCount.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 } // Refetch every 30 seconds
  );

  useEffect(() => {
    if (countData?.count) {
      setUnreadCount(countData.count);
    }
  }, [countData]);

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onOpenCenter}
      className="relative hover:bg-muted"
      title="Notificações"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
          variant="default"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
