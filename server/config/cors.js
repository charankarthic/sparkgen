const corsOptions = {
  origin: [
    'https://sparkgen.vercel.app',
    'https://sparkgen-chi.vercel.app',
    'https://sparkgen-git-main-charankarthic.vercel.app',
    /^https:\/\/sparkgen-.*\.vercel\.app$/,
    // Include localhost for development
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions;