import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// WhatsApp Cloud API configuration
const WA_API_URL = 'https://graph.facebook.com/v17.0';
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;

const app = express();
app.use(cors());
app.use(express.json());

// Webhook endpoint for WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    const { object, entry } = req.body;
    
    if (object === 'whatsapp_business_account') {
      for (const event of entry[0].changes) {
        const { value } = event;
        const { messaging } = value;

        if (messaging) {
          for (const message of messaging) {
            const { from, text } = message;
            
            if (text) {
              await handleMessage(from, text.body);
            }
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).send('ERROR');
  }
});

// Handle incoming messages
async function handleMessage(from, message) {
  try {
    // Get user preferences from Firestore
    const userRef = db.collection('users').doc(from);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Handle different message types
    if (message.toLowerCase().includes('start')) {
      await sendWelcomeMessage(from);
    } else if (message.toLowerCase().includes('preferences')) {
      await sendPreferencesMessage(from, userData);
    } else {
      // Handle other message types
      await sendDefaultMessage(from);
    }

    // Save message to history
    await userRef.collection('messages').add({
      message,
      timestamp: new Date(),
      type: 'received'
    });
  } catch (error) {
    console.error('Error handling message:', error);
    await sendErrorMessage(from);
  }
}

// Send message to WhatsApp
async function sendMessage(to, message) {
  try {
    await axios.post(`${WA_API_URL}/${WA_PHONE_NUMBER_ID}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message }
    }, {
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Send welcome message
async function sendWelcomeMessage(to) {
  const message = `
    Welcome to BibleAI! 🙏
    
    I can help you with:
    1. Daily Bible verses
    2. Devotionals and reflections
    3. Prayer journaling
    4. Scripture sharing
    
    Type "preferences" to set up your daily verse delivery.
  `;
  await sendMessage(to, message);
}

// Send preferences message
async function sendPreferencesMessage(to, userData) {
  const message = `
    Your current preferences:
    - Daily verse time: ${userData.dailyTime || 'Not set'}
    - Bible version: ${userData.bibleVersion || 'Not set'}
    - Preferred topics: ${userData.topics?.join(', ') || 'Not set'}
    
    To change your preferences, reply with:
    - "set time [HH:MM]" to set daily verse time
    - "set version [version]" to set Bible version
    - "set topics [topics]" to set preferred topics
  `;
  await sendMessage(to, message);
}

// Send default message
async function sendDefaultMessage(to) {
  const message = `
    I didn't understand that. Here are some commands:
    - "start" to begin
    - "preferences" to view settings
    - "help" for more options
  `;
  await sendMessage(to, message);
}

// Send error message
async function sendErrorMessage(to) {
  const message = `
    Something went wrong. Please try again.
    Type "help" for available commands.
  `;
  await sendMessage(to, message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp bot server running on port ${PORT}`);
});
