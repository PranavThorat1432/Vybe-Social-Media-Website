import React from 'react'
import logo1 from '../assets/VybeWhite.png.png'
import { FaRegHeart } from "react-icons/fa";
import { BiMessageAltDetail } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import StoryDP from './StoryDP';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';
import Post from './Post';

const Feed = () => {

    const navigate = useNavigate();
    const {postData} = useSelector((state) => state.post);
    const {userData, notificationData} = useSelector((state) => state.user);
    const {storyList, currentUserStory} = useSelector((state) => state.story);

  return (
    <div className='lg:w-[50%] w-full bg-white dark:bg-gray-800 min-h-screen lg:h-screen relative lg:overflow-y-auto'>
      {/* Navbar fixed at the bottom center */}
      <div className='fixed bottom-0 left-0 right-0 flex justify-center z-50'>
        <Navbar />
      </div>
      {/* Add bottom padding to prevent content from being hidden behind the navbar */}
      <div className='pb-24'>
        {/* Mobile Header */}
        <div className='w-full h-[70px] flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden'>
            <img 
                src={logo1} 
                alt="Vybe" 
                className='h-8 cursor-pointer' 
                onClick={() => navigate('/')}
            />
            <div className='flex items-center gap-4'>
                <div className='cursor-pointer relative' onClick={() => navigate('/notifications')}>
                    <FaRegHeart className='text-gray-700 dark:text-gray-200 w-5 h-5'/>
                    {notificationData?.some((noti) => !noti.isRead) && (
                        <div className='w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0'></div>
                    )}
                </div>
                <BiMessageAltDetail 
                    className='text-gray-700 dark:text-gray-200 w-5 h-5 cursor-pointer' 
                    onClick={() => navigate('/messages')}
                />
            </div>
        </div>

        {/* Stories */}
        <div className='w-full bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex space-x-4 overflow-x-auto pb-2 hide-scrollbar'>
                <StoryDP 
                    userName={'Your Story'} 
                    profileImage={userData?.profileImage} 
                    story={currentUserStory}
                    isCurrentUser
                />
                {storyList?.map((story, index) => (
                    <StoryDP 
                        key={story?._id || index}
                        userName={story?.author?.userName} 
                        profileImage={story?.author?.profileImage} 
                        story={story} 
                    />
                ))}
            </div>
        </div>

        {/* Posts Feed */}
        <div className='w-full max-w-2xl mx-auto px-2 py-4'>
            {postData?.map((post, index) => (
                <div key={post._id || index} className='mb-6'>
                    <Post post={post} />
                </div>
            ))}
        </div>

        {/* Global Styles */}
        <style jsx global>{`
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>
      </div>
    </div>
  )
}

export default Feed
