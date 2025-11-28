import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiKey } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, password: newPassword },
        { withCredentials: true }
      );
      navigate('/signin', { state: { message: 'Password reset successfully! Please sign in.' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Forgot Password</h2>
        <p className='text-gray-600'>Enter your email to receive a verification code</p>
      </div>
      
      <form onSubmit={handleStep1} className='space-y-6'>
        <div className='space-y-1'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiMail className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='email'
              id='email'
              className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='Email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className='text-sm text-red-600'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className='w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
        >
          {loading ? <ClipLoader size={20} color='white' /> : 'Send Verification Code'}
        </button>
      </form>

      <div className='mt-6 text-center cursor-pointer'>
        <Link
          to='/signin'
          className='text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center'
        >
          <FiArrowLeft className='mr-1' /> Back to Sign In
        </Link>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8'>
      <div className='text-center mb-8'>
        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4'>
          <FiKey className='h-6 w-6 text-indigo-600' />
        </div>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Verify OTP</h2>
        <p className='text-gray-600'>We've sent a verification code to {email}</p>
      </div>
      
      <form onSubmit={handleStep2} className='space-y-6'>
        <div className='space-y-1'>
          <label htmlFor='otp' className='block text-sm font-medium text-gray-700'>
            Verification Code
          </label>
          <div className='mt-1'>
            <input
              type='text'
              id='otp'
              className='block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='Enter 6-digit code'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <p className='mt-2 text-sm text-gray-500'>Didn't receive a code? <button type='button' onClick={handleStep1} className='font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer'>Resend</button></p>
        </div>

        {error && <p className='text-sm text-red-600'>{error}</p>}

        <div className='space-y-3'>
          <button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
          >
            {loading ? <ClipLoader size={20} color='white' /> : 'Verify Code'}
          </button>
          
          <button
            type='button'
            onClick={() => setStep(1)}
            className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer'
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Reset Password</h2>
        <p className='text-gray-600'>Create a new password for your account</p>
      </div>
      
      <form onSubmit={handleStep3} className='space-y-6'>
        <div className='space-y-4'>
          <div>
            <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>
              New Password
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='newPassword'
                type={showPassword ? 'text' : 'password'}
                className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='Enter new password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength='6'
              />
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-gray-400 hover:text-gray-500 focus:outline-none'
                >
                  {showPassword ? (
                    <FiEyeOff className='h-5 w-5' />
                  ) : (
                    <FiEye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor='confirmNewPassword' className='block text-sm font-medium text-gray-700'>
              Confirm New Password
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='confirmNewPassword'
                type={showPassword ? 'text' : 'password'}
                className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='Confirm new password'
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength='6'
              />
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer'
                >
                  {showPassword ? (
                    <FiEyeOff className='h-5 w-5' />
                  ) : (
                    <FiEye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <p className='text-sm text-red-600'>{error}</p>}

        <div className='space-y-3'>
          <button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
          >
            {loading ? <ClipLoader size={20} color='white' /> : 'Reset Password'}
          </button>
          
          <button
            type='button'
            onClick={() => setStep(2)}
            className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer'
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-4'>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default ForgotPassword;
