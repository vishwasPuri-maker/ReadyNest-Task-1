This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Dynamic Form Builder

A full-stack Dynamic Form Builder application where authenticated users can create, manage, publish, and share custom forms. Other users can fill out these forms without logging in, and form owners can view all submitted responses through a dashboard.

Project Overview

This project allows users to:

Create an account and log in
Build forms dynamically
Add multiple field types
Publish forms
Share form links
Collect responses
View submitted responses
Manage created forms
Tech Stack
Frontend
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Backend
Next.js API Routes
Database
PostgreSQL (Neon)
ORM
Prisma
Authentication
JWT Authentication
Deployment
Frontend: Vercel
Database: Neon PostgreSQL
User Flow
Step 1: Visit Website

When a user visits the application, they land on the Home Page.

Available actions:

Login
Sign Up
Learn About Features
Step 2: Sign Up

New users create an account.

Required fields:

Name
Email
Password

After successful registration:

User account is created
User can log in
Step 3: Login

Existing users log in using:

Email
Password

After successful login:

JWT token is generated
User is redirected to Dashboard
Important Rule

Only authenticated users can create and manage forms.

Unauthenticated users cannot:

Create forms
Edit forms
Delete forms
View dashboard

Only logged-in users can access these features.

Step 4: Dashboard

After login, users enter their personal dashboard.

Dashboard Features:

Create New Form
View Existing Forms
Edit Forms
Delete Forms
View Responses

Each form card contains:

Form Title
Total Responses
Edit Button
Delete Button
Responses Button
Step 5: Create New Form

User clicks:

Create Form

A new form builder page opens.

User enters:

Form Title
Form Description

Example:

Title: Student Registration Form

Description: Fill out your registration details.

Step 6: Dynamic Form Builder

The user builds a form dynamically by adding fields.

Supported Field Types:

Text Field

Example:

Name

[____________]

Email Field

Example:

Email

[____________]

Number Field

Example:

Age

[____________]

Dropdown Field

Example:

Branch

▼ CSE
▼ IT
▼ ECE

User can add custom options.

Checkbox Field

Example:

Skills

☑ Java

☑ C++

☑ Python

Multiple selections allowed.

Radio Field

Example:

Gender

○ Male

○ Female

Only one option can be selected.

Date Field

Example:

Date of Birth

[ Select Date ]

Textarea Field

Example:

Feedback

Field Configuration

Each field contains:

Label
Type
Required Status

Example:

Label: Name

Type: Text

Required: True

Step 7: Save Form

User clicks:

Save Draft

The complete form structure is stored in PostgreSQL.

Form remains private.

Step 8: Publish Form

User clicks:

Publish

The system generates a public form URL.

Example:

/form/abc123

Anyone with the link can access the form.

Step 9: Share Form

User copies the generated link and shares it.

Example:

https://domain.com/form/abc123

The receiver does not need an account.

Step 10: Public Form Submission

Anyone visiting the form link can:

Fill the form
Submit responses

No login required.

Example Submission:

Name: Vishwas

Email: abc@gmail.com

Branch: CSE

Step 11: Store Responses

After submission:

Response is validated
Data is saved in PostgreSQL
Submission timestamp is stored
Step 12: View Responses

Form owner opens:

Dashboard → Responses

All submissions are displayed.

Example:

Name	Email	Branch
Vishwas	abc@gmail.com	CSE
Rahul	xyz@gmail.com	IT
Step 13: Manage Forms

Users can:

Edit Form

Modify:

Title
Description
Fields
Delete Form

Remove a form permanently.

View Form

Preview published form.

Database Models
User

Stores account information.

Fields:

id
name
email
password
Form

Stores form information.

Fields:

id
title
description
published
userId
createdAt
Field

Stores dynamic form fields.

Fields:

id
label
type
required
options
formId
Response

Stores form submissions.

Fields:

id
formId
answers
createdAt
Application Routes

Home Page

/

Login

/login

Signup

/signup

Dashboard

/dashboard

Create Form

/forms/new

Edit Form

/forms/[id]/edit

Responses

/forms/[id]/responses

Public Form

/form/[id]