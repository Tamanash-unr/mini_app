import React from 'react'

const TabButton = ({ buttonStyle, textStyle, text, icon, iconAlt, iconStyle, onClick }) => {
  return (
    <div 
        className={`p-2 cursor-pointer ${buttonStyle ?? ''}`} 
        onClick={() => onClick()}
    >
      <img src={icon} alt={iconAlt} className={`${iconStyle}`} />
      {
        text && 
        <p 
          className={`ubuntu-regular text-white text-lg ${textStyle ?? ''}`}
        >
          {text}
        </p>
      }
    </div>
  )
}

export default TabButton