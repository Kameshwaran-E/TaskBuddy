import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logOut } from "../../firebase/firebaseConfig";
import UserProfile from "../header/UserProfile";
import TaskList from "./TaskList"; 
import TaskBoard from "./TaskBoard"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DashBoard() {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const navigate = useNavigate();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.warning("Session expired! Redirecting to login...");
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
        {/* Hide view toggle buttons on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => setViewMode('list')}
            className={`cursor-pointer font-semibold flex items-center gap-2 px-4 py-2 rounded-lg ${
              viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
          <button 
            onClick={() => setViewMode('board')}
            className={`cursor-pointer font-semibold flex items-center gap-2 px-4 py-2 rounded-lg ${
              viewMode === 'board' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Board
          </button>
        </div>

        {/* Logout button */}
        <button 
          onClick={handleLogout}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 font-semibold bg-red-50 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {
          viewMode === "list" ? 
          <TaskList hasSearched={hasSearched} setHasSearched={setHasSearched} /> : 
          <TaskBoard hasSearched={hasSearched} setHasSearched={setHasSearched} />
      }
    </div>
  );
}

export default DashBoard;
