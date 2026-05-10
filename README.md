# Library API

## About

The Library API is a comprehensive backend REST API application that is designed to digitally manage the fundamental operations of a public or academic library. Manually managing a library, such as keeping track of which books have been borrowed, who borrowed them, when they are due, and how many copies remain, is time-consuming and error-prone. This solution automates those procedures by providing a clear, organized API that any frontend application, mobile app, or administrative dashboard can use.

The software represents three main real-world entities: **Authors**, **Books**, and **Members**. Authors are book creators; a single author might write multiple books. Members are registered library cards who may borrow books from the collection. The borrowing relationship between Members and Books is tracked using a specific **Borrow** junction table, which records who borrowed which book, when, and whether it was returned, resulting in a many-to-many link between Members and Books.

The API implements real-world business standards. When a member borrows a book, the system ensures that at least one copy is available before producing the borrow record and automatically reduces the available copy count. When a book is returned, its copy count is restored. A member cannot borrow the same book twice if the prior borrow is still ongoing. These limitations ensure data integrity and reflect how a genuine library system operates.

The project strictly adheres to the MVC architectural pattern (Model-View-Controller). Route files merely define URL paths and pass all logic to specific controller files. Controllers handle database queries, validation, and return formatting. Models use Sequelize ORM to define the database structure, specifying data types, constraints, and associations. Middleware is contained within its own directory and handles cross-cutting issues such as request logging, 404 handling, and global error detection. All sensitive configurations are stored in environment variables, keeping credentials out of source control.

This API was created with the developer experience in mind. To facilitate integration, each endpoint returns detailed JSON error messages, appropriate HTTP status codes, and uniform response structures. The Postman collection included in this repository enables any developer to test all endpoints instantly after configuration without creating a single line of additional code.

---

## Tech Stack

| Technology | Version |
|------------|---------|
| Node.js    | >= 18.x |
| Express.js | ^4.19.2 |
| Sequelize  | ^6.37.3 |
| MySQL      | >= 8.0  |
| mysql2     | ^3.9.7  |
| dotenv     | ^16.4.5 |

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/kyra/library-api.git
cd library-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_db
DB_USER=root
DB_PASS=yourpassword
PORT=3000
```

### 4. Create the MySQL Database

Log into MySQL and create the database:

```sql
CREATE DATABASE library_db;
```

### 5. Start the Server

```bash
npm start
```

Sequelize will automatically create all tables on startup. You should see:

```
Database synced successfully.
Library API server is running on http://localhost:3000
```

---

## Database Schema

### `authors`

| Column      | Type         | Constraints        |
|-------------|--------------|--------------------|
| id          | INTEGER      | PK, Auto Increment |
| name        | STRING(150)  | NOT NULL           |
| nationality | STRING(100)  | nullable           |
| bio         | TEXT         | nullable           |
| createdAt   | DATETIME     | auto               |
| updatedAt   | DATETIME     | auto               |

### `books`

| Column          | Type        | Constraints              |
|-----------------|-------------|--------------------------|
| id              | INTEGER     | PK, Auto Increment       |
| title           | STRING(255) | NOT NULL                 |
| isbn            | STRING(20)  | NOT NULL, UNIQUE         |
| publishedYear   | INTEGER     | nullable                 |
| copiesAvailable | INTEGER     | NOT NULL, default: 1     |
| authorId        | INTEGER     | FK → authors.id, NOT NULL|
| createdAt       | DATETIME    | auto                     |
| updatedAt       | DATETIME    | auto                     |

### `members`

| Column         | Type        | Constraints        |
|----------------|-------------|--------------------|
| id             | INTEGER     | PK, Auto Increment |
| name           | STRING(150) | NOT NULL           |
| email          | STRING(200) | NOT NULL, UNIQUE   |
| phone          | STRING(20)  | nullable           |
| membershipDate | DATEONLY    | NOT NULL, default today |
| createdAt      | DATETIME    | auto               |
| updatedAt      | DATETIME    | auto               |

### `borrows` (Junction Table)

| Column     | Type                    | Constraints              |
|------------|-------------------------|--------------------------|
| id         | INTEGER                 | PK, Auto Increment       |
| memberId   | INTEGER                 | FK → members.id, NOT NULL|
| bookId     | INTEGER                 | FK → books.id, NOT NULL  |
| borrowDate | DATEONLY                | NOT NULL, default today  |
| returnDate | DATEONLY                | nullable                 |
| status     | ENUM('borrowed','returned') | NOT NULL, default 'borrowed' |
| createdAt  | DATETIME                | auto                     |
| updatedAt  | DATETIME                | auto                     |

---

## Relationship Diagram (ER Diagram)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   AUTHORS   │         │    BOOKS     │         │   MEMBERS   │
│─────────────│         │──────────────│         │─────────────│
│ id (PK)     │◄────────│ authorId(FK) │         │ id (PK)     │
│ name        │  1    * │ id (PK)      │         │ name        │
│ nationality │         │ title        │         │ email       │
│ bio         │         │ isbn         │         │ phone       │
└─────────────┘         │ publishedYear│         │ membershipDate│
                        │copiesAvailable         └──────┬──────┘
                        └──────┬───────┘                │
                               │ *                    * │
                               │    ┌─────────────┐    │
                               └────│   BORROWS   │────┘
                                    │─────────────│
                                    │ id (PK)     │
                                    │ bookId (FK) │
                                    │ memberId(FK)│
                                    │ borrowDate  │
                                    │ returnDate  │
                                    │ status      │
                                    └─────────────┘

Relationships:
  Author  ──< Book     (One-to-Many: Author has many Books)
  Member  >──< Book    (Many-to-Many through Borrows)
```

---

## API Reference

### Authors

| Method | Path               | Request Body                        | Description             | Success |
|--------|--------------------|-------------------------------------|-------------------------|---------|
| GET    | /api/authors       | —                                   | Get all authors         | 200     |
| GET    | /api/authors/:id   | —                                   | Get author + books      | 200     |
| POST   | /api/authors       | `{ name*, nationality, bio }`       | Create an author        | 201     |
| PUT    | /api/authors/:id   | `{ name, nationality, bio }`        | Update an author        | 200     |
| DELETE | /api/authors/:id   | —                                   | Delete an author        | 200     |

### Books

| Method | Path             | Request Body                                              | Description             | Success |
|--------|------------------|-----------------------------------------------------------|-------------------------|---------|
| GET    | /api/books       | —                                                         | Get all books + author  | 200     |
| GET    | /api/books/:id   | —                                                         | Get book + borrowers    | 200     |
| POST   | /api/books       | `{ title*, isbn*, authorId*, publishedYear, copiesAvailable }` | Create a book     | 201     |
| PUT    | /api/books/:id   | `{ title, isbn, authorId, publishedYear, copiesAvailable }` | Update a book         | 200     |
| DELETE | /api/books/:id   | —                                                         | Delete a book           | 200     |

### Members

| Method | Path                       | Request Body                            | Description                    | Success |
|--------|----------------------------|-----------------------------------------|--------------------------------|---------|
| GET    | /api/members               | —                                       | Get all members                | 200     |
| GET    | /api/members/:id           | —                                       | Get member + borrowed books    | 200     |
| POST   | /api/members               | `{ name*, email*, phone, membershipDate }` | Create a member             | 201     |
| PUT    | /api/members/:id           | `{ name, email, phone, membershipDate }` | Update a member               | 200     |
| DELETE | /api/members/:id           | —                                       | Delete a member                | 200     |
| GET    | /api/members/:id/borrows   | —                                       | Get all borrows for a member   | 200     |

### Borrows *(Relationship Endpoints)*

| Method | Path                    | Request Body                              | Description                        | Success |
|--------|-------------------------|-------------------------------------------|------------------------------------|---------|
| GET    | /api/borrows            | —                                         | Get all borrow records             | 200     |
| GET    | /api/borrows/:id        | —                                         | Get single borrow record           | 200     |
| POST   | /api/borrows            | `{ memberId*, bookId*, borrowDate }`      | Borrow a book                      | 201     |
| PUT    | /api/borrows/:id/return | `{ returnDate }`                          | Return a book                      | 200     |

`*` = required field

---

## Error Responses

| Status | When it occurs                              | JSON Structure |
|--------|---------------------------------------------|----------------|
| 400    | Missing required fields in POST             | `{ "error": "Validation error", "message": "field is required" }` |
| 400    | Duplicate unique field (email, isbn)        | `{ "error": "Validation error", "message": "field must be unique" }` |
| 400    | No book copies available                    | `{ "error": "No copies available for this book" }` |
| 400    | Book already borrowed and not returned      | `{ "error": "Member has already borrowed this book and not returned it" }` |
| 404    | Record not found by ID                      | `{ "error": "Resource not found" }` |
| 404    | Undefined route                             | `{ "error": "Route not found", "message": "Cannot METHOD /path" }` |
| 500    | Unexpected server error                     | `{ "error": "Internal Server Error", "message": "An unexpected error occurred." }` |
