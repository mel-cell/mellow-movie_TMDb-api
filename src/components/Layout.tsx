import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout components/Header';
import Footer from './layout components/Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
