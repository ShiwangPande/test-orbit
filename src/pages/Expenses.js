import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logout from "../components/Logout.js";
function Expenses() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto bg-gray-800">
                        {/* Sidebar Links */}
                        <div className="flex items-center flex-shrink-0 px-4">
                            <img
                                className="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                alt="Your Company"
                            />
                        </div>
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-4 flex flex-col gap-6 mt-7 bg-gray-800 space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="bg-gray-900 text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Receipt
                                </Link>
                                <Logout />
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-0 z-40  ${showMobileMenu ? 'block' : 'hidden'}`}>
                <div className="flex items-center justify-start h-full">
                    <div className="bg-gray-800 h-full w-full p-8 flex flex-col">
                        <div className="flex justify-end">
                            <button
                                onClick={toggleMobileMenu}
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
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-7 flex-col mt-7 bg-gray-800 space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="bg-gray-900 text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Receipt
                                </Link>
                                <Logout />
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-800 border-b border-gray-200 lg:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        type="button"
                        className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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

export default Expenses