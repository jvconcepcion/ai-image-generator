import React, { useState, useRef, useEffect } from 'react'
import defaultImg from '@/assets/default-img.png'
import Skeleton from '@mui/material/Skeleton'

const ImageGenerator = () => {
  const [ imageUrl, setImageUrl ] = useState('/')
  const [ loading, setLoading ] = useState(false)
  const [ isDisabled, setIsDisabled ] = useState(true)

  const inputDesktopRef = useRef(null)
  const inputMobileRef = useRef(null)

  const getPromptValue = () => {
    return inputDesktopRef.current?.value.trim() || inputMobileRef.current?.value.trim() || ''
  }

  const clearInactiveInput = () => {
    const isDesktop = window.innerWidth >= 768

    if (isDesktop) {
      // desktop is visible - clear mobile
      if (inputMobileRef.current) inputMobileRef.current.value = ''
    } else {
      // mobile is visible - clear desktop
      if (inputDesktopRef.current) inputDesktopRef.current.value = ''
    }
  }

  const handleImageGenerate = async () => {
    const prompt = getPromptValue()
    if (!prompt) return

    const url = import.meta.env.VITE_OPENAI_API_IMAGE_URL
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    setLoading(true)
    console.log(prompt)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'Chrome'
        },
        body: JSON.stringify({
          prompt,
          'n': 1,
          'size': '512x512'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Unknown error')
      }

      const { data } = await response.json()
      console.log(data)
      if (data && data.length > 0) {
        setImageUrl(data[ 0 ].url)
      } else {
        throw new Error('No image returned from OpenAI')
      }
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      clearInactiveInput();
      checkPrompt();
    };

    const checkPrompt = () => {
      const prompt =
        inputDesktopRef.current?.value.trim() ||
        inputMobileRef.current?.value.trim() ||
        '';
      setIsDisabled(prompt === '');
    };

    const desktopInput = inputDesktopRef.current;
    const mobileInput = inputMobileRef.current;

    desktopInput?.addEventListener('input', checkPrompt);
    mobileInput?.addEventListener('input', checkPrompt);

    window.addEventListener('resize', handleResize);

    checkPrompt(); // Initial check on mount

    return () => {
      desktopInput?.removeEventListener('input', checkPrompt);
      mobileInput?.removeEventListener('input', checkPrompt);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='flex flex-col m-auto items-center pt-14 md:pt-16 gap-7 bg-gradient-to-r from-black/10 via-black/20 h-full'>
      <div className='text-4xl md:text-[70px] font-medium pb-7'>
        Ai Image <span className='bg-gradient-to-r from-orange-500 to-red-800 bg-clip-text text-transparent font-semibold'>Generator</span>
      </div>
      <div className='relative flex flex-col'>
        <div className='w-screen h-[380px] px-4 md:px-0 md:w-[512px] md:h-[512px]'>
          { loading
            ? <Skeleton animation='wave' variant='rectangular' width='100%' height='100%' />
            : <img className='w-full h-full' src={ imageUrl === '/' ? defaultImg : imageUrl } alt='' />
          }
        </div>
      </div>
      <div className='relative flex w-11/12 h-36 mx-4 md:mx-2 rounded-md md:w-[1000px] md:h-[95px] md:rounded-[20px] justify-between items-center bg-[#1f3540]'>
        {/* desktop */ }
        <input
          ref={ inputDesktopRef }
          type='text'
          className='hidden md:block w-[600px] h-[50px] bg-transparent border-none outline-none text-lg text-white pl-8 ml-8 placeholder:text-[#999]'
          placeholder='Describe your image'
        />
        {/* mobile */ }
        <textarea
          ref={ inputMobileRef }
          placeholder='Describe your image...'
          className='block md:hidden w-full max-w-md h-32 px-4 pb-4 rounded-md bg-transparent resize-none focus:outline-none mx-auto mt-4 text-base'
        />
        <div
          className={ `
            absolute bottom-[-80px] md:static py-5 flex items-center justify-center
            w-full md:w-[300px] md:h-[95px] text-xl rounded-md md:rounded-l-none md:rounded-r-[20px]
            bg-gradient-to-r from-orange-500 to-red-800
            transition-opacity duration-300 ease-in-out
            ${isDisabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}
          `}
        >
          <span className='w-full text-center' onClick={ isDisabled ? null : handleImageGenerate }>
            Generate
          </span>
        </div>
      </div>
    </div>
  )
}

export default ImageGenerator