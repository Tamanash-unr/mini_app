import React from 'react'

const CustomButton = ({ buttonStyle, textStyle, text, subtext, onClick, disabled = false }) => {
  return (
    <button 
        className={`min-w-[150px] min-h-[20px] rounded-full bg-sky-500 hover:bg-green-500 p-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-sky-500 ${buttonStyle ?? ''}`} 
        onClick={() => onClick()}
        disabled={disabled}
    >
        <p 
            className={`ubuntu-regular text-white text-lg ${textStyle ?? ''}`}
        >
            {text}
        </p>
    </button>
  )
}

export default CustomButton