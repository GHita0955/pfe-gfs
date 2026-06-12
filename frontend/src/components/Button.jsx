import React from 'react'

const VARIANTS = {
  primary:
    'inline-flex items-center justify-center rounded-full border border-white bg-white px-7 py-3 text-xs font-extrabold uppercase tracking-wide text-black shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-xs font-extrabold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-gold/15 hover:text-gold',
  gold: 'btn-gold',
  outline: 'btn-outline-gold',
  ghost: 'btn-ghost',
}

export default function Button({ variant = 'primary', icon, children, className = '', ...props }) {
  const classes = `${VARIANTS[variant] || VARIANTS.primary} ${className}`.trim()
  return (
    <button className={classes} {...props}>
      {icon && <span className="-ml-1 mr-2 inline-flex items-center justify-center w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
