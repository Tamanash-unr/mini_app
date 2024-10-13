import React from 'react'
import { Card } from '../../components'

const DailyTasks = () => {

  return (
    <div className='flex flex-col items-center w-full overflow-y-scroll mt-4 mb-20'>
        <div className='flex flex-col items-start w-[90%] md:w-[60%] my-1 py-6'>
            <p className='ubuntu-bold text-xl md:text-2xl'>Daily Tasks</p>
            <Card 
                title="Login to Game Center"
                titleStyle="text-base md:text-xl"
                btnTxt="Claim"
                btnStyle="min-w-[90px] md:min-w-[100px]"
                txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                onExecute={()=> alert("Test")}
            />
            <Card 
                title="Visit Channel"
                titleStyle="text-base md:text-xl"
                btnTxt="Claim"
                btnStyle="min-w-[90px] md:min-w-[100px]"
                txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                onExecute={()=> alert("Test")}
            />
            <Card 
                title="Check In"
                titleStyle="text-base md:text-xl"
                btnTxt="Claim"
                btnStyle="min-w-[90px] md:min-w-[100px]"
                txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                onExecute={()=> alert("Test")}
            />
        </div>
        <div className='flex flex-col items-start w-[90%] md:w-[60%] my-1 py-6'>
            <p className='ubuntu-bold text-xl md:text-2xl'>Social Tasks</p>
            <Card 
                title="Login to Game Center"
                titleStyle="text-base md:text-xl"
                btnTxt="Claim"
                btnStyle="min-w-[90px] md:min-w-[100px]"
                txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                onExecute={()=> alert("Test")}
            />
            <Card 
                title="Visit Channel"
                titleStyle="text-base md:text-xl"
                btnTxt="Claim"
                btnStyle="min-w-[90px] md:min-w-[100px]"
                txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                onExecute={()=> alert("Test")}
            />
            <Card 
                title="Check In"
                titleStyle="text-base md:text-xl"
                btnTxt="Claim"
                btnStyle="min-w-[90px] md:min-w-[100px]"
                txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                onExecute={()=> alert("Test")}
            />
        </div>
    </div>
  )
}

export default DailyTasks