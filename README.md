# Announcements API

Node.js REST API for managing announcements, built as a homework assignment for the GoIT Node.js course. 
The API supports search, sorting, pagination, validation, full error handling, and Swagger documentation for all routes.

## Tech Stack

- Node.js, Express.js.
- Prisma ORM with SQLite database.
- Celebrate (Joi) for request validation.
- Swagger UI for API documentation.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run database migrations

```bash
npm run prisma:migrate
```

Applies Prisma migrations and prepares the SQLite database schema.

### Start the development server

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default (or as configured in your environment).

### Open API documentation

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

Use it to explore endpoints, models, and error formats.

## API Routes

### Announcements

- `GET /announcements` – Get a list of announcements with search, sorting, and pagination.
- `GET /announcements/:id` – Get a single announcement by ID.
- `POST /announcements` – Create a new announcement (body validated via Celebrate).
- `PATCH /announcements/:id` – Update an existing announcement and refresh `updatedAt`.
- `DELETE /announcements/:id` – Delete an announcement by ID.

### Query Features

- Case‑insensitive search (SQLite‑friendly OR filter across relevant fields).
- Sorting by `newest` / `oldest` using creation date.
- Pagination with 10 items per page.

## Error Handling & Validation

- Consistent error responses for `400`, `404`, and `500` HTTP status codes.
- Request body validation for `POST` and `PATCH` using Celebrate/Joi schemas.

## Testing with VS Code REST Client

The project root contains a `requests.http` file with examples of all API calls.  
With the REST Client extension in VS Code you can send requests directly from this file.

## Author

Robert Levin — GoIT Node.js student.
GitHub: `https://github.com/rlevin-ctrl`.
