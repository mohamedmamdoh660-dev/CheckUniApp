"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  notificationsService,
  NotificationItem,
} from "@/modules/zoho-applications/services/zoho-notifications-service";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { markNotificationsAsRead } from "@/supabase/actions/db-actions";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "../ui/avatar";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "sonner";

export default function NotificationsMenu() {
  const { userProfile } = useAuth();
  const agentId = userProfile?.id;
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const router = useRouter();
  const [markRead, setMarkRead] = useState<{ id: string; loading: boolean }[]>(
    []
  );

  const unreadCount = useMemo(
    () => items.filter((i) => !i.is_read).length,
    [items]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rows = await notificationsService.listByUser(
          agentId,
          100,
          0,
          false
        );
        setItems(rows);
      } finally {
        setLoading(false);
      }
    };
    if (agentId) load();
  }, [agentId]);

  // Realtime updates for notifications
  useEffect(() => {
    if (!agentId) return;
    const channel = supabaseClient
      .channel(`rt-notifs-${agentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zoho_notifications" },
        (payload: any) => {
          const row: any = payload.new || payload.record;
          if (!row) return;
          const belongsToUser =
            row.agent_id === agentId || row.user_id === agentId;
          if (!belongsToUser) return;

          if (payload.eventType === "INSERT") {
            setItems((prev) => [row, ...prev.filter((i) => i.id !== row.id)]);
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) =>
              prev.map((i) => (i.id === row.id ? { ...i, ...row } : i))
            );
          } else if (payload.eventType === "DELETE") {
            setItems((prev) =>
              prev.filter((i) => i.id !== (payload.old?.id || row.id))
            );
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabaseClient.removeChannel(channel);
      } catch {}
    };
  }, []);

  const markAllRead = async () => {
    if (!agentId || unreadCount === 0) return;
    try {
      setMarking(true);
      await markNotificationsAsRead(agentId);
      setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    } finally {
      setMarking(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] h-4 min-w-4 px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-100 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span>Notifications</span>

            {unreadCount > 0 && (
              <Badge variant={unreadCount > 0 ? "default" : "outline"}>
                {unreadCount} unread
              </Badge>
            )}
          </div>

          {unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={marking}
            >
              {marking ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Mark read
            </Button>
          ) : (
            <Badge variant={unreadCount > 0 ? "default" : "outline"}>
              {unreadCount} unread
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-0" />
        <div className="max-h-96 overflow-auto">
          {loading ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`px-3 py-2 border-b cursor-pointer last:border-b-0 ${n.is_read ? "bg-background hover:bg-muted" : "bg-primary/5 hover:bg-primary/10"}`}
                onClick={() => {
                  router.push(`/${n.module_name}/${n.module_id}`);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <Avatar>
                        <AvatarImage src={generateNameAvatar(n.module_name)} />
                      </Avatar>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{n.title}</div>
                      {n.content ? (
                        <div className="text-sm text-muted-foreground truncate">
                          {n.content}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {!n.is_read && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              markRead.find((i) => i.id === n.id)?.loading
                            }
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                setMarkRead((prev) => [
                                  ...prev,
                                  { id: n.id, loading: true },
                                ]);
                                await notificationsService.markOneRead(n.id);
                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.id === n.id ? { ...i, is_read: true } : i
                                  )
                                );
                                toast.success("Marked as read");
                              } catch {
                                toast.error("Failed to mark as read");
                              } finally {
                                setMarkRead((prev) =>
                                  prev.filter((i) => i.id !== n.id)
                                );
                              }
                            }}
                          >
                            {markRead.find((i) => i.id === n.id)?.loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 " />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as read</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
