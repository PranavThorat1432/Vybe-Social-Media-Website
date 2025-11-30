import React, { useRef, useState } from 'react';
import { FiPlus, FiImage, FiVideo, FiX } from 'react-icons/fi';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '../Components/VideoPlayer';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setPostData } from '../redux/postSlice';
import { setCurrentUserStory } from '../redux/storySlice';
import { setLoopData } from '../redux/loopSlice';
import { ClipLoader } from 'react-spinners';

const Upload = () => {

    const navigate = useNavigate();
    const [uploadType, setUploadType] = useState('Post');
    const [frontendMedia, setFrontendMedia] = useState(null);
    const [backendMedia, setBackendMedia] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const {postData} = useSelector((state) => state.post);
    const {storyData} = useSelector((state) => state.story);
    const {loopData} = useSelector((state) => state.loop);
    const mediaInput = useRef();

    const handleMedia = (e) => {
      const file = e.target.files[0];
      console.log(file);
      if(file.type.includes('image')) {
        setMediaType('image');

      } else {
        setMediaType('video');

      }

      setBackendMedia(file);
      setFrontendMedia(URL.createObjectURL(file));
    };


    const uploadPost = async () => {
      try {
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('mediaType', mediaType);
        formData.append('media', backendMedia);
        
        const result = await axios.post(`${serverUrl}/api/post/upload-post`, formData, {
          withCredentials: true
        });
        dispatch(setPostData([...postData, result.data]));
        setLoading(false);
        navigate('/');
        
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };


    const uploadStory = async () => {
      try {
        const formData = new FormData();
        formData.append('mediaType', mediaType);
        formData.append('media', backendMedia);
        
        const result = await axios.post(`${serverUrl}/api/story/upload-story`, formData, {
          withCredentials: true
        });
        dispatch(setCurrentUserStory(result.data))
        setLoading(false);
        navigate('/');

      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };


    const uploadLoop = async () => {
      try {
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('media', backendMedia);
        
        const result = await axios.post(`${serverUrl}/api/loop/upload-loop`, formData, {
          withCredentials: true
        });
        dispatch(setLoopData([...loopData, result.data]));
        setLoading(false);
        navigate('/');

      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    const handleUpload = () => {
      setLoading(true);

      if(uploadType === 'Post') {
        uploadPost();

      } else if(uploadType === 'Story') {
        uploadStory();

      } else {
        uploadLoop();
      }
    };
    

  // Get accept string based on upload type
  const getAcceptString = () => {
    if (uploadType === 'Loop') return 'video/*';
    if (uploadType === 'Story') return 'image/*,video/*';
    return 'image/*,video/*';
  };

  // Handle drag and drop
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMedia({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  return (
    <div className='w-full min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4 md:p-8'>
      <div className='w-full max-w-3xl bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700'>
        {/* Header */}
        <div className='p-4 border-b border-gray-700 flex items-center'>
          <button 
            onClick={() => navigate('/')}
            className='p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 mr-4 cursor-pointer'
          >
            <MdOutlineKeyboardBackspace className='text-gray-300 w-6 h-6' />
          </button>
          <h1 className='text-xl font-bold text-white'>Create New {uploadType}</h1>
        </div>

        {/* Upload Type Selector */}
        <div className='p-4 border-b border-gray-700'>
          <div className='flex bg-gray-700 rounded-full p-1'>
            {['Post', 'Story', 'Loop'].map((type) => (
              <button
                key={type}
                onClick={() => setUploadType(type)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  uploadType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className='p-6'>
          {!frontendMedia ? (
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => mediaInput.current.click()}
            >
              <input 
                type="file" 
                accept={getAcceptString()}
                hidden 
                ref={mediaInput} 
                onChange={handleMedia}
              />
              <div className='flex flex-col items-center justify-center space-y-4'>
                <div className='w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center'>
                  <FiPlus className='text-white w-8 h-8' />
                </div>
                <h3 className='text-xl font-semibold text-white'>Drag and drop {uploadType === 'Loop' ? 'a video' : 'photos or videos'} here</h3>
                <p className='text-gray-400 text-sm'>
                  {uploadType === 'Post' && 'Share photos or videos to your feed'}
                  {uploadType === 'Story' && 'Share a photo or video to your story'}
                  {uploadType === 'Loop' && 'Upload a short video to loop'}
                </p>
                <button 
                  className='mt-4 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-2 px-6 rounded-full transition-colors duration-200'
                  onClick={(e) => {
                    e.stopPropagation();
                    mediaInput.current.click();
                  }}
                >
                  Select from computer
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Media Preview */}
              <div className='relative bg-black rounded-xl overflow-hidden'>
                <button 
                  onClick={() => {
                    setFrontendMedia(null);
                    setBackendMedia(null);
                  }}
                  className='absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700/90 p-2 rounded-full z-10 transition-colors duration-200'
                >
                  <FiX className='text-white w-5 h-5' />
                </button>
                
                {mediaType === 'image' ? (
                  <img 
                    src={frontendMedia} 
                    alt="Preview" 
                    className='w-full max-h-[400px] object-contain mx-auto rounded-lg'
                  />
                ) : (
                  <div className='w-full max-h-[400px] flex items-center justify-center'>
                    <VideoPlayer media={frontendMedia} />
                  </div>
                )}
              </div>

              {/* Caption Input */}
              {uploadType !== 'Story' && (
                <div className='relative'>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={`Add a caption${uploadType === 'Loop' ? ' for your loop...' : '...'}`}
                    className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px]'
                    rows='3'
                  />
                  <div className='flex justify-between items-center mt-2 text-xs text-gray-400'>
                    <span>{caption.length}/2,200</span>
                    {uploadType === 'Loop' && (
                      <div className='flex items-center space-x-2'>
                        <FiVideo className='w-4 h-4' />
                        <span>Video will loop automatically</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`w-full py-3 cursor-pointer px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                  loading
                    ? 'bg-blue-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color='white' className='mr-2' />
                    <span>Uploading...</span>
                  </>
                ) : (
                  `Share ${uploadType}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Upload
