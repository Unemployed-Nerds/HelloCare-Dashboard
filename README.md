# HelloCare Dashboard

The HelloCare Dashboard is a modern web application designed for healthcare providers and administrators. It serves as the command center for managing patient data, appointments, and viewing medical report analytics.

## Features

- **Analytics Dashboard**: Visual overview of patient statistics, appointment trends, and system usage.
- **Patient Management**: access patient profiles and history.
- **Secure Access**:
    - **Doctor Login**: Personalized views for doctors to manage their schedule and patients.
    - **Admin Controls**: System-wide management capabilities.
- **Report Viewer**: Securely view patient medical records shared via QR codes or direct permissions.
- **Responsive Design**: Optimized for desktop and tablet usage in clinical settings.

## Tech Stack

- **Framework**: React (Vite)
- **Language**: JavaScript/TypeScript
- **Styling**: Tailwind CSS & Lucide React Icons
- **State/Data**: Firebase Integration
- **Charts**: Recharts for data visualization

## Prerequisites

- Node.js (v18 or higher)
- npm or bun

## Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd HelloCare-Dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Build for Production

To build the application for deployment:

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to any static hosting service (Firebase Hosting, Vercel, Netlify).

## Key Components

- **Dashboard**: Main landing view with summary cards and charts.
- **Patients**: Table view of patients with search and filter capabilities.
- **Appointments**: Calendar or list view of upcoming consultations.
- **Sidebar**: Main navigation component using Lucide icons.
