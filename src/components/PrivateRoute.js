// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ path, element, isAuthenticated }) => {
  return (
    <Route
      path={path}
      element={isAuthenticated ? element : <Navigate to="/dsm/login" />}
    />
  );
};

export default PrivateRoute;
