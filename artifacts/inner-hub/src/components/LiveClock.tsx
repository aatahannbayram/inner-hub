import { useEffect, useState } from "react";

function formatIstanbul(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}

export function LiveClock() {
  const [time, setTime] = useState(() => formatIstanbul(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatIstanbul(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right font-mono text-[10px] uppercase tracking-widest leading-relaxed">
      <div>By Invitation</div>
      <div className="hidden md:block tabular-nums text-muted-foreground">
        İstanbul 41.00°N 28.97°E · {time} TRT
      </div>
      <div className="md:hidden tabular-nums text-muted-foreground">{time} TRT</div>
    </div>
  );
}
