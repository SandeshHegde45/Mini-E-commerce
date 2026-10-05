# Mini E-commerce

A small full-stack marketplace application. The repository contains a React storefront and a separate Express API backed by MongoDB.

## Features

### Frontend

- React 19 single-page application built with Vite.
- Responsive product catalogue with pagination, on-page search, product details, and light/dark theme.
- Registration and login screens, protected shopper pages, and a seller dashboard.
- Shopping cart with quantity changes, item removal, and checkout.
- Seller product create, edit, publish/unpublish, and delete actions, including image preview and upload.
- Redux Toolkit / RTK Query for application and API state, React Hook Form for forms, and Tailwind CSS for styling.

### Backend

- Express API with MongoDB persistence through Mongoose.
- Registration, login, logout, current-user, and refresh-token endpoints.
- Short-lived access tokens and rotating refresh tokens stored in an HTTP-only cookie.
- Public, published-product catalogue with pagination.
- Seller-only product management, including ImageKit image uploads.
- Per-user cart management and stock validation during cart updates and checkout.
- CORS configured for credentialed requests from the frontend origin(s).

## Application layout

```text
.
├── Mini_E-comm_Frontend/  # React/Vite application
│   └── src/
│       ├── api/           # RTK Query API endpoints
│       ├── components/
│       ├── features/      # Redux slices and theme provider
│       └── pages/
└── Mini_E-comm_Backend/   # Express/MongoDB API
    └── src/
        ├── app/
        ├── config/
        ├── controllers/
        ├── models/
        ├── routes/
        └── services/
```

## Prerequisites

- Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+ recommended) and npm.
- A running MongoDB instance or a MongoDB Atlas connection string.
- An ImageKit account and private key to create or replace product images.

## Local setup

### 1. Configure the backend

In a terminal, install the backend dependencies:

```sh
cd Mini_E-comm_Backend
npm install
```

Create `Mini_E-comm_Backend/.env` with the following variables:

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/mini-e-commerce
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
FRONTEND_URL=http://localhost:5173
```

Use the URI supplied by your MongoDB provider if you are using Atlas. Keep both token secrets and the ImageKit private key private; do not commit `.env` files. `FRONTEND_URL` accepts a comma-separated list of allowed frontend origins. In development it defaults to `http://localhost:5173` when unset; configure it explicitly for deployed frontends.

Start the API:

```sh
npm run dev
```

The API listens on `http://localhost:3000` by default. Visit that URL to check that the server is online. The server connects to MongoDB during startup, so it must be reachable before the API can start successfully.

### 2. Configure the frontend

Open a second terminal from the repository root:

```sh
cd Mini_E-comm_Frontend
npm install
```

Create `Mini_E-comm_Frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Start the Vite development server:

```sh
npm run dev
```

Open `http://localhost:5173`. The backend allows the local Vite origin by default in development. If you change either port or host, update `VITE_API_URL` and the backend's `FRONTEND_URL` to match. Restart the relevant server after changing environment variables.

## Scripts

Run these from the corresponding application directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `Mini_E-comm_Frontend` | `npm run dev` | Start the Vite development server |
| `Mini_E-comm_Frontend` | `npm run build` | Create the production frontend bundle in `dist/` |
| `Mini_E-comm_Frontend` | `npm run preview` | Preview the production bundle locally |
| `Mini_E-comm_Frontend` | `npm run lint` | Run ESLint |
| `Mini_E-comm_Backend` | `npm run dev` | Start the API with nodemon |
| `Mini_E-comm_Backend` | `npm start` | Start the API with Node.js |

There is currently no backend test suite configured.

## Frontend routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Signed-in user | Product catalogue |
| `/products/:id` | Public | Published product details |
| `/login`, `/register` | Signed-out visitor | Authentication |
| `/cart`, `/checkout`, `/order-success` | Signed-in user | Cart and checkout flow |
| `/seller` | Seller | Manage products created from this browser |

On application startup, the frontend attempts to restore the session using the refresh-token cookie. The access token is held in Redux memory; a page reload attempts to obtain a new one from the backend.

## Backend API

All routes are prefixed with `/api`. Authenticated routes require an `Authorization: Bearer <access-token>` header; cart and account routes require a shopper login, and product write routes require a seller login. Product image uploads use `multipart/form-data` with the field name `image`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create an account |
| `POST` | `/auth/login` | Public | Sign in |
| `POST` | `/auth/refresh-token` | Refresh cookie | Rotate tokens and return a new access token |
| `GET` | `/auth/me` | Authenticated | Return the current user |
| `POST` | `/auth/logout` | Authenticated | Revoke the refresh token and clear its cookie |
| `GET` | `/products?page=1&limit=12` | Public | List published products (API limit is capped at 100) |
| `GET` | `/products/:id` | Public | Get a published product |
| `POST` | `/products` | Seller | Create a product |
| `PUT` | `/products/:id` | Owning seller | Update a product |
| `DELETE` | `/products/:id` | Owning seller | Delete a product |
| `GET` | `/cart` | Authenticated | Get the current user's cart |
| `POST` | `/cart` | Authenticated | Add a product (`productId`, `quantity`) |
| `PATCH` | `/cart` | Authenticated | Set an item's quantity (`productId`, `quantity`) |
| `DELETE` | `/cart/:productId` | Authenticated | Remove one item |
| `DELETE` | `/cart` | Authenticated | Empty the cart |
| `POST` | `/cart/checkout` | Authenticated | Check stock, decrement it, and empty the cart |

To create a seller account, send `"role": "seller"` with the registration request; the frontend registration form creates shopper accounts only.

## Configuration reference

### Backend (`Mini_E-comm_Backend/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | API listening port; defaults to `3000` |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Secret used to sign 15-minute access tokens |
| `REFRESH_TOKEN_SECRET` | Secret used to sign 7-day refresh tokens |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit server-side credential used for product uploads |
| `FRONTEND_URL` | Allowed frontend origin(s), comma-separated; defaults to `http://localhost:5173` outside production |
| `NODE_ENV` | Set to `production` when deploying; enables secure, cross-site refresh cookies |

### Frontend (`Mini_E-comm_Frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, including `/api`; defaults to `http://localhost:3000/api` |

Vite exposes `VITE_*` values in the built client bundle. Do not put private keys or other secrets in frontend environment variables.

## Assumptions and current limitations

- Product prices support `INR` and `USD`. Cart totals are calculated by adding the listed numeric amounts; the application does not convert currencies.
- Creating a product requires one image. The backend accepts images up to 1 MB and uploads them to ImageKit. ImageKit credentials are needed for seller image uploads.
- Sellers can manage only products they own. Public catalogue responses include published products only.
- The seller dashboard list is cached in that browser's `localStorage`; it is not a server-provided listing of all of the seller's products. Clearing browser storage removes that local list.
- Checkout is a stock-and-cart demonstration, not a payment integration. It decrements stock and clears the cart, but does not create a persistent order, payment, shipping, or tracking record. The confirmation page's order details are frontend navigation state, not a saved order.
- Registration requires a name, email, password of at least six characters, and matching confirmation. Shopper accounts are the default; seller accounts must be requested through the API.
- In production, deploy the frontend and backend separately as needed, set `VITE_API_URL` to the deployed API base URL, set `FRONTEND_URL` to the deployed frontend origin(s), and use HTTPS so refresh cookies can be sent securely.
