import { ReactNode } from "react";

const Tooltip = ({ 
  message, children, isCentered = true
} : {
  message: string, children: ReactNode, isCentered?: boolean
}) => {
  return (
    <div className={`relative ${isCentered && 'flex flex-col items-center'} group`}>
      {children}
      <div className="absolute bottom-1 flex-col items-center hidden mb-6 group-hover:flex">
        <span className="relative block whitespace-nowrap max-w-xs z-10 p-2 text-xs text-white bg-gray-700 shadow-lg rounded-md">{message}</span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700"></div>
      </div>
    </div>
  );
};

export default Tooltip;