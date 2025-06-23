# AfridemiQ - Africa Exam Prep Platform

**AfridemiQ** is a comprehensive digital learning and exam preparation platform specifically designed for African students across Francophone and Anglophone educational systems. The platform provides personalized learning experiences, extensive practice materials, and advanced analytics to help students excel in their exams.

## 🌍 Vision

Empowering African students with cutting-edge educational technology to excel in their academic pursuits while preserving and celebrating African educational heritage and languages.

## ✨ Key Features

### 📚 Comprehensive Subject Coverage
- **Core Subjects**: Mathematics, Physics, Chemistry, Biology, French, English, Philosophy, History, Geography
- **Specialized Subjects**: African Languages, Arabic, Portuguese, Technology, Agriculture, Health Sciences
- **Series-Specific Content**: Support for BAC (A, C, D, L), WAEC, NECO, JAMB, KCSE, and BEPC systems

### 🎯 Personalized Learning
- **Adaptive Learning Algorithms**: Content difficulty adjusts based on performance
- **Subject-Specific Lesson Types**: 
  - Math lessons with interactive problem-solving
  - Science lessons with virtual experiments
  - Language lessons with comprehension and writing exercises
  - Philosophy lessons with critical thinking components

### 📊 Advanced Analytics & Progress Tracking
- **Real-time Performance Metrics**: Track scores, completion rates, and learning patterns
- **Detailed Subject Mastery**: Monitor progress across different topics and difficulty levels
- **Gamified Progress System**: Badges, achievements, and leaderboards to motivate learning

### 🤝 Collaborative Learning
- **Study Groups**: Form and join study groups with peers
- **Peer Tutoring**: Connect with advanced students for mentorship
- **Discussion Forums**: Subject-specific discussion spaces

### 🏆 Assessment & Evaluation
- **Practice Quizzes**: Thousands of questions across all subjects
- **Mock Exams**: Full-length practice exams mimicking real test conditions
- **Instant Feedback**: Detailed explanations and learning recommendations
- **Performance Analytics**: Comprehensive reports for students and parents

### 📱 Multi-Platform Access
- **Mobile App**: React Native app with offline capabilities
- **Web Platform**: Full-featured web application
- **Offline Support**: Download content for studying without internet

### 🌐 Multi-Language Support
- **Primary Languages**: French, English, Arabic, Portuguese
- **Local Languages**: Support for major African languages (Wolof, Hausa, Yoruba, Amharique, etc.)
- **Cultural Context**: Content adapted to African educational contexts

## 🛠 Technical Architecture

### Frontend (Mobile)
```
mobile/v1/
├── app/                 # Expo Router pages
├── src/
│   ├── components/      # Reusable UI components
│   ├── services/        # API integration
│   ├── utils/           # Helper functions
│   └── dat/            # Data structures and types
├── constants/           # App constants
└── assets/             # Images, fonts, etc.
```

### Backend (Server)
```
server/
├── src/
│   ├── models/          # Database schemas
│   │   ├── learning/    # Learning-related models
│   │   ├── assessment/  # Quiz and exam models
│   │   ├── progress/    # Progress tracking
│   │   └── results/     # User results and analytics
│   ├── services/        # Business logic
│   │   ├── learning/    # Subject-specific lesson services
│   │   ├── assessment/  # Quiz and evaluation services
│   │   └── progress/    # Analytics and tracking
│   ├── routes/          # API endpoints
│   ├── controllers/     # Request handlers
│   └── middlewares/     # Authentication, validation, etc.
└── v1/                  # API versioning
```

### Database Schema Highlights
- **Subject-Specific Lesson Models**: Tailored schemas for each subject type
- **Comprehensive User Analytics**: Detailed tracking of learning patterns
- **Flexible Assessment System**: Support for various question types and formats
- **Progress Tracking**: Multi-dimensional progress monitoring
- **Social Features**: Study groups, peer tutoring, and collaboration tools

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Expo CLI (for mobile development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/afridemiq.git
   cd afridemiq
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start the server
   npm run dev
   ```

3. **Mobile App Setup**
   ```bash
   cd mobile/v1
   npm install
   
   # Start the Expo development server
   npx expo start
   ```

### Environment Variables

#### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/AfricaExamPrep
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloud Storage (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Mobile App
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## 📊 Data Structure Overview

The platform uses a sophisticated data structure to handle diverse educational content:

- **User Management**: Comprehensive user profiles with preferences, progress, and social features
- **Content Management**: Subject-specific lessons, quizzes, and resources
- **Assessment System**: Flexible quiz and exam framework
- **Analytics Engine**: Multi-dimensional progress tracking and performance analysis
- **Social Features**: Study groups, peer tutoring, and collaborative learning

## 🎯 Target Audience

- **Primary**: High school students preparing for national exams (BAC, WAEC, NECO, etc.)
- **Secondary**: Middle school students building foundational knowledge
- **Tertiary**: University entrance exam candidates
- **Educators**: Teachers seeking digital resources and student analytics

## 🌟 Unique Value Propositions

1. **African-Centric Content**: Curriculum aligned with African educational systems
2. **Multi-Language Support**: Native language options for better comprehension
3. **Offline Capabilities**: Learn without consistent internet access
4. **Cultural Relevance**: Examples and contexts familiar to African students
5. **Affordable Access**: Designed for economic accessibility across Africa
6. **Collaborative Learning**: Emphasis on community and peer support

## 🤝 Contributing

We welcome contributions from educators, developers, and students! Please read our Contributing Guidelines for details on:

- Code standards and best practices
- Content creation guidelines
- Translation and localization
- Bug reporting and feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- African educators and curriculum specialists who provided guidance
- Open-source community for tools and libraries
- Beta testers and early adopters across Africa
- Cultural and linguistic consultants

## 📞 Support

- **Documentation**: [docs.afridemiq.com](https://docs.afridemiq.com)
- **Community Forum**: [community.afridemiq.com](https://community.afridemiq.com)
- **Email Support**: support@afridemiq.com
- **WhatsApp**: +XXX-XXX-XXXX

---

**Built with ❤️ for African students, by African educators and technologists.**

*Empowering the next generation of African leaders through quality education and technology.*
