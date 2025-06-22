import { Easing } from "react-native-reanimated"

export const animations = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  timing: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  bounce: {
    damping: 8,
    stiffness: 100,
    mass: 1,
  },
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
}

export const fadeIn = {
  from: { opacity: 0, transform: [{ translateY: 20 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
}

export const slideInRight = {
  from: { transform: [{ translateX: 300 }] },
  to: { transform: [{ translateX: 0 }] },
}

export const scaleIn = {
  from: { transform: [{ scale: 0.8 }], opacity: 0 },
  to: { transform: [{ scale: 1 }], opacity: 1 },
}
