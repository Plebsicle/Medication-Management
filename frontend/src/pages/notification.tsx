import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<{ title: string; body: string }[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8001");
    setSocket(newSocket);

    let token = localStorage.getItem("jwt"); 

    if (token) {
      token = token.replace(/^"|"$/g, ''); 
      newSocket.emit("authenticate", token);
    }


    newSocket.on("notification", (notification : any) => {
      setNotifications((prev) => [...prev, notification]);
      if (Notification.permission === "granted") {
        new Notification(notification.title, { body: notification.body });
      }
    });

    newSocket.on("error", (error: string) => {
      console.error("Socket error:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          alert("Please enable notifications to receive medication reminders.");
        }
      });
    }
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.map((notification, index) => (
                  <li key={index} className="p-3 border rounded-md hover:bg-muted/50">
                    <strong>{notification.title}:</strong> {notification.body}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No notifications yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationSystem;
