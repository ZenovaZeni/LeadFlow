import { useInView } from '../hooks/useInView'

/**
 * Wrapper component that animates children when they scroll into view.
 * Usage: <AnimateIn type="fadeUp" delay={0.1}><Card /></AnimateIn>
 */
export default function AnimateIn({ children, type = 'fadeUp', delay = 0, className = '' }) {
  const [ref, isInView] = useInView({ threshold: 0.1 })

  const animations = {
    fadeUp: { from: 'translate3d(0, 30px, 0)', to: 'translate3d(0, 0, 0)' },
    fadeIn: { from: 'translate3d(0, 0, 0)', to: 'translate3d(0, 0, 0)' },
    fadeLeft: { from: 'translate3d(-30px, 0, 0)', to: 'translate3d(0, 0, 0)' },
    fadeRight: { from: 'translate3d(30px, 0, 0)', to: 'translate3d(0, 0, 0)' },
    scaleIn: { from: 'scale(0.95)', to: 'scale(1)' },
  }

  const anim = animations[type] || animations.fadeUp

  const style = {
    opacity: isInView ? 1 : 0,
    transform: isInView ? anim.to : anim.from,
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    willChange: 'opacity, transform',
  }

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
}
