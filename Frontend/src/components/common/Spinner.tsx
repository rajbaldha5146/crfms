import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-10000 animate-in fade-in duration-300">
      <div className="flex flex-col items-center">
        {/* Modern Gradient Ring Spinner */}
        <div className="spinner-gradient"></div>

        <div className="mt-8 text-center">
          <p className="text-white font-bold tracking-[0.2em] uppercase text-[11px] opacity-90">
            Please Wait
          </p>
          <div className="flex gap-1.5 justify-center mt-2.5">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
