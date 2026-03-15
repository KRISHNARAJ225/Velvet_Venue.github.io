import React from 'react';
import UserSidebar from './UserSidebar';

const GlobalSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Sidebar positioned at the edge, doesn't affect page layout */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <UserSidebar isOpen={isOpen} onClose={onClose} />
      </div>
      
      {/* Mobile overlay only */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default GlobalSidebar;
