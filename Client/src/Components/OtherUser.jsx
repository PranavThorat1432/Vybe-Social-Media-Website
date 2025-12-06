import React from 'react'
import profilePic from '../assets/profilePic.png'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';

const OtherUser = ({user}) => {

    const {userData} = useSelector((state) => state.user);
    const navigate = useNavigate();

  return (
    <div className='w-full py-3 px-2 flex items-center justify-between hover:bg-gray-800/50 rounded-lg transition-colors duration-200'>
        <div className='flex items-center gap-3 min-w-0'>
            <div 
                className='w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105'
                onClick={() => navigate(`/profile/${user.userName}`)}
            >
                <img 
                    src={user.profileImage || profilePic} 
                    alt={user.userName}
                    className='w-full h-full object-cover transition-opacity duration-200 hover:opacity-90'
                />
            </div>
            <div className='min-w-0'>
                <div 
                    className='text-sm text-white font-medium hover:text-blue-400 cursor-pointer truncate max-w-[120px] transition-colors duration-200'
                    onClick={() => navigate(`/profile/${user.userName}`)}
                    title={user.userName}
                >
                    {user.userName}
                </div>
                <div 
                    className='text-xs text-gray-400 truncate max-w-[120px]'
                    title={user.name}
                >
                    {user.name}
                </div>
            </div>
        </div>
        
        <FollowButton className='cursor-pointer'
            tailwind='px-3 py-1.5 text-xs font-medium bg-transparent hover:bg-gray-700 border border-gray-600 rounded-md text-white transition-colors duration-200 flex-shrink-0 cursor-pointer'
            targetUserId={user._id}
        >
            Follow
        </FollowButton>

    </div>
  )
}

export default OtherUser
