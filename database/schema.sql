-- PostgreSQL Schema for MediBill AI

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    filename TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id),
    name TEXT,
    price DOUBLE PRECISION,
    quantity INTEGER
);

CREATE TABLE IF NOT EXISTS rate_cards (
    id SERIAL PRIMARY KEY,
    item_name TEXT UNIQUE,
    benchmark_price DOUBLE PRECISION
);
