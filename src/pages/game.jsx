import { useState, useEffect } from 'react'

const Game = () => {
    const [playerPosition, setPlayerPosition] = useState(200);
    const [items, setItems] = useState([])
    const [score, setScore] = useState(0);
    const itemSize = 25;
    const playerSize = 200;
    
    const handleKeyPress = (evt) => {
        if(evt.key === 'ArrowLeft'){
            setPlayerPosition((prev) => Math.max(0, prev - 15));
        } else if(evt.key === 'ArrowRight') {
            setPlayerPosition((prev) => Math.min(window.innerWidth - playerSize, prev + 15))
        }
    };

    const handleTouchMove = (evt) => {
        const touchX = evt.touches[0].clientX;
        const halfScreenWidth = window.innerWidth / 2

        if(touchX < halfScreenWidth){
            setPlayerPosition((prev) => Math.max(0, prev - 10));
        } else {
            setPlayerPosition((prev) => Math.min(window.innerWidth - playerSize, prev + 10))
        }
    }

    const createItem = () => {
        const newItem = {
            id: Date.now(),
            position: Math.floor(Math.random() * (window.innerWidth - itemSize)),
            top: 0,
        };

        setItems((prevItems) => [...prevItems, newItem])
    }

    // Bind event listeners for input
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress)
        window.addEventListener('touchmove', handleTouchMove)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
            window.removeEventListener('touchmove', handleTouchMove)
        }
    }, [])

    useEffect(() => {
        const player = document.getElementById('player')

        const interval = setInterval(() => {
            setItems((prevItems) => {
                const updatedItems = prevItems.map((item) => ({
                    ...item,
                    top: item.top + 5
                }))

                let itemsToRemove = [];
                let newScore = score 

                // Check for collisions
                updatedItems.forEach((item) => {
                    if( item.top + itemSize >= player.getBoundingClientRect().bottom && 
                        item.position >= playerPosition && 
                        item.position <= playerPosition + playerSize
                    ){
                        newScore += 1
                        itemsToRemove.push(item.id)
                    } else if(item.top > window.innerHeight) {
                        // item has gone off screen
                        itemsToRemove.push(item.id)
                    }
                })

                const filteredItems = updatedItems.filter(item => !itemsToRemove.includes(item.id))

                setScore(newScore)
                return filteredItems
            });
        }, 24)

        return () => clearInterval(interval)
    }, [playerPosition, score])

    useEffect(() => {
        const itemInterval = setInterval(createItem, 1000);
        return () => clearInterval(itemInterval)
    }, [])

    return (
        //Game Container
        <div className="relative m-auto md:w-[60%] h-screen overflow-hidden bg-[#d1c7c7]">
            {/* Score Div */}
            <div>Score: {score}</div>

            {/* Player */}
            <div
                id='player'
                className={`absolute bottom-[25px] rounded-full w-[${playerSize}px] h-[25px] bg-sky-800 transform transition-all duration-75`} 
                style={{ left: playerPosition }}
            />

            {/* Items */}
            {
                items.map((item) => (
                    <div 
                        key={item.id}
                        className="absolute w-[50px] h-[50px] bg-red-600"
                        style={{
                            left: item.position,
                            top: item.top,
                        }}
                    />
                ))
            }
        </div>
    )
}

export default Game