import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Notifications() {
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      trpc.useUtils().notifications.list.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      trpc.useUtils().notifications.list.invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification: any) => (
            <Card
              key={notification.id}
              className={`${!notification.isRead ? "border-primary/50 bg-primary/5" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {notification.type === "critical_vulnerability" ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {notification.message}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
