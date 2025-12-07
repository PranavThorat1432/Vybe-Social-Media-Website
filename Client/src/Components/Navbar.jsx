import React, { useState, useEffect } from 'react';
import { GoHomeFill, GoHome } from "react-icons/go";
import { FiSearch, FiPlusSquare, FiPlus } from "react-icons/fi";
import { RxVideo } from "react-icons/rx";
import { BsSearch } from 'react-icons/bs';
import { RiVideoLine, RiVideoFill } from 'react-icons/ri';
import { FaUserCircle, FaUser } from 'react-icons/fa';
import profileImage from '../assets/profilePic.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData } = useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState('');
    const [showTooltip, setShowTooltip] = useState(null);

    // Set active tab based on current route
    useEffect(() => {
        const path = location.pathname.split('/')[1];
        setActiveTab(path || 'home');
    }, [location]);

    const navItems = [
        { 
            id: 'home', 
            icon: activeTab === 'home' ? 
                <GoHomeFill className="w-6 h-6" /> : 
                <GoHome className="w-6 h-6" />,
            label: 'Home',
            path: '/'
        },
        { 
            id: 'search', 
            icon: activeTab === 'search' ? 
                <BsSearch className="w-6 h-6" /> : 
                <FiSearch className="w-6 h-6" />,
            label: 'Search',
            path: '/search'
        },
        { 
            id: 'upload', 
            icon: activeTab === 'upload' ? 
                <FiPlus className="w-6 h-6" /> : 
                <FiPlusSquare className="w-6 h-6" />,
            label: 'Create',
            path: '/upload'
        },
        { 
            id: 'loops', 
            icon: activeTab === 'loops' ? 
                <RiVideoFill className="w-6 h-6" /> : 
                <RiVideoLine className="w-6 h-6" />,
            label: 'Reels',
            path: '/loops'
        },
        { 
            id: 'profile', 
            icon: activeTab === 'profile' ? 
                <FaUser className="w-6 h-6" /> : 
                <FaUserCircle className="w-6 h-6" />,
            label: 'Profile',
            path: `/profile/${userData?.userName || ''}`
        }
    ];

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md mx-auto z-50"
        >
            <div className="relative">
                {/* Background with blur effect */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-lg rounded-full shadow-2xl shadow-black/50" />
                
                {/* Navigation items */}
                <nav className="relative flex items-center justify-around p-2">
                    {navItems.map((item) => (
                        <div 
                            key={item.id}
                            className="relative flex flex-col items-center"
                            onMouseEnter={() => setShowTooltip(item.id)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1 }}
                                className={`p-3 rounded-full cursor-pointer transition-colors duration-200 ${
                                    activeTab === item.id ? 'text-white' : 'text-gray-300 hover:text-white'
                                }`}
                                onClick={() => {
                                    navigate(item.path);
                                    setActiveTab(item.id);
                                }}
                            >
                                {item.id === 'profile' && userData?.profileImage ? (
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-transparent hover:border-white transition-colors">
                                        <img 
                                            src={userData.profileImage} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    item.icon
                                )}
                            </motion.div>
                            
                            {/* Active indicator */}
                            {activeTab === item.id && (
                                <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-white"
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30
                                    }}
                                />
                            )}
                            
                            {/* Tooltip */}
                            <AnimatePresence>
                                {showTooltip === item.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-10 bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
                                    >
                                        {item.label}
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </nav>
            </div>
        </motion.div>
  )
}

export default Navbar;
