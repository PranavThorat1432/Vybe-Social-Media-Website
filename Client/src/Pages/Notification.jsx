import React, { useEffect } from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import NotificationCard from '../Components/NotificationCard';
import axios from 'axios';
import { serverUrl } from '../App';
import { setNotificationData, removeNotification } from '../redux/userSlice';


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
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await axios.delete(`${serverUrl}/api/user/notifications/${notificationId}`, {
                withCredentials: true
            });
            dispatch(removeNotification(notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/getAllNotifications`, {
                withCredentials: true
            });
            dispatch(setNotificationData(result.data));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const { socket } = useSelector((state) => state.socket);

    // Handle real-time notification deletion
    useEffect(() => {
        const handleNotificationDeleted = (data) => {
            dispatch(removeNotification(data.notificationId));
        };

        socket?.on('notificationDeleted', handleNotificationDeleted);

        return () => {
            socket?.off('notificationDeleted', handleNotificationDeleted);
        };
    }, [dispatch, socket]);

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
            {notificationData.length > 0 ? (
                notificationData.map((noti) => (
                    <NotificationCard 
                        key={noti._id} 
                        noti={noti} 
                        onDelete={handleDeleteNotification}
                        onMarkAsRead={noti.isRead ? undefined : () => {
                            // Optimistically update the UI
                            dispatch(setNotificationData(
                                notificationData.map(n => 
                                    n._id === noti._id ? { ...n, isRead: true } : n
                                )
                            ));
                            // Then make the API call
                            markAsRead();
                        }}
                    />
                ))
            ) : (
                <div className='flex flex-col items-center justify-center h-64 text-gray-400'>
                    <p>No notifications yet</p>
                </div>
            )}
        </div>
    </div>
  )
}

export default Notification
