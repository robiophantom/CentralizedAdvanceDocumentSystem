# Centralized Advanced Document Management System

A powerful, scalable document management system with full-text search capabilities, built with Node.js, Express, and PostgreSQL.

## Features

- **Instant Search**: Search documents by name, content, metadata, and keywords using PostgreSQL full-text search
- **Centralized Storage**: Organize all documents in one place with proper categorization
- **Version Control**: Track document versions and changes over time
- **Keyword Tagging**: Tag documents with keywords for better organization
- **Text Extraction**: Automatically extract text from PDF, DOCX, and TXT files for searchable content
- **User Authentication**: Secure JWT-based authentication system
- **Role-Based Access**: Admin and user roles with appropriate permissions
- **RESTful API**: Clean, well-documented API endpoints

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with full-text search extensions
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Text Extraction**: pdf-parse, mammoth
- **Security**: Helmet, bcrypt, CORS, rate limiting

## Project Structure

```
CentralizedAdvanceDocumentSystem/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   └── documentController.js # Document management logic
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   └── documentRoutes.js    # Document endpoints
│   │   ├── utils/
│   │   │   ├── fileUpload.js        # File upload configuration
│   │   │   └── textExtraction.js    # Text extraction utilities
│   │   └── app.js                   # Express app setup
│   └── package.json
├── database/
│   └── schema.sql                   # PostgreSQL schema
├── uploads/                         # Uploaded files directory
│   └── .gitkeep
├── .env.example                     # Environment variables template
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/robiophantom/CentralizedAdvanceDocumentSystem.git
cd CentralizedAdvanceDocumentSystem
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Setup PostgreSQL Database

Create a new PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE document_management;
\q
```

Run the schema to create tables and indexes:

```bash
psql -U postgres -d document_management -f ../database/schema.sql
```

### 4. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
cp ../.env.example .env
```

Edit `.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=document_management
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 5. Start the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Documents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/documents/upload` | Upload a document | Yes |
| GET | `/api/documents` | Get all documents | Yes |
| GET | `/api/documents/:id` | Get document by ID | Yes |
| GET | `/api/documents/search?q=query` | Search documents | Yes |
| PUT | `/api/documents/:id` | Update document metadata | Yes |
| DELETE | `/api/documents/:id` | Delete document | Yes |

### Example API Usage

#### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123"
  }'
```

#### Upload a Document

```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "title=Important Document" \
  -F "description=This is a test document" \
  -F "keywords=test,important,pdf"
```

#### Search Documents

```bash
curl -X GET "http://localhost:5000/api/documents/search?q=important" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Users Table
Stores user authentication and profile information.

### Documents Table
Main document storage with metadata, file information, and extracted text for search indexing.

### Document Keywords Table
Keywords/tags associated with documents for better categorization and filtering.

### Document Versions Table
Tracks version history for documents (feature ready for implementation).

## Full-Text Search Features

The system uses PostgreSQL's powerful full-text search capabilities:

- **GIN Indexes**: Fast full-text search on title, description, and extracted text
- **Trigram Indexes**: Fuzzy matching for typo-tolerant searches
- **Ranking**: Results ranked by relevance using `ts_rank`
- **Multiple Languages**: Configurable language support (English by default)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Helmet.js**: Sets security HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **File Type Validation**: Restricts allowed file types
- **File Size Limits**: Prevents large file uploads

## Future Enhancements

- [ ] AI-powered document summarization
- [ ] OCR for image-based documents
- [ ] Document sharing and collaboration
- [ ] Advanced search filters
- [ ] Document preview functionality
- [ ] Bulk operations
- [ ] Audit logging
- [ ] Email notifications
- [ ] Frontend web application

## Development

### Code Style
- ES6+ JavaScript
- Consistent error handling
- Comprehensive comments
- RESTful API design principles

### Adding New Features

1. Create necessary database migrations in `database/schema.sql`
2. Add controllers in `backend/src/controllers/`
3. Define routes in `backend/src/routes/`
4. Add middleware if needed in `backend/src/middleware/`
5. Update API documentation in this README

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `.env`
- Ensure database exists and schema is loaded

### File Upload Issues
- Check `uploads/` directory exists and has write permissions
- Verify `MAX_FILE_SIZE` in `.env`
- Check allowed file types in `ALLOWED_FILE_TYPES`

### Authentication Issues
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration settings
- Verify user exists in database

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
