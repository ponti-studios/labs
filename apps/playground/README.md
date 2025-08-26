# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- �️ TFL Traffic Cameras with Google Maps integration
- �📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

### Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

For the TFL Traffic Cameras feature, you'll need a Google Maps API key and a PostgreSQL database:

**Google Maps Setup:**
- Get an API key from the [Google Cloud Console](https://console.cloud.google.com/)
- Enable the Maps JavaScript API
- Add your key to `.env` as `VITE_GOOGLE_API_KEY`

**Database Setup:**
- Install PostgreSQL locally or use a cloud provider
- Create a database for the project
- Add your database URL to `.env` as `DATABASE_URL`
- Run database migrations: `pnpm db:migrate`
- Populate TFL camera data: `pnpm db:populate-tfl`

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
