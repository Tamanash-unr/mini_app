import React from 'react'

import { icons } from '../constants'

const GameCards = ({ containerClass, imgClass, imgSrc, appName, infoContainer, txtClass, btnTxtClass, doOnClick }) => {
  return (
    <div className={`bg-sky-600 rounded-xl p-2 ${containerClass}`}>
        <img src={imgSrc || icons.gcenterStock} alt='cardImg..' className={`${imgClass}`} />
        <div className={`w-full flex items-center justify-between pt-2 ${infoContainer}`}>
            <p className={`m-0 font-semibold ${txtClass}`}>{appName || 'Game Name'}</p>
            <button className={`bg-green-600 px-4 py-0.5 font-semibold rounded-full ${btnTxtClass}`} onClick={doOnClick}>Play</button>
        </div>
    </div>
  )
}

export default GameCards