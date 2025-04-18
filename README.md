# AI Flashcards - test

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Placeholder: Update if license differs -->
[![Node Version](https://img.shields.io/badge/node-22.14.0-blue.svg)](.nvmrc)

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

## Project Description

AI Flashcards is a web application designed to streamline the creation of educational flashcards. It aims to minimize the time required for flashcard creation and encourage effective learning methods like spaced repetition.

Key features include:

* **AI-Powered Generation:** Generate flashcard suggestions automatically from pasted text using AI.
* **Manual Creation:** Create flashcards manually with front and back content.
* **Flashcard Management:** View, edit, and delete your saved flashcards.
* **Candidate Review:** Review, edit, accept, or reject AI-generated flashcard suggestions.
* **User Accounts:** Register, log in, and manage your account to store your flashcards.
* **Spaced Repetition:** Integration with a spaced repetition algorithm for effective learning sessions (integration details TBD).

This application addresses the common problem of manual flashcard creation being time-consuming and tedious, providing a faster alternative.

## Tech Stack

* **Frontend:**
  * [Astro 5](https://astro.build/)
  * [React 19](https://react.dev/) (for interactive components)
  * [TypeScript 5](https://www.typescriptlang.org/)
  * [Tailwind CSS 4](https://tailwindcss.com/)
  * [Shadcn/ui](https://ui.shadcn.com/) (React component library)
* **Backend:**
  * [Supabase](https://supabase.com/) (PostgreSQL Database, Authentication, BaaS)
* **AI Integration:**
  * [Openrouter.ai](https://openrouter.ai/) (Access to various AI models)
* **Testing:**
  * [Vitest](https://vitest.dev/) (Unit and integration testing)
  * [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (Component testing)
  * [Playwright](https://playwright.dev/) (End-to-end testing)
  * [Axe DevTools](https://www.deque.com/axe/) (Accessibility testing)
  * [Vitest Coverage](https://vitest.dev/guide/coverage.html) (Code coverage measurement using c8/v8)
  * [Istanbul](https://istanbul.js.org/) (Code coverage reporting)
* **Development Tools:**
  * [Node.js](https://nodejs.org/) (v22.14.0 recommended)
  * [ESLint](https://eslint.org/)
  * [Prettier](https://prettier.io/)
* **CI/CD & Hosting:**
  * [GitHub Actions](https://github.com/features/actions)
  * [DigitalOcean](https://www.digitalocean.com/) (via Docker)

## Getting Started Locally

Follow these steps to set up and run the project locally:

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install Node.js:**
    Ensure you have Node.js version `22.14.0` installed. We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm):

    ```bash
    nvm install 22.14.0
    nvm use 22.14.0
    ```

    Or download directly from [nodejs.org](https://nodejs.org/).

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file (if one exists) or by creating it manually. You will need to add your Supabase and Openrouter.ai API keys and potentially other configuration details.

    ```plaintext
    # .env
    PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
    # Add other variables as needed
    ```

    *(Note: Obtain these keys from your Supabase project settings and Openrouter.ai account.)*

5. **Run the development server:**

    ```bash
    npm run dev
    ```

    The application should now be running locally, typically at `http://localhost:3001`.

## Available Scripts

The following scripts are available via npm:

* `npm run dev`: Starts the Astro development server with hot reloading.
* `npm run build`: Builds the application for production.
* `npm run preview`: Starts a local server to preview the production build.
* `npm run astro`: Accesses the Astro CLI for various commands.
* `npm run lint`: Lints the codebase using ESLint.
* `npm run lint:fix`: Lints the codebase and attempts to fix issues automatically.
* `npm run format`: Formats the codebase using Prettier.

## Project Scope

### Included Features (MVP)

* User account system (registration, login, deletion).
* Manual flashcard creation with character limits (Front: 200, Back: 500).
* AI-powered flashcard generation from pasted text.
* Review, editing, acceptance, and rejection of AI-generated candidates.
* Viewing, editing, and deleting saved flashcards.
* Integration with a pre-built spaced repetition algorithm.
* Basic statistics on AI-generated vs. accepted flashcards.

### Out of Scope (MVP)

* Custom/advanced spaced repetition algorithms (like SM-2).
* Importing flashcards/materials from files (PDF, DOCX, CSV, etc.).
* Social features (sharing, commenting, rating).
* Integrations with external platforms (LMS, etc.).
* Dedicated mobile applications (iOS/Android).
* Advanced text formatting in flashcards.
* Tagging or categorization of flashcards.
* Advanced server-side error logging.
* Configurable UI settings.

## Project Status

**Status:** In Development

The project is currently under active development, focusing on implementing the core features defined in the MVP scope.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
