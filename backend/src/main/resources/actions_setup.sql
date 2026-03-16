-- Create tbl_actions table
CREATE TABLE tbl_actions (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255),
    color VARCHAR(255),
    target_module VARCHAR(255),
    target_status_id BIGINT,
    sort_order INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Actions for Admin Profiles
INSERT INTO tbl_actions (label, code, icon, color, target_module, target_status_id, sort_order) VALUES
('View', 'VIEW', 'Eye', 'text-gray-500', 'ADMIN_PROFILES', NULL, 1),
('Approve', 'APPROVE', 'Check', 'text-emerald-600', 'ADMIN_PROFILES', 1, 2),
('Reject', 'REJECT', 'X', 'text-rose-600', 'ADMIN_PROFILES', 1, 3),
('Activate', 'ACTIVATE', 'Play', 'text-indigo-600', 'ADMIN_PROFILES', 2, 2);

-- Seed Actions for Admin Users
INSERT INTO tbl_actions (label, code, icon, color, target_module, target_status_id, sort_order) VALUES
('Edit', 'EDIT', 'Pencil', 'text-indigo-600', 'ADMIN_USERS', NULL, 1),
('Delete', 'DELETE', 'Trash', 'text-rose-600', 'ADMIN_USERS', NULL, 2);

-- Seed Actions for User Profiles
INSERT INTO tbl_actions (label, code, icon, color, target_module, target_status_id, sort_order) VALUES
('View Profile', 'VIEW', 'User', 'text-indigo-600', 'USER_PROFILES', NULL, 1),
('Shortlist', 'SHORTLIST', 'Heart', 'text-rose-500', 'USER_PROFILES', NULL, 2);
