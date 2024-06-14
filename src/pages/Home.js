import React from 'react';
import Logo from "../images/logo.svg"
import nozzle from "../images/nozzle.png";
import arrow from "../images/arrow.svg"
import nozzlee from "../images/nozzlee.png";
import { useNavigate } from 'react-router-dom';
function Home({ data }) {
    const navigate = useNavigate()
    const handleclick = () => {
        navigate('/login')
    }
    return (
        <div className='h-screen home bg-wheat overflow-hidden'>

            <div className=' w-screen  flex justify-center flex-col items-center'>
                <img className='mt-10 w-36 h-36' src={Logo} alt="" />
                <div className='mt-20 flex flex-col lg:flex-row gap-3  mx-3 text-center  my-5'>
                    <h2 className='text-[1.8rem] lg:text-5xl font-semibold'>
                        Welcome to      </h2>
                    <h1 className='font-extrabold text-4xl lg:text-5xl'>{' '} {data.petro_name}</h1>
                </div>

                <img className='absolute left-[-44px] w-72 rotate-[18deg] top-[55%] ' src={nozzlee} alt="" />
                <button onClick={handleclick} className='p-3 block w-[5rem] h-[5rem] absolute bottom-20 border-5 border-black bg-redish rounded-full right-10 m-3 lg:m-7 font-bold'>

                    <img src={arrow}  alt="" />
                </button>

            </div>
        </div >
    )
}

export default Home