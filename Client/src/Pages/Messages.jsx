import React from 'react';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OnlineUsers from '../Components/OnlineUsers';
import { setSelectedUser } from '../redux/messageSlice';
import profilePic from '../assets/profilePic.png';
import { FaSearch } from 'react-icons/fa';

const Messages = () => {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);
    const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
    const { prevChatUsers = [] } = useSelector((state) => state.message) || {};
    const dispatch = useDispatch();

    return (
        <div className='w-full h-screen flex flex-col bg-gray-900 overflow-hidden'>
            {/* Mobile Header */}
            <div className='md:hidden p-3 border-b border-gray-800 flex items-center gap-4 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10'>
                <button 
                    onClick={() => navigate(-1)} 
                    className='p-1.5 rounded-full hover:bg-gray-800 transition-colors'
                    aria-label='Go back'
                >
                    <MdOutlineKeyboardBackspace className='text-white w-6 h-6' />
                </button>
                <h1 className='text-xl font-bold text-white'>Messages</h1>
            </div>

            {/* Search Bar */}
            <div className='p-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0'>
                <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <FaSearch className='text-gray-400 w-4 h-4' />
                    </div>
                    <input
                        type='text'
                        placeholder='Search messages'
                        className='w-full bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200'
                    />
                </div>
            </div>

            {/* Online Users */}
            <div className='w-full py-3 px-4 flex gap-4 items-center overflow-x-auto no-scrollbar border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm flex-shrink-0'>
                {userData?.following?.map((user, index) => (
                    (onlineUsers && onlineUsers.includes(user._id?.toString())) && (
                        <div 
                            key={user._id || index} 
                            className='flex flex-col items-center flex-shrink-0'
                            onClick={() => {
                                dispatch(setSelectedUser(user));
                                navigate('/messageArea');
                            }}
                        >
                            <OnlineUsers user={user} />
                            <span className='text-xs text-gray-400 mt-1.5 truncate max-w-[60px]'>{user.userName}</span>
                        </div>
                    )
                ))}
            </div>

            {/* Messages List */}
            <div className='flex-1 overflow-y-auto pb-4 h-[calc(100vh-220px)] md:h-auto'>
                {prevChatUsers?.length > 0 ? (
                    prevChatUsers.map((user, index) => (
                        <div 
                            key={user._id || index}
                            className='px-4 py-3 flex items-center gap-3 active:bg-gray-800/50 transition-colors duration-200 cursor-pointer border-b border-gray-800/50'
                            onClick={() => {
                                dispatch(setSelectedUser(user));
                                navigate('/messageArea');
                            }}
                        >
                            <div className='relative flex-shrink-0'>
                                <div className='w-12 h-12 rounded-full overflow-hidden'>
                                    <img 
                                        src={user.profileImage || profilePic} 
                                        alt={user.userName}
                                        className='w-full h-full object-cover'
                                        loading='lazy'
                                    />
                                </div>
                                {onlineUsers.includes(user._id) && (
                                    <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                )}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <h3 className='text-white font-medium truncate'>{user.userName}</h3>
                                <div className='flex items-center gap-1'>
                                    {onlineUsers.includes(user._id) ? (
                                        <>
                                            <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                                            <p className='text-sm text-gray-400 truncate'>Active now</p>
                                        </>
                                    ) : (
                                        <p className='text-sm text-gray-400 truncate'>Last seen recently</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 flex-1'>
                        <div className='w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4'>
                            <FaSearch className='w-6 h-6' />
                        </div>
                        <h3 className='text-lg font-medium text-white mb-1'>No messages yet</h3>
                        <p className='text-sm max-w-xs'>Start a conversation with someone to see your messages here</p>
                    </div>
                )}
            </div>
        </div>
  )
}

export default Messages
