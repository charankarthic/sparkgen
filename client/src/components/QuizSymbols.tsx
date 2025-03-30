import React from 'react';
import { cn } from "@/lib/utils";

interface QuizSymbolProps {
  className?: string;
}

export function QuizSymbols({ className }: QuizSymbolProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Math symbols */}
      <div className="absolute text-blue-500 text-2xl animate-float top-10 left-[10%]">∑</div>
      <div className="absolute text-green-500 text-2xl animate-float delay-300 top-20 right-[15%]">π</div>
      <div className="absolute text-red-500 text-2xl animate-float delay-100 bottom-10 left-[20%]">÷</div>
      <div className="absolute text-yellow-500 text-2xl animate-float delay-200 bottom-20 right-[25%]">√</div>

      {/* Code symbols */}
      <div className="absolute text-purple-500 text-2xl animate-float delay-150 top-[25%] left-[8%]">&lt;/&gt;</div>
      <div className="absolute text-teal-500 text-2xl animate-float delay-250 top-[30%] right-[12%]">{ }</div>

      {/* Science symbols */}
      <div className="absolute text-indigo-500 text-2xl animate-float delay-50 bottom-[35%] left-[18%]">⚛</div>
      <div className="absolute text-amber-500 text-2xl animate-float delay-350 bottom-[28%] right-[22%]">🧪</div>

      {/* Grammar and language symbols */}
      <div className="absolute text-rose-500 text-2xl animate-float delay-175 top-[40%] left-[25%]">"</div>
      <div className="absolute text-emerald-500 text-2xl animate-float delay-225 top-[50%] right-[15%]">!</div>
      <div className="absolute text-cyan-500 text-2xl animate-float delay-275 bottom-[45%] left-[12%]">?</div>

      {/* Additional decorative elements */}
      <div className="absolute bg-blue-500/20 h-16 w-16 rounded-full blur-xl animate-pulse-slow top-[15%] left-[30%]"></div>
      <div className="absolute bg-purple-500/20 h-24 w-24 rounded-full blur-xl animate-pulse-slow delay-100 bottom-[20%] right-[10%]"></div>
      <div className="absolute bg-amber-500/20 h-20 w-20 rounded-full blur-xl animate-pulse-slow delay-200 top-[60%] right-[35%]"></div>
      <div className="absolute bg-emerald-500/20 h-28 w-28 rounded-full blur-xl animate-pulse-slow delay-300 bottom-[10%] left-[5%]"></div>
    </div>
  );
}