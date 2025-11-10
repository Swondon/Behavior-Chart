# Behavior Chart

A collaborative, real-time, digital behavior chart application designed to track and encourage positive behavior in a shared environment. Inspired by the classic classroom clip chart, this application brings the concept to the web, allowing friends, family, or group members to interact with a shared chart from anywhere.

## About The Project

This project began as a digital re-creation of a well-loved physical behavior chart. The original chart was a simple, effective, and fun part of daily life. When it eventually broke, the idea was born to create a durable, shareable, and accessible version that anyone could use.

This application allows users to create their own charts, invite others to join via a unique share code, and collectively manage the "clip" levels of all participants in real-time.

## Key Features

*   **User Authentication:** Secure account creation and login system.
*   **Chart Creation & Management:** Users can create multiple charts, each with a unique name and settings.
*   **Easy Sharing:** Every chart has a unique, easy-to-remember share code for inviting others.
*   **Real-Time Collaboration:** All changes to a chart are instantly reflected for all connected users, powered by Firebase Firestore.
*   **Dynamic Behavior Levels:** A color-coded, multi-level system to visually represent progress.
*   **Clipping Up & Down:** Users can move participants' clips up or down the chart to reward positive behavior or provide reminders.
*   **Configurable Approval System:** Chart owners can configure how "clip" changes are handled:
    *   **No Approval:** Changes are applied instantly.
    *   **Owner Approval:** Only the chart owner can approve or reject clip change requests.
    *   **Any Member Approval:** Any member of the chart can approve or reject requests.
*   **Clip Requests with Justification:** When approval is required, users must provide a reason for their requested clip change.
*   **Owner-Specific Controls:** Chart owners have administrative privileges to edit the chart title, manage user names, and remove participants.

## Technology Stack

*   **Frontend:** React, TypeScript
*   **Routing:** React Router
*   **Database & Auth:** Firebase (Firestore, Authentication)
*   **Styling:** CSS

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js (v14 or later)
*   npm, yarn, or pnpm
*   A Firebase project

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/swondon/behavior-chart.git
    ```

2.  Navigate to the project directory:
    ```sh
    cd behavior-chart
    ```

3.  Install NPM packages:
    ```sh
    npm install
    ```

### Firebase Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Enable **Firestore Database** and **Firebase Authentication** (with the Email/Password sign-in method).
3.  In your project settings, add a new Web App.
4.  Firebase will provide you with a configuration object. Create a file named `src/firebase.ts` and add your configuration to it, like so:

    ```typescript
    // src/firebase.ts
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    export { db, auth };
    ```

5.  In your Firestore security rules, you will need to set up rules to allow authenticated users to read/write data. For development, you can start with open rules, but be sure to secure them for production.

    Example development rules:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```

### Running the Application

Start the development server:

```sh
npm run dev
```

Open the app in your browser.

