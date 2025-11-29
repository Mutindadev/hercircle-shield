# HerCircle Shield

**A Production-Ready Chrome Extension for Real-Time GBV Detection and Support**

HerCircle Shield is a comprehensive browser extension and backend system designed to detect and combat gender-based violence (GBV) targeting women across Africa. The system provides AI-powered threat detection, emotional support, evidence capture, legal pathways, and safe community connection.

---

## Overview

HerCircle Shield combines advanced AI detection with practical support tools to create a comprehensive safety net for women experiencing online harassment, cyberbullying, NCII (non-consensual intimate images), doxxing, deepfakes, coercion, and other forms of digital abuse.

### Core Features

**EchoReport** provides anonymous timestamped incident logging with automatic screenshot capture, PDQ-style content hashing for NCII takedowns, and exportable legal evidence packages in PDF and JSON formats.

**HerCircle** enables encrypted peer matching, trusted circle alerts for three to five emergency contacts, moderated support groups, and real-time chat via WebSockets for secure communication.

**AI Detection** utilizes Gemini as the primary detection engine with OpenAI as fallback, supplemented by an offline TensorFlow.js model. The system detects harassment, African language GBV slang, coercion, gaslighting, financial control patterns, doxxing attempts, deepfake indicators, and audio spoofing.

**NCII Takedown Hub** offers one-click removal requests for Meta, TikTok, X (Twitter), and Telegram platforms with auto-filled forms and hash-based re-upload prevention.

**Panic Button** provides instant alerts to trusted contacts with optional GPS sharing, platform auto-reporting, stalkerware scanning capabilities, and temporary account lockdown features.

**Support System** includes a 24/7 AI chatbot, peer chat functionality, counselor escalation pathways, and microlearning modules covering digital safety, survivor rights, and legal routes.

**Legal Pathways** delivers country-aware legal summaries for Kenya, Nigeria, South Africa, and other African nations, along with HR letter generation and an incident escalation wizard.

---

## Screenshots

### Extension Interface

![Extension Icon](screenshots/Screenshot%20from%202025-11-29%2016-04-42.png)
*HerCircle Shield purple heart icon in Chrome toolbar*

![Home Dashboard](screenshots/Screenshot%20from%202025-11-29%2016-05-13.png)
*Main dashboard with panic button, quick actions, and weekly safety stats*

![Circles Tab](screenshots/Screenshot%20from%202025-11-29%2016-05-41.png)
*Trusted contacts and support circles management*

![Learn Tab](screenshots/Screenshot%20from%202025-11-29%2016-06-06.png)
*Educational resources and safety guides*

![Settings Tab](screenshots/Screenshot%20from%202025-11-29%2016-06-24.png)
*Extension settings and preferences*

### Key Features

![Panic Button Modal](screenshots/Screenshot%20from%202025-11-29%2016-06-46.png)
*Emergency panic button with GPS sharing option*

![Evidence Capture](screenshots/Screenshot%20from%202025-11-29%2016-07-01.png)
*Screenshot capture for evidence collection*

![Educational Modal](screenshots/Screenshot%20from%202025-11-29%2016-07-20.png)
*In-depth educational content and safety tips*

![Threat Detection](screenshots/Screenshot%20from%202025-11-29%2016-04-08.png)
*Real-time threat detection on social media platforms*

![Extension Popup](screenshots/Screenshot%20from%202025-11-29%2016-30-52.png)
*Complete extension popup interface*

---

## Technology Stack

### Frontend
- **Extension**: Vanilla JavaScript with HTML5 and CSS3
- **Styling**: Tailwind CSS for consistent design
- **Storage**: Chrome Storage API for local-first data persistence

### Backend
- **Framework**: Express 4 with tRPC 11 for type-safe API communication
- **AI Services**: Gemini (primary), OpenAI (fallback), TensorFlow.js (offline)
- **Database**: MySQL/TiDB with Drizzle ORM for encrypted data storage
- **Real-time**: WebSocket via Socket.IO for chat and live updates
- **Authentication**: Manus OAuth for secure user management

### Infrastructure
- **Deployment**: Docker containers with docker-compose orchestration
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Railway or Heroku for backend services

---

## Project Structure

```
hercircle-shield/
├── extension/
│   ├── manifest.json              # Chrome extension configuration
│   ├── icons/                     # Extension icons (16/32/48/128px)
│   ├── popup/                     # Popup UI (HTML, CSS, JS)
│   ├── content/                   # Content scripts for page monitoring
│   ├── background/                # Service worker for background tasks
│   ├── lib/                       # Utility libraries (offline detection)
│   └── assets/                    # Static assets
├── server/
│   ├── routers.ts                 # tRPC API routes
│   ├── db.ts                      # Database query helpers
│   ├── ai/                        # AI detection services
│   │   ├── detection.ts           # Gemini/OpenAI integration
│   │   └── detection.test.ts      # AI detection tests
│   ├── services/                  # Business logic services
│   │   ├── websocket.ts           # Real-time chat server
│   │   ├── ncii-takedown.ts       # Platform takedown automation
│   │   └── legal.ts               # Legal document generation
│   └── _core/                     # Framework infrastructure
├── drizzle/
│   └── schema.ts                  # Database schema definitions
├── client/                        # Web dashboard (React 19)
│   ├── src/
│   │   ├── pages/                 # Dashboard pages
│   │   ├── components/            # Reusable UI components
│   │   └── lib/trpc.ts            # tRPC client configuration
│   └── public/                    # Static assets
├── tests/                         # Test suites
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
├── docs/                          # Documentation
│   ├── API.md                     # API documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── USER_GUIDE.md              # User manual
│   └── TESTING.md                 # Testing guide
├── docker-compose.yml             # Docker orchestration
└── package.json                   # Dependencies and scripts
```

---

## Installation

### Prerequisites

The system requires Node.js version 22 or higher, pnpm package manager version 10 or higher, MySQL or TiDB database, and Chrome browser version 88 or higher for the extension.

### Backend Setup

Clone the repository and navigate to the project directory. Install dependencies using `pnpm install`. Configure environment variables by copying `.env.example` to `.env` and filling in the required values including database connection string, JWT secret, and API keys for Gemini and OpenAI.

Push the database schema using `pnpm db:push` to create all necessary tables. Start the development server with `pnpm dev`, which will run on `http://localhost:3000` by default.

### Extension Installation

Navigate to `chrome://extensions/` in your Chrome browser and enable Developer mode using the toggle in the top right corner. Click "Load unpacked" and select the `extension` directory from the project. The HerCircle Shield icon should appear in your browser toolbar.

---

## Usage

### For Users

Click the HerCircle Shield icon in your browser toolbar to open the popup interface. The **Home** tab displays your safety statistics including threats detected and content blocked this week. Use the prominent red **Panic Button** for emergency situations to alert your trusted contacts instantly.

The **Circle** tab allows you to add trusted contacts who will receive alerts during emergencies. You can also join support circles to connect with peers facing similar challenges.

The **Learn** tab provides access to digital safety guides, legal rights information, bystander intervention tips, and regional hotlines for Kenya, Nigeria, South Africa, and Ghana.

The **Settings** tab offers detection sensitivity controls with three levels: low, balanced, and high. You can enable or disable auto-hiding of harmful content, configure notifications, toggle heart animations, and enable GPS sharing for panic alerts.

### For Developers

Run the test suite using `pnpm test` to execute all unit and integration tests. Check TypeScript types with `pnpm check` to ensure type safety across the codebase. Format code using `pnpm format` to maintain consistent code style.

Build for production with `pnpm build`, which creates optimized bundles for both backend and extension. Deploy using Docker with `docker-compose up -d` to start all services in production mode.

---

## API Documentation

### tRPC Endpoints

The **Incidents** router provides `incidents.create` for creating new incident reports, `incidents.list` for retrieving user's incident history, and `incidents.get` for fetching specific incident details by ID.

The **Contacts** router offers `contacts.add` for adding trusted contacts, `contacts.list` for retrieving all trusted contacts, and `contacts.delete` for removing a contact.

The **Circles** router includes `circles.create` for creating support circles, `circles.list` for retrieving user's circles, and `circles.addMember` for inviting members to circles.

The **Chat** router provides `chat.send` for sending messages to circles and `chat.getMessages` for retrieving message history.

The **Detection** router offers `detection.log` for logging detection events and `detection.stats` for retrieving detection statistics.

The **AI** router includes `ai.detect` for analyzing single content items and `ai.detectBatch` for batch content analysis.

The **Takedown** router provides `takedown.create` for submitting NCII takedown requests and `takedown.list` for tracking takedown request status.

The **Legal** router offers `legal.create` for creating legal cases and `legal.list` for retrieving user's legal cases.

The **Settings** router includes `settings.get` for retrieving user settings and `settings.update` for updating preferences.

### WebSocket Events

The real-time communication system uses several WebSocket events. `join_circle` connects to a circle's chat room, `send_message` broadcasts messages to circle members, `typing` indicates when a user is typing, `leave_circle` disconnects from a circle, and `panic_alert` broadcasts emergency alerts to relevant users.

---

## Security & Privacy

HerCircle Shield implements end-to-end encryption for all peer-to-peer communications using industry-standard encryption protocols. The system is fully compliant with GDPR and CCPA regulations, ensuring user data rights are respected.

Content warnings and consent gating are implemented throughout the interface to protect users from unexpected exposure to harmful content. Offline resources ensure critical functionality remains available even without internet connectivity.

The local-first storage architecture prioritizes data sovereignty, with optional cloud backup for users who choose to enable it. All sensitive data is encrypted at rest and in transit.

---

## Testing

The testing suite includes comprehensive coverage across multiple layers. Unit tests verify individual functions and components, integration tests ensure proper interaction between system components, and end-to-end tests validate complete user workflows.

Platform-specific tests validate detection accuracy across Twitter, Facebook, Instagram, Gmail, LinkedIn, TikTok, and WhatsApp Web. AI model accuracy testing ensures detection rates exceed ninety percent with false positive rates below ten percent.

Load testing validates system performance with over one thousand concurrent users. Security audits verify encryption implementation, authentication flows, and data protection measures. Privacy audits ensure GDPR and CCPA compliance throughout the system.

---

## Deployment

### Docker Deployment

The system includes a complete Docker configuration for easy deployment. Build images using `docker-compose build` and start services with `docker-compose up -d`. Monitor logs with `docker-compose logs -f` and stop services using `docker-compose down`.

### Railway Deployment

Railway provides a streamlined deployment process. Connect your GitHub repository to Railway, configure environment variables in the Railway dashboard, and deploy automatically on every push to the main branch.

### Heroku Deployment

Heroku deployment follows standard procedures. Create a new Heroku app, add the MySQL addon, configure environment variables, and deploy using Git push to the Heroku remote.

---

## Contributing

Contributions are welcome from developers, designers, translators, and community advocates. Fork the repository, create a feature branch, make your changes with tests, and submit a pull request with a clear description.

Please follow the existing code style, write tests for new features, update documentation as needed, and respect the code of conduct.

---

## License

This project is licensed under the MIT License, allowing free use, modification, and distribution with attribution.

---

## Support

For technical issues, please open a GitHub issue with detailed reproduction steps. For security vulnerabilities, email security@hercircle.org directly. For general questions and community support, join our Discord server.

---

## Acknowledgments

HerCircle Shield was built with support from women's rights organizations across Africa, GBV survivors who shared their experiences, open-source contributors who provided code and feedback, and platform partners who enabled takedown integrations.

This project is dedicated to all women fighting against online gender-based violence. Your safety and dignity matter.

---

**Made with 💗 for African women**

*Version 1.0.0*
