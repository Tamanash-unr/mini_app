import React from 'react'

const CustomButton = ({ buttonStyle, textStyle, text, btnIcon, btnIconStyle, onClick, isLoading = false, disabled = false }) => {
  return (
    <button 
        className={`min-w-[150px] min-h-[20px] rounded-full bg-sky-500 hover:bg-green-500 p-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-sky-500 ${buttonStyle ?? ''}`} 
        onClick={() => onClick()}
        disabled={isLoading || disabled ? true : false}
    >
    {
      isLoading ? 
      <div className='w-6 h-6 rounded-full border-2 border-t-4 border-white border-t-indigo-500 animate-spin mx-auto' />
      :
      <>
        { btnIcon && 
          <img src={btnIcon} alt="btnIcon.." className={`${btnIconStyle}`} />
        }
        <p className={`ubuntu-regular text-white text-lg ${textStyle ?? ''}`}>
          {text}
        </p>
      </>
    }
    </button>
  )
}

export default CustomButton