import React, { useEffect, useRef, useState } from 'react'
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import profilePic from '../assets/profilePic.png'
import FollowButton from './FollowButton';
import { useNavigate } from 'react-router-dom';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineComment } from 'react-icons/md';
import { serverUrl } from '../App';
import axios from 'axios';
import { setLoopData } from '../redux/loopSlice';
import { IoSendSharp } from 'react-icons/io5';

const LoopCard = ({loop}) => {

  const videoRef = useRef();
  const commentRef = useRef();
  const navigate = useNavigate();
  const {userData} = useSelector((state) => state.user);
  const {loopData} = useSelector((state) => state.loop);
  const {socket} = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMute, setIsMute] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [msg, setMsg] = useState('');

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if(video) {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    }
  };

  const handleClick = () => {
    if(isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/loop/like/${loop._id}`, {
          withCredentials: true
      });
      const updatedLoop = result.data;

      const updatedLoops = loopData.map(p => p._id == loop._id ? updatedLoop : p);
      dispatch(setLoopData(updatedLoops));
            
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/loop/comment/${loop._id}`, 
        { message: msg },  // Changed from 'msg' to 'message' to match backend
        { withCredentials: true }
      );
      const updatedLoop = result.data;

      const updatedLoops = loopData.map(p => p._id === loop._id ? updatedLoop : p);
      dispatch(setLoopData(updatedLoops));
      setMsg('');
            
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  
  const handleLikeOnDoubleClick = () => {
    setShowHeart(true);
    setTimeout(() => {
      setShowHeart(false);
    }, 6000)

    {!loop.likes.includes(userData._id) ? handleLike() : null}
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if(commentRef.current && !commentRef.current.contains(e.target)) {
        setShowComment(false);
      }
    };

    if(showComment) {
      document.addEventListener('mousedown', handleClickOutside)
      
    } else {
      document.removeEventListener('mousedown', handleClickOutside)

    }

  }, [showComment]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const video = videoRef.current;

      if(entry.isIntersecting) {
        video.play();
        setIsPlaying(true);

      } else {
        video.pause();
        setIsPlaying(false);

      }

    }, {threshold: 0.6});

    if(videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if(videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    }

  }, []);

  useEffect(() => {
    const handleLikedLoop = (updatedData) => {
        const updatedLoops = loopData.map(p => 
            p._id === updatedData.loopId 
                ? { ...p, likes: updatedData.likes } 
                : p
        );
        dispatch(setLoopData(updatedLoops));
    };
    
    const handleCommentedLoop = (updatedData) => {
        const updatedLoops = loopData.map(p => 
            p._id === updatedData.loopId 
                ? { ...p, comments: updatedData.comments } 
                : p
        );
        dispatch(setLoopData(updatedLoops));
    };

    socket?.on('likedLoop', handleLikedLoop);
    socket?.on('commentedLoop', handleCommentedLoop);

    return () => {
        socket?.off('likedLoop', handleLikedLoop);
        socket?.off('commentedLoop', handleCommentedLoop);
    };
}, [socket, loopData, dispatch]);


  return (
    <div className='w-full lg:w-[480px] h-screen flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden'>

      {showHeart && <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
        <GoHeartFill className='w-[100px] h-[100px] drop-shadow-2xl text-white'/>
      </div>}

      {/* Comment Section */}
      <div ref={commentRef} className={`absolute z-200 bottom-0 w-full h-[500px] px-2.5 rounded-t-4xl bg-[#0e1718] left-0 ${showComment ? 'translate-y-0' : 'translate-y-full'} transition-transform duration-500 ease-in-out shadow-2xl shadow-black`}>

        <h1 className='text-white text-[20px] text-center font-semibold py-2.5'>Comments</h1>

        {/* App Comments */}
        <div className='w-full h-[350px] overflow-y-auto flex flex-col gap-5'>

          {loop.comments.length == 0 && 
            <div className='text-center text-white text-5 font-semibold mt-[50px]'>No Comments Yet</div>
          }

          {loop.comments?.map((comment, index) => (
            <div className='w-full flex flex-col gap-[5px] border-b border-gray-800 justify-center pb-2.5'>
              <div className='flex text-white items-center gap-2.5'>
                <div className='w-[35px] h-[35px] md:w-10 md:h-10 rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${comment?.author?.userName}`)}>
                  <img 
                    src={comment?.author?.profileImage || profilePic} 
                    alt="" 
                    className='w-full h-full object-cover'
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = profilePic;
                    }}
                  />
                </div>
                <div className=' flex flex-col justify-center'>
                    <div className='font-semibold truncate'>{comment?.author?.userName}</div>
                    <div className='wrap-break-words'>{comment.message}</div>
                </div>
              </div>

              </div>
          ))}
        </div>

        <div className='w-full fixed h-20 flex items-center justify-between px-5 py-5 bottom-0'>
          <div className='w-[35px] h-[35px] md:w-10 md:h-10 rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${post?.author?.userName}`)}>
              <img src={loop?.author?.profileImage || profilePic} alt="" className='w-full object-cover'/>
          </div>
        
          <input type="text" className='px-2.5 border-b-2 border-b-gray-500 w-[90%] outline-none h-10 text-white' placeholder={`Add a comment for ${loop?.author?.userName}...`} onChange={(e) => setMsg(e.target.value)} value={msg}/>
        
          {msg && 
            <button className='absolute right-5 cursor-pointer text-white' onClick={handleComment}>
                <IoSendSharp className='w-5 h-5'/>
            </button>
          }
        </div>

      </div>

      <video ref={videoRef} src={loop?.media} muted={isMute ? true : false} autoPlay loop  className='w-full max-h-full' onClick={handleClick} onTimeUpdate={handleTimeUpdate} onDoubleClick={handleLikeOnDoubleClick}/>

      {/* Volume Button */}
      <div className='absolute top-5 right-5 cursor-pointer' onClick={() => setIsMute(!isMute)}>
        {!isMute ? <FiVolume2 className='w-5 h-5 text-white font-semibold'/> : <FiVolumeX className='w-5 h-5 text-white font-semibold'/>}
      </div>

      {/* Progress Bar */}
      <div className='absolute bottom-0 w-full h-1 bg-gray-900 '>
        <div className='w-40 h-full bg-white transition-all duration-200 ease-linear' style={{width: `${progress}% `}}></div>
      </div>

      <div className='w-full absolute h-[100px] bottom-[5px] px-5 gap-2.5 flex flex-col '>
        <div className='flex items-center gap-2'>
            <div className='w-[45px] h-[45px] border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${loop?.author?.userName}`)}>
              <img src={loop?.author?.profileImage || profilePic} alt="" className='w-full object-cover'/>
            </div>
        
            <div className='w-[120px] font-semibold truncate text-white hover:underline' onClick={() => navigate(`/profile/${loop?.author?.userName}`)}>{loop?.author?.userName}</div>

            <FollowButton targetUserId={loop?.author?._id} tailwind={"px-2.5 py-1.5 text-white border-2 border-white cursor-pointer text-[14px] rounded-2xl"}/>
        </div>

        <div className='w-[450px] font-semibold truncate text-white px-2.5'>
          {loop?.caption}
        </div>

        <div className='absolute right-2 flex flex-col gap-5 text-white bottom-[120px] justify-center px-2.5'>
          <div className='flex flex-col items-center cursor-pointer'>
            <div onClick={handleLike}>
              {!loop?.likes?.includes(userData._id) ? 
                <GoHeart className='w-[25px] h-[25px] cursor-pointer'/> :
                <GoHeartFill className='w-[25px] h-[25px] cursor-pointer text-red-600'/>
              }
            </div>
            <div>{loop?.likes?.length}</div>
          </div>
          
          <div className='flex flex-col items-center cursor-pointer'>
            <div onClick={() => setShowComment(true)}><MdOutlineComment className='w-[25px] h-[25px] cursor-pointer '/></div>
            <div>{loop?.comments?.length}</div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoopCard
