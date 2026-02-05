let logs: string[] = [];

export function installMobileConsole() {
  if (typeof window === "undefined") return;

  const push = (type: string, args: unknown[]) => {
    const msg = `[${type}] ` + args.map(a =>
      typeof a === "string" ? a : JSON.stringify(a)
    ).join(" ");
    logs.push(msg);
    if (logs.length > 50) logs.shift();
  };

  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  console.log = (...args) => {
    push("log", args);
    original.log(...args);
  };
  console.warn = (...args) => {
    push("warn", args);
    original.warn(...args);
  };
  console.error = (...args) => {
    push("error", args);
    original.error(...args);
  };

  window.onerror = (msg, src, line, col) => {
    push("window.error", [msg, `${src}:${line}:${col}`]);
    return false;
  };

  window.addEventListener("unhandledrejection", (e) => {
    push("promise", [e.reason]);
  });

  (window as any).__GET_MOBILE_LOGS__ = () => logs;
}
