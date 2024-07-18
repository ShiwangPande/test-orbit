import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton({ setIsAuthenticated }) {

    const dsm_url = process.env.REACT_APP_DSM_URL;
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication state or token (if any)
        // For example, if using localStorage to store authentication token:
        localStorage.removeItem('submittedNozzleData');
        localStorage.removeItem('submittedData');
        localStorage.removeItem('submittedRecieptData');
        localStorage.removeItem('submittedExpensesData');

        // Redirect to the login page or any other appropriate page
        // localStorage.removeItem('isAuthenticated');
    
        navigate({dsm_url});
    };

    return (
        <div className="flex flex-row text-white bg-red-500 border border-red-500 hover:text-red-500 hover:bg-transparent  rounded-md text-center w-fit  px-3 py-2 text-sm font-medium" >
            <button onClick={handleLogout}>Logout
            </button>

        </div>
    );
}

export default LogoutButton;
