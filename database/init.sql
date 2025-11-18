-- ===============================================
-- INSURANCE PLATFORM - DATABASE SCHEMA
-- PostgreSQL Database Structure
-- ===============================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS insurance_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===============================================
-- USERS TABLE
-- ===============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- ===============================================
-- INSURANCE TYPES TABLE
-- ===============================================
CREATE TABLE insurance_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    base_premium DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default insurance types
INSERT INTO insurance_types (name, description, base_premium) VALUES
('life', 'Life Insurance - Coverage for life events', 100.00),
('rent', 'Rent Insurance - Property protection', 50.00),
('vehicle', 'Vehicle Insurance - Auto coverage', 75.00);

-- ===============================================
-- POLICIES TABLE (Main Policy Information)
-- ===============================================
CREATE TABLE policies (
    id SERIAL PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insurance_type_id INTEGER NOT NULL REFERENCES insurance_types(id),
    -- Status: 'issued' (recién creada, pendiente de aprobación), 'active' (aprobada y vigente), 'cancelled' (cancelada)
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'active', 'cancelled')),
    
    -- Common Fields
    start_date DATE NOT NULL,
    -- end_date is NULL for 'issued' and 'active' policies, only set when 'cancelled'
    end_date DATE DEFAULT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    coverage_amount DECIMAL(12, 2) NOT NULL,
    
    -- Life Insurance Specific (JSONB for flexibility)
    life_details JSONB DEFAULT NULL,
    -- Example structure:
    -- {
    --   "age": 35,
    --   "medical_history": "None",
    --   "smoker": false,
    --   "beneficiaries": [{"name": "Jane Doe", "relationship": "spouse"}]
    -- }
    
    -- Rent Insurance Specific
    rent_details JSONB DEFAULT NULL,
    -- Example structure:
    -- {
    --   "address": "123 Main St",
    --   "property_value": 250000,
    --   "usage_type": "residential",
    --   "square_meters": 120
    -- }
    
    -- Vehicle Insurance Specific
    vehicle_details JSONB DEFAULT NULL,
    -- Example structure:
    -- {
    --   "make": "Toyota",
    --   "model": "Camry",
    --   "year": 2022,
    --   "vin": "1HGBH41JXMN109186",
    --   "license_plate": "ABC123"
    -- }
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_policies_user_id ON policies(user_id);
CREATE INDEX idx_policies_insurance_type_id ON policies(insurance_type_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_policy_number ON policies(policy_number);

-- ===============================================
-- POLICY CLAIMS TABLE (Optional - for future)
-- ===============================================
CREATE TABLE policy_claims (
    id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    claim_date DATE NOT NULL,
    claim_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'paid')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claims_policy_id ON policy_claims(policy_id);

-- ===============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ===============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON policy_claims
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SEED DATA (Demo Users)
-- ===============================================
-- Password for all demo users: "Password123!" (hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@insurance.com', '$2b$10$X7QZ1YQZ1YQZ1YQZ1YQZ1Oe8Z1YQZ1YQZ1YQZ1YQZ1YQZ1YQZ1YQZ1Y', 'Admin', 'User', 'admin'),
('john.doe@email.com', '$2b$10$X7QZ1YQZ1YQZ1YQZ1YQZ1Oe8Z1YQZ1YQZ1YQZ1YQZ1YQZ1YQZ1YQZ1Y', 'John', 'Doe', 'customer'),
('jane.smith@email.com', '$2b$10$X7QZ1YQZ1YQZ1YQZ1YQZ1Oe8Z1YQZ1YQZ1YQZ1YQZ1YQZ1YQZ1YQZ1Y', 'Jane', 'Smith', 'customer');

-- ===============================================
-- VIEWS FOR REPORTING
-- ===============================================

-- Active Policies Summary
CREATE VIEW active_policies_summary AS
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    it.name as insurance_type,
    p.policy_number,
    p.premium_amount,
    p.coverage_amount,
    p.start_date,
    p.end_date,
    p.status
FROM policies p
JOIN users u ON p.user_id = u.id
JOIN insurance_types it ON p.insurance_type_id = it.id
WHERE p.status = 'active';

-- User Statistics
CREATE VIEW user_policy_stats AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(p.id) as total_policies,
    SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_policies,
    SUM(p.premium_amount) as total_premium
FROM users u
LEFT JOIN policies p ON u.id = p.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- ===============================================
-- COMMENTS
-- ===============================================
COMMENT ON TABLE users IS 'User accounts for customers and administrators';
COMMENT ON TABLE insurance_types IS 'Types of insurance products offered';
COMMENT ON TABLE policies IS 'Insurance policies with type-specific details stored in JSONB';
COMMENT ON TABLE policy_claims IS 'Claims submitted against policies';
