# Performance Management HR System

A full-stack HR performance management application built with Next.js, integrating Anthropic's Claude API for AI-assisted evaluations and Google Sheets for data persistence.

## Features

- Manager Dashboard: Submit monthly performance reviews (Output, Attendance, Teamwork).
- AI Feedback Improvement: Automatically rewrite manager comments to be professional and actionable.
- Low Score Action Plans: Generate an immediate growth plan if an employee scores 2 or below.
- HR Assistant Chat: Ask natural language questions about existing reviews and employees.
- Employee View: See historical performance and receive an AI-generated 3-month trend summary.

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- AI Integration: Anthropic API (Claude 3 Haiku)
- Database: Google Sheets API

## Environment Variables

Create a `.env.local` file in the root directory with the following keys:

CLAUDE_API_KEY="your-anthropic-api-key"
CLAUDE_MODEL="claude-3-haiku-20240307"

GOOGLE_SPREADSHEET_ID="your-google-spreadsheet-id"
GOOGLE_SHEET_NAME="Sheet1"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

## Installation

1. Clone the repository and install dependencies:
   npm install

2. Run the development server:
   npm run dev

3. Open http://localhost:3000 in your browser.

## Application Structure

- /src/app/manager: Manager dashboard, review form, and HR chat.
- /src/app/employee: Employee view and trend summaries.
- /src/app/api/ai/*: Claude API routes for text improvement, action plans, and HR queries.
- /src/lib/claude.ts: Core AI prompting and Anthropic SDK wrapper.
- /src/lib/google-sheets.ts: Data persistence and retrieval logic.
