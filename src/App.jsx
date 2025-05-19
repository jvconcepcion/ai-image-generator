import { useState } from 'react'
import { ImageGenerator } from '@/components'

function App() {
  const [ count, setCount ] = useState(0)

  return (
    <div className='relative h-screen'>
      <div
        className='absolute inset-0 z-0'
        style={ {
          backgroundImage: `url(/bg-image.jpg)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          mixBlendMode: 'color-dodge',
        } }
      />
      <ImageGenerator />
    </div>
  )
}

export default App
