import React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const Modal = ({ children }) => {

    const isOpen = useSelector(state => state.app.modalOpen)
    const modalChild = useSelector(state => state.app.modalChild)

    const transition = {
        hidden: { 
            opacity: 0, 
            backgroundColor: 'rgba(17,24,39,0)',
        },
        show: { 
            backgroundColor: 'rgba(17,24,39,0.8)',
            opacity: 1,
            transition: {
                duration: 0.5,
            }
        }
    }

    return (
    <AnimatePresence>
        {
            isOpen && 
            <motion.div 
                variants={transition}
                initial="hidden"
                animate="show"
                exit="hidden"
                onClick={() => console.log("close")}
                className={`fixed z-40 w-full h-full md:w-[60%] flex items-center justify-center`}
            >
                <motion.div 
                    initial={{
                        y: 500
                    }}
                    animate={{
                        y: 0,
                        transition: {
                            duration: 0.5,
                            ease: 'easeInOut'
                        }
                    }}
                    exit={{
                        y: 500
                    }}
                    className='w-full h-full'
                >
                    {children[modalChild]}
                </motion.div>
            </motion.div>
        }
    </AnimatePresence>
    )
}

export default Modal