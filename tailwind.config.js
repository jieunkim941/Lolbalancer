export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        lol: {
          bg: '#0A0A0F',
          card: '#1A1A2E',
          border: '#2A2A4A',
          neon: '#4CC9FF',
          gold: '#C8AA6E',
          text: '#F0F0F0',
          muted: '#8888AA',
          red: '#FF4655',
          green: '#00C853',
          yellow: '#FFD600',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
