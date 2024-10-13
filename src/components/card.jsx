import React from 'react'
import CustomButton from './customButton'

const Card = ({ cardSyle, contentStyle, title, titleStyle, subtitle, subtitleStyle, btnStyle, btnTxt, txtStyle, onExecute }) => {
  return (
    <div className={`flex items-center justify-between w-full p-4 bg-black/75 rounded-xl my-2 ${cardSyle}`}>
        <div className={`ubuntu-medium text-xl ${contentStyle}`}>
            <h2 className={`${titleStyle}`}>{title}</h2>
            <h3 className={`${subtitleStyle}`}>{subtitle}</h3>
        </div>
        <CustomButton 
            buttonStyle={btnStyle}
            text={btnTxt}
            textStyle={txtStyle}
            onClick={onExecute}
        />
    </div>
  )
}

export default Card