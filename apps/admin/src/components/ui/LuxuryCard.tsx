"use client";

import React from "react";

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function LuxuryCard({ 
  children, 
  className = "", 
  padding = "md" 
}: LuxuryCardProps) {
  const paddingMap = {
    none: "p-0",
    sm: "p-4",
    md: "p-8",
    lg: "p-10",
  };

  return (
    <div className={`
      bg-white 
      border border-[#EEEBE6] 
      luxury-shadow 
      transition-all duration-300
      ${paddingMap[padding]}
      ${className}
    `.trim()}>
      {children}
    </div>
  );
}
