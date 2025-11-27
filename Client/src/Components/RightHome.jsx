import React from 'react';
import Messages from '../Pages/Messages';
import { FaPaperPlane } from 'react-icons/fa';

const RightHome = () => {
  return (
    <div className='w-[25%] hidden lg:flex flex-col h-screen bg-gray-900 border-l border-gray-800 overflow-hidden'>
      {/* Header */}
      <div className='w-full h-16 px-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10'>
        <h2 className='text-white text-lg font-semibold'>Messages</h2>
        <button className='p-2 rounded-full hover:bg-gray-800 transition-colors duration-200'>
          <FaPaperPlane className='text-gray-300 w-5 h-5 hover:text-blue-400 transition-colors' />
        </button>
      </div>
      
      {/* Messages Content */}
      <div className='flex-1 overflow-y-auto'>
        <Messages />
      </div>
    </div>
  );
};

export default RightHome;
