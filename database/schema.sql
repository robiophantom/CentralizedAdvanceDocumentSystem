-- PostgreSQL Database Schema for Centralized Document Management System

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL,
    extracted_text TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);



-- Document keywords table (for tagging)
CREATE TABLE IF NOT EXISTS document_keywords (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE(document_id, keyword)
);

-- Create indexes for keyword searches
CREATE INDEX IF NOT EXISTS idx_keywords_document_id ON document_keywords(document_id);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON document_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword_trgm ON document_keywords USING GIN (keyword gin_trgm_ops);

-- Document versions table (for version control)
CREATE TABLE IF NOT EXISTS document_versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    changes_description TEXT,
    uploaded_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(document_id, version_number)
);

-- Create indexes for version tracking
CREATE INDEX IF NOT EXISTS idx_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON document_versions(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on documents table
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for document search with keyword aggregation
CREATE OR REPLACE VIEW document_search_view AS
SELECT 
    d.id,
    d.title,
    d.description,
    d.file_name,
    d.file_type,
    d.file_size,
    d.created_at,
    u.username as uploaded_by_username,
    u.full_name as uploaded_by_fullname,
    COALESCE(
        (SELECT string_agg(keyword, ', ') 
         FROM document_keywords dk 
         WHERE dk.document_id = d.id),
        ''
    ) as keywords
FROM documents d
JOIN users u ON d.uploaded_by = u.id;

-- Insert sample admin user (password: 'admin123' - CHANGE IN PRODUCTION!)
-- Password hash is bcrypt hash of 'admin123' with 10 rounds
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$m/job4vYT1JTNnGBbMgSKelh9wxUdWTpCFqi8xTAfuFUkYgt0PXPm',
    'System Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

