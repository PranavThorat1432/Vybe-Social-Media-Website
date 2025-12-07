import React, { useRef, useState, useEffect } from 'react';
import { MdOutlineKeyboardBackspace, MdEdit } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import profilePic from '../assets/profilePic.png';
import axios from 'axios';
import { serverUrl } from '../App';
import { setProfileData, setUserData } from '../redux/userSlice';
import { ClipLoader } from 'react-spinners';

const EditProfile = () => {

    const {userData} = useSelector((state) => state.user);
    const navigate = useNavigate();
    const imageInput = useRef();

    const [frontendImage, setFrontendImage] = useState(userData.profileImage || profilePic);
    const [backendImage, setBackendImage] = useState(null);
    const [name, setName] = useState(userData.name || '');
    const [userName, setUserName] = useState(userData.userName || '');
    const [bio, setBio] = useState(userData.bio || '');
    const [profession, setProfession] = useState(userData.profession || '');
    const [gender, setGender] = useState(userData.gender || '');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleImage = async (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    };


    const editProfile = async () => {
        setLoading(true);
        try {
            const formdata = new FormData();
            formdata.append('name', name);
            formdata.append('userName', userName);
            formdata.append('bio', bio);
            formdata.append('profession', profession);
            formdata.append('gender', gender);
            
            if(backendImage) {
                formdata.append('profileImage', backendImage);
            }
            const result = await axios.post(`${serverUrl}/api/user/edit-profile`, formdata, {
                withCredentials: true
            });
            dispatch(setProfileData(result.data));
            dispatch(setUserData(result.data));
            setLoading(false);
            navigate(`/profile/${userData.userName}`)
            
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };


  const [inputClicked, setInputClicked] = useState({
    name: !!name,
    userName: !!userName,
    profession: !!profession,
    bio: !!bio,
    gender: !!gender
  });

  return (
    <div className='w-full min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4 md:p-8'>
      <div className='w-full max-w-4xl bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 mt-8'>
        {/* Header */}
        <div className='p-4 border-b border-gray-700 flex items-center'>
          <button 
            onClick={() => navigate(`/profile/${userData.userName}`)}
            className='p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 mr-4'
          >
            <MdOutlineKeyboardBackspace className='text-gray-300 w-6 h-6' />
          </button>
          <h1 className='text-xl font-bold text-white'>Edit Profile</h1>
        </div>

        {/* Profile Picture Section */}
        <div className='flex flex-col items-center py-6 px-4 border-b border-gray-700'>
          <div className='relative group'>
            <div className='w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-blue-500 transition-all duration-300'>
              <img 
                src={frontendImage} 
                alt="Profile" 
                className='w-full h-full object-cover'
              />
            </div>
            <div 
              className='absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer transform translate-y-1/4 group-hover:translate-y-0 transition-transform duration-300'
              onClick={() => imageInput.current.click()}
            >
              <MdEdit className='text-white w-5 h-5' />
              <input type="file" accept='image/*' ref={imageInput} hidden onChange={handleImage} />
            </div>
          </div>
          <button 
            onClick={() => imageInput.current.click()}
            className='mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200'
          >
            Change Profile Picture
          </button>
        </div>

        {/* Form Section */}
        <div className='p-6 space-y-6'>
          {/* Name Input */}
          <div className='relative'>
            <input
              type='text'
              id='name'
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer'
              onChange={(e) => {
                setName(e.target.value);
                setInputClicked({...inputClicked, name: true});
              }}
              onFocus={() => setInputClicked({...inputClicked, name: true})}
              value={name}
              placeholder=' '
            />
            <label
              htmlFor='name'
              className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none
                ${inputClicked.name || name ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'top-3.5'}
                peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-blue-400 peer-focus:bg-gray-800 peer-focus:px-1`}
            >
              Full Name
            </label>
          </div>

          {/* Username Input */}
          <div className='relative'>
            <input
              type='text'
              id='userName'
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer'
              onChange={(e) => {
                setUserName(e.target.value);
                setInputClicked({...inputClicked, userName: true});
              }}
              onFocus={() => setInputClicked({...inputClicked, userName: true})}
              value={userName}
              placeholder=' '
            />
            <label
              htmlFor='userName'
              className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none
                ${inputClicked.userName || userName ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'top-3.5'}
                peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-blue-400 peer-focus:bg-gray-800 peer-focus:px-1`}
            >
              Username
            </label>
          </div>

          {/* Profession Input */}
          <div className='relative'>
            <input
              type='text'
              id='profession'
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer'
              onChange={(e) => {
                setProfession(e.target.value);
                setInputClicked({...inputClicked, profession: true});
              }}
              onFocus={() => setInputClicked({...inputClicked, profession: true})}
              value={profession}
              placeholder=' '
            />
            <label
              htmlFor='profession'
              className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none
                ${inputClicked.profession || profession ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'top-3.5'}
                peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-blue-400 peer-focus:bg-gray-800 peer-focus:px-1`}
            >
              Profession
            </label>
          </div>

          {/* Bio Input */}
          <div className='relative'>
            <textarea
              id='bio'
              rows='3'
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer resize-none'
              onChange={(e) => {
                setBio(e.target.value);
                setInputClicked({...inputClicked, bio: true});
              }}
              onFocus={() => setInputClicked({...inputClicked, bio: true})}
              value={bio}
              placeholder=' '
            />
            <label
              htmlFor='bio'
              className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none
                ${inputClicked.bio || bio ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'top-3.5'}
                peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-blue-400 peer-focus:bg-gray-800 peer-focus:px-1`}
            >
              Bio
            </label>
          </div>

          {/* Gender Select */}
          <div className='relative'>
            <select
              id='gender'
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer'
              onChange={(e) => setGender(e.target.value)}
              value={gender}
            >
              <option value=''>Select Gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
              <option value='prefer-not-to-say'>Prefer not to say</option>
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400'>
              <svg className='fill-current h-4 w-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/></svg>
            </div>
            <label
              htmlFor='gender'
              className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none
                ${gender ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'hidden'}`}
            >
              Gender
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={editProfile}
            disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center h-12 mt-8 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <ClipLoader size={24} color='white' className='mr-2' />
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
