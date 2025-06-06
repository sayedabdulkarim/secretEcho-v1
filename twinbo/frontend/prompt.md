Build a simple authentication flow in React using Redux Toolkit and JWT authentication.

**Features & Requirements:**

**Stack:**

- React (preferably with functional components)
- Redux Toolkit (for state management and async actions)
- React Router v6 (for routing & protected routes)
- Tailwind for Css Framework

**Setup:**

1.  **Install Redux Toolkit & React Redux:**

2.  **Auth Pages:**

    - **Login Page**

      - Form for email and password
      - On submit, dispatch login async action (calls backend API: `/login`)
      - Store JWT in Redux state (in localStorage for persistence)

    - **Register Page**

      - Form for username, email, password
      - On submit, dispatch register async action (calls backend API: `/register`)
      - redirect to login on success

3.  **Protected Route Logic:**

    - USing protectedRoute component , Only render the `HomeScreen` if the user is authenticated (has a valid JWT in state/localStorage)
    - If not authenticated, redirect to `/login`

4.  **Redux Toolkit Implementation:**

    - Update `slices / auth` for handling user state, JWT token, loading, error
    - Implement async thunks (`login`, `register`, and `checkAuth`) for API calls
    - Store user info and token in state

5.  **Screens:**

    - Login/ Register
    - Simple page (e.g., "Welcome, \[username]!")
    - Only accessible when logged in

6.  **Logout Logic:**

    - Add logout button on `HomeScreen`
    - On click, clear JWT/token from Redux (and localStorage), redirect to `/login`

7.  **Bonus:**

    - Show loading indicators and error messages for API calls
    - Use modern React best practices (hooks, functional components)

Only update for Frontend
