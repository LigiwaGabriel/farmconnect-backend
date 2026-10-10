# FarmConnect Backend

FarmConnect Backend is the Node.js, Express, and MariaDB/MySQL API for the FarmConnect agricultural marketplace. Farmers can publish produce listings, buyers can send inquiries and order requests, and admins can manage users, products, orders, and categories.

## Tech Stack

- Node.js and Express.js
- MariaDB/MySQL with `mysql2`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcrypt`
- Image uploads with `multer`
- Environment variables with `dotenv`

## Folder Structure

- `config/db.js`: Creates the MariaDB/MySQL connection pool.
- `controllers/`: Holds request logic for auth, products, orders, inquiries, profiles, admin tools, and categories.
- `middleware/`: Holds JWT authentication, role checks, and image upload setup.
- `routes/`: Defines API endpoint URLs and attaches middleware/controllers.
- `uploads/`: Stores product images uploaded through Multer.
- `database/schema.sql`: Creates all database tables.
- `database/seed.sql`: Adds sample users, profiles, categories, products, orders, and inquiries.
- `server.js`: Starts Express and registers all route groups.

## Prerequisites

- Node.js 18 or newer
- npm
- MariaDB or MySQL

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Edit `.env` with your database credentials and local frontend URL:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=farmconnect
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
```

4. Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

5. Load sample data:

```bash
mysql -u root -p farmconnect < database/seed.sql
```

6. Start the development server:

```bash
npm run dev
```

The backend runs at `http://localhost:5000` by default.

## Environment Variables

- `PORT`: Express server port, default `5000`.
- `DB_HOST`: Database host, usually `localhost`.
- `DB_USER`: Database username.
- `DB_PASSWORD`: Database password.
- `DB_NAME`: Database name, default `farmconnect`.
- `JWT_SECRET`: Secret key used to sign JWTs.
- `JWT_EXPIRES_IN`: Token lifetime, for example `1d`.
- `CLIENT_URL`: Frontend URL allowed by CORS.
- `CLIENT_URLS`: Comma-separated list of additional frontend URLs allowed by CORS.

## Run Commands

```bash
npm run dev
```

For production-style startup:

```bash
npm start
```

## Verify the Backend

Open this URL after starting the server:

```text
http://localhost:5000
```

You should see:

```json
{ "message": "FarmConnect API is running." }
```

## Default Login Accounts

All seeded accounts use the password `password123`.

- Admin: `admin@farmconnect.test`
- Farmer: `farmer1@farmconnect.test`
- Buyer: `buyer1@farmconnect.test`

## Troubleshooting

- If `npm run dev` fails because `nodemon` is missing, rerun `npm install`.
- If database login fails, check `DB_USER`, `DB_PASSWORD`, and `DB_HOST` in `.env`.
- If the database does not exist, rerun `mysql -u root -p < database/schema.sql`.
- If the frontend receives a CORS error, add the exact frontend origin to `CLIENT_URLS`, then restart the backend.

## JWT Authentication

When a user logs in, the API returns a JWT. The frontend stores that token in `localStorage` and sends it in the `Authorization` header as `Bearer <token>`. The `authMiddleware` verifies the token and attaches the decoded user to `req.user`.

## Role-Based Access Control

The `roleMiddleware` checks `req.user.role`. For example, product creation allows only farmers, while admin routes allow only admins. Controllers still perform ownership checks so farmers can edit only their own listings.

## Image Uploads

Product image uploads use Multer in `middleware/uploadMiddleware.js`. Images are saved in `uploads/`, and Express serves them publicly at `/uploads/<filename>`. The frontend sends product forms as `multipart/form-data`.

## API Documentation

### Auth

- `POST /api/auth/register`: Register a farmer or buyer.
- `POST /api/auth/login`: Login and receive a JWT.
- `GET /api/auth/me`: Get the logged-in user.

### Products

- `GET /api/products`: Browse available products. Supports `name`, `category_id`, `district`, `min_price`, `max_price`, and `min_quantity`.
- `GET /api/products/:id`: Get one product.
- `POST /api/products`: Farmer creates a product. Protected.
- `PUT /api/products/:id`: Farmer edits own product. Protected.
- `DELETE /api/products/:id`: Farmer or admin removes a listing. Protected.
- `GET /api/products/farmer/my-products`: Farmer views own listings. Protected.

### Orders

- `POST /api/orders`: Buyer sends an order request. Protected.
- `GET /api/orders/my-orders`: Buyer views own orders. Protected.
- `GET /api/orders/farmer`: Farmer views orders for own products. Protected.
- `PUT /api/orders/:id/status`: Farmer/admin updates order status. Protected.

### Inquiries

- `POST /api/inquiries`: Buyer sends an inquiry. Protected.
- `GET /api/inquiries/my-inquiries`: Buyer views own inquiries. Protected.
- `GET /api/inquiries/farmer`: Farmer views inquiries for own products. Protected.
- `PUT /api/inquiries/:id/status`: Farmer/admin updates inquiry status. Protected.

### Profiles

- `GET /api/profile`: Get current user profile.
- `PUT /api/profile/farmer`: Create/update farmer profile.
- `PUT /api/profile/buyer`: Create/update buyer profile.

### Categories

- `GET /api/categories`: List active categories.
- `POST /api/categories`: Admin creates a category.
- `PUT /api/categories/:id`: Admin updates a category.

### Admin

- `GET /api/admin/stats`: Basic system statistics.
- `GET /api/admin/users`: List all users.
- `GET /api/admin/products`: List all products.
- `GET /api/admin/orders`: List all orders.
- `PUT /api/admin/users/:id/status`: Activate or deactivate a user.

## New Features (Student Additions)

### 1. Favorites saved in the database
- `GET /api/favorites`: Buyer lists saved products. Protected.
- `POST /api/favorites/:productId`: Buyer saves a product. Protected.
- `DELETE /api/favorites/:productId`: Buyer removes a favorite. Protected.

### 2. Buyer cancels a pending order
- `PUT /api/orders/:id/cancel`: Buyer cancels their own order. Only orders with status `pending` can be cancelled. Protected.

### 3. Product ratings and reviews
- `GET /api/reviews/product/:productId`: Public. Returns reviews and an average rating.
- `POST /api/reviews/product/:productId`: Buyer adds or updates their review (rating 1 to 5, optional comment). Each buyer has one review per product. Protected.

The `reviews` table is defined in `database/schema.sql`, and sample reviews are in `database/seed.sql`.

## Database Setup Without the Command Line

If the `mysql` command is not available (for example on Windows), use MySQL Workbench:

1. Connect to your local MySQL server.
2. Open `database/schema.sql` with **File > Open SQL Script** and run it.
3. Open `database/seed.sql` and run it.

Warning: `schema.sql` drops and recreates all tables, so only run it on a fresh setup.

## Setup Notes

- If your database password contains `#`, wrap it in quotes in `.env`, for example `DB_PASSWORD="#mypassword"`. Without quotes, everything after `#` is treated as a comment and the login fails with "using password: NO".
- Never commit `.env` or `node_modules`.
