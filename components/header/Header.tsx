import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import ProfileDropdown from '../other/ProfileDropdown';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen : boolean;
  userImage: string;
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, sidebarOpen, userImage, userName, }) => {
  const defaultUserImage = '/images/user.png';
  const defaultUserName = 'User';

  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-900 px-2 shadow-sm sm:gap-x-6 sm:px-1 lg:px-3 justify-between pointer-events-auto">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => {console.log('sidebarOpen', sidebarOpen); setSidebarOpen(!sidebarOpen) }}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        <span className="flex-1 text-center items-center flex-shrink-0 rounded-md  px-2 py-1 text-xs sm:text-sm md:text-md md:text-lg font-medium text-blue-400">
          Talk Shop
        </span>
      </div>

      <div className="flex-shrink-0" onClick={() => router.push('/settings')}>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Cog6ToothIcon
            className="-ml-0.5 h-4 w-4 sm:w-5 sm:h-5"
            aria-hidden="true"
          />
          <span>Settings</span>
        </button>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <div
          className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
          aria-hidden="true"
        />
        <ProfileDropdown
          userImage={userImage || defaultUserImage}
          userName={userName || defaultUserName}
          signOut={signOut}
        />
      </div>
    </div>
  );
};

export default Header;
