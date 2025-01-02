import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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
    <div>
      <h1>Notifications</h1>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            <strong>{notification.title}:</strong> {notification.body}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationSystem;
