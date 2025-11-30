'use client'

import { useEffect, useState, useId } from 'react'
import { motion, type Variants } from 'framer-motion'
import SplitType from 'split-type'

interface AnimatedTextProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  inView?: boolean
  viewportAmount?: number
  blur?: boolean
}

const lineVariants: Variants = {
  hidden: (blur: boolean) => ({
    opacity: 0,
    y: 30,
    filter: blur ? 'blur(8px)' : 'blur(0px)',
  }),
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
}

export function AnimatedText({
  text,
  as: Tag = 'p',
  className = '',
  delay = 0,
  stagger = 0.12,
  duration = 0.7,
  inView = true,
  viewportAmount = 0.8,
  blur = true,
}: AnimatedTextProps) {
  const [lines, setLines] = useState<string[]>([])
  const [isReady, setIsReady] = useState(false)
  const id = useId()

  useEffect(() => {
    const splitText = () => {
      const measureElement = document.createElement(Tag)
      measureElement.className = className
      measureElement.style.position = 'absolute'
      measureElement.style.visibility = 'hidden'
      measureElement.style.pointerEvents = 'none'
      measureElement.textContent = text
      document.body.appendChild(measureElement)

      const split = new SplitType(measureElement, { types: 'lines' })
      const splitLines = split.lines?.map((line) => line.textContent || '') || [text]

      document.body.removeChild(measureElement)

      setLines(splitLines)
      setIsReady(true)
    }

    if (document.fonts) {
      document.fonts.ready.then(splitText)
    } else {
      splitText()
    }

    const handleResize = () => {
      setIsReady(false)
      setLines([])
      if (document.fonts) {
        document.fonts.ready.then(splitText)
      } else {
        splitText()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [text, className, Tag])

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const MotionTag = motion[Tag] as typeof motion.p

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      {...(inView
        ? { whileInView: 'visible', viewport: { once: true, amount: viewportAmount } }
        : { animate: isReady ? 'visible' : 'hidden' })}
    >
      {isReady ? (
        lines.map((line, index) => (
          <motion.span
            key={`${id}-${index}`}
            variants={lineVariants}
            custom={blur}
            transition={{
              duration,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="block"
          >
            {line}
          </motion.span>
        ))
      ) : (
        <span style={{ opacity: 0 }}>{text}</span>
      )}
    </MotionTag>
  )
}
