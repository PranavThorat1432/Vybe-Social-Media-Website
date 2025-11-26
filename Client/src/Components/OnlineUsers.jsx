import React from 'react'
import { useNavigate } from 'react-router-dom';
import profilePic from '../assets/profilePic.png'
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '../redux/messageSlice';


const OnlineUsers = ({user}) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();


  return (
    <div className='w-[50px] h-[50px] flex gap-5 justify-start items-center relative'>
      <div className='w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={() => {dispatch(setSelectedUser(user)); navigate(`/messageArea/${user?.userName}`)}}>
        <img src={user?.profileImage || profilePic} alt="" className='w-full object-cover'/>
      </div>

      <div className='w-2.5 h-2.5 bg-[#0080ff] rounded-full absolute top-2 right-0'></div>
    </div>
  )
}

export default OnlineUsers
