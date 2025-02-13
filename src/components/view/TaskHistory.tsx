import React, { useEffect, useState } from "react";
import type { TaskHistory } from "../../types";
import { collection, query, orderBy, getDocs, where, Timestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

interface TaskHistoryProps {
  taskId?: string;
  className?: string;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Array<{
    field: string;
    oldValue?: any;
    newValue?: any;
  }>;
  timestamp: Timestamp;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ taskId, className, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) {
        console.log('No user logged in');
        return;
      }
      
      try {
        setLoading(true);
        const historyQuery = query(
          collection(db, "taskHistory"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        console.log('Fetching history for user:', auth.currentUser.uid);
        const snapshot = await getDocs(historyQuery);
        console.log('Raw history data:', snapshot.docs.map(doc => doc.data()));
        
        const historyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HistoryEntry[];

        console.log('Processed history data:', historyData);
        
        const filteredHistory = taskId 
          ? historyData.filter(entry => entry.taskId === taskId)
          : historyData;

        setHistory(filteredHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [taskId]);

  const formatChange = (change: { field: string; oldValue?: any; newValue?: any }) => {
    if (change.field === "all") {
      return change.oldValue ? "Task was deleted" : "Task was created";
    }
    
    const formatValue = (value: any) => {
      if (value === undefined || value === null) return "none";
      if (typeof value === "boolean") return value ? "yes" : "no";
      if (value instanceof Date) return value.toLocaleString();
      if (value.toDate) return value.toDate().toLocaleString();
      return value.toString();
    };

    const fieldName = change.field.charAt(0).toUpperCase() + change.field.slice(1);
    return `${fieldName} changed from "${formatValue(change.oldValue)}" to "${formatValue(change.newValue)}"`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800";
      case "updated":
        return "bg-blue-100 text-blue-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/75 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-2xl ${className}`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Activity Log</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500">No activity history available</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      {entry.timestamp.toDate().toLocaleString()}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {entry.changes.map((change, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {formatChange(change)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskHistory;