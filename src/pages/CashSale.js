import React from 'react';

import Navbar from '../components/Navbar';
function CashSale({petrodata}) {

    return (
        <div className="h-screen flex bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 overflow-hidden bg-gray-100">
            <Navbar petrodata={petrodata}  />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                <h1 className='relative block  lg:hidden text-white mx-auto w-[70%] text-center top-4 text-2xl z-20'>Cash Sale</h1>
                <div className='mt-11'>
                    sdasdnjkasdnjkasdkjansdkjansdjnaskndnbaskjdnasljdknk
                </div>
            </main>
        </div>

    );
}

export default CashSale;
