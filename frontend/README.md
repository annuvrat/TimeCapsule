# Time Capsule App

A modern web application that allows users to create digital time capsules - messages that can only be accessed after a specified date. Share your thoughts, memories, and messages with friends and loved ones in a unique way.
 
## Features

- User authentication (login/register)
- Create time capsules with custom unlock dates
- Share capsules with multiple recipients
- View all your created capsules
- Automatic unlocking of capsules when their time comes
- Modern, responsive UI built with Material-UI

## Tech Stack

- React 18
- Material-UI v5
- React Router v6
- Axios for API communication
- React-Toastify for notifications
- Date-fns for date manipulation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=your_api_url_here
```

## API Documentation

The API documentation can be found in the `context.md` file. The API provides endpoints for:
- User authentication
- Time capsule management
- Recipient management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
