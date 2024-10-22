import React, { useState, useEffect, useCallback } from 'react'
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useNavigate } from 'react-router-dom';

import { CustomButton } from '../components';
import { icons } from '../constants';

const LineGame = () => {
    const { unityProvider, unload, addEventListener, removeEventListener, isLoaded, loadingProgression } = useUnityContext({
        loaderUrl: "build/new_diasble.loader.js",
        dataUrl: "build/new_diasble.data",
        frameworkUrl: "build/new_diasble.framework.js",
        codeUrl: "build/new_diasble.wasm",
        streamingAssetsUrl: "StreamingAssets",
        productName: "web3",
        productVersion: "1.0.2",
    })

    const navigate = useNavigate();

    const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);

    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(function () {
        // A function which will update the device pixel ratio of the Unity
        // Application to match the device pixel ratio of the browser.
        const updateDevicePixelRatio = function () {
        setDevicePixelRatio(window.devicePixelRatio);
        };
        // A media matcher which watches for changes in the device pixel ratio.
        const mediaMatcher = window.matchMedia(
        `screen and (resolution: ${devicePixelRatio}dppx)`
        );
        // Adding an event listener to the media matcher which will update the
        // device pixel ratio of the Unity Application when the device pixel
        // ratio changes.
        mediaMatcher.addEventListener("change", updateDevicePixelRatio);
        return function () {
        // Removing the event listener when the component unmounts.
        mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
        };
    },[devicePixelRatio]);

    const handleGameOver = useCallback((score) => {
        setIsGameOver(true)
        setScore(score);
        console.log("Game is Over" ,score)
    }, [])

    useEffect(() => {
        addEventListener("GameOver", handleGameOver)

        setTimeout(() => {
            setIsGameOver(true)
        }, 30000)

        return () => {
            removeEventListener("GameOver", handleGameOver)
        }
    }, [handleGameOver, addEventListener, removeEventListener])

    const handleReturn = async () => {
        await unload();
        console.log('score: ', score)
        navigate('/main')
    }

    return (
     <div className='flex justify-center w-screen bg-slate-950'>
            <div className={`flex flex-col items-center justify-center w-screen h-screen ${isLoaded ? 'invisible' : 'visible'}`}>
                <img src={icons.Gear} alt="WIP..." className='w-20 h-20 animate-spin'/>
                <div className='w-[75%] md:w-[20%] my-6 h-5 rounded-full bg-white overflow-hidden'>
                    <div className={`w-[${ Math.round(loadingProgression * 100)}%] h-full bg-sky-500`}/>
                </div>
            </div>
            <Unity
                unityProvider={unityProvider}
                className={`fixed z-0 w-screen h-screen md:w-[500px] md:mx-auto ${isLoaded ? 'visible' : 'invisible'}`}
                devicePixelRatio={devicePixelRatio}
            />
            <div className={`fixed transition-transform ease-in-out duration-500 bottom-0 ${ isGameOver ? 'translate-y-0' : 'translate-y-32'} flex justify-center w-full md:w-[500px] pt-6 pb-4 z-10 bg-gradient-to-t from-slate-600`}>
                <CustomButton 
                    text="Go Back"
                    textStyle="m-0 ubuntu-bold"
                    onClick={handleReturn}
                />
            </div>
     </div>
    )
}

export default LineGame