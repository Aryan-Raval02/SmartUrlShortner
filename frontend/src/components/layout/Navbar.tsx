import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { LinkIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Shortly</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Login
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
