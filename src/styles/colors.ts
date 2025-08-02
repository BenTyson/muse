// Punk Rock Color Palette
// Source: https://www.schemecolor.com/punk-rock.php

export const colors = {
  // Primary Colors
  roseVale: '#AB505E',        // Main red/pink - primary brand color
  hippieTrail: '#B8860F',     // Gold/yellow - accent color
  sapphire: '#255F85',        // Blue - secondary color
  shuttleGray: '#5A626F',     // Gray - neutral color
  ebonyClay: '#283044',       // Dark blue/gray - dark backgrounds
  
  // Semantic mappings
  primary: '#AB505E',         // roseVale
  primaryDark: '#8B3E4A',     // Darker variant of roseVale
  primaryLight: '#C56B7A',    // Lighter variant of roseVale
  
  secondary: '#255F85',       // sapphire
  secondaryDark: '#1A4260',   // Darker variant of sapphire
  secondaryLight: '#3B7BA5',  // Lighter variant of sapphire
  
  accent: '#B8860F',          // hippieTrail
  accentDark: '#8F6A0C',      // Darker variant of hippieTrail
  accentLight: '#D4A520',     // Lighter variant of hippieTrail
  
  // Neutrals
  dark: '#283044',            // ebonyClay
  gray: '#5A626F',            // shuttleGray
  grayLight: '#8B929C',       // Lighter gray
  grayLighter: '#B8BCC4',     // Even lighter gray
  grayLightest: '#E5E7EB',   // Very light gray
  
  // Black and White
  black: '#000000',
  white: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981',         // Green
  error: '#EF4444',           // Red
  warning: '#F59E0B',         // Orange
  info: '#3B82F6',            // Blue
  
  // Background colors
  bgDark: '#000000',          // Pure black
  bgDarkAlt: '#283044',       // ebonyClay
  bgLight: '#FFFFFF',         // White
  bgGray: '#F5F5F5',          // Light gray background
}

// Tailwind CSS class mappings
export const colorClasses = {
  primary: {
    bg: 'bg-[#AB505E]',
    bgHover: 'hover:bg-[#8B3E4A]',
    text: 'text-[#AB505E]',
    textHover: 'hover:text-[#AB505E]',
    border: 'border-[#AB505E]',
    ring: 'ring-[#AB505E]',
    focusRing: 'focus:ring-[#AB505E]',
  },
  secondary: {
    bg: 'bg-[#255F85]',
    bgHover: 'hover:bg-[#1A4260]',
    text: 'text-[#255F85]',
    textHover: 'hover:text-[#255F85]',
    border: 'border-[#255F85]',
    ring: 'ring-[#255F85]',
    focusRing: 'focus:ring-[#255F85]',
  },
  accent: {
    bg: 'bg-[#B8860F]',
    bgHover: 'hover:bg-[#8F6A0C]',
    text: 'text-[#B8860F]',
    textHover: 'hover:text-[#B8860F]',
    border: 'border-[#B8860F]',
    ring: 'ring-[#B8860F]',
    focusRing: 'focus:ring-[#B8860F]',
  },
  dark: {
    bg: 'bg-[#283044]',
    bgHover: 'hover:bg-[#1F2537]',
    text: 'text-[#283044]',
    textHover: 'hover:text-[#283044]',
    border: 'border-[#283044]',
  },
  gray: {
    bg: 'bg-[#5A626F]',
    bgHover: 'hover:bg-[#4A5260]',
    text: 'text-[#5A626F]',
    textHover: 'hover:text-[#5A626F]',
    border: 'border-[#5A626F]',
  },
}