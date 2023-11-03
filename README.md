# Chat App Backend

Welcome to the Chat App Backend repository! This backend application is developed using Node.js, Express, Sequelize, and Socket.io. It enables real-time communication through One-to-One chat, group chat, and channel chat functionalities. Below, you'll find essential information on setting up, running, and understanding the features of this application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js: [Download and Install Node.js](https://nodejs.org/en/download)
- Express: `npm i express`
- MySQL: `npm i mysql2`
- Sequelize: `npm install sequelize`
- Socket.io: `npm install socket.io`

## Other Dependencies

```json
{
  "nodemon": "^3.0.1",
  "dotenv": "^16.3.1",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "bcrypt": "^5.1.1",
  "helmet": "^7.0.0",
  "joi": "^17.9.2",
  "jsonwebtoken": "^9.0.1",
  "jwt-decode": "^3.1.2",
  "nanoid": "^5.0.2",
  "node-fetch": "^3.3.2",
  "morgan": "^1.10.0",
  "winston": "^3.10.0",
  "eslint": "^8.52.0"
}
```

## Environment File

You will also need to create a `.env` file in the root directory of this project with the necessary environment variables for connecting to your database.

`IP`= user pc Ip which is used for running on different machine locally.
`PORT`= Port to run express in this project `3002` port is used.
`MORGAN`= `dev` use this.

`DB_NAME`= your Database name.
`DB_USER`= your Database user. Default user is `root`.
`DB_HOST`= your Database host. Default host is `localhost`.
`DB_PASS`= your Database password. Default password is `null`.
`DB_DIALECT`= your Database dialect. In this project we are using `mysql`.

`JWT_SECRET`= Set your JWT secret.

## Getting Started

1. Clone this repository to your local machine.
2. Navigate to the project directory using the command line.
3. Run `npm install` or `npm i` to install the project dependencies.

## Database Configuration

1. Create a MySQL database for the application.
2. Configure the database connection in the `src/config/dbconfig.js` file.

```js
{
  development: {
    username: your_username,
    password: your_password,
    database: your_database_name,
    host: localhost,
    dialect: mysql
  }
}
```

## Running the Application

Run `npm run dev` to start the server.
The server will be running at `http://localhost:3002`.

## Features

### One-to-One Chat

- Users can send and receive messages privately to/from another user.
- Real-time updates ensure instant message delivery.

### Group Chat

- Users can create and join different groups.
- Group members can exchange messages within the group.
- Real-time updates enable seamless group communication.
- Join and leave the groups in Real-time.
- Join group with invite link and manual invite.

### Channel Chat

- Users can join specific channels based on topics or interests.
- Channels provide a platform for broader discussions.
- Real-time updates facilitate dynamic channel conversations.

## API Endpoints

### Auth Endpoints

- $${\color{orange}POST}$$ /api/user/signup: Register a new user.
- $${\color{orange}POST}$$ /api/user/login: User login with authentication token generation.
- $${\color{orange}POST}$$ /api/user/setAvatar: set user profile avatar.
- $${\color{green}GET}$$ /api/user/users: Fetch all registered users.
- $${\color{green}GET}$$ /api/user/validate: Validating the access token.

### Chat Endpoints

- $${\color{green}GET}$$ /api/chat/dashboard: Fetch all conversations of user.
- $${\color{green}GET}$$ /api/chat/fetchChat/:id: Fetch specific conversation of user.
- $${\color{green}GET}$$ /api/chat/unreadChat/:id: Fetch unread messages.
- $${\color{orange}POST}$$ /api/chat/createGroup: Create group conversation.
- $${\color{orange}POST}$$ /api/chat/joinGroup/:code: Join group with inviteLink.
- $${\color{orange}POST}$$ /api/chat/joinGroup: Join group by admin.
- $${\color{green}GET}$$ /api/chat/fetchInviteLink/:id: Fetch group invite link.
- $${\color{green}GET}$$ /api/chat/getGroups: Fetch all groups related to specific user.
- $${\color{green}GET}&& /api/chat/fetchGroupChat/:id: Fetch specific group chat.
- $${\color{purple}PATCH}$$ /api/chat/updateAdmin: Update group admin role.
- $${\color{purple}PATCH}$$ /api/chat/leaveGroup: Leave group conversation.
- $${\color{orange}POST}$$ /api/chat/createChannel: Create channel conversation.
- $${\color{orange}POST}$$ /api/chat/joinChannel: Join channel conversation.
- $${\color{green}GET}$$ /api/chat/getChannels: Fetch all channels.

## Socket.io Events

- 'online': Update user status to online.
- 'joinConversation': Triggered when user in specific conversation chat.
- 'message': Triggered when user sends message to another user.
- 'messageDelivered': Message status updated to delivered when user comes online.
- 'messageSeen': Message status updated to seen when user comes in specific conversation.
- 'groupMessage': Triggered when user message in a specific group.
- 'channelMessage': Triggered when user message in a specific channel.
- 'disconnect': Triggered when user goes offline and updated status to offline.

Feel free to explore the codebase and customize the application further to meet your specific requirements. If you have any questions or need assistance, please don't hesitate to reach out.

Happy coding! 👨🏻‍💻
