import React from 'react';

export const Tooltip = ({ children, text, position = 'top' }) => {

  const baseClasses =
    'absolute w-max max-w-xs p-2 px-3 text-sm text-white bg-gray-900 rounded-md shadow-lg ' +
    'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 ' +
    'transition-all duration-150 ease-in-out pointer-events-none';

  
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block group">       
      {children}
      
      <div className={`${baseClasses} ${getPositionClasses()}`}>
        {text}
        
        <div
          className="absolute bg-gray-900 h-2 w-2 transform rotate-45"
          style={{
            top: position === 'bottom' ? '-4px' : 'auto',
            bottom: position === 'top' ? '-4px' : 'auto',
            left: position === 'right' ? '-4px' : position === 'left' ? 'auto' : 'calc(50% - 4px)',
            right: position === 'left' ? '-4px' : 'auto',
          }}
        />
      </div>
    </div>
  );
};