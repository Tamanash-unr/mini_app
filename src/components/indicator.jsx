import React from 'react'

const Indicator = ({styleInner, styleOuter, styleContainer}) => {
  return (
    <span className={`absolute top-0 right-0 flex h-3 w-3 ${styleContainer}`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styleOuter}`} />
        <span className={`relative inline-flex rounded-full h-3 w-3 ${styleInner}`} />
    </span>
  )
}

export default Indicator