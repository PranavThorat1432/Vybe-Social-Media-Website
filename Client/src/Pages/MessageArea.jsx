import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineKeyboardBackspace, MdOutlineEmojiEmotions } from 'react-icons/md';
import { LuPaperclip, LuImagePlus } from 'react-icons/lu';
import { IoSend, IoSendOutline } from 'react-icons/io5';
import { BsThreeDotsVertical, BsCheck2All } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import profilePic from '../assets/profilePic.png';
import SenderMsg from '../Components/SenderMsg';
import ReceiverMsg from '../Components/ReceiverMsg';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMessages } from '../redux/messageSlice';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MessageArea = () => {

    const {selectedUser, messages} = useSelector((state) => state.message);
    const {userData} = useSelector((state) => state.user);
    const {socket, onlineUsers = []} = useSelector((state) => state.socket);
    const navigate = useNavigate();
    const imageInput = useRef();
    const dispatch = useDispatch();

    const [input, setInput] = useState();
    const [frontendImage, setFrontendImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    };

    const handleSendMsg = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('message', input);
            if(backendImage) {
                formData.append('image', backendImage);
            }

            const result = await axios.post(`${serverUrl}/api/msg/send-msg/${selectedUser._id}`, formData, {
                withCredentials: true
            });
            dispatch(setMessages([...messages, result.data]));
            setInput('');
            setBackendImage(null);
            setFrontendImage(null);

        } catch (error) {
            console.log(error);
        }
    };

    const getAllMsgs = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/msg/getAll-msgs/${selectedUser._id}`, {
                withCredentials: true
            });
            dispatch(setMessages(result.data));

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllMsgs();
    }, [])

    useEffect(() => {
        socket.on('newMessage', (msg) => {
            dispatch(setMessages([...messages, msg]))
        })
        return () =>socket?.off('newMessage');
    }, [messages, setMessages]);

  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format message date
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    
    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        let displayDate;
        const date = new Date(msg.createdAt);
        
        if (isToday(date)) {
          displayDate = 'Today';
        } else if (isYesterday(date)) {
          displayDate = 'Yesterday';
        } else {
          displayDate = format(date, 'MMMM d, yyyy');
        }
        
        groups.push({ type: 'date', content: displayDate, id: `date-${msgDate}` });
      }
      
      groups.push({ ...msg, type: 'message', id: msg._id || `msg-${Date.now()}-${Math.random()}` });
    });
    
    return groups;
  };

  const groupedMessages = messages ? groupMessagesByDate(messages) : [];

  return (
    <div className='flex flex-col h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm z-10'>
        <div className='flex items-center gap-3'>
          <button 
            onClick={() => navigate('/')}
            className='p-2 rounded-full hover:bg-gray-800/80 transition-all duration-200 active:scale-95'
          >
            <MdOutlineKeyboardBackspace className='text-gray-300 w-6 h-6' />
          </button>
          
          <div 
            className='flex items-center gap-3 cursor-pointer group'
            onClick={() => navigate(`/profile/${selectedUser.userName}`)}
          >
            <div className='relative'>
              <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-300 transform group-hover:scale-105'>
                <img 
                  src={selectedUser.profileImage || profilePic} 
                  alt={selectedUser.userName}
                  className='w-full h-full object-cover'
                />
              </div>
              {onlineUsers.includes(selectedUser._id) && (
                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 ring-1 ring-green-400/50 animate-pulse'></div>
              )}
            </div>
            <div>
              <h2 className='text-white font-medium group-hover:text-blue-400 transition-colors'>{selectedUser.userName}</h2>
              <div className='flex items-center gap-1'>
                {onlineUsers.includes(selectedUser._id) ? (
                  <>
                    <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
                    <p className='text-xs text-green-400'>Active now</p>
                  </>
                ) : (
                  <p className='text-xs text-gray-400'>Offline</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className='flex items-center gap-2'>
          <button className='p-2 rounded-full hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-blue-400'>
            <BsThreeDotsVertical className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className='flex-1 overflow-y-auto p-4 space-y-6 bg-linear-to-b from-gray-900/80 to-gray-900/50'>
        <AnimatePresence>
          {groupedMessages.length > 0 ? (
            <div className='space-y-6'>
              {groupedMessages.map((item) => {
                if (item.type === 'date') {
                  return (
                    <div key={item.id} className='relative flex items-center justify-center my-4'>
                      <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                        <div className='w-full border-t border-gray-700/50'></div>
                      </div>
                      <div className='relative flex justify-center'>
                        <span className='px-3 text-xs text-gray-400 bg-gray-900/80 rounded-full border border-gray-700/50'>
                          {item.content}
                        </span>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={item.sender === userData._id ? 'flex justify-end' : 'flex justify-start'}
                  >
                    {item.sender === userData._id ? (
                      <SenderMsg message={item} />
                    ) : (
                      <ReceiverMsg message={item} />
                    )}
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='h-full flex flex-col items-center justify-center text-center p-6'
            >
              <div className='w-24 h-24 mb-4 rounded-full bg-linear-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center'>
                <svg className='w-12 h-12 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-white mb-1'>Say hello! 👋</h3>
              <p className='text-gray-400 max-w-md'>Send your first message to start the conversation</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <div className='p-4 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm'>
        <AnimatePresence>
          {frontendImage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='relative mb-3 max-w-xs mx-auto rounded-xl overflow-hidden border border-gray-700/50 shadow-lg'
            >
              <img 
                src={frontendImage} 
                alt='Preview' 
                className='w-full h-40 object-cover'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-3'>
                <button
                  onClick={() => {
                    setFrontendImage(null);
                    setBackendImage(null);
                  }}
                  className='ml-auto bg-red-500/90 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z' clipRule='evenodd' />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSendMsg} className='flex items-center gap-2'>
          <input
            type='file'
            accept='image/*'
            ref={imageInput}
            onChange={handleImage}
            className='hidden'
          />
          
          <div className='relative flex-1 bg-gray-800/50 rounded-full border border-gray-700/50 focus-within:border-blue-500/50 transition-all duration-200 flex items-center pr-2'>
            <button
              type='button'
              onClick={() => imageInput.current.click()}
              className='p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-full'
              aria-label='Attach image'
            >
              <LuImagePlus className='w-5 h-5' />
            </button>
            
            <input
              type='text'
              value={input || ''}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type a message...'
              className='w-full bg-transparent border-0 text-white py-3 px-2 focus:ring-0 focus:outline-none placeholder-gray-500 text-sm sm:text-base'
            />
            
            <div className='flex items-center gap-1'>
              <button
                type='button'
                className='p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full'
              >
                <MdOutlineEmojiEmotions className='w-5 h-5' />
              </button>
              
              <button
                type='submit'
                disabled={!input && !frontendImage}
                className={`p-2 rounded-full transition-all duration-200 ${
                  input || frontendImage
                    ? 'text-blue-500 hover:text-blue-400 hover:bg-gray-700/50'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                {input || frontendImage ? (
                  <IoSend className='w-5 h-5' />
                ) : (
                  <IoSendOutline className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessageArea
