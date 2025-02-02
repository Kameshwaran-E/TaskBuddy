import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logOut } from "../../firebase/firebaseConfig";
import UserProfile from "../header/UserProfile";
import TaskList from "./TaskList"; 
import TaskBoard from "./TaskBoard"; 
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import noresult from '../../assets/noresult.png';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ViewSection() {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const navigate = useNavigate();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.warning("Session expired! Redirecting to login...");
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setFilteredTasks(tasks);
    // After the first load, set isInitialLoad to false
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [tasks, isInitialLoad]);

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out. Please try again.");
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="flex flex-col px-8 pt-2 pb-56 leading-snug bg-white max-md:pb-24">
    <UserProfile />

    <div className="flex justify-between items-center mt-5">
      <div className="flex gap-6 text-base cursor-pointer max-md:hidden">
        <div
          className={`flex items-center gap-1 text-black ${
            viewMode === "list" ? "font-bold" : "opacity-60"
          }`}
          onClick={() => {
            setViewMode("list");
            toast.info("Switched to List View");
          }}
        >
          <span>List</span>
        </div>
        <div
          className={`flex items-center gap-1 text-stone-800 ${
            viewMode === "board" ? "font-bold" : "opacity-60"
          }`}
          onClick={() => {
            setViewMode("board");
            toast.info("Switched to Board View");
          }}
        >
          <span>Board</span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="ml-auto max-md:my-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 cursor-pointer"
      >
        Logout
      </button>
    </div>
      {/* {viewMode === "list" ? <TaskList /> : <TaskBoard />} */}

      {isInitialLoad  ? (
        <div className="flex flex-col items-center justify-center w-full mt-16">
          <img
            src={noresult}
            alt="No Results Found"
            className="max-w-[300px] h-auto mb-4"
          />
          <p className="text-lg text-gray-600 font-medium">No tasks found</p>
        </div>
      ) : (
        viewMode === "list" ? <TaskList /> : <TaskBoard />
      )}
    </div>
  );
}

export default ViewSection;