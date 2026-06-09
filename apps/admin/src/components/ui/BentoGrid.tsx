"use client";

import React from "react";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-12 gap-6 ${className}`}>
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  cols?: number;
  mdCols?: number;
  lgCols?: number;
  className?: string;
}

export function BentoItem({ 
  children, 
  cols = 12, 
  mdCols, 
  lgCols,
  className = "" 
}: BentoItemProps) {
  const colSpan = `col-span-${cols}`;
  const mdSpan = mdCols ? `md:col-span-${mdCols}` : "";
  const lgSpan = lgCols ? `lg:col-span-${lgCols}` : "";

  return (
    <div className={`${colSpan} ${mdSpan} ${lgSpan} ${className}`}>
      {children}
    </div>
  );
}
