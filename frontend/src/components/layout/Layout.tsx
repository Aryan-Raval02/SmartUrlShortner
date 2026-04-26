import React from 'react';
import Navbar from './Navbar';
import ToastContainer from '../common/Toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <ToastContainer />
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 Shortly. All rights reserved. Built with ❤️ for speed.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
