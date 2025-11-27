import React, { useEffect, useState } from 'react'
import profilePic from '../assets/profilePic.png'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import VideoPlayer from './VideoPlayer';
import { FaEye } from "react-icons/fa6";

const StoryCard = ({story}) => {

    const navigate = useNavigate();
    const {storyData} = useSelector((state) => state.story); 
    const {userData, profileData} = useSelector((state) => state.user); 


    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => { 
                if(prev >= 100) {
                    clearInterval(interval);
                    navigate('/');
                    return 100;
                }
                return prev + 1
            })
        }, 150)

        return () => clearInterval(interval);

    }, [navigate]);

    const viewerList = storyData?.viewers?.filter((viewer) => viewer?._id !== userData?._id) || [];

  return (
    <div className='w-full max-w-[500px] h-screen border-x-2 border-gray-800 pt-2.5 relative flex flex-col justify-center text-white'>
        <div className='flex items-center gap-2.5 absolute top-7 left-5'>
            <MdOutlineKeyboardBackspace className='text-white w-[30px] h-[30px] cursor-pointer' onClick={() => navigate(`/`)}/>

            <div className='w-[45px] h-[45px] border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${storyData?.author?.userName}`)}>
                <img src={storyData?.author?.profileImage || profilePic} alt="" className='w-full object-cover'/>
            </div>
                        
            <div className='w-[120px] font-semibold  text-white hover:underline' onClick={() => navigate(`/profile/${storyData?.author?.userName}`)}>{storyData?.author?.userName}</div>
        </div>

        {/* Progress Bar */}
        <div className='absolute top-2.5 w-full h-1 bg-gray-900 '>
            <div className='w-40 h-full bg-white transition-all duration-200 ease-linear' style={{width: `${progress}% `}}></div>
        </div>

        {!showViewers && <>
            <div className='w-full h-[90vh] flex items-center justify-center'>
                {storyData?.mediaType === 'image' && 
                    <div className='w-[90%] flex items-center justify-center '>
                        <img src={storyData?.media} alt="" className='w-[80%] rounded-2xl object-cover'/> 
                    </div>
                }

                {storyData?.mediaType === 'video' && 
                    <div className='w-[80%] flex flex-col items-center justify-center '>
                        <VideoPlayer media={storyData?.media}/>
                    </div>
                }
            </div>
            
            { story?.author?.userName == userData?.userName &&
                <div className='w-full h-[70px] bottom-0 p-2 left-0 flex items-center  gap-2.5 cursor-pointer' onClick={() => setShowViewers(true)}>
                    <div className='text-white flex items-center gap-[5px] '><FaEye/> {viewerList.length}</div>
                    <div className='flex relative h-10'>
                        {viewerList.slice(0, 3).map((viewer, index) => (
                            <div
                                key={viewer?._id || index}
                                className='w-7 h-7 border-2 border-black rounded-full cursor-pointer overflow-hidden absolute'
                                style={{ left: `${index * 9}px` }}
                            >
                                <img src={viewer?.profileImage || profilePic} alt="" className='w-full object-cover'/>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </>}


        {showViewers && 
            <>
                <div className='w-full h-[30%] flex items-center justify-center mt-[100px] mb-5 overflow-hidden cursor-pointer' onClick={() => setShowViewers(false)}>
                    {storyData?.mediaType === 'image' && 
                        <div className='h-full flex items-center justify-center '>
                            <img src={storyData?.media} alt="" className='h-[80%] rounded-2xl object-cover'/> 
                        </div>
                    }

                    {storyData?.mediaType === 'video' && 
                        <div className='h-full flex flex-col items-center justify-center '>
                            <VideoPlayer media={storyData?.media}/>
                        </div>
                    }
                </div>

                <div className='w-full h-[70%] border-t-2 border-t-gray-800 p-5'>
                    <div className='flex items-center gap-1.5'>
                        <FaEye/> <span>{viewerList.length}</span> <span>Viewers</span>
                    </div>

                    <div className='w-full max-h-full flex flex-col gap-2.5 overflow-auto pt-5'>
                        {viewerList.map((viewer, index) => (
                            <div className='w-full flex items-center gap-2.5'>
                                <div className='w-[35px] h-[35px] border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${viewer?.userName}`)}>
                                    <img src={viewer?.profileImage || profilePic} alt="" className='w-full object-cover'/>
                                </div>
                                    
                                <div className='w-[120px] font-semibold  text-white hover:underline' onClick={() => navigate(`/profile/${viewer?.userName}`)}>{viewer?.userName}</div>
                            </div>
                        ))} 
                    </div>
                </div>
            </>
        }

        
    </div>
  )
}

export default StoryCard
