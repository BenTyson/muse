'use client'

import { useState, useEffect } from 'react'

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('default')

  useEffect(() => {
    // Apply theme to document
    const body = document.body
    if (currentTheme === 'red') {
      body.classList.add('theme-red')
    } else {
      body.classList.remove('theme-red')
    }
  }, [currentTheme])

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'default' ? 'red' : 'default')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleTheme}
        className="w-16 h-16 rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm transition-all duration-300 hover:scale-110"
        style={{
          background: currentTheme === 'default' 
            ? 'linear-gradient(45deg, rgb(7, 191, 221), rgb(255, 20, 147))'
            : 'linear-gradient(45deg, rgb(139, 0, 0), rgb(220, 20, 60))'
        }}
        title={`Switch to ${currentTheme === 'default' ? 'Red' : 'Cyan/Pink'} theme`}
      >
        {currentTheme === 'default' ? (
          <div className="text-center">
            <div className="text-xs">RED</div>
            <div className="text-xs">TEST</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xs">CYAN</div>
            <div className="text-xs">PINK</div>
          </div>
        )}
      </button>
    </div>
  )
}