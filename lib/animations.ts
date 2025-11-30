// Animation variants for Framer Motion
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.8, ease: 'easeInOut' }
}

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.8, ease: 'easeOut' }
}

export const slideDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { duration: 0.8, ease: 'easeOut' }
}

export const slideLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.8, ease: 'easeOut' }
}

export const slideRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.8, ease: 'easeOut' }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.7, ease: 'easeOut' }
}

export const scaleUp = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
  transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0
  },
  transition: { duration: 0.6 }
}

export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.4, ease: 'easeInOut' }
}

export const hoverLift = {
  y: -8,
  scale: 1.02,
  transition: { duration: 0.4, ease: 'easeOut' }
}

export const tapScale = {
  scale: 0.95,
  transition: { duration: 0.2 }
}

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.15
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.5 }
  }
}

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { duration: 0.2 }
  }
}

export const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8
    }
  }
}

export const bounceTransition = {
  type: 'spring',
  damping: 10,
  stiffness: 100
}

export const smoothTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.5
}
