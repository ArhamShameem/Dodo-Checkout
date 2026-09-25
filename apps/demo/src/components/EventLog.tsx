import React from "react";

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "info" | "processing" | "success" | "error" | "close";
  details?: Record<string, unknown>;
}

interface EventLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ logs, onClear }) => {
  const getBadgeStyle = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "error":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "processing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "close":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 text-slate-100 overflow-hidden shadow-lg">
      <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 ml-2">
            Host Event Stream (SDK Callbacks)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">
            {logs.length} {logs.length === 1 ? "event" : "events"}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-2 select-text">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <p>No checkout events captured yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click "Buy Pro — $49" above to trigger DodoCheckout.open()
            </p>
          </div>
        ) : (
          logs.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2.5 py-1 px-2 rounded hover:bg-slate-900/60 transition-colors"
            >
              <span className="text-slate-500 text-[11px] flex-shrink-0 select-none">
                [{entry.time}]
              </span>

              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${getBadgeStyle(
                  entry.type
                )}`}
              >
                {entry.type}
              </span>

              <div className="flex-1">
                <span className="text-slate-200">{entry.message}</span>
                {entry.details && (
                  <pre className="mt-1 text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded border border-slate-800/80 overflow-x-auto">
                    {JSON.stringify(entry.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
