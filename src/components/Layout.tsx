import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header&Footer/Header';
import Footer from './Header&Footer/Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
