import React from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import LoopCard from '../Components/LoopCard';
import { useSelector } from 'react-redux';

const Loops = () => {

    const navigate = useNavigate();
    const {loopData} = useSelector((state) => state.loop);

  return (
    <div className='w-screen h-screen bg-black overflow-hidden flex justify-center items-center'>
        <div className='bg-gray-400 h-9 min-w-5 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-500 transition-all ease-in-out duration-200 left-10 p-3 gap-2 mt-6 fixed top-0 z-100' onClick={() => navigate('/')}>
            <div >
                <MdOutlineKeyboardBackspace className='text-white w-[30px] h-[30px]' />
            </div>
            <h1 className='text-white text-[18px] font-semibold'>Loops</h1>
        </div>

        <div className='h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide'>
            {loopData.map((loop, index) => (
                <div className='h-screen snap-start'>
                    <LoopCard loop={loop} key={index}/>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Loops
