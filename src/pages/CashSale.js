import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import Logout from "../components/Logout"
import logo from "../images/navlogo.svg"
function CashSale() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const controls = useAnimation();

    useEffect(() => {
        if (showMobileMenu) {
            controls.start({ x: 0 });
        } else {
            controls.start({ x: '-80vw' });
        }
    }, [showMobileMenu, controls]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x < -50) {
            setShowMobileMenu(false);
        } else if (info.offset.x > 50) {
            setShowMobileMenu(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('.navbar') === null) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileMenu]);
    return (

        <div className="h-screen flex overflow-hidden bg-gray-100">
            <div className="hidden lg:fixed h-screen md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="h-0 flex-1 flex flex-col pt-10 pb-4 overflow-y-auto bg-navbar">
                        {/* Sidebar Links */}
                        <div className="flex items-center flex-shrink-0 px-4">
                            <img
                                className="h-10 mx-auto w-auto "
                                src={logo}
                                alt="Your Company"
                            />
                        </div>
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-4 flex flex-col gap-10 mt-7 bg-navbar space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="bg-wheat text-black block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Receipt
                                </Link>
                                <div className='px-3 '>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-0 z-40 ${showMobileMenu ? 'block' : 'hidden'}`}>
                <div className="flex items-center justify-start h-full backdrop-blur-sm">
                    <motion.div
                        className={`bg-navbar h-full fixed w-[80vw] p-8 flex flex-col navbar`}
                        initial={{ x: '-80vw' }}
                        animate={controls}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: 'grab', left: 0 }}
                    >
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                type="button"
                                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
                                aria-controls="mobile-menu"
                                aria-expanded={showMobileMenu ? 'true' : 'false'}
                            >
                                <span className="sr-only">Close main menu</span>
                                {/* Close Icon */}
                                <svg
                                    className={`h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-2 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-[3rem] flex-col mt-8 bg-navbar space-y-1">
                                <div className="flex items-center flex-shrink-0 px-4">
                                    <img
                                        className="h-10 mx-auto w-auto "
                                        src={logo}
                                        alt="Your Company"
                                    />
                                </div>
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="bg-wheat text-black block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Receipt
                                </Link>
                                <div className='px-3'>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="flex flex-col ml-0 lg:ml-[17%] w-0 flex-1 overflow-hidden">
                <div className="w-screen z-10 flex-shrink-0  fixed flex h-16 bg-navbar border-b border-gray-200 lg:hidden">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        type="button"
                        className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md focus:outline-none focus:white focus:ring-inset focus:white"
                        aria-controls="mobile-menu"
                        aria-expanded={showMobileMenu ? 'true' : 'false'}
                    >
                        <span className="sr-only">Open main menu</span>
                        {/* Hamburger Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? 'hidden' : 'block'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        {/* Close Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? 'block' : 'hidden'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    {/* Your main content here */}
                </main>
            </div>
        </div>
    )
}

export default CashSale