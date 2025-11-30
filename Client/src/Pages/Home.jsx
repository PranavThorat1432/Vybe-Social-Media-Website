import React from 'react'
import LeftHome from '../Components/LeftHome'
import RightHome from '../Components/RightHome'
import Feed from '../Components/Feed'

const Home = () => {
  return (
    <div className='w-full flex justify-center items-center'>

      <LeftHome/>
      <Feed/>
      <RightHome/>

    </div>
  )
}

export default Home
