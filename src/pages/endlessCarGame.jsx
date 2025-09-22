import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { icons } from '../constants';
import { CustomButton } from '../components';
import { updateEarnedFromGame } from '../lib/redux/appSlice';

const EndlessCarGame = () => {
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState({
    score: 0,
    speed: 5,
    displaySpeed: 30,
    lastSpeedIncrease: 0,
    isGameStarted: false,
    isGamePaused: false,
    isGameOver: false,
    playerX: 0,
    playerY: 0
  });

  const [gameObjects, setGameObjects] = useState({
    lines: [],
    enemies: [],
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowRight: false,
      ArrowLeft: false,
      Space: false
    }
  });

  const randomColor = () => {
    const colors = ['#e74c3c', '#3498db', '#e67e22', '#9b59b6', '#f39c12', '#1abc9c'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const isCollide = (rect1, rect2) => {
    return !(
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom ||
      rect1.right < rect2.left ||
      rect1.left > rect2.right
    );
  };

  const initializeGame = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const lines = [];
    const enemies = [];

    // Create road lines
    for (let i = 0; i < 10; i++) {
      lines.push({
        id: i,
        y: i * 150,
        x: gameAreaRect.width / 2 - 5
      });
    }

    // Create enemies
    for (let i = 0; i < 3; i++) {
      enemies.push({
        id: i,
        y: (i + 1) * 600 * -1,
        x: Math.floor(Math.random() * (gameAreaRect.width - 50)),
        color: randomColor()
      });
    }

    setGameObjects(prev => ({ ...prev, lines, enemies }));
    setGameState(prev => ({
      ...prev,
      playerX: (gameAreaRect.width - 50) / 2,
      playerY: gameAreaRect.height - 120,
      score: 0,
      speed: 5,
      displaySpeed: 30,
      lastSpeedIncrease: 0,
      isGameStarted: true,
      isGameOver: false,
      isGamePaused: false
    }));
  }, []);

  const endGame = useCallback(async () => {

    setGameState(prev => ({
      ...prev,
      isGameStarted: false,
      isGameOver: true
    }));

    dispatch(updateEarnedFromGame(gameState.score))

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [gameState.score, dispatch, updateEarnedFromGame]);

  const gameLoop = useCallback(() => {
    if (!gameAreaRef.current || gameState.isGamePaused || !gameState.isGameStarted) {
      return;
    }

    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    
    setGameState(prevState => {
      const newState = { ...prevState };
      
      // Update score
      newState.score += 0.1;

      // Speed increase logic
      const currentScore = Math.floor(newState.score);
      if (currentScore > 0 && currentScore % 50 === 0 && currentScore > newState.lastSpeedIncrease) {
        newState.speed += 0.5;
        newState.displaySpeed += 5;
        newState.lastSpeedIncrease = currentScore;
      }

      // Player movement
      if (gameObjects.keys.ArrowLeft && newState.playerX > 0) {
        newState.playerX -= newState.speed * 2;
      }
      if (gameObjects.keys.ArrowRight && newState.playerX < gameAreaRect.width - 50) {
        newState.playerX += newState.speed * 2;
      }

      return newState;
    });

    setGameObjects(prevObjects => {
      const newObjects = { ...prevObjects };
      
      // Move lines
      newObjects.lines = newObjects.lines.map(line => {
        let newY = line.y + gameState.speed;
        if (newY >= gameAreaRef.current.offsetHeight) {
          newY -= gameAreaRef.current.offsetHeight + 100;
        }
        return { ...line, y: newY };
      });

      // Move enemies and check collisions
      let collisionDetected = false;
      newObjects.enemies = newObjects.enemies.map(enemy => {
        let newY = enemy.y + gameState.speed;
        let newX = enemy.x;
        let newColor = enemy.color;

        // Check collision with player
        const enemyRect = {
          left: enemy.x,
          top: enemy.y,
          right: enemy.x + 50,
          bottom: enemy.y + 100
        };
        
        const playerRect = {
          left: gameState.playerX,
          top: gameState.playerY,
          right: gameState.playerX + 50,
          bottom: gameState.playerY + 100
        };

        if (isCollide(enemyRect, playerRect)) {
          collisionDetected = true;
        }

        // Reset enemy position if it goes off screen
        if (newY >= gameAreaRef.current.offsetHeight) {
          newY = -600;
          newX = Math.floor(Math.random() * (gameAreaRef.current.offsetWidth - 50));
          newColor = randomColor();
          // Add score for avoiding enemy
          setGameState(prev => ({ ...prev, score: prev.score + 1 }));
        }

        return { ...enemy, y: newY, x: newX, color: newColor };
      });

      if (collisionDetected) {
        endGame();
        return prevObjects;
      }

      return newObjects;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameObjects.keys, endGame]);

  useEffect(() => {
    if (gameState.isGameStarted && !gameState.isGamePaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isGameStarted, gameState.isGamePaused, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      if (e.code === 'Space') {
        togglePause();
      } else {
        setGameObjects(prev => ({
          ...prev,
          keys: { ...prev.keys, [e.key]: true }
        }));
      }
    };

    const handleKeyUp = (e) => {
      e.preventDefault();
      setGameObjects(prev => ({
        ...prev,
        keys: { ...prev.keys, [e.key]: false }
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls
  const handleTouchStart = (e) => {
    if(!gameState.isGameStarted) return;

    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if(!gameState.isGameStarted) return;

    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right
        setGameObjects(prev => ({
          ...prev,
          keys: { ...prev.keys, ArrowRight: true }
        }));
        setTimeout(() => {
          setGameObjects(prev => ({
            ...prev,
            keys: { ...prev.keys, ArrowRight: false }
          }));
        }, 200);
      } else {
        // Swipe left
        setGameObjects(prev => ({
          ...prev,
          keys: { ...prev.keys, ArrowLeft: true }
        }));
        setTimeout(() => {
          setGameObjects(prev => ({
            ...prev,
            keys: { ...prev.keys, ArrowLeft: false }
          }));
        }, 200);
      }
    }
  };

  const startGame = () => {
    initializeGame();
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isGamePaused: !prev.isGamePaused
    }));
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      speed: 5,
      displaySpeed: 30,
      lastSpeedIncrease: 0,
      isGameStarted: false,
      isGamePaused: false,
      isGameOver: false,
      playerX: 0,
      playerY: 0
    });
    setGameObjects({
      lines: [],
      enemies: [],
      keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowRight: false,
        ArrowLeft: false,
        Space: false
      }
    });
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden select-none">
      {/* Score Display */}
      <div className="bg-black bg-opacity-80 h-16 flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm">
        Score: {Math.floor(gameState.score)} | Speed: {gameState.displaySpeed}km/h
      </div>

      {/* Game Area */}
      <div className="flex justify-center">
        <div 
          ref={gameAreaRef}
          className="bg-black w-full max-w-sm h-screen relative overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          {/* Road Lines */}
          {gameState.isGameStarted && gameObjects.lines.map(line => (
            <div
              key={line.id}
              className="absolute w-2 h-24 bg-white"
              style={{
                top: `${line.y}px`,
                left: `${line.x}px`
              }}
            />
          ))}

          {/* Player Car */}
          {gameState.isGameStarted && (
            <div
              className={`absolute w-12 h-24 flex items-center justify-center text-black font-bold text-lg bg-contain bg-white rounded-2xl`}
              style={{
                left: `${gameState.playerX}px`,
                top: `${gameState.playerY}px`,
                backgroundImage: `url(${icons.Car})`
              }}
            />
          )}

          {/* Enemy Cars */}
          {gameState.isGameStarted && gameObjects.enemies.map(enemy => (
            <div
              key={enemy.id}
              className="absolute w-12 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-sm bg-contain rotate-180"
              style={{
                left: `${enemy.x}px`,
                top: `${enemy.y}px`,
                backgroundColor: enemy.color,
                backgroundImage: `url(${icons.Car})`
              }}
            />
          ))}

          {/* Start Button */}
          {!gameState.isGameStarted && !gameState.isGameOver && (
            <button
              onClick={startGame}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-green-600 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105"
            >
              Start Game
            </button>
          )}
        </div>
      </div>

      {/* Pause Screen */}
      {gameState.isGamePaused && (
        <div className="fixed inset-0 bg-yellow-400 bg-opacity-80 flex flex-col items-center justify-center z-50">
          <h2 className="text-3xl font-bold text-black mb-4">Game Paused</h2>
          <p className="text-xl text-black mb-4">Score: {Math.floor(gameState.score)}</p>
          <button
            onClick={togglePause}
            className="bg-green-500 hover:bg-orange-500 text-black hover:text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Resume
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-10 text-white text-center">
          <h2 className="text-4xl font-bold text-red-500 mb-6">Game Over</h2>
          <p className="text-xl mb-2">
            Score: {Math.floor(gameState.score)}
          </p>
          <p className="text-lg mb-6 text-gray-300">Speed: {gameState.displaySpeed}km/h</p>
        </div>
      )}

      {/* Mobile Instructions */}
      {/* <div className="fixed bottom-4 left-4 right-4 text-center text-white text-sm opacity-75 md:hidden">
        Swipe left/right to steer • Space to pause
      </div> */}
        <div className={`fixed transition-transform ease-in-out duration-500 bottom-0 ${ gameState.isGameOver ? 'translate-y-0' : 'translate-y-32'} flex justify-center w-full md:w-[500px] pt-6 pb-4 z-10 bg-gradient-to-t from-slate-600`}>
            <CustomButton 
                text="Go Back"
                textStyle="m-0 ubuntu-bold"
                onClick={() => navigate('/main')}
            />
        </div>
    </div>
  );
};

export default EndlessCarGame;