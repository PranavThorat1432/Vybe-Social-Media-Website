import React, { useState } from 'react';
import logo1 from '../assets/VybeWhite.png.png';
import profilePic from '../assets/profilePic.png';
import { FaRegHeart, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import OtherUser from './OtherUser';
import { useNavigate } from 'react-router-dom';
import Notification from '../Pages/Notification';

const LeftHome = () => {

    const { userData, suggestedUsers } = useSelector((state) => state.user);
    const { notificationData } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showNotification, setShowNotification] = useState(false);

    const handleLogout = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/auth/signout`, {
                withCredentials: true
            });
            dispatch(setUserData(null));

        } catch (error) {
            console.log(error);
        }
    };


  return (
    <div className={`w-[25%] hidden lg:flex flex-col h-screen bg-gray-900 border-r border-gray-800 ${showNotification ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Header */}
        <div className='w-full h-16 px-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10'>
            <div className='flex items-center'>
                <div 
                    className='w-15 h-15 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity'
                    onClick={() => navigate('/')}
                >
                    <img 
                        src={logo1} 
                        alt="Vybe" 
                        className='h-10 w-auto object-contain' 
                    />
                </div>
            </div>
            <div className='relative'>
                <button 
                    className='p-2 rounded-full hover:bg-gray-800 transition-colors duration-200 relative'
                    onClick={() => setShowNotification(prev => !prev)}
                >
                    <FaRegHeart className='text-gray-300 w-5 h-5 hover:text-white transition-colors'/>
                    {notificationData?.some((noti) => !noti.isRead) && (
                        <div className='absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-gray-900 animate-pulse'></div>
                    )}
                </button>
            </div>
        </div>

        {!showNotification && <>
            {/* User Profile Section */}
            <div className='w-full p-4 border-b border-gray-800 hover:bg-gray-800/30 transition-colors duration-200'>
                <div className='flex items-center justify-between'>
                    <div 
                        className='flex items-center gap-3 cursor-pointer group'
                        onClick={() => navigate(`/profile/${userData.userName}`)}
                    >
                        <div className='relative group'>
                            <div className='w-12 h-12 rounded-full overflow-hidden cursor-pointer transition-transform duration-200 group-hover:scale-105'>
                                <img 
                                    src={userData.profileImage || profilePic} 
                                    alt={userData.userName}
                                    className='w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90'
                                />
                            </div>
                            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 ring-1 ring-green-400/30'></div>
                        </div>
                        <div className='max-w-[140px]'>
                            <div className='text-white font-medium group-hover:text-blue-400 transition-colors duration-200 truncate'>{userData.userName}</div>
                            <div className='text-sm text-gray-400 truncate'>{userData.name}</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className='px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-red-900/30 rounded-md transition-colors duration-200 flex items-center gap-1.5 border border-gray-700 hover:border-red-900/50 cursor-pointer'
                    >
                        <FaSignOutAlt className='w-3.5 h-3.5' />
                        <span>Sign out</span>
                    </button>
                </div>
            </div>

            {/* Suggested Users */}
            <div className='w-full p-4'>
                <div className='flex items-center justify-between mb-3'>
                    <h2 className='text-gray-300 font-semibold text-sm'>Suggested for you</h2>
                    <button className='text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 cursor-pointer'>
                        See all
                    </button>
                </div>
                <div className='space-y-3'>
                    {suggestedUsers?.slice(0, 5).map((user, index) => (
                        <div key={user._id || index} className='group'>
                            <OtherUser user={user} />
                        </div>
                    ))}
                </div>
                
                {/* Footer Links */}
                <div className='mt-8 pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-3'>
                    <div className='flex flex-wrap gap-x-3 gap-y-1'>
                        <a href='#' className='hover:text-gray-300 transition-colors duration-200 cursor-pointer'>About</a>
                        <a href='#' className='hover:text-gray-300 transition-colors duration-200 cursor-pointer'>Help</a>
                        <a href='#' className='hover:text-gray-300 transition-colors duration-200 cursor-pointer'>Terms</a>
                        <a href='#' className='hover:text-gray-300 transition-colors duration-200 cursor-pointer'>Privacy</a>
                        <a href='#' className='hover:text-gray-300 transition-colors duration-200 cursor-pointer'>API</a>
                        <a href='#' className='hover:text-gray-300 transition-colors duration-200 cursor-pointer'>Jobs</a>
                    </div>
                    <p className='text-gray-600 text-[11px]'>© {new Date().getFullYear()} Vybe</p>
                </div>
            </div>
        </>
        }

        {showNotification && <Notification/>}
    </div>
  )
}

export default LeftHome
