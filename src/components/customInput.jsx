import { useState } from 'react'

const CustomInput = ({ isPassword = false, placeholder, value, onChange, containerStyle, inputStyle }) => {
    const [isVisible, setIsVisible] = useState(isPassword)

  return (
    <div className={`relative ${containerStyle}`}>
        <input 
            className={`py-2 px-4 rounded-full border border-solid border-black bg-gray-900 ubuntu-medium text-white ${inputStyle}`}
            type={isVisible ? "password" : "text"}
            placeholder={placeholder}
            value={value}
            onChange={(evt) => onChange(evt.target.value)}
        />
    </div>
  )
}

export default CustomInput