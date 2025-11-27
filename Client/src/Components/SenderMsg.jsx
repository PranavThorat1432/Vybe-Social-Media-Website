import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsCheck2All, BsCheck2 } from 'react-icons/bs';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const SenderMsg = ({ message, isLastMessage }) => {
  const { userData } = useSelector((state) => state.user);
  const scroll = useRef();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isLastMessage) {
      scroll.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [message, isLastMessage]);

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <motion.div
      ref={scroll}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-full flex justify-end mb-4 last:mb-2 px-2 group"
    >
      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]">
        <div className="flex flex-col items-end">
          <div className="relative">
            {message.image && (
              <div className={`rounded-xl overflow-hidden mb-1 transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <img
                  className="max-h-[280px] w-auto object-cover rounded-xl"
                  src={message.image}
                  alt=""
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </div>
            )}
            {message.image && !imageLoaded && (
              <div className="w-full h-[200px] bg-gray-700/50 rounded-xl animate-pulse mb-1"></div>
            )}
            
            {message.message && (
              <div 
                className={`inline-block px-4 py-2.5 rounded-2xl rounded-br-sm ${
                  message.image ? 'rounded-tl-none bg-gray-800/80 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                } shadow-lg`}
              >
                <div className="text-white text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                  {message.message}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center mt-1 gap-2">
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.createdAt)}
            </span>
            <span className="text-xs flex items-center">
              {message.read ? (
                <BsCheck2All className="text-blue-400" />
              ) : message.delivered ? (
                <BsCheck2All className="text-gray-400" />
              ) : (
                <BsCheck2 className="text-gray-400" />
              )}
            </span>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-700 group-hover:border-blue-400 transition-colors">
          <img 
            src={userData.profileImage} 
            alt={userData.userName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SenderMsg;
