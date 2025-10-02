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

export default function NotificationsMenu() {
  const { userProfile } = useAuth();
  const agentId = userProfile?.id;
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

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
          20,
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
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? "default" : "outline"}>
              {unreadCount} unread
            </Badge>
            {unreadCount > 0 && (
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
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
                className={`px-3 py-2 border-b last:border-b-0 ${n.is_read ? "bg-background" : "bg-primary/5"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {n.module_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{n.title}</div>
                      {n.content ? (
                        <div className="text-sm text-muted-foreground truncate">
                          {n.content}
                        </div>
                      ) : null}
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {n.module_name}
                      </div>
                    </div>
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
