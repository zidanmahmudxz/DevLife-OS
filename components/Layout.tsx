import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/* ===============================
   PREMIUM BALANCED SVG ICON SET
=================================*/

const iconSize = 26;
const strokeW = 1.8;

const Icons = {

  Dashboard: ({ active }: { active: boolean }) => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="13" width="7" height="8" rx="2"
        fill={active ? "url(#grad-blue-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#3b82f6" : "currentColor"}
        strokeWidth={strokeW}
      />
      <rect x="14" y="3" width="7" height="10" rx="2"
        fill={active ? "url(#grad-blue-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#3b82f6" : "currentColor"}
        strokeWidth={strokeW}
      />
      <rect x="14" y="17" width="7" height="4" rx="2"
        fill={active ? "url(#grad-blue-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#3b82f6" : "currentColor"}
        strokeWidth={strokeW}
      />
      <rect x="3" y="3" width="7" height="6" rx="2"
        fill={active ? "url(#grad-blue-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#3b82f6" : "currentColor"}
        strokeWidth={strokeW}
      />
      <defs>
        <linearGradient id="grad-blue-1" x1="3" y1="3" x2="21" y2="21">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  ),

  Projects: ({ active }: { active: boolean }) => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      <path d="M2 11V7C2 5.9 2.9 5 4 5H7.5L10.5 8H20C21.1 8 22 8.9 22 10V11"
        stroke={active ? "#6366f1" : "currentColor"}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path d="M2 11H22V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V11Z"
        fill={active ? "url(#grad-indigo-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#6366f1" : "currentColor"}
        strokeWidth={strokeW}
      />
      <defs>
        <linearGradient id="grad-indigo-1" x1="2" y1="11" x2="22" y2="19">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  ),

  Finance: ({ active }: { active: boolean }) => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill={active ? "url(#grad-emerald-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#10b981" : "currentColor"}
        strokeWidth={strokeW}
      />
      <path d="M12 7V17"
        stroke={active ? "#ecfdf5" : "currentColor"}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path d="M12 7C10.5 7 9 8.5 9 10C9 11.5 10.5 13 12 13"
        stroke={active ? "#ecfdf5" : "currentColor"}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path d="M12 13L15 17"
        stroke={active ? "#ecfdf5" : "currentColor"}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path d="M10 7H14"
        stroke={active ? "#ecfdf5" : "currentColor"}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="grad-emerald-1" x1="3" y1="3" x2="21" y2="21">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  ),

  Tasks: ({ active }: { active: boolean }) => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="4"
        stroke={active ? "#8b5cf6" : "currentColor"}
        strokeWidth={strokeW}
      />
      <path d="M8 13L11 16L16 10"
        stroke={active ? "#8b5cf6" : "currentColor"}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
    </svg>
  ),

  Vault: ({ active }: { active: boolean }) => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="10" width="14" height="10" rx="3"
        fill={active ? "url(#grad-amber-1)" : "currentColor"}
        fillOpacity={active ? "1" : "0.12"}
        stroke={active ? "#f59e0b" : "currentColor"}
        strokeWidth={strokeW}
      />
      <path d="M7 10V7C7 4.5 9.5 2 12 2C14.5 2 17 4.5 17 7V10"
        stroke={active ? "#f59e0b" : "currentColor"}
        strokeWidth={strokeW}
      />
      <defs>
        <linearGradient id="grad-amber-1" x1="5" y1="10" x2="19" y2="20">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  )

};
