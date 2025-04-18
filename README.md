<div align="center"> <img src="./EncChat/src/assets/Logotyp.png" width="400" height="100" alt="EncChat"> </div>

## 📑 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Setup and Installation](#-setup-and-installation)
- [Usage](#-usage)
- [Security](#-security)
- [Authors](#-authors)

## 📢 Description
EncChat is a modern real-time communication application that offers users an intuitive and secure environment for chatting. With support from advanced technologies such as React, Vite, Node.js, and PostgreSQL, EncChat ensures reliability, flexibility, and security in message management. The application includes features like registration, login, friend search, profile and chat personalization, and notification management.

## 🎯 Features

**User Authentication**
- Account registration with CAPTCHA and password encryption
- Login via username or email
- Password recovery and "remember me" option
- Email verification

**Main Interface**
- User profile with photo, name, and email
- Friends list and recent chats
- Conversation window
- User search capability

**Profile Settings**
- Change profile picture, password, and personal information
- Application appearance customization
- Blocked users management
- Message and contact statistics

**Chat Settings**
- Disappearing message mode
- Multimedia preview
- User blocking capability

**Notifications**
- Recent event information
- Invitation and notification list management

**End-to-End Encryption**
- Client-side message encryption
- Secure key exchange protocol
- Protection against unauthorized access to messages

**Key Backup & Recovery**
- Secure encryption key backup system
- Key recovery mechanisms
- Protection against key loss

**Friend Management**
- Friend request system
- Friend search functionality
- Managing friend relationships

**Toast Notification System**
- Real-time status notifications
- Action feedback alerts
- Error and success messaging
  
## 🛠️ Technologies

### Frontend
- React + Vite
- React Router
- WebSockets for real-time communication
- Web Crypto API for client-side encryption

### Backend
- Node.js
- Express
- WebSocket server
- JWT authentication

### Database
- PostgreSQL with Prisma ORM

### Cloud Services
- Cloudinary for image storage

## 🏗️ Architecture

The application follows a client-server architecture with end-to-end encryption:

1. **User Interface Layer**: React components handling the UI/UX
2. **Client-side Encryption Layer**: WebCrypto API for local message encryption
3. **Communication Layer**: WebSockets for real-time data exchange
4. **Server Layer**: Node.js + Express handling API requests
5. **Storage Layer**: PostgreSQL database for persistent data

## 🚀 Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/EncChat.git
   cd EncChat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with necessary environment variables:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/encdb
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_KEY=your_encryption_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## 💻 Usage

- Open `http://localhost:3000` in your browser
- Register a new account or log in to an existing one
- Add friends by searching for their username
- Begin chatting in a secure, end-to-end encrypted environment
- Customize your profile and chat settings as needed

## 🔒 Security

EncChat prioritizes user security with several key features:

- End-to-end encryption using the Web Crypto API
- RSA key pairs for secure key exchange
- AES-GCM for symmetric message encryption
- No plaintext message storage on the server
- Secure chat session management
- Password hashing with bcrypt

## ✍️ Authors

- **Patryk Czartowski** - *Project Lead* - [GitHub](https://github.com/PatrykCzartowski)
- **Kacper Pianka** - *Developer* - [GitHub](https://github.com/Kpianka)
- **Paweł Piernicki** - *Developer* - [GitHub](https://github.com/PiernickiP)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
