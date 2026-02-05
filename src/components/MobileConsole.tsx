"use client";

import { useEffect, useState } from "react";

export default function MobileConsole() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const getLogs = (window as any).__GET_MOBILE_LOGS__;
      if (getLogs) setLogs([...getLogs()]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-black text-green-400 text-xs px-3 py-2 rounded-md opacity-80"
      >
        🐞 Logs
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-green-400 text-xs p-3 overflow-auto">
      <button
        onClick={() => setOpen(false)}
        className="mb-2 bg-green-700 text-black px-2 py-1 rounded"
      >
        Close
      </button>
      <pre className="whitespace-pre-wrap">
        {logs.join("\n")}
      </pre>
    </div>
  );
}
