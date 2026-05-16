import { Bell, CheckCircle2, AlertTriangle, X } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import type { RealtimeNotification } from "../../../store/useRealtimeNotificationStore";

interface Props {
  notification: RealtimeNotification;

  onClose: (id: number) => void;
}

const RealtimeNotificationCard = ({ notification, onClose }: Props) => {
  const navigate = useNavigate();

  // =========================
  // Timer
  // =========================

  const duration = notification.type === "HierarchyWarning" ? 10000 : 7000;

  const [progress, setProgress] = useState(100);

  // =========================
  // Auto Close
  // =========================

  useEffect(() => {
    const start = Date.now();

    // Progress Animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;

      const percent = Math.max(0, 100 - (elapsed / duration) * 100);

      setProgress(percent);
    }, 16);

    // Close

    const timer = setTimeout(() => {
      onClose(notification.id);
    }, duration);

    return () => {
      clearTimeout(timer);

      clearInterval(interval);
    };
  }, [notification.id, onClose]);

  // =========================
  // Click
  // =========================

  const handleClick = () => {
    if (notification.feedbackId) {
      navigate(`/feedbacks/${notification.feedbackId}`);
    }

    onClose(notification.id);
  };

  // =========================
  // Type Config
  // =========================

  const isResolved = notification.type === "FeedbackResolved";

  const isHierarchyWarning = notification.type === "HierarchyWarning";

  // =========================
  // UI Config
  // =========================

  const icon = isHierarchyWarning ? (
    <AlertTriangle size={20} />
  ) : isResolved ? (
    <CheckCircle2 size={20} />
  ) : (
    <Bell size={20} />
  );

  const iconStyle = isHierarchyWarning
    ? "bg-amber-50 text-amber-600"
    : isResolved
    ? "bg-emerald-50 text-emerald-600"
    : "bg-blue-50 text-blue-600";

  const barStyle = isHierarchyWarning
    ? "bg-amber-500"
    : isResolved
    ? "bg-emerald-500"
    : "bg-blue-500";

  return (
    <div
      className="
        w-90
        bg-white
        rounded-2xl
        border border-slate-200
        shadow-2xl
        overflow-hidden
        animate-in
        slide-in-from-right-5
        fade-in
        duration-300
      "
    >
      {/* Top */}

      <div
        onClick={handleClick}
        className="
          p-4
          cursor-pointer
          hover:bg-slate-50
          transition-colors
        "
      >
        <div className="flex items-start gap-3">
          {/* Icon */}

          <div
            className={`
              w-11 h-11
              rounded-xl
              flex items-center justify-center
              shrink-0
              ${iconStyle}
            `}
          >
            {icon}
          </div>

          {/* Content */}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {notification.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1">Just now</p>
              </div>

              {/* Close */}

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onClose(notification.id);
                }}
                className="
                  p-1 rounded-md
                  hover:bg-slate-100
                  text-slate-400
                  hover:text-slate-600
                  transition-colors
                "
              >
                <X size={15} />
              </button>
            </div>

            {/* Message */}

            <p className="text-sm text-slate-600 leading-relaxed mt-2">
              {notification.message}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}

      <div className="h-1 bg-slate-100">
        <div
          className={`
            h-full
            transition-none
            ${barStyle}
          `}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};

export default RealtimeNotificationCard;
