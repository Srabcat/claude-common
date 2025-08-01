# LoopBack 3 Legacy Platform Instructions

Development guidance for the legacy 10x10 recruitment platform (LoopBack 3 + React).

## System Overview

The 10x10 recruitment platform is a multi-component system consisting of:

1. **Frontend Web Application** (`10by10-web-app-client/`) - React-based client application
2. **Backend API Server** (`10by10-web-app/`) - LoopBack 3 Node.js API server
3. **Machine Learning Service** (`MatchingML/`) - Python Flask service for candidate-job matching
4. **Chrome Extension** (`10x10-chrome-extension/`) - Browser extension for LinkedIn integration
5. **Database Utilities** (`MongoUtils/`) - MongoDB backup and maintenance scripts

Development commands are available in each repository's README.md file.

## Architecture Overview

### Backend API Server (LoopBack 3)
- **Framework**: LoopBack 3 with Node.js 18+
- **Database**: MongoDB via `loopback-connector-mongodb`
- **Authentication**: JWT-based with role-based access control
- **Key Models**: Account, Candidate, Job, Engagement, Employer, Organization
- **External Integrations**: AWS S3, SMTP email, Stripe for payments
- **Background Processing**: Bull queues with Redis for async tasks

#### Key Backend Components
- `/server/models/` - LoopBack model definitions and business logic
- `/common/models/` - Shared model files with validation and methods
- `/server/boot/` - Application startup scripts and initialization
- `/server/tasks/` - Background job definitions (email reminders, ATS sync)
- `/server/queues/` - Queue processing for async operations
- `/common/Helpers/` - Utility libraries and helper functions

### Machine Learning Service (Python Flask)
- **Purpose**: Candidate-job matching algorithms and ML model serving
- **Framework**: Flask with Python 3.7+
- **Models**: Custom ML models for resume parsing and matching scores
- **Integration**: REST API consumed by the frontend matching system
- **Deployment**: Docker-based with AWS Lightsail

### Chrome Extension
- **Purpose**: LinkedIn integration for candidate duplicate checking
- **Technology**: Vanilla JavaScript with Chrome Extension APIs
- **Authentication**: OAuth integration with main 10x10 platform
- **Features**: Profile parsing, duplicate detection, candidate import

## Development Environment Setup

### Prerequisites
- Node.js 18+ (backend and frontend)
- Python 3.7+ (ML service)
- MongoDB 4.4+
- Redis (for queues)
- Docker & Docker Compose (ML service)
- AWS CLI (for deployments)

### Local Development Flow
1. Start MongoDB and Redis locally
2. Start backend API: `cd 10by10-web-app && npm run start:local`
3. Start frontend: `cd 10by10-web-app-client && npm run start:local`
4. (Optional) Start ML service: `cd MatchingML && docker-compose up`

### Environment Variables
Backend requires:
- `MONGO_URL` - MongoDB connection string
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `CRYPTO_SECRET_PHRASE` - Encryption key for sensitive data
- `NODE_ENV` - Environment (local/development/production)

## Key Business Logic

### Candidate-Job Matching System
- **ML Scoring**: Python service provides algorithmic match scores
- **Requirements Matching**: Complex boolean logic for job requirements
- **Ownership Rules**: Recruiter ownership and conflict detection system
- **Permitted Jobs**: Candidates can only be submitted to jobs they have permission for

### Multi-Tenant Architecture
- **Organizations**: Top-level tenant boundary
- **Roles**: Admin, Employer, Recruiter, Coordinator with different permissions
- **Data Isolation**: Account-based data separation with ownership validation

### External Integrations
- **ATS Systems**: Greenhouse integration for job and candidate sync
- **LinkedIn**: Profile parsing and candidate import via Chrome extension
- **Crunchbase**: Company data enrichment and funding information
- **Streak CRM**: Pipeline management integration
- **Email**: Automated reminder and notification system

## Testing and Quality

### Backend Testing
- Jest test framework with focus on model validation and API endpoints
- Integration tests for external service connections
- Database migration scripts in `/server/scripts/`

### Frontend Testing
- Jest + React Testing Library for component testing
- Tests should be co-located with components
- End-to-end testing via manual QA process

## Deployment Architecture

### Multi-Environment Support
- **Production**: AWS Elastic Beanstalk + S3/CloudFront (frontend)
- **Staging**: Separate AWS environments for testing
- **Development**: Dedicated development environments
- **Beta**: Feature preview environment

### Infrastructure
- **Backend**: AWS Elastic Beanstalk with Auto Scaling
- **Frontend**: AWS S3 + CloudFront CDN
- **Database**: MongoDB Atlas or self-managed MongoDB
- **ML Service**: AWS Lightsail containers
- **DNS**: Route53 with automated switching scripts

## Important Conventions

### File Organization
- `.lib.js` files contain pure business logic and utilities
- `.tool.js` files contain specific utility functions
- `.dic.jsx` files contain UI metadata and configuration
- Model files follow LoopBack 3 conventions with `.js` and `.json` pairs

### Code Style
- Backend follows Airbnb ESLint configuration
- Frontend uses Create React App ESLint rules
- Consistent use of async/await for asynchronous operations
- Environment-specific configuration via JSON files and environment variables

### Security Considerations
- Never commit AWS credentials or API keys
- Use environment variables for all sensitive configuration
- Implement proper input validation in LoopBack models
- Role-based access control throughout the application