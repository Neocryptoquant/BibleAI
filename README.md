# # BibleAI

A mobile-first spiritual assistant that delivers personalized Bible verses and devotionals daily via WhatsApp and a mobile app.

## Project Structure

- `backend/`: Contains the server-side logic and API endpoints
- `frontend/`: React Native mobile app
- `shared/`: Shared code and configurations
- `whatsapp-bot/`: WhatsApp integration code

## Setup

1. Install dependencies:
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Initialize Firebase project
firebase init
```

2. Create a Firebase project and add your configuration to `shared/firebase/firebaseConfig.ts`

3. Install project dependencies:
```bash
cd frontend
npm install

cd ../backend
cd install
```

## Features

- Daily Bible verse delivery via WhatsApp
- AI-powered devotionals and journaling
- Mobile app for reading and journaling
- Verse sharing capabilities
- User preference management

## Tech Stack

- Firebase (Auth, Firestore, Cloud Functions)
- React Native (Expo)
- WhatsApp Cloud API
- OpenAI API (for AI features)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT LicenseAI
