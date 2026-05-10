import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isPaused, setIsPaused] = useState(false);
  const duration = 4000;
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  const config = {
    success: {
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
      border: "border-emerald-500/30",
      bg: "bg-slate-900",
      text: "text-white",
    },
    error: {
      icon: <AlertCircle size={20} className="text-rose-400" />,
      border: "border-rose-500/30",
      bg: "bg-slate-900",
      text: "text-white",
    },
    info: {
      icon: <Info size={20} className="text-sky-400" />,
      border: "border-sky-500/30",
      bg: "bg-slate-900",
      text: "text-white",
    },
  };

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onClose();
    }, remainingTimeRef.current);
  }, [onClose]);

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, startTimer]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current -= elapsed;
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed top-6 right-6 min-w-[340px] ${config[type].bg} ${config[type].border} border p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform hover:translate-y-[-2px] z-9999 animate-in fade-in slide-in-from-right-8`}
    >
      <div className="shrink-0">
        {config[type].icon}
      </div>

      <div className="grow">
        <p className={`text-sm font-medium ${config[type].text} leading-tight`}>
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
