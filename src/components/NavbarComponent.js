import React from 'react'

function NavbarComponent() {
  
    return (


        <>
           <nav>
                <div className="flex justify-between items-center h-16 w-full bg-gray-300 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100	 text-black relative shadow-sm font-sans font-bold text-xl">
                    <div className="pl-8">Petrol Pump</div>
                    <div className="pr-8">
                        <a href="/login" className="p-4">Login</a>
                    </div>
                </div>
           </nav>
        </>

    )
}

export default NavbarComponent