import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import ForgotPassword from './Pages/ForgotPassword'
import Home from './Pages/Home'
import { useDispatch, useSelector } from 'react-redux'
import getCurrentUser from './hooks/getCurrentUser'
import getSuggestedUsers from './hooks/getSuggestedUsers'
import Profile from './Pages/Profile'
import EditProfile from './Pages/EditProfile'
import Upload from './Pages/Upload'
import getAllPosts from './hooks/getAllPosts'
import Loops from './Pages/Loops'
import getAllLoops from './hooks/getAllLoops'
import Story from './Pages/Story'
import getAllStories from './hooks/getAllStories'
import Messages from './Pages/Messages'
import MessageArea from './Pages/MessageArea'
export const serverUrl = import.meta.env.VITE_BACKEND_URL;
import {io} from 'socket.io-client'
import { setOnlineUsers, setSocket } from './redux/socketSlice'
import getFollowingList from './hooks/getFollowingList'
import getPrevChatUsers from './hooks/getPrevChatUsers'
import Search from './Pages/Search'
import getAllNotifications from './hooks/getAllNotifications'
import Notification from './Pages/Notification'
import { setNotificationData } from './redux/userSlice'


const App = () => {
  
  getCurrentUser();
  getSuggestedUsers();
  getAllPosts();
  getAllLoops();
  getAllStories();
  getFollowingList();
  getPrevChatUsers();
  getAllNotifications();
  
  const {userData, notificationData} = useSelector((state) => state.user);
  const {socket} = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if(userData && userData._id) {
      const socketIo = io(serverUrl, {
        query: {
          userId: userData._id.toString()
        }
      })
      dispatch(setSocket(socketIo));
      socketIo.on('getOnlineUsers', (users) => {
        dispatch(setOnlineUsers(users))
      });
      return () => {
        socketIo.close();
        dispatch(setSocket(null));
        dispatch(setOnlineUsers([]));
      };

    } else {
      if(socket) {
        socket.close();
        dispatch(setSocket(null));
        dispatch(setOnlineUsers([]));
      }
    }
  }, [userData]);


    socket?.on('newNotification', (noti) => {
      dispatch(setNotificationData([...notificationData, noti]))
    });


  return (
      <Routes>

        <Route path='/' element={userData ? <Home/> : <Navigate to={'/signin'}/>}/>
        <Route path='/signup' element={!userData ? <SignUp/> : <Navigate to={'/'}/>}/>
        <Route path='/signin' element={!userData ? <SignIn/> : <Navigate to={'/'}/>}/>
        <Route path='/forgot-password' element={!userData ? <ForgotPassword/> : <Navigate to={'/'}/>}/>
        <Route path='/profile/:userName' element={userData ? <Profile/> : <Navigate to={'/signin'}/>}/>
        <Route path='/edit-profile' element={userData ? <EditProfile/> : <Navigate to={'/signin'}/>}/>
        <Route path='/upload' element={userData ? <Upload/> : <Navigate to={'/signin'}/>}/>
        <Route path='/loops' element={userData ? <Loops/> : <Navigate to={'/signin'}/>}/>
        <Route path='/story/:userName' element={userData ? <Story/> : <Navigate to={'/signin'}/>}/>
        <Route path='/messages' element={userData ? <Messages/> : <Navigate to={'/signin'}/>}/>
        <Route path='/messageArea' element={userData ? <MessageArea/> : <Navigate to={'/signin'}/>}/>
        <Route path='/messageArea/:userName' element={userData ? <MessageArea/> : <Navigate to={'/signin'}/>}/>
        <Route path='/search' element={userData ? <Search/> : <Navigate to={'/signin'}/>}/>
        <Route path='/notifications' element={userData ? <Notification/> : <Navigate to={'/signin'}/>}/>
      </Routes>
  )
}

export default App
