import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#dbdce0ff' 
    },
    content: {
      marginLeft: '300px', 
      padding: '30px',
      width: '100%',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;