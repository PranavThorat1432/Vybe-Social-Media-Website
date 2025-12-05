import React, { useState } from 'react';
import profilePic from '../assets/profilePic.png';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHeart, FiMessageSquare, FiUserPlus, FiClock, FiTrash2, FiX, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { removeNotification } from '../redux/userSlice';

const NotificationCard = ({ noti, onMarkAsRead, onDelete }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (isDeleting) return;
        
        try {
            setIsDeleting(true);
            await axios.delete(`${serverUrl}/api/user/notifications/${noti._id}`, {
                withCredentials: true
            });
            
            // Dispatch action to remove notification from Redux store
            dispatch(removeNotification(noti._id));
            
            // If there's a parent component handling deletion
            if (onDelete) {
                onDelete(noti._id);
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Get appropriate icon based on notification type
    const getNotificationIcon = () => {
        switch(noti.type) {
            case 'like':
                return <FiHeart className='w-5 h-5 text-red-500' />;
            case 'comment':
                return <FiMessageSquare className='w-5 h-5 text-blue-500' />;
            case 'follow':
                return <FiUserPlus className='w-5 h-5 text-green-500' />;
            default:
                return <FiUser className='w-5 h-5 text-gray-400' />;
        }
    };

    // Format timestamp
    const formatTime = (dateString) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    const handleClick = () => {
        // Mark as read when clicked
        if (!noti.isRead) {
            onMarkAsRead?.();
        }
        
        // Navigate to the relevant content
        if (noti.post) {
            navigate(`/post/${noti.post._id}`);
        } else if (noti.loop) {
            navigate(`/loops/${noti.loop._id}`);
        } else if (noti.sender) {
            navigate(`/profile/${noti.sender.userName}`);
        }
    };

    return (
        <div 
            className={`relative group p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                noti.isRead 
                    ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                    : 'bg-gray-800 hover:bg-gray-700 border-l-4 border-blue-500'
            }`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                if (!showDeleteConfirm) {
                    setIsMenuOpen(false);
                }
            }}
        >
            <div className='flex items-start gap-3'>
                {/* Notification Icon */}
                <div className='relative mt-0.5'>
                    <div className={`p-2 rounded-full ${
                        noti.isRead ? 'bg-gray-700' : 'bg-blue-500/20'
                    }`}>
                        {getNotificationIcon()}
                    </div>
                    {!noti.isRead && (
                        <div className='absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-800' />
                    )}
                </div>

                {/* Notification Content */}
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                        <span 
                            className='font-semibold text-white hover:underline'
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${noti.sender.userName}`);
                            }}
                        >
                            {noti.sender.userName}
                        </span>
                        <span className='text-gray-300 text-sm'>{noti.message}</span>
                    </div>
                    
                    <div className='flex items-center mt-1 text-xs text-gray-400'>
                        <FiClock className='w-3 h-3 mr-1' />
                        <span>{formatTime(noti.createdAt)}</span>
                    </div>
                </div>

                {/* Media Preview */}
                {(noti?.post || noti?.loop) && (
                    <div className='w-12 h-12 rounded-lg overflow-hidden border border-gray-700 shrink-0 ml-2'>
                        {noti?.loop ? (
                            <video 
                                src={noti.loop.media} 
                                muted 
                                loop 
                                className='w-full h-full object-cover'
                            />
                        ) : noti?.post?.mediaType === 'image' ? (
                            <img 
                                src={noti.post.media} 
                                alt="Post preview" 
                                className='w-full h-full object-cover'
                            />
                        ) : noti?.post?.media ? (
                            <video 
                                src={noti.post.media} 
                                muted 
                                loop 
                                className='w-full h-full object-cover'
                            />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Three-dot menu - Positioned in top-right corner */}
            <div className={`absolute right-3 top-3 transition-opacity duration-200 ${isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
                {!showDeleteConfirm ? (
                    <div className='relative'>
                        <button 
                            className={`p-1.5 rounded-full transition-colors ${isMenuOpen ? 'bg-gray-700' : 'bg-transparent hover:bg-gray-700'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            title='More options'
                        >
                            <FiMoreVertical className='w-4 h-4 text-gray-400' />
                        </button>
                        
                        {/* Dropdown menu */}
                        {isMenuOpen && (
                            <div 
                                className='absolute right-0 mt-1 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10 py-1'
                                onClick={(e) => e.stopPropagation()}
                                style={{ top: '100%' }}
                            >
                                {!noti.isRead && (
                                    <button
                                        className='w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMarkAsRead?.();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                        </svg>
                                        Mark as read
                                    </button>
                                )}
                                <button
                                    className='w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FiTrash2 className='w-4 h-4' />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700 shadow-lg' onClick={(e) => e.stopPropagation()}>
                        <button 
                            className='p-1 text-xs text-red-400 hover:bg-red-900/50 rounded px-2 py-1 transition-colors'
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button 
                            className='p-1 text-xs text-gray-300 hover:bg-gray-700/50 rounded-full transition-colors'
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(false);
                            }}
                        >
                            <FiX className='w-3.5 h-3.5' />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(NotificationCard);
