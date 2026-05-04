export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { cairo: ['Cairo', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 16px 40px rgba(2, 8, 23, .08)' }
    },
  },
  plugins: [],
}
