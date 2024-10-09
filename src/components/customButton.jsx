import React from 'react'

const CustomButton = ({ buttonStyle, textStyle, text, subtext, onClick }) => {
  return (
    <div 
        className={`min-w-[150px] min-h-[20px] rounded-full bg-sky-500 hover:bg-green-500 p-2 cursor-pointer ${buttonStyle ?? ''}`} 
        onClick={() => onClick()}
    >
        <p 
            className={`ubuntu-regular text-white text-lg ${textStyle ?? ''}`}
        >
            {text}
        </p>
    </div>
  )
}

export default CustomButton