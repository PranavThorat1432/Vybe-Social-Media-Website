import React, { useState } from 'react'
import logo from '../assets/VybeBlack.png.png'
import logo1 from '../assets/VybeWhite.png.png'
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import axios from 'axios';
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';


const SignIn = () => {

    const [inputClicked, setInputClicked] = useState({
        userName: false,
        password: false,
    });
    const [showPass, setShowPass] = useState(false);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSignin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`,
                { userName, password },
                { withCredentials: true }
            );
            dispatch(setUserData(result.data)); 
            console.log(result.data)
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            setError(error.response?.data?.message);
        }
    };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center items-center p-4'>
      <div className='w-full max-w-5xl bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700'>
        <div className='flex flex-col lg:flex-row h-full'>
          {/* Left Side - Branding */}
          <div className='lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex flex-col justify-center items-center text-center text-white'>
            <img src={logo1} alt="Vybe Logo" className='w-40 mb-6'/>
            <h1 className='text-3xl font-bold mb-4'>Welcome Back!</h1>
            <p className='text-gray-300 mb-8'>Not Just A Platform, It's a VYBE</p>
            <div className='w-24 h-1 bg-blue-500 rounded-full mb-8'></div>
            <p className='text-gray-400 text-sm'>Connect with friends and share your moments</p>
          </div>

          {/* Right Side - Form */}
          <div className='lg:w-1/2 bg-gray-800 p-8 flex flex-col items-center'>
            <h2 className='text-2xl font-bold text-white mb-8'>Sign In to Vybe</h2>
            
            {/* Username Input */}
            <div className='w-full mb-6'>
                <div className='relative mb-6'>
                  <div 
                    className={`relative group transition-all duration-200 ${inputClicked.userName ? 'mb-8' : 'mb-4'}`}
                    onClick={() => setInputClicked({...inputClicked, userName: true})}
                  >
                    <input 
                      type="text" 
                      id='userName' 
                      className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer relative z-10'
                      required 
                      onChange={(e) => setUserName(e.target.value)} 
                      value={userName}
                      placeholder=' '
                    />
                    <label 
                      htmlFor="userName" 
                      className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none z-20
                          ${inputClicked.userName || userName ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'top-3.5'}
                          peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-blue-400 peer-focus:bg-gray-800 peer-focus:px-1`}
                    >
                      Username
                    </label>
                  </div>
                </div>
            </div>

            {/* Password Input */}
            <div className='w-full mb-6'>
              <div className='relative'>
                <div 
                  className={`relative group transition-all duration-200`}
                  onClick={() => setInputClicked({...inputClicked, password: true})}
                >
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    id='password' 
                    className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer relative z-10 pr-12'
                    required 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password}
                    placeholder=' '
                  />
                  <label 
                    htmlFor="password" 
                    className={`absolute left-3 px-1 transition-all duration-200 text-gray-400 pointer-events-none z-20
                        ${inputClicked.password || password ? 'text-xs -top-2.5 text-blue-400 bg-gray-800 px-1' : 'top-3.5'}
                        peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-blue-400 peer-focus:bg-gray-800 peer-focus:px-1`}
                  >
                    Password
                  </label>
                  <div className='absolute right-3 top-3.5 text-gray-400 hover:text-white cursor-pointer z-20'>
                    {!showPass ? 
                      <IoIosEye className='w-5 h-5' onClick={() => setShowPass(true)}/> 
                      : <IoIosEyeOff className='w-5 h-5' onClick={() => setShowPass(false)}/>
                    }
                  </div>
                </div>
              </div>
              <div 
                className='text-right text-sm text-blue-400 hover:text-blue-300 cursor-pointer mt-2 transition-colors duration-200'
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </div>
            </div>

            {error && (
              <div className='w-full p-3 mb-4 bg-red-900/30 border border-red-700 text-red-300 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <button 
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center h-12 mt-2 mb-4'
              onClick={handleSignin} 
              disabled={loading}
            >
              {loading ? <ClipLoader size={24} color='white' className='mr-2'/> : null}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className='text-gray-400 text-sm mt-4'>
              Don't have an account?{' '}
              <span 
                className='font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors duration-200'
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
