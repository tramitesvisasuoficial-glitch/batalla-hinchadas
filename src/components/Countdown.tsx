"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  startsAt: Date;
  endsAt: Date | null;
  onStatusChange?: (status: "before" | "active" | "ended") => void;
}

export default function Countdown({ startsAt, endsAt, onStatusChange }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ label: string; text: string }>({ label: "", text: "" });
  const [status, setStatus] = useState<"before" | "active" | "ended">("before");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      
      if (now < startsAt) {
        if (status !== "before") {
          setStatus("before");
          onStatusChange?.("before");
        }
        return { label: "COMIENZA EN", text: formatTime(startsAt.getTime() - now.getTime()) };
      }
      
      if (endsAt && now >= endsAt) {
        if (status !== "ended") {
          setStatus("ended");
          onStatusChange?.("ended");
        }
        return { label: "", text: "BATALLA FINALIZADA" };
      }
      
      if (status !== "active") {
        setStatus("active");
        onStatusChange?.("active");
      }
      
      if (endsAt) {
        return { label: "TERMINA EN", text: formatTime(endsAt.getTime() - now.getTime()) };
      } else {
        return { label: "", text: "Batalla sin límite de tiempo definido." };
      }
    };

    const formatTime = (ms: number) => {
      if (ms <= 0) return "00:00:00";
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    // Initial calculate
    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [startsAt, endsAt, status, onStatusChange]);

  if (status === "ended") {
    return <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ef4444", margin: "16px 0", textAlign: "center" }}>{timeLeft.text}</div>;
  }

  return (
    <div style={{ textAlign: "center", marginBottom: "16px", color: "#e2e8f0" }}>
      {timeLeft.label && <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "4px", fontWeight: "bold" }}>{timeLeft.label}</div>}
      <div style={{ fontSize: "1.2rem", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px" }}>
        {timeLeft.text}
      </div>
    </div>
  );
}
