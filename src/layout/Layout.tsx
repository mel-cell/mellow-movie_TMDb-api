import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout components/Header';
import Footer from '../components/layout components/Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
