// // pages/Unauthorized.tsx
// import React from 'react';
// import { useAuth } from '../contexts/AuthContext';

// const Unauthorized: React.FC = () => {
//   const { user, logout } = useAuth();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full text-center">
//         <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
//         <p className="text-gray-600 mb-4">
//           Sorry, you don't have permission to access this page.
//         </p>
//         {user && (
//           <p className="text-sm text-gray-500 mb-4">
//             Logged in as: {user.email} ({user.role})
//           </p>
//         )}
//         <button
//           onClick={logout}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Unauthorized;



import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/api';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Inventory,
  AccountCircle,
  ExitToApp,
  Dashboard
} from '@mui/icons-material';

export const Unauthorized: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box className="h-full flex flex-col bg-gray-50">
      {/* <AppBar position="static" sx={{ backgroundColor: '#1E293B' }}>
        <Toolbar>
          <Inventory sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory System
          </Typography>
        </Toolbar>
      </AppBar> */}

      <Container component="main" className="flex-grow flex items-center justify-center">
        <Paper elevation={6} className="p-8 text-center max-w-md w-full">
          <Box className="flex flex-col items-center">
            <Avatar sx={{ m: 1, bgcolor: 'error.main' }}>
              <ExitToApp />
            </Avatar>
            <Typography component="h1" variant="h5" className="text-center my-4">
              Access Denied
            </Typography>
            <Typography variant="body2" color="textSecondary" className="text-center mt-2 mb-4">
              Sorry, you don't have permission to access this page.
            </Typography>
            
            {user && (
              <Box className="mb-4">
                <Divider className="my-3" />
                <Typography variant="body2">
                  Logged in as: {user.email}
                </Typography>
                <Typography variant="body2">
                  Role: {user.role}
                </Typography>
              </Box>
            )}
<Box className="flex flex-col md:flex-row items-center md:justify-around gap-2 w-full">
            <Button
              variant="contained"
              onClick={logout}
              sx={{ backgroundColor: '#1E293B' }}
              className="hover:bg-gray-700"
            >
              Logout
            </Button>
            
            {user && (
              <Button
                component={Link}
                to="/"
                variant="outlined"
                className="mt-3"
              >
                Return to Dashboard
              </Button>
            )}
            </Box>
          </Box>
        </Paper>
      </Container>

      <Box component="footer" className="py-4 bg-gray-100 text-center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Inventory System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};