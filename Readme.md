# Professional Video Hosting Platform Backend

A robust, production-ready backend for a video-sharing platform (similar to YouTube) built with Node.js, Express, and MongoDB. This project features user authentication, media management with Cloudinary, and advanced data modeling.

## 🚀 Features

-   **User Authentication & Authorization**: Secure registration and login with JWT (Access & Refresh Tokens) and Bcrypt hashing.
-   **Profile Management**: Update user details, avatars, and cover images.
-   **Media Handling**: Integration with Cloudinary for secure and optimized image/video storage.
-   **Advanced Data Modeling**: Comprehensive schemas for Users, Videos, Comments, Likes, Playlists, Tweets, and Subscriptions.
-   **Middleware-driven Architecture**: Includes authentication guards, file upload management (Multer), and error handling.
-   **RESTful API Design**: Clean and structured API endpoints for frontend integration.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB (Mongoose ODM)
-   **Authentication**: JSON Web Tokens (JWT)
-   **File Management**: Cloudinary, Multer
-   **Security**: Bcrypt
-   **Frontend (Stub)**: React, Vite (located in `/client`)

## 📂 Project Structure

```text
├── src/
│   ├── controllers/    # Business logic for routes
│   ├── db/             # Database connection setup
│   ├── middlewares/    # Custom express middlewares (auth, upload)
│   ├── models/         # Mongoose schemas (User, Video, etc.)
│   ├── routes/         # Express route definitions
│   ├── utils/          # Helper classes and functions (APIError, Cloudinary)
│   ├── app.js          # Express app configuration
│   └── index.js        # Entry point for the server
├── client/             # Frontend React application
└── public/             # Static files and temp storage
```

## ⚙️ Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB account/local instance
-   Cloudinary account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Amaan0907/Backend_Project.git
    cd Backend_Project
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFERESH_TOKEN_SECRET=your_refresh_token_secret
    REFERESH_TOKEN_EXPIRY=10d
    CLOUDINARY_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

### Running the Project

-   **Run Backend (Development)**:
    ```bash
    npm run dev
    ```
-   **Run Frontend**:
    ```bash
    npm run client:dev
    ```

## 📡 API Endpoints (User)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/users/register` | Register a new user | No |
| POST | `/api/v1/users/login` | User login | No |
| POST | `/api/v1/users/logout` | User logout | Yes |
| POST | `/api/v1/users/refresh-token` | Refresh access token | No |
| GET | `/api/v1/users/current-user` | Get logged-in user details | Yes |
| PATCH | `/api/v1/users/update-avatar` | Update user avatar | Yes |
| PATCH | `/api/v1/users/update-coverImage` | Update user cover image | Yes |
| POST | `/api/v1/users/update-account-details`| Update name/email | Yes |
| POST | `/api/v1/users/update-password` | Change user password | Yes |
| GET | `/api/v1/users/watch-history` | Get user's watch history | Yes |
| GET | `/api/v1/users/channel/:username` | Get a user's channel profile| Yes |

## 🚧 Roadmap

- [ ] Implement Video management routes (Upload, Delete, Update)
- [ ] Add Likes and Comments functionality
- [ ] Build Playlist management
- [ ] Implement Subscription model logic
- [ ] Full Frontend integration with React

## 📄 License

This project is licensed under the ISC License.
