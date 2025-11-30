import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setPostData } from '../redux/postSlice'
import { setNotificationData } from '../redux/userSlice'

const getAllNotifications = () => {

    const dispatch = useDispatch();
    const {userData} = useSelector((state) => state.user);

    useEffect(() => {
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

        fetchNotifications();
    }, [dispatch, userData]);
};

export default getAllNotifications;
