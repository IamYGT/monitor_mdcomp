import { useCallback } from "react";
import { LogEntry, LogType } from "../../models/interfaces/AppState";
import { useAppContext } from "../contexts/AppContext";

interface UseLoggerReturn {
  logs: LogEntry[];
  addLog: (message: string, type: LogType) => void;
  clearLogs: () => void;
  toggleDebugMode: () => void;
  debugMode: boolean;
}

export const useLogger = (): UseLoggerReturn => {
  const { state, addLog, clearLogs, toggleDebugMode } = useAppContext();

  const addLogEntry = useCallback(
    (message: string, type: LogType) => {
      addLog(message, type);

      // Debug amaçlı konsola da yaz
      if (process.env.NODE_ENV === "development") {
        switch (type) {
          case "info":
            console.info(message);
            break;
          case "success":
            console.log("%c" + message, "color: green");
            break;
          case "warning":
            console.warn(message);
            break;
          case "error":
            console.error(message);
            break;
          default:
            console.log(message);
        }
      }
    },
    [addLog]
  );

  return {
    logs: state.logs,
    addLog: addLogEntry,
    clearLogs,
    toggleDebugMode,
    debugMode: state.connection.debugMode,
  };
};
