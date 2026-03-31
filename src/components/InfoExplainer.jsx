import { useState, useEffect, useRef } from 'react'

/**
 * InfoExplainer Component
 * 
 * A premium-styled tooltip that shows on hover (desktop) or click (mobile/tablet).
 * 
 * @param {string} text - The explanation text to display.
 * @param {string} position - The position of the tooltip relative to the icon (top, bottom, left, right).
 */
export default function InfoExplainer({ text, position = 'top' }) {
  const [show, setShow] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative inline-flex items-center ml-1.5" ref={ref}>
      <div 
        role="button"
        tabIndex={0}
        className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all cursor-help border border-white/5 outline-none"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation()
          setShow(!show)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setShow(!show)
          }
        }}
      >
        <span className="material-symbols-outlined text-[10px] pointer-events-none">info</span>
      </div>

      {show && (
        <div className={`absolute z-[100] w-48 p-3 rounded-xl bg-[#091328]/95 backdrop-blur-xl border border-indigo-500/30 shadow-2xl animate-fade-in-up ${positionClasses[position]}`}>
          <p className="text-[11px] leading-relaxed font-medium text-slate-200">
            {text}
          </p>
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-[#091328] border-indigo-500/30 rotate-45 transform ${
            position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
            position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
            position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' :
            'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b'
          }`}></div>
        </div>
      )}
    </div>
  )
}
