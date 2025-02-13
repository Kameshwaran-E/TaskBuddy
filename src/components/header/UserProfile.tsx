import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import defaultAvatar from '../../assets/kamesh.webp'; 

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (!user) {
    return <div>Please log in.</div>; // Or redirect to login page
  }

  const capitalizedName = user.displayName
    ? user.displayName.charAt(0).toUpperCase() + user.displayName.slice(1)
    : "User";

  

  return (
    <div className="flex flex-wrap gap-5 justify-between w-full max-md:bg-[#faeefc] whitespace-nowrap max-md:max-w-full">
      {/* Logo & App Name */}
      <div className="flex gap-1.5 self-start text-2xl font-semibold text-zinc-800">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/13d7178ca26599c287697e1dc351c412ccc36885c4f1e7c0838786f73d09acc4?apiKey=161b3d1e03384f15926e8dd4913c9f73&"
          alt="TaskBuddy logo"
          className="object-contain shrink-0 my-auto aspect-square w-[29px]"
        />
        <div>TaskBuddy</div>
      </div>

      {/* User Info */}
      <div className="flex gap-2 text-base font-bold text-black text-opacity-60 items-center">
        {user.photoURL ? (
          <img
            loading="lazy"
            src={defaultAvatar}
            alt="User Avatar"
            className="object-cover shrink-0 w-9 h-9 rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center w-9 h-9 bg-gray-300 text-white text-lg font-semibold rounded-full">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <div className="my-auto max-md:hidden">{capitalizedName}</div>
      </div>

      {/* Logout Button */}
      
    </div>
  );
}

export default UserProfile;
