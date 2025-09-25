import React, { useState, useEffect, useCallback } from 'react'
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { CustomButton } from '../components';
import { icons } from '../constants';
import { updateEarnedFromGame } from '../lib/redux/appSlice';

const SpaceGame = () => {
    const { unityProvider, unload, addEventListener, removeEventListener, isLoaded, loadingProgression } = useUnityContext({
        loaderUrl: "games/space_game/build/space_game.loader.js",
        dataUrl: "games/space_game/build/space_game.data",
        frameworkUrl: "games/space_game/build/space_game.framework.js",
        codeUrl: "games/space_game/build/space_game.wasm",
        streamingAssetsUrl: "StreamingAssets",
        productName: "web3",
        productVersion: "1.0.2",
        companyName: "digiframe"
    })

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameStartTime, setGameStartTime] = useState(null);

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

    const handleGameOver = useCallback(async (score) => {
        if(!isGameOver){
            setIsGameOver(true)
            dispatch(updateEarnedFromGame(score))
            
            // Process tokenomics reward via Yellow Network
            try {
                const gameResults = {
                    score: score,
                    gameTime: gameStartTime ? Date.now() - gameStartTime : 0,
                    level: Math.floor(score / 1000), // Estimate level from score
                    enemies_defeated: Math.floor(score / 100) // Estimate enemies from score
                };

                // Simple reward system - earn coins based on score
                const baseReward = Math.floor(score / 10); // 1 coin per 10 points
                const levelBonus = Math.floor(gameResults.level) * 5; // 5 coins per level
                const totalReward = Math.max(baseReward + levelBonus, 10); // Minimum 10 coins

                dispatch(updateEarnedFromGame(totalReward));
                console.log('🎉 Space game reward processed:', totalReward, 'coins');
            } catch (error) {
                console.error('Failed to process space game tokenomics reward:', error);
            }
            
            removeEventListener("GameOver", handleGameOver)
        }
    }, [dispatch, removeEventListener, isGameOver, gameStartTime])

    useEffect(() => {
        addEventListener("GameOver", handleGameOver)
        
        // Set game start time when Unity loads
        if (isLoaded && !gameStartTime) {
            setGameStartTime(Date.now());
        }

        return () => {
            removeEventListener("GameOver", handleGameOver)
        }
    }, [handleGameOver, addEventListener, removeEventListener, isLoaded, gameStartTime])

    const handleReturn = async () => {
        await unload();
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

export default SpaceGame
