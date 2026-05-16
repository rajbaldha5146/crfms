/* eslint-disable react-hooks/purity */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Dynamic duration based on toast type (e.g., 8000ms for info, 5000ms for others)
  const duration = type === "info" ? 8000 : 4000;

  const timerRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  // 2. Initialize remainingTimeRef with the dynamic duration
  const remainingTimeRef = useRef<number>(duration);

  const config = {
    success: {
      icon: <CheckCircle2 size={18} strokeWidth={2.5} />,
      iconBg: "bg-emerald-100/80 text-emerald-600",
      bar: "bg-emerald-500",
      border: "border-emerald-200/60",
      glow: "shadow-emerald-500/10",
    },
    error: {
      icon: <AlertCircle size={18} strokeWidth={2.5} />,
      iconBg: "bg-rose-100/80 text-rose-600",
      bar: "bg-rose-500",
      border: "border-rose-200/60",
      glow: "shadow-rose-500/10",
    },
    info: {
      icon: <Info size={18} strokeWidth={2.5} />,
      iconBg: "bg-blue-100/80 text-blue-600",
      bar: "bg-blue-500",
      border: "border-blue-200/60",
      glow: "shadow-blue-500/10",
    },
  };

  // 3. Added duration as a dependency to ensure accuracy
  const startProgress = useCallback(() => {
    const startTime = Date.now();
    const startRemaining = remainingTimeRef.current;

    progressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newRemaining = startRemaining - elapsed;
      const pct = Math.max(0, (newRemaining / duration) * 100);
      setProgress(pct);
    }, 16);
  }, [duration]);

  const stopProgress = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const closeToast = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match duration-300
  }, [onClose]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    startProgress();
    timerRef.current = window.setTimeout(() => {
      closeToast();
    }, remainingTimeRef.current);
  }, [closeToast, startProgress]);

  useEffect(() => {
    // Small delay to ensure the enter animation triggers
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPaused) startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopProgress();
    };
  }, [isPaused, startTimer, stopProgress]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    stopProgress();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current -= elapsed;
    }
  };

  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        fixed top-3 right-3 z-9999
        w-95 max-w-[calc(100vw-48px)]
        bg-white rounded-2xl border
        ${config[type].border}
        ${config[type].glow}
        /* Custom Layered Shadow for White BG */
        shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04),0_20px_25px_-5px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]
        overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }
      `}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon Container */}
        <div className={`
          w-10 h-10 rounded-xl
          flex items-center justify-center
          shrink-0
          ${config[type].iconBg}
        `}>
          {config[type].icon}
        </div>

        {/* Text Content */}
        <div className="flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-slate-900 capitalize tracking-tight">
              {type}
            </h3>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              System
            </span>
          </div>
          <p className="text-[13px] font-medium leading-relaxed text-slate-500 mt-0.5">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={closeToast}
          className="
            -mr-1 w-8 h-8 rounded-lg
            flex items-center justify-center
            text-slate-400 hover:text-slate-900
            hover:bg-slate-50 active:scale-95
            transition-all duration-200
          "
        >
          <X size={16} />
        </button>
      </div>

      {/* Modern Thinner Progress Bar */}
      <div className="h-0.5 bg-slate-50/50">
        <div
          className={`h-full ${config[type].bar} transition-none`}
          style={{ 
            width: `${progress}%`,
            /* Add a small glow to the progress bar end */
            boxShadow: `0 0 8px ${config[type].bar}` 
          }}
        />
      </div>
    </div>
  );
};

export default Toast;