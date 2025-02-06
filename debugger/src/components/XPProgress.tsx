import React from "react";

const XPProgress = ({ xp, level }: { xp: number, level: number }) => {
  return (
    <div className="w-full bg-gray-500 rounded-full h-4 mt-2">
      <div 
        className="bg-blue-500 h-4 rounded-full transition-all duration-500" 
        style={{ width: `${(xp / (level * 100)) * 100}%` }}
      />
    </div>
  );
};

export default XPProgress;
