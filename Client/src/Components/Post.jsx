import React, { useEffect, useState, useRef } from 'react';
import profilePic from '../assets/profilePic.png';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MdOutlineComment, 
  MdOutlineBookmarkBorder, 
  MdOutlineBookmark,
  MdMoreHoriz,
  MdOutlineShare,
  MdEmojiEmotions
} from 'react-icons/md';
import { IoSendSharp } from 'react-icons/io5';
import { BsThreeDots, BsEmojiSmile } from 'react-icons/bs';
import axios from 'axios';
import { serverUrl } from '../App';
import { removePost, setPostData } from '../redux/postSlice';
import { setUserData } from '../redux/userSlice';
import FollowButton from './FollowButton';
import { motion, AnimatePresence } from 'framer-motion';


const Post = ({ post }) => {
    const { userData } = useSelector((state) => state.user);
    const { postData } = useSelector((state) => state.post);
    const { socket } = useSelector((state) => state.socket);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const commentInputRef = useRef(null);
    const [showComment, setShowComment] = useState(false);
    const [msg, setMsg] = useState('');
    const [isLiked, setIsLiked] = useState(post?.likes?.includes(userData?._id));
    const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
    const [showOptions, setShowOptions] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(userData?.saved?.includes(post?._id));
    const [doubleClickLike, setDoubleClickLike] = useState(false);
    
    // Format timestamp
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - postDate) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleLike = async () => {
        try {
            const wasLiked = isLiked;
            
            // Optimistic UI update
            setIsLiked(!wasLiked);
            setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
            
            const result = await axios.get(`${serverUrl}/api/post/like/${post._id}`, {
                withCredentials: true
            });
            
            const updatedPost = result.data;
            const updatedPosts = postData.map(p => p._id === post._id ? updatedPost : p);
            dispatch(setPostData(updatedPosts));
            
        } catch (error) {
            console.error('Error liking post:', error);
            // Revert on error
            setIsLiked(prev => !prev);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };
    
    const handleDoubleClick = () => {
        if (!isLiked) {
            setDoubleClickLike(true);
            handleLike();
            setTimeout(() => setDoubleClickLike(false), 1000);
        }
    };


    const handleComment = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        
        const tempComment = {
            _id: `temp-${Date.now()}`,
            message: msg,
            author: {
                _id: userData._id,
                userName: userData.userName,
                profileImage: userData.profileImage
            },
            createdAt: new Date().toISOString()
        };
        
        // Optimistic UI update
        const updatedPost = {
            ...post,
            comments: [tempComment, ...(post.comments || [])]
        };
        
        const updatedPosts = postData.map(p => p._id === post._id ? updatedPost : p);
        dispatch(setPostData(updatedPosts));
        setMsg('');
        
        try {
            const result = await axios.post(
                `${serverUrl}/api/post/comment/${post._id}`, 
                { message: msg },
                { withCredentials: true }
            );
            
            // Update with server response
            const serverUpdatedPost = result.data;
            const finalUpdatedPosts = postData.map(p => 
                p._id === post._id ? serverUpdatedPost : p
            );
            dispatch(setPostData(finalUpdatedPosts));
            
        } catch (error) {
            console.error('Error posting comment:', error);
            // Revert on error
            const revertedPosts = postData.map(p => p._id === post._id ? post : p);
            dispatch(setPostData(revertedPosts));
        }
    };


    const handleSaved = async () => {
        const wasBookmarked = isBookmarked;
        
        // Optimistic UI update
        setIsBookmarked(!wasBookmarked);
        
        try {
            const result = await axios.get(
                `${serverUrl}/api/post/saved/${post._id}`, 
                { withCredentials: true }
            );
            
            dispatch(setUserData(result.data));
            
        } catch (error) {
            console.error('Error Saving Post:', error);
            // Revert on error
            setIsBookmarked(wasBookmarked);
        }
    };
    
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Check out this post',
                    text: `Post by ${post.author.userName}`,
                    url: `${window.location.origin}/post/${post._id}`,
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(
                    `${window.location.origin}/post/${post._id}`
                );
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleDeletePost = async () => {
        if (isDeleting || post?.author?._id !== userData?._id) return;
        
        const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
        if (!confirmDelete) return;
        
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${serverUrl}/api/post/delete/${post._id}`, {
                withCredentials: true
            });
            
            // Remove the post from the Redux store
            dispatch(removePost(post._id));
            
            // Show success message
            alert('Post deleted successfully');
            
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowOptions(false);
        }
    };

    useEffect(() => {
        const handleLikedPost = (updatedData) => {
            const updatedPosts = postData.map(p => 
                p._id === updatedData.postId 
                    ? { ...p, likes: updatedData.likes } 
                    : p
            );
            dispatch(setPostData(updatedPosts));
        };
        
        const handleCommentedPost = (updatedData) => {
            const updatedPosts = postData.map(p => 
                p._id === updatedData.postId 
                    ? { ...p, comments: updatedData.comments } 
                    : p
            );
            dispatch(setPostData(updatedPosts));
        };

        const handlePostDeleted = ({ postId }) => {
            dispatch(removePost(postId));
        };

        socket?.on('likedPost', handleLikedPost);
        socket?.on('commentedPost', handleCommentedPost);
        socket?.on('postDeleted', handlePostDeleted);

        return () => {
            socket?.off('likedPost', handleLikedPost);
            socket?.off('commentedPost', handleCommentedPost);
            socket?.off('postDeleted', handlePostDeleted);
        };
    }, [socket, postData, dispatch]);


  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-[600px] mx-auto bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg dark:shadow-gray-900/30 mb-6 border border-gray-100 dark:border-gray-700'
    >
        {/* Header */}
        <div className='flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700'>
            <div className='flex items-center space-x-3'>
                <div 
                    className='w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500 cursor-pointer hover:opacity-90 transition-opacity'
                    onClick={() => navigate(`/profile/${post?.author?.userName}`)}
                >
                    <img 
                        src={post?.author?.profileImage || profilePic} 
                        alt={post?.author?.userName}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = profilePic;
                        }}
                    />
                </div>
                <div 
                    className='flex flex-col cursor-pointer'
                    onClick={() => navigate(`/profile/${post?.author?.userName}`)}
                >
                    <span className='font-semibold text-sm text-gray-900 dark:text-white hover:underline'>
                        {post?.author?.userName}
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {formatTimeAgo(post?.createdAt)}
                    </span>
                </div>
            </div>
            
            <div className='relative'>
                <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                >
                    <BsThreeDots className='w-5 h-5 text-gray-600 dark:text-gray-300 cursor-pointer' />
                </button>
                
                {showOptions && (
                    <div className='absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700'>
                        {userData?._id === post?.author?._id ? (
                            <>
                                <button 
                                    onClick={handleDeletePost}
                                    disabled={isDeleting}
                                    className={`w-full text-left px-4 py-2 text-sm ${isDeleting ? 'text-gray-500' : 'text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'} flex items-center gap-2 cursor-pointer`}
                                >
                                    {isDeleting ? (
                                        <span className='flex items-center gap-2'>
                                            <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                            </svg>
                                            Deleting...
                                        </span>
                                    ) : 'Delete Post'}
                                </button>
                                <button className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'>
                                    Edit Post
                                </button>
                            </>
                        ) : (
                            <button className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'>
                                Report Post
                            </button>
                        )}
                        <button 
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)}
                            className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        >
                            Copy Link
                        </button>
                    </div>
                )}
            </div>

        </div>

        {/* Post Media */}
        <div 
            className='relative w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer'
            onDoubleClick={handleDoubleClick}
            style={{ aspectRatio: '1/1' }}
        >
            {post?.mediaType === 'image' && (
                <img 
                    src={post?.media} 
                    alt="Post content" 
                    className='w-full h-full object-contain bg-black'
                    loading='lazy'
                />
            )}

            {post?.mediaType === 'video' && (
                <div className='w-full h-full'>
                    <VideoPlayer media={post?.media} />
                </div>
            )}
            
            {/* Double tap like animation */}
            <AnimatePresence>
                {doubleClickLike && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className='absolute pointer-events-none'
                    >
                        <GoHeartFill className='w-24 h-24 text-white/90' />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        {/* Action Buttons */}
        <div className='p-3'>
            <div className='flex justify-between items-center mb-2'>
                <div className='flex space-x-4'>
                    <button 
                        onClick={handleLike}
                        className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                    >
                        {isLiked ? (
                            <GoHeartFill className='w-6 h-6 text-red-500' />
                        ) : (
                            <GoHeart className='w-6 h-6 text-gray-700 dark:text-gray-300' />
                        )}
                    </button>
                    
                    <button 
                        onClick={() => {
                            setShowComment(!showComment);
                            if (!showComment && commentInputRef.current) {
                                setTimeout(() => commentInputRef.current.focus(), 100);
                            }
                        }}
                        className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                    >
                        <MdOutlineComment className='w-6 h-6 text-gray-700 dark:text-gray-300' />
                    </button>
                    
                    <button 
                        onClick={handleShare}
                        className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                    >
                        <MdOutlineShare className='w-6 h-6 text-gray-700 dark:text-gray-300' />
                    </button>
                </div>
                
                <button 
                    onClick={handleSaved}
                    className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                    {isBookmarked ? (
                        <MdOutlineBookmark className='w-6 h-6 text-gray-900 dark:text-yellow-400' />
                    ) : (
                        <MdOutlineBookmarkBorder className='w-6 h-6 text-gray-700 dark:text-gray-300' />
                    )}
                </button>
            </div>
            
            {/* Like count */}
            <div className='font-semibold text-sm text-gray-900 dark:text-white mb-1'>
                {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
            </div>
            
            {/* Caption */}
            {post?.caption && (
                <div className='text-sm text-gray-900 dark:text-white mb-1'>
                    <span 
                        className='font-semibold mr-2 hover:underline cursor-pointer'
                        onClick={() => navigate(`/profile/${post.author.userName}`)}
                    >
                        {post.author.userName}
                    </span>
                    {post.caption}
                </div>
            )}
            
            {/* View all comments */}
            {post?.comments?.length > 0 && (
                <button 
                    onClick={() => setShowComment(!showComment)}
                    className='text-sm text-gray-500 dark:text-gray-400 mb-2 hover:underline'
                >
                    View all {post.comments.length} comments
                </button>
            )}
            
            {/* Time posted */}
            <div className='text-xs text-gray-400 uppercase tracking-wider'>
                {formatTimeAgo(post?.createdAt)}
            </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
            {showComment && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className='border-t border-gray-100 dark:border-gray-700 overflow-hidden'
                >
                    {/* Comments List */}
                    <div className='max-h-[300px] overflow-y-auto p-3 space-y-3'>
                        {Array.isArray(post?.comments) && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <motion.div 
                                    key={comment?._id || comment.tempId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className='flex items-start space-x-3 group'
                                >
                                    <div 
                                        className='shrink-0 w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-pink-500'
                                        onClick={() => navigate(`/profile/${comment?.author?.userName}`)}
                                    >
                                        <img 
                                            src={comment?.author?.profileImage || profilePic} 
                                            alt={comment?.author?.userName}
                                            className='w-full h-full object-cover'
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = profilePic;
                                            }}
                                        />
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <div className='inline-flex flex-col bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2'>
                                            <div className='flex items-center space-x-2'>
                                                <span 
                                                    className='font-semibold text-sm text-gray-900 dark:text-white hover:underline cursor-pointer'
                                                    onClick={() => navigate(`/profile/${comment?.author?.userName}`)}
                                                >
                                                    {comment?.author?.userName}
                                                </span>
                                                <span className='text-sm text-gray-900 dark:text-gray-100 wrap-break-words'>
                                                    {comment?.message}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className='flex items-center space-x-4 mt-1 ml-2 text-xs text-gray-500 dark:text-gray-400'>
                                            <span>{formatTimeAgo(comment?.createdAt)}</span>
                                            <button className='font-semibold hover:underline'>Reply</button>
                                            <button className='font-semibold hover:underline'>Like</button>
                                            
                                            {comment?.author?._id === userData?._id && (
                                                <button className='text-red-500 hover:underline'>Delete</button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button className='opacity-0 group-hover:opacity-100 transition-opacity p-1'>
                                        {comment?.author?._id === userData?._id ? (
                                            <BsThreeDots className='w-4 h-4 text-gray-500' />
                                        ) : (
                                            <GoHeart className='w-4 h-4 text-gray-500 hover:text-red-500' />
                                        )}
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                                No comments yet. Be the first to comment!
                            </div>
                        )}
                    </div>
                    
                    {/* Add Comment */}
                    <form onSubmit={handleComment} className='border-t border-gray-100 dark:border-gray-700 p-3'>
                        <div className='flex items-center space-x-2'>
                            <div className='flex-1 relative'>
                                <input
                                    ref={commentInputRef}
                                    type='text'
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    placeholder='Add a comment...'
                                    className='w-full bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                />
                                <button 
                                    type='button'
                                    className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500'
                                >
                                    <BsEmojiSmile className='w-5 h-5' />
                                </button>
                            </div>
                            
                            <button 
                                type='submit'
                                disabled={!msg.trim()}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                                    msg.trim() 
                                        ? 'bg-pink-500 text-white hover:bg-pink-600 cursor-pointer' 
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                                } transition-colors`}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default Post;
