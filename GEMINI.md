# GEMINI.md

## Project Overview

This is a web application built with React and Vite. It serves as an AI-powered product recommendation system. The user can describe a product they are looking for, and the application will return a list of matching products. The UI is styled with Tailwind CSS and includes animations and interactive elements. The project uses `lucide-react` for icons.

The main application logic is contained in the `src/ProductRecommendationApp.jsx` file. This component manages the state for the search prompt, loading status, and results. It also includes a simple hash-based routing to switch between the main page and an "About" page.

## Building and Running

You can use `npm` to manage dependencies and run the project.

### Available Scripts

*   **`npm run dev`**: Starts the development server with hot module replacement.
*   **`npm run build`**: Builds the application for production.
*   **`npm run lint`**: Lints the codebase using ESLint.
*   **`npm run preview`**: Serves the production build locally for preview.

### Running the project

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```

## Development Conventions

*   The project uses [ESLint](https://eslint.org/) for code linting. The configuration can be found in `eslint.config.js`.
*   Styling is done using [Tailwind CSS](https://tailwindcss.com/). The configuration is in `tailwind.config.js`.
*   The project follows standard React best practices.
