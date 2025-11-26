import axios from 'axios';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App';
import { toggleFollow } from '../redux/userSlice';

const FollowButton = ({ targetUserId, onFollowChange, className = '' }) => {

    const {following} = useSelector((state) => state.user);
    const isFollowing = following?.includes(targetUserId);
    const dispatch = useDispatch();

    const handleFollow = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/follow/${targetUserId}`, {
                withCredentials: true
            });
            if(onFollowChange) {
                onFollowChange();
            }
            dispatch(toggleFollow(targetUserId));

        } catch (error) {
            console.log(error);
        }
    };

  return (
    <button 
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            isFollowing 
                ? 'bg-transparent text-gray-200 border border-gray-500 hover:bg-gray-700 hover:border-gray-400' 
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
        } ${className}`}
        onClick={handleFollow}
    >
        {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}

export default FollowButton
