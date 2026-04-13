const MusicScriptLogo = ({ className = "w-full h-full", showText = true }: { className?: string, showText?: boolean }) => (
  <svg 
    viewBox="0 0 400 400" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* Círculos concéntricos minimalistas */}
    <circle 
      cx="200" cy="170" r="110" 
      stroke="url(#tealGradient)" 
      strokeWidth="4" 
      fill="none" 
      strokeDasharray="12 12" 
    />
    <circle 
      cx="200" cy="170" r="125" 
      stroke="#0f766e" 
      strokeWidth="2" 
      fill="none" 
      opacity="0.5" 
    />

    {/* Monograma Abstracto MJS */}
    <g 
      stroke="url(#tealGradient)" 
      strokeWidth="14" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    >
      {/* Letra M geométrica */}
      <polyline points="120,210 120,120 160,170 200,120 200,210" />
      
      {/* Letra J entrelazada */}
      <path d="M 240,120 V 190 A 25,25 0 0 1 190,190" />
      
      {/* Letra S abstracta */}
      <path d="M 290,135 C 290,110 250,110 250,145 C 250,180 290,180 290,205 C 290,230 250,230 250,205" />
    </g>

    {/* Marca denominativa opcional */}
    {showText && (
      <text 
        x="200" y="350" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="32" 
        fontWeight="800" 
        fill="currentColor" 
        textAnchor="middle" 
        letterSpacing="5"
      >
        &lt;MUSICSCRIPT&gt;
      </text>
    )}
  </svg>
);

export default MusicScriptLogo;
