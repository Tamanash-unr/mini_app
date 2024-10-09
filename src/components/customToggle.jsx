import React from 'react'

const CustomToggle = ({ style }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${style}`}>
        <input 
            type="checkbox" 
            value="" 
            className="sr-only peer" 
        />
        <div 
            className="relative w-16 h-8 bg-gray-200 rounded-full peer dark:bg-gray-700 dark:border-gray-600 peer-checked:bg-blue-600
                      peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white peer-checked:after:start-4
                      after:transform after:content-[''] after:absolute after:top-[6px] after:start-2 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" 
        />
    </label>
  )
}

export default CustomToggle