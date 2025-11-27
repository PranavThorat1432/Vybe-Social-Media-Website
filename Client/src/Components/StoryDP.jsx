import React, { useEffect, useState } from 'react'
import profilePic from '../assets/profilePic.png'
import { FiPlusCircle } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';

const StoryDP = ({profileImage, userName, story}) => {

  const navigate = useNavigate();
  const {userData} = useSelector((state) => state.user);
  const {storyData, storyList} = useSelector((state) => state.story);

  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    if(story?.viewers?.some((viewer) => viewer._id == userData._id.toString() || viewer == userData._id.toString())) {
      setViewed(true);
    } else {
      setViewed(false);
    }
  }, [story, userData, storyData, storyList]);

  const handleViewers = async () => {
    try {
      if (story) {
        await axios.get(`${serverUrl}/api/story/view/${story._id}`, {
          withCredentials: true
        });
      }
    } catch (error) {
      console.error('Error updating story views:', error);
    }
  };

  const handleClick = () => {
    if(!story && userName === 'Your Story') {
      navigate('/upload');
    } else if(story && userName === 'Your Story') {
      handleViewers();
      navigate(`/story/${userData.userName}`);
    } else {
      handleViewers();
      navigate(`/story/${userName}`);
    }
  };

  const isCurrentUser = userName === 'Your Story';
  const hasUnviewedStory = story && !viewed && !isCurrentUser;
  const hasStory = story || isCurrentUser;

  return (
    <div 
      className='flex flex-col items-center w-20 cursor-pointer transition-transform duration-300 hover:scale-105'
      onClick={handleClick}
    >
      <div className={`relative p-0.5 rounded-full ${hasUnviewedStory ? 'bg-linear-to-tr from-yellow-400 to-pink-500' : 'bg-gray-500/30'}`}>
        <div className='relative p-0.5 bg-gray-900 rounded-full'>
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${hasUnviewedStory ? 'border-blue-500' : 'border-gray-600'}`}>
            <img 
              src={profileImage || profilePic} 
              alt={userName} 
              className='w-full h-full object-cover'
            />
          </div>
          
          {isCurrentUser && (
            <div className='absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-gray-900'>
              <FiPlusCircle className='text-white w-4 h-4' />
            </div>
          )}
          
          {hasUnviewedStory && (
            <div className='absolute inset-0 rounded-full border-2 border-transparent animate-ping opacity-75'></div>
          )}
        </div>
        
        {hasStory && hasUnviewedStory && (
          <div className='absolute inset-0 rounded-full bg-linear-to-tr from-yellow-400/20 to-pink-500/20 opacity-50'></div>
        )}
      </div>
      
      <div className='mt-2 text-center w-full'>
        <p className='text-xs text-white truncate px-1'>{userName}</p>
        {hasUnviewedStory && (
          <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1'></div>
        )}
      </div>
    </div>
  );
};

export default StoryDP
