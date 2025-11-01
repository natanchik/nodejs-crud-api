# CRUD API

A simple RESTful CRUD API built with Node.js and TypeScript for managing user records.

## Prerequisites

- Node.js (v24.11.0 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/natanchik/nodejs-crud-api.git
cd nodejs-crud-api
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

The application can be run in two modes:

### Development Mode

```bash
npm run start:dev
```

This will start the server in development mode with hot reloading.

### Production Mode

```bash
npm run start:prod
```

This will build the application and start it in production mode.

## Available Scripts

- `npm run build` - Build the application for production
- `npm run start:dev` - Start the application in development mode
- `npm run start:prod` - Build and start the application in production mode
- `npm run lint` - Run ESLint to check and fix code style
- `npm run format` - Format code using Prettier
- `npm test` - Run the test suite
- `npm run typecheck` - Check TypeScript types

## API Endpoints

### Get All Users

- **GET** `/api/users`
- Returns an array of all users
- Response: 200 OK

### Get User by ID

- **GET** `/api/users/:id`
- Returns a single user by ID
- Response: 200 OK or 404 Not Found

### Create User

- **POST** `/api/users`
- Creates a new user
- Request Body:

```json
{
    "username": "John Doe",
    "age": 25,
    "hobbies": ["reading", "gaming"]
}
```

- Response: 201 Created

### Update User

- **PUT** `/api/users/:id`
- Updates an existing user
- Request Body:

```json
{
    "username": "Jane Smith",
    "age": 30,
    "hobbies": ["painting", "dancing"]
}
```

- Response: 200 OK or 404 Not Found

### Delete User

- **DELETE** `/api/users/:id`
- Deletes a user
- Response: 204 No Content or 404 Not Found

## Data Model

### User

```typescript
interface User {
    id: string; // UUID v4
    username: string; // User's name
    age: number; // User's age
    hobbies: string[]; // Array of hobbies
}
```

## Error Handling

The API implements the following error responses:

- `400 Bad Request` - Invalid request body or missing required fields
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Testing

The application includes a comprehensive test suite. To run the tests:

```bash
npm test
```

## Development

### Type Checking

To check TypeScript types:

```bash
npm run typecheck
```

### Code Formatting

To format the code:

```bash
npm run format
```

### Linting

To run the linter:

```bash
npm run lint
```
