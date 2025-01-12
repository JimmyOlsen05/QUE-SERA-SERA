# University Social Platform

A modern social platform built with React, TypeScript, and Vite, designed for university students to connect and interact.

<<<<<<< HEAD
## Features

- 🔐 User Authentication & Profile Management
- 💬 Real-time Chat & Messaging
- 👥 Group Creation & Management
- 📝 Academic Forum & Discussions
- 🤝 Friend Connections
- 📚 Academic Project Collaboration
- 🎓 Interview Experience Sharing
- 🔔 Real-time Notifications
- 📱 Responsive Design

=======
>>>>>>> 7c1eed6c6724ace97691babec2f226ffcd990be5
## Prerequisites

Before running this application, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

## Installation

1. Unzip the project folder to your desired location
2. Open a terminal/command prompt
<<<<<<< HEAD
3. Navigate to the project directory:
=======
3. Navigate to the 'project' directory:
>>>>>>> 7c1eed6c6724ace97691babec2f226ffcd990be5
   ```bash
   cd project
   ```
4. Install the dependencies:
   ```bash
   npm install
   ```

<<<<<<< HEAD
## Environment Setup

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
```

## Database Setup (Important)

This application uses Supabase as its backend database. To set up the database:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Set up the following tables in your Supabase database:

### Tables Structure

#### Profile
- id (uuid, primary key)
- username (text, unique)
- full_name (text)
- avatar_url (text, nullable)
- university (text)
- field_of_study (text, nullable)
- sub_field (text, nullable)
- year_of_enroll (integer, nullable)
- year_of_completion (integer, nullable)
- interests (array, nullable)
- nationality (text, nullable)
- bio (text, nullable)
- created_at (timestamp with time zone)

#### Forum
- id (uuid, primary key)
- user_id (uuid, foreign key)
- title (text)
- content (text)
- category (text)
- attachment_url (text, nullable)
- created_at (timestamp with time zone)

#### Comments
- id (uuid, primary key)
- post_id (uuid, foreign key)
- user_id (uuid, foreign key)
- content (text)
- created_at (timestamp)
- updated_at (timestamp)

#### Groups
- id (uuid, primary key)
- name (text)
- description (text, nullable)
- image_url (text, nullable)
- created_by (uuid, foreign key)
- created_at (timestamp)

#### Messages
- id (uuid, primary key)
- sender_id (uuid, foreign key)
- receiver_id (uuid, foreign key)
- content (text)
- image_url (text, nullable)
- read (boolean)
- created_at (timestamp)

=======
>>>>>>> 7c1eed6c6724ace97691babec2f226ffcd990be5
## Running the Application

1. To start the development server:
   ```bash
   npm run dev
   ```
2. Open your web browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Build for Production

<<<<<<< HEAD
=======
If you want to build the application for production:

>>>>>>> 7c1eed6c6724ace97691babec2f226ffcd990be5
1. Run the build command:
   ```bash
   npm run build
   ```
2. To preview the production build:
   ```bash
   npm run preview
   ```

<<<<<<< HEAD
## Project Structure

```
project/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Application pages/routes
│   ├── store/         # State management (Zustand)
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── lib/           # Third-party library configurations
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase
- **State Management:** Zustand
- **Routing:** React Router DOM v6
- **Email Service:** EmailJS
- **UI Components:** Custom components with Lucide icons
- **Date Handling:** date-fns
- **Notifications:** react-hot-toast
=======
## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router DOM
- Zustand (State Management)
- Other utilities: date-fns, clsx, react-hot-toast

## Database Setup (Important)

This application uses Supabase as its backend database. To set up the database:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Set up the following tables in your Supabase database:
   - Users
   - Messages
   - Groups
   - Posts
   - Comments
   - Likes
   - Group_members

4. After creating your project, get your project credentials from:
   - Project Settings -> API
   - Copy the `Project URL` and `anon public` key

5. Create a `.env` file in the project root and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Note: For security reasons, never commit the `.env` file to version control.

## Environment Setup

The application requires a `.env` file in the project root with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Contact the project administrator for the correct environment variables.
>>>>>>> 7c1eed6c6724ace97691babec2f226ffcd990be5

## Troubleshooting

If you encounter any issues:

1. Make sure all prerequisites are installed correctly
2. Verify that you're using the correct Node.js version
3. Try deleting the `node_modules` folder and `package-lock.json`, then run `npm install` again
4. Check if all environment variables are set correctly
<<<<<<< HEAD
5. Ensure your Supabase database tables are set up with the correct schema
6. Check if your EmailJS configuration is correct for the contact form
=======
>>>>>>> 7c1eed6c6724ace97691babec2f226ffcd990be5

## Support

For any additional questions or support, please contact the project maintainers.
