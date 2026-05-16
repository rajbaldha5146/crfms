import { useRealtimeNotificationStore } from "../../../store/useRealtimeNotificationStore";

import RealtimeNotificationCard from "./RealtimeNotificationCard";

const RealtimeNotificationContainer = () => {
  const { notifications, removeNotification } = useRealtimeNotificationStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="
            fixed bottom-5 right-5
            z-9999
            flex flex-col gap-3
          "
    >
      {notifications.map((notification) => (
        <RealtimeNotificationCard
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default RealtimeNotificationContainer;
