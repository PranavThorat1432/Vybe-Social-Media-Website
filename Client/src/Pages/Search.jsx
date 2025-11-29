import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiX, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchData, setUserData } from '../redux/userSlice';
import profilePic from '../assets/profilePic.png';
import { ClipLoader } from 'react-spinners';

const Search = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { searchData, userData } = useSelector((state) => state.user);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState({});

    const handleSearch = useCallback(async (e) => {
        e?.preventDefault();

        if (!input.trim()) {
            dispatch(setSearchData([]));
            return;
        }

        try {
            setIsLoading(true);
            const result = await axios.get(`${serverUrl}/api/user/search?keyWord=${input}`, {
                withCredentials: true
            });
            dispatch(setSearchData(result.data));
            
            // Initialize follow status for each user
            const followStatus = {};
            result.data.forEach(user => {
                followStatus[user._id] = userData.following?.includes(user._id) || false;
            });
            setIsFollowing(followStatus);
            
        } catch (error) {
            console.error('Search error:', error);
            dispatch(setSearchData([]));
        } finally {
            setIsLoading(false);
        }
    }, [input, dispatch, userData.following]);
    
    const handleFollow = async (userId, index) => {
        try {
            const response = await axios.put(
                `${serverUrl}/api/user/follow-unfollow/${userId}`,
                {},
                { withCredentials: true }
            );
            
            // Update the follow status
            setIsFollowing(prev => ({
                ...prev,
                [userId]: !prev[userId]
            }));
            
            // Update the current user's following list
            dispatch(setUserData(response.data));
            
        } catch (error) {
            console.error('Follow/Unfollow error:', error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (input.trim()) {
                handleSearch();
            } else {
                dispatch(setSearchData([]));
            }
        }, 300); // Debounce search by 300ms

        return () => clearTimeout(timeoutId);
    }, [input, handleSearch, dispatch]);

  return (
    <div className='w-full min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4 md:p-6'>
      <div className='w-full max-w-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <button 
            onClick={() => navigate(-1)}
            className='p-2 rounded-full hover:bg-gray-700 transition-colors duration-200'
          >
            <MdOutlineKeyboardBackspace className='text-gray-300 w-6 h-6' />
          </button>
          <h1 className='text-xl font-bold text-white'>Search</h1>
          <div className='w-6'></div> {/* For alignment */}
        </div>
        
        {/* Search Input */}
        <div className='relative mb-6'>
          <form onSubmit={handleSearch} className='relative'>
            <div className='relative'>
              <FiSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Search users...'
                className='w-full pl-12 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                autoFocus
              />
              {input && (
                <button
                  type='button'
                  onClick={() => {
                    setInput('');
                    dispatch(setSearchData([]));
                  }}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                >
                  <FiX className='w-5 h-5' />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search Results */}
        <div className='space-y-3'>
          {isLoading ? (
            <div className='flex justify-center py-10'>
              <ClipLoader size={30} color='#3b82f6' />
            </div>
          ) : searchData && searchData.length > 0 ? (
            searchData.map((user) => (
              <div 
                key={user._id}
                className='bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200'
              >
                <div className='flex items-center justify-between'>
                  <div 
                    className='flex items-center flex-1 min-w-0 cursor-pointer'
                    onClick={() => navigate(`/profile/${user.userName}`)}
                  >
                    <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shrink-0'>
                      <img 
                        src={user.profileImage || profilePic} 
                        alt={user.userName}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='ml-4 min-w-0'>
                      <h3 className='text-white font-semibold truncate'>{user.userName}</h3>
                      <p className='text-gray-400 text-sm truncate'>{user.name || user.userName}</p>
                      <div className='flex items-center mt-1'>
                        <span className='text-xs text-gray-500'>
                          {user.followers?.length || 0} followers • {user.following?.length || 0} following
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user._id !== userData?._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user._id);
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isFollowing[user._id]
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? (
                        <ClipLoader size={16} color='white' />
                      ) : isFollowing[user._id] ? (
                        <div className='flex items-center'>
                          <FiUserCheck className='mr-1' /> Following
                        </div>
                      ) : (
                        <div className='flex items-center'>
                          <FiUserPlus className='mr-1' /> Follow
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : input ? (
            <div className='text-center py-12'>
              <FiSearch className='mx-auto w-12 h-12 text-gray-600 mb-4' />
              <h3 className='text-xl font-medium text-white'>No results found</h3>
              <p className='text-gray-400 mt-2'>We couldn't find any users matching "{input}"</p>
            </div>
          ) : (
            <div className='text-center py-16'>
              <FiSearch className='mx-auto w-12 h-12 text-gray-600 mb-4' />
              <h3 className='text-xl font-medium text-white'>Search for users</h3>
              <p className='text-gray-400 mt-2'>Find people by their username or name</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
