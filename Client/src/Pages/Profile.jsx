import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { serverUrl } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileData, setUserData } from '../redux/userSlice';
import { MdOutlineKeyboardBackspace, MdPhotoCamera, MdGridOn, MdBookmarkBorder } from 'react-icons/md';
import { FiSettings, FiLogOut, FiMessageCircle } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import profilePic from '../assets/profilePic.png';
import Navbar from '../Components/Navbar';
import FollowButton from '../Components/FollowButton';
import Post from '../Components/Post';
import { setSelectedUser } from '../redux/messageSlice';

const Profile = () => {
    const { userName } = useParams();
    const dispatch = useDispatch();
    const { profileData, userData } = useSelector((state) => state.user);
    const { postData } = useSelector((state) => state.post);
    const navigate = useNavigate();
    const [postType, setPostType] = useState('Post');
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleProfile = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get(`${serverUrl}/api/user/get-profile/${userName}`, {
                withCredentials: true
            });
            dispatch(setProfileData(result.data));
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/auth/signout`, {
                withCredentials: true
            });
            dispatch(setUserData(null));

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        handleProfile();
    }, [userName, dispatch]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                            aria-label="Go back"
                        >
                            <MdOutlineKeyboardBackspace className="w-6 h-6 text-white" />
                        </button>
                        
                        <h1 className="text-xl font-semibold text-white">
                            {profileData?.userName}
                        </h1>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                                aria-label="Menu"
                            >
                                <BsThreeDots className="w-6 h-6 text-white" />
                            </button>
                            
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-700">
                                    {profileData?._id === userData?._id ? (
                                        <>
                                            <button 
                                                onClick={() => {
                                                    navigate('/edit-profile');
                                                    setIsMenuOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                            >
                                                <FiSettings className="mr-3" /> Edit Profile
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                                            >
                                                <FiLogOut className="mr-3" /> Log Out
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                dispatch(setSelectedUser(profileData));
                                                navigate('/messageArea');
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                        >
                                            <FiMessageCircle className="mr-3" /> Message
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Info */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 md:flex md:items-start gap-10">
                        <div className="relative group shrink-0 mx-auto md:mx-0">
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg">
                                <img 
                                    src={profileData?.profileImage || profilePic} 
                                    alt={profileData?.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = profilePic;
                                    }}
                                />
                            </div>
                            {profileData?._id === userData?._id && (
                                <button 
                                    onClick={() => navigate('/edit-profile')}
                                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                                    aria-label="Edit profile picture"
                                >
                                    <MdPhotoCamera className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        
                        <div className="mt-6 md:mt-0 flex-1">
                            <div className="flex items-center flex-wrap gap-4 mb-4">
                                <h2 className="text-2xl font-bold text-white">{profileData?.name}</h2>
                                {profileData?._id !== userData?._id && (
                                    <div className="flex space-x-3">
                                        <FollowButton 
                                            targetUserId={profileData?._id} 
                                            onFollowChange={handleProfile}
                                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                                        />
                                        <button 
                                            onClick={() => {
                                                dispatch(setSelectedUser(profileData));
                                                navigate('/messageArea');
                                            }}
                                            className="px-4 py-1.5 border border-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            Message
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {profileData?.profession && (
                                <p className="text-gray-300 font-medium mb-2">{profileData.profession}</p>
                            )}
                            
                            {profileData?.bio && (
                                <p className="text-gray-400 mb-4">{profileData.bio}</p>
                            )}
                            
                            <div className="flex items-center gap-8 mt-6 pt-4 border-t border-gray-700">
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-bold text-white">{profileData?.posts?.length || 0}</div>
                                    <span className="text-sm text-gray-400">Posts</span>
                                </div>
                                
                                <button 
                                    onClick={() => navigate(`/followers/${profileData?.userName}`)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex relative -translate-y-2">
                                            {profileData?.followers?.slice(0, 3).map((follower, index) => (
                                                <div 
                                                    key={follower._id}
                                                    className={`w-8 h-8 border-2 border-gray-800 rounded-full overflow-hidden ${index > 0 ? 'absolute' : ''}`}
                                                    style={index > 0 ? { left: `${index * 18}px` } : {}}
                                                >
                                                    <img 
                                                        src={follower?.profileImage || profilePic} 
                                                        alt="" 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = profilePic;
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-2xl font-bold text-white">
                                                {profileData?.followers?.length || 0}
                                            </div>
                                            <span className="text-sm text-gray-400">Followers</span>
                                        </div>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={() => navigate(`/following/${profileData?.userName}`)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex relative -translate-y-2">
                                            {profileData?.following?.slice(0, 3).map((following, index) => (
                                                <div 
                                                    key={following._id}
                                                    className={`w-8 h-8 border-2 border-gray-800 rounded-full overflow-hidden ${index > 0 ? 'absolute' : ''}`}
                                                    style={index > 0 ? { left: `${index * 18}px` } : {}}
                                                >
                                                    <img 
                                                        src={following?.profileImage || profilePic} 
                                                        alt="" 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = profilePic;
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-2xl font-bold text-white">
                                                {profileData?.following?.length || 0}
                                            </div>
                                            <span className="text-sm text-gray-400">Following</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="mt-8">
                    {profileData?._id === userData?._id && (
                        <div className="border-b border-gray-700">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setPostType('Post')}
                                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                                        postType === 'Post'
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <MdGridOn className="mr-2" />
                                        Posts
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => setPostType('Saved')}
                                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                                        postType === 'Saved'
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <MdBookmarkBorder className="mr-2" />
                                        Saved
                                    </div>
                                </button>
                            </nav>
                        </div>
                    )}

                    <div className="mt-6">
                        {profileData?._id === userData?._id ? (
                            <>
                                {postType === 'Post' ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {postData.filter(post => post?.author?._id === profileData?._id).length > 0 ? (
                                            postData
                                                .filter(post => post?.author?._id === profileData?._id)
                                                .map((post) => (
                                                    <div key={post._id} className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                        <Post key={post._id} post={post} />
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="col-span-3 py-12 text-center">
                                                <div className="mx-auto h-24 w-24 text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="mt-2 text-lg font-medium text-white">No posts yet</h3>
                                                <p className="mt-1 text-gray-400">
                                                    Share your first photo or video to get started.
                                                </p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => navigate('/create-post')}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Create Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {userData?.saved?.length > 0 ? (
                                            userData.saved.map((postId) => {
                                                const savedPost = postData.find(post => post._id === postId);
                                                return savedPost && (
                                                    <div key={savedPost._id} className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                        <Post post={savedPost} />
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-3 py-12 text-center">
                                                <div className="mx-auto h-24 w-24 text-gray-500">
                                                    <MdBookmarkBorder className="w-full h-full" />
                                                </div>
                                                <h3 className="mt-2 text-lg font-medium text-white">No saved posts</h3>
                                                <p className="mt-1 text-gray-400">
                                                    Save photos and videos that you want to see again.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {postData.filter(post => post?.author?._id === profileData?._id).length > 0 ? (
                                    postData
                                        .filter(post => post?.author?._id === profileData?._id)
                                        .map((post) => (
                                            <div key={post._id} className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <Post post={post} />
                                            </div>
                                        ))
                                ) : (
                                    <div className="col-span-3 py-12 text-center">
                                        <div className="mx-auto h-24 w-24 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-2 text-lg font-medium text-white">No posts yet</h3>
                                        <p className="mt-1 text-gray-400">
                                            {profileData?.name || 'This user'} hasn't shared any posts yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 py-3 px-4 z-10">
                    <Navbar />
                </div>
    </div>
    </div>
  )
}

export default Profile
