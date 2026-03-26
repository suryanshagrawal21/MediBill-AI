-- Seed Data for MediBill AI (CGHS + NPPA)

INSERT INTO rate_cards (item_name, benchmark_price) VALUES
('Paracetamol 500mg', 2.0),
('CBC Test', 400.0),
('ICU Charges/day', 11000.0),
('Surgical Gloves', 180.0),
('X-Ray', 300.0)
ON CONFLICT (item_name) DO NOTHING;
