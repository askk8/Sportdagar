-- Sportdagar Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE gender_type AS ENUM ('pojke', 'flicka', 'annat');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'waitlist');

-- =============================================
-- SPORTS TABLE
-- =============================================

CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10),
    color VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SPORT WEEKS TABLE
-- =============================================

CREATE TABLE sport_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_week_dates CHECK (end_date >= start_date)
);

-- =============================================
-- SESSIONS TABLE
-- =============================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_week_id UUID NOT NULL REFERENCES sport_weeks(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    min_age INTEGER NOT NULL DEFAULT 6,
    max_age INTEGER NOT NULL DEFAULT 18,
    max_capacity INTEGER NOT NULL DEFAULT 20,
    current_bookings INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_session_times CHECK (end_time > start_time),
    CONSTRAINT valid_age_range CHECK (max_age >= min_age),
    CONSTRAINT valid_capacity CHECK (max_capacity > 0),
    CONSTRAINT valid_bookings_count CHECK (current_bookings >= 0)
);

-- =============================================
-- CHILDREN TABLE
-- =============================================

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender gender_type,
    medical_notes TEXT,
    emergency_contact_name VARCHAR(255) NOT NULL,
    emergency_contact_phone VARCHAR(50) NOT NULL,
    emergency_contact_relation VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status booking_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_child_session UNIQUE (session_id, child_id)
);

-- =============================================
-- USER PROFILES TABLE (extends auth.users)
-- =============================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_sessions_sport_week ON sessions(sport_week_id);
CREATE INDEX idx_sessions_sport ON sessions(sport_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_bookings_child ON bookings(child_id);
CREATE INDEX idx_bookings_parent ON bookings(parent_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_sport_weeks_dates ON sport_weeks(start_date, end_date);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sport_weeks_updated_at
    BEFORE UPDATE ON sport_weeks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Safe booking function with locking to prevent race conditions
CREATE OR REPLACE FUNCTION create_booking(
    p_session_id UUID,
    p_child_id UUID,
    p_parent_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_session sessions%ROWTYPE;
    v_child children%ROWTYPE;
    v_child_age INTEGER;
    v_booking_id UUID;
    v_overlap_count INTEGER;
BEGIN
    -- Lock the session row to prevent concurrent overbooking
    SELECT * INTO v_session
    FROM sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Session not found');
    END IF;

    IF NOT v_session.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Session is not active');
    END IF;

    -- Get child info
    SELECT * INTO v_child FROM children WHERE id = p_child_id AND parent_id = p_parent_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Child not found or not owned by parent');
    END IF;

    -- Check child age eligibility
    v_child_age := EXTRACT(YEAR FROM AGE(v_session.session_date, v_child.birth_date));
    IF v_child_age < v_session.min_age OR v_child_age > v_session.max_age THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Child age %s is not in the required range %s-%s', v_child_age, v_session.min_age, v_session.max_age)
        );
    END IF;

    -- Check if already booked for this session
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE session_id = p_session_id AND child_id = p_child_id AND status = 'confirmed'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Child is already booked for this session');
    END IF;

    -- Check for overlapping sessions on the same day
    SELECT COUNT(*) INTO v_overlap_count
    FROM bookings b
    JOIN sessions s ON b.session_id = s.id
    WHERE b.child_id = p_child_id
      AND b.status = 'confirmed'
      AND s.session_date = v_session.session_date
      AND s.id != p_session_id
      AND (
          (s.start_time < v_session.end_time AND s.end_time > v_session.start_time)
      );

    IF v_overlap_count > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Child has an overlapping session on this day');
    END IF;

    -- Check capacity
    IF v_session.current_bookings >= v_session.max_capacity THEN
        RETURN jsonb_build_object('success', false, 'error', 'Session is fully booked');
    END IF;

    -- Create the booking
    INSERT INTO bookings (session_id, child_id, parent_id, status)
    VALUES (p_session_id, p_child_id, p_parent_id, 'confirmed')
    RETURNING id INTO v_booking_id;

    -- Increment booking count
    UPDATE sessions SET current_bookings = current_bookings + 1 WHERE id = p_session_id;

    RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id);
END;
$$ LANGUAGE plpgsql;

-- Cancel booking function
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_parent_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_booking bookings%ROWTYPE;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND parent_id = p_parent_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking already cancelled');
    END IF;

    UPDATE bookings SET status = 'cancelled', cancelled_at = NOW() WHERE id = p_booking_id;
    UPDATE sessions SET current_bookings = GREATEST(current_bookings - 1, 0) WHERE id = v_booking.session_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- children policies
CREATE POLICY "Parents can manage own children" ON children FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "Admins can view all children" ON children FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- bookings policies
CREATE POLICY "Parents can view own bookings" ON bookings FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- sport_weeks policies
CREATE POLICY "Anyone can view published weeks" ON sport_weeks FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins can manage sport weeks" ON sport_weeks FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- sessions policies
CREATE POLICY "Anyone can view active sessions" ON sessions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage sessions" ON sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- sports policies
CREATE POLICY "Anyone can view sports" ON sports FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage sports" ON sports FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
