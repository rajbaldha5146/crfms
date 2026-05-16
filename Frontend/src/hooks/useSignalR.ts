import { useEffect } from "react";
import signalRService from "../services/signalrService";
import { useNotificationStore } from "../store/useNotificationStore";
import { useRealtimeNotificationStore } from "../store/useRealtimeNotificationStore";

export const useSignalR = () => {
  const { addNotification } = useNotificationStore();

  const { addNotification: addRealtimeNotification } =
    useRealtimeNotificationStore();

  useEffect(() => {
    console.log("Initializing SignalR...");

    const initialize = async () => {
      try {
        // Start Connection

        await signalRService.startConnection();

        // Receive Event

        signalRService.onReceiveNotification((notification) => {
          console.log("Realtime notification received", notification);

          // Dropdown Notification Store

          addNotification(notification);

          // Floating Popup Notification

          addRealtimeNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            feedbackId: notification.feedbackId,
            createdAt: notification.createdAt,
          });
        });
      } catch (error) {
        console.error("SignalR initialization failed", error);
      }
    };

    initialize();

    // IMPORTANT:
    // No cleanup for app-level SignalR

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};