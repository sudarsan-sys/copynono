🚀 ExamGuard: Beginner's Setup Guide

Welcome to the ExamGuard project!

This system has three different parts that work together:

The Server (Backend): The brain of the operation (Node.js & Databases).

The Web App (Frontend): The dashboard for Admins and Students (React).

The Mobile App: The camera app for Invigilators (React Native / Expo).

Follow these steps in order to get everything running on your computer.

🛠️ Step 1: Prerequisites

Before you start, make sure you have these installed on your computer:

Node.js → Download and install from https://nodejs.org

PostgreSQL → Download and install from https://postgresql.org

Expo Go → Download this app on your physical iPhone or Android phone from the App Store / Google Play

🛢️ Step 2: Start the Backend (Server)

The server needs to be running first so the apps have a database to talk to.

1️⃣ Open your terminal (or VS Code terminal) and go into the server folder:

cd server


2️⃣ Install the necessary packages:

npm install


3️⃣ Sync your database and generate the Prisma client:

npx prisma generate
npx prisma migrate dev


4️⃣ Seed the Database

(This creates test users like Harry Potter and Dr. Snape so you can log in):

npm run test


Note: Based on your package.json, this runs your script.ts / seed.ts file.

5️⃣ Start the server:

npm run dev


✅ If successful, you will see:

🚀 Server running on http://localhost:5000


Leave this terminal window open and running!

💻 Step 3: Start the Web App (Admin & Student Portal)

Now let's start the website.

🔹 Open a New Terminal Window (keep the server one running).

1️⃣ Go into your web app folder:

cd exam-integrity-guard


2️⃣ Install the frontend packages:

npm install


3️⃣ Start the website:

npm run dev


✅ It will give you a local link (usually http://localhost:5173).

Ctrl + Click it to open your browser!

📱 Step 4: Start the Mobile App (Invigilator Portal)

Finally, let's start the mobile app for the invigilators.

🔹 Open a Third Terminal Window.

⚠️ Crucial Step for Mobile

Because your phone is a separate device, it cannot use localhost to find your computer's server.

1️⃣ Find your computer's IP Address

Open Windows Command Prompt

Type:

ipconfig


Look for IPv4 Address

2️⃣ Update the API URL

Open:

invigilator-app/app/index.tsx


Change the API_URL to match your IP. Example:

export const API_URL = '[http://192.168.1.5:5000/api](http://192.168.1.5:5000/api)';


3️⃣ Run the App

Go into the mobile app folder:

cd invigilator-app


Install the mobile packages:

npm install


Start the Expo server:

npx expo start


✅ A giant QR code will appear in your terminal.

Open the Expo Go app on your phone and scan that QR code!

🧪 Step 5: How to Test the System

Now that all three parts are running, here is how you test them using the data we seeded in Step 2:

1️⃣ Log in to the Web App as an Admin

Open your browser to the Web App.

Click "Login as Admin"

Credentials:

ID: admin@college.edu

Password: admin123

2️⃣ Log in to the Mobile App as an Invigilator

Open the Expo app on your phone.

Credentials:

ID: snape@hogwarts.edu or PROF-001

Password: (Type anything)

Go to the "Report Malpractice" tab and upload an image to see the hashing work!

3️⃣ Log in to the Web App as a Student

Open your browser to the Web App.

Click "Login as Student"

Credentials:

ID: STU-001 (This is Harry Potter's ID)

Password: (Type anything)

You will see the cases filed against you!
