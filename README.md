# Clipa AI - Viral Podcast Clip Generator

<div align="center">
  <img src="/clipa-ai-logo.png" alt="Clipa AI Logo" width="200" height="200" style="animation: float 3s ease-in-out infinite;">
</div>

<div align="center">
  <h3 style="animation: pulse 2s ease-in-out infinite;">🎬 Transform Podcasts into Viral Clips 🎬</h3>
</div>

<br>

Transform your podcast episodes into viral social media clips using AI-powered video processing. Upload your podcast, and our system automatically generates engaging short-form video clips perfect for TikTok, Instagram Reels, and YouTube Shorts.

<style>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>

## 🚀 Features

- **🎬 AI-Powered Clip Generation**: Automatically identifies the most engaging moments from your podcast
- **☁️ Cloud Storage**: Secure file uploads to AWS S3 with pre-signed URLs
- **💳 Credit-Based System**: Purchase credits and use them to generate clips
- **📊 Real-Time Processing**: Track your video processing status in real-time
- **🎯 Modern UI**: Built with Next.js 16, Tailwind CSS, and Shadcn UI
- **🔐 Secure Authentication**: User management with better-auth
- **💰 Payment Integration**: Polar payment processing for credit purchases
- **⚡ Background Processing**: Inngest-powered asynchronous video processing
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ System Architecture

```mermaid
graph TB
    A[User] --> B[Next.js Frontend]
    B --> C[Better Auth]
    B --> D[AWS S3 Storage]
    B --> E[PostgreSQL Database]
    B --> F[Polar Payments]
    B --> G[Inngest Background Jobs]
    
    G --> H[Video Processing Service]
    H --> D
    
    F --> I[Credit System]
    I --> E
    
    subgraph "Infrastructure"
        E
        D
        G
        F
    end
    
    subgraph "Application Layer"
        B
        C
    end
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Authentication**: Better Auth

### Backend & Infrastructure
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3
- **Background Jobs**: Inngest
- **Payments**: Polar
- **Deployment**: Vercel

### Development Tools
- **TypeScript**: Type-safe development
- **ESLint**: Code linting
- **Prisma**: Database ORM and migrations
- **AWS SDK**: S3 integration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket
- Polar account (for payments)
- Inngest account (for background jobs)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/viral-podcast-clip.git
   cd viral-podcast-clip/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables (see Environment Variables section)
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key-here"

# Polar Integration
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_SERVER="sandbox" # or "production"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
S3_BUCKET_NAME="your-s3-bucket-name"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and credit management
- **UploadedFiles**: Track uploaded podcast videos
- **Clips**: Generated viral clips linked to uploaded files

```mermaid
erDiagram
    User ||--o{ UploadedFile : uploads
    User ||--o{ Clip : owns
    UploadedFile ||--o{ Clip : generates
    
    User {
        string id PK
        string name
        string email
        string image
        int credits
        datetime createdAt
        datetime updatedAt
    }
    
    UploadedFile {
        string id PK
        string userId FK
        string s3Key
        string displayName
        string status
        int clipCount
        datetime createdAt
        datetime updatedAt
    }
    
    Clip {
        string id PK
        string userId FK
        string uploadedFileId FK
        string s3Key
        datetime createdAt
        datetime updatedAt
    }
```

## 🔄 Workflow Process

1. **User Upload**: User uploads a podcast video through the dashboard
2. **File Storage**: Video is stored in AWS S3 using pre-signed URLs
3. **Processing Trigger**: Background job is triggered to process the video
4. **AI Analysis**: External service analyzes the video and identifies viral moments
5. **Clip Generation**: Multiple short clips are generated and stored in S3
6. **Database Update**: Clips are registered in the database with metadata
7. **Credit Deduction**: Credits are deducted from user's account
8. **User Notification**: User can view and download generated clips

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── pricing/           # Pricing page
│   └── sign-in/           # Authentication pages
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── webcomponents/    # Custom components
├── lib/                   # Utility libraries
├── actions/              # Server actions
├── inngest/              # Background job functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🎯 Core Features in Detail

### Credit System
- Users start with 10 free credits
- Credits are consumed when generating clips
- Additional credits can be purchased via Polar payments
- Credit balance is displayed in the dashboard

### File Upload System
- Supports MP4 files up to 500MB
- Files are organized in S3 using UUID-based directories
- Real-time upload progress tracking
- Automatic file validation

### Video Processing Pipeline
- Asynchronous processing using Inngest
- Status tracking: queued → processing → processed/failed
- Automatic clip discovery and registration
- Error handling and retry mechanisms

### Payment Integration
- Polar payment processing for credit purchases
- Three pricing tiers: Small (50 credits), Medium (150 credits), Large (500 credits)
- Customer portal for subscription management
- Webhook-based credit granting

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your application

The project includes a `vercel.json` configuration file for optimal deployment settings.

### Environment Variables for Production

Make sure to set all the environment variables listed above in your Vercel dashboard. Key differences for production:

- `BETTER_AUTH_URL`: Set to your Vercel app URL
- `NEXT_PUBLIC_APP_URL`: Set to your Vercel app URL
- `POLAR_SERVER`: Set to `"production"`

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📈 Monitoring & Analytics

- **Inngest Dashboard**: Monitor background job execution
- **Vercel Analytics**: Track performance and usage
- **Database Monitoring**: Use Prisma Studio for database management
- **AWS CloudWatch**: Monitor S3 operations

## 🔒 Security Considerations

- All file uploads use pre-signed S3 URLs
- User authentication via better-auth
- Environment variables for sensitive data
- CORS configuration for API endpoints
- Input validation and sanitization

## 🤝 Contributing

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/viral-podcast-clip/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Better Auth](https://better-auth.com/) - Authentication solution
- [Polar](https://polar.sh/) - Payment processing
- [Inngest](https://inngest.com/) - Background job processing
- [Prisma](https://prisma.io/) - Database ORM
- [AWS](https://aws.amazon.com/) - Cloud infrastructure

---

Built with ❤️ by the Clipa AI team
