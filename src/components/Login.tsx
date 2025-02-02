import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import taskbuddy from "../assets/taskbuddy logo.png";
import google from "../assets/google.png";
import rightside from "../assets/rightside.png"; // Import the rightside image
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import circle from '../assets/circle.png'

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        toast.success("Login successful! Redirecting...");
        navigate("/listview");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      toast.dismiss(); // Dismiss existing toasts
      await signInWithGoogle();
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-slate-50">
      {/* Left Section - Takes 1/4 on desktop, full width on mobile */}
      <div className="pt-10 px-5 md:px-20 w-full md:w-2/4 bg-stone-50">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-1.5 text-2xl text-fuchsia-800 font-bold">
            <img src={taskbuddy} alt="TaskBuddy Logo" className="object-contain w-8" />
            <span>TaskBuddy</span>
          </div>
          <p className="mt-2 text-xs font-medium text-black max-w-xs">
            Streamline your workflow and track progress effortlessly with our all-in-one task management app.
          </p>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`flex gap-3 items-center justify-center w-full md:w-auto px-6 py-3 mt-6 text-lg text-white rounded-2xl 
              ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-900 cursor-pointer"}`}
            aria-label="Continue with Google"
          >
            <img src={google} alt="Google Logo" className="w-5" />
            <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            {loading && <span className="animate-spin ml-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>}
          </button>
        </div>
      </div>

      {/* Circle Image (Only visible on mobile) */}
<div className="md:hidden flex justify-center mt-20">
  <img src={circle} alt="Decorative Circle" className="w-full h-full " />
</div>

      {/* Right Section - Takes 3/4 width on desktop, hidden on mobile */}
      <div className="hidden md:block md:w-3/4 h-screen">
        <img src={rightside} alt="Right Side Illustration" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Login;
