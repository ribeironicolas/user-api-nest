# README - Store API using NestJS

## Introduction

This project is an API for an online store developed using the NestJS framework. It provides basic CRUD (Create, Read, Update, Delete).

## Technologies Used

- **NestJS**: A TypeScript framework for building server-side applications.
- **TypeORM**: ORM (Object-Relational Mapping) to work with SQL databases.
- **JWT (JSON Web Tokens)**: For user authentication and authorization.

## Project Setup

1. **Install Dependencies**:
   ```
   npm install
   ```

2. **Database Configuration**:
   - Make sure you have a database set up.
   - Rename the '.env-example' to '.env' and fill in the secrets.

3. **Run the Project**:
   ```
   npm run start
   ```

## Routes
### Users

- `POST /users`: Create a new user.
- `GET /users`: Get a list of all users.
- `GET /users/:id`: Get details of a specific user.
- `PATCH /users/:id`: Partially update details of a user.
- `PUT /users/:id`: Update details of a user.
- `DELETE /users/:id`: Delete a user.

### Authentication

- `POST /auth/login`: Login with email and password.
- `POST /auth/register`: Register a new user.
- `POST /auth/forget`: Request password reset for a registered user.
- `POST /auth/reset`: Reset password using token received via email.
- `POST /auth/me`: Get current user details.
- `POST /auth/photo`: Upload a photo for the current user.
- `POST /auth/files`: Upload multiple files.
- `POST /auth/files-fields`: Upload files with both photo and documents fields.