import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface TaskHistoryProps {
  taskId?: string; // Optional filtering for a specific task
  className?: string;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ taskId }) => {
  const history = useSelector((state: RootState) => state.tasks.taskHistory);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || "Deleted Task";
  };

  const formatChange = (change: { field: string; oldValue?: any; newValue?: any }) => {
    if (change.field === "all") {
      return change.oldValue ? "Task was deleted" : "Task was created";
    }
    return `Changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`;
  };

  // Filter history for the specific task if taskId is provided
  const filteredHistory = taskId ? history.filter((entry) => entry.taskId === taskId) : history;

  return (
    <div className="mt-4 bg-white rounded-lg shadow p-6 max-h-96 overflow-auto">
      <h2 className="text-xl font-semibold mb-4">Task History</h2>

      {filteredHistory.length === 0 ? (
        <p className="text-gray-500">No history available for this task.</p>
      ) : (
        <div className="space-y-4">
          {filteredHistory.slice().reverse().map((entry) => (
            <div key={entry.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{getTaskTitle(entry.taskId)}</h3>
                  <p className="text-sm text-gray-600">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    entry.action === "created"
                      ? "bg-green-100 text-green-800"
                      : entry.action === "updated"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {entry.action}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {entry.changes.map((change, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {formatChange(change)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
