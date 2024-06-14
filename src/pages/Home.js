import React from 'react'

function Home({ data }) {

    return (
        <div className='h-screen overflow-hidden'>
            <nav className='bg-[#151515]'>
                <div className="flex justify-between items-center h-16 w-full  rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  text-[#EEEEEE] relative shadow-sm font-sans font-bold text-xl">
                    <div className="pl-8">{data.petro_name}</div>


                </div>
            </nav>
            <div className='h-[85vh] w-screen bg-[#EEEEEE] flex justify-center flex-col items-center'>
                <h1 className='text-3xl lg:text-5xl text-center font-semibold my-5'>
                    Welcome to {data.petro_name}   

                </h1>
                <button className='p-3 text-xl bg-[#c18516] rounded-md m-3 lg:m-7 font-bold'>
                    <a href='/login'>Login</a>
                </button>
            </div>
        </div>
    )
}

export default Home