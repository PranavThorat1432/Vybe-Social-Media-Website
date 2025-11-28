import React, { useEffect } from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import NotificationCard from '../Components/NotificationCard';
import axios from 'axios';
import { serverUrl } from '../App';
import getAllNotifications from '../hooks/getAllNotifications';
import { setNotificationData } from '../redux/userSlice';


const Notification = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {notificationData} = useSelector((state) => state.user);
    const ids = notificationData.map((n) => n._id);

    const markAsRead = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/user/markAsRead`, {notificationId: ids}, {
                withCredentials: true
            });

        } catch (error) {
            console.log(error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/getAllNotifications`, {
                withCredentials: true
            });
            dispatch(setNotificationData(result.data));
    
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        markAsRead();
        fetchNotifications();
    }, []);

  return (
    <div className='w-full h-screen bg-black overflow-auto'>
        <div className='w-full h-20 flex items-center gap-5 p-2.5' >
            <MdOutlineKeyboardBackspace className='text-white w-[25px] h-[25px] cursor-pointer ml-5 lg:hidden' onClick={() => navigate(`/`)}/>
            <h1 className='text-white text-xl font-semibold md:ml-5'>Notifications</h1>
        </div>

        <div className='w-full h-full flex flex-col gap-5 px-2.5'>
            {notificationData.map((noti, index) => (
                <NotificationCard noti={noti} key={index}/>
            ))}
        </div>
    </div>
  )
}

export default Notification
