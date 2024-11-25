import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import CustomButton from './customButton'

const Card = ({ cardSyle, cardIcon, cardIconStyle, contentStyle, title, titleStyle, subtitle, subtitleStyle, subIcon, subIconStyle, btnStyle, btnTxt, btnDisabled, txtStyle, onExecute, childIndex = 1, hideBtn = false }) => {
  
  const cardRef = useRef(null)
  const [loading, setLoading] = useState(false)

  // const elementIsVisibleInViewport = (elem, partiallyVisible = false) => {
  //   const { top, left, bottom, right } = elem.getBoundingClientRect();
  //   const { innerHeight, innerWidth } = window;
  //   return partiallyVisible
  //     ? ((top > 0 && top < innerHeight) ||
  //         (bottom > 0 && bottom < innerHeight)) &&
  //         ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
  //     : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
  // };

  // useEffect(()=>{
  //   if(elementIsVisibleInViewport(cardRef.current) === false){
  //     childIndex = 1
  //   }
  // },[])

  return (
    <motion.div 
      className={`flex items-center justify-between w-full p-4 bg-black/75 rounded-xl my-2 ${cardSyle}`}
      ref={cardRef}
      initial={{ x: -500, opacity: 0 }}
      animate={{ x: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: 0.2 * childIndex,
        ease: "easeOut"
      }}
    >
        <div className={`ubuntu-medium text-xl ${contentStyle}`}>
            {
              cardIcon && 
              <img src={cardIcon} alt="cardIcon.." className={`${cardIconStyle}`} />
            }
            <h2 className={`${titleStyle}`}>{title}</h2>
            <h3 className={`${subtitleStyle}`}>
              {
                subIcon && 
                <img src={subIcon} alt="subIcon.." className={`${subIconStyle}`} />
              }
              {subtitle}
            </h3>
        </div>
        {
          hideBtn ? <></> : 
          <CustomButton 
            buttonStyle={btnStyle}
            text={btnTxt}
            textStyle={txtStyle}
            onClick={() => onExecute(setLoading)}
            disabled={btnDisabled}
            isLoading={loading}
          />
        }
    </motion.div>
  )
}

export default Card