/*
  # Create Users Table for InvestPro Platform

  ## Overview
  This migration creates the users table for storing user registration and profile information.

  ## New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique identifier, links to auth.users
  - `full_name` (text) - User's full name
  - `mobile` (text, unique) - Primary mobile number for login
  - `alt_mobile` (text, optional) - Alternative mobile number
  - `email` (text, unique) - Email address
  - `referral_code` (text, optional) - Referral code used during signup
  - `own_referral_code` (text, unique) - User's unique referral code for sharing
  - `kyc_status` (text) - KYC verification status (pending, approved, rejected)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `users` table
  - Users can read their own profile data
  - Users can update their own profile data
  - Only authenticated users can insert their own record
  - Users cannot delete their profile

  ## Notes
  - Mobile numbers are used as primary login identifier
  - Each user gets a unique referral code generated at signup
  - KYC status defaults to 'pending'
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text UNIQUE NOT NULL,
  alt_mobile text,
  email text UNIQUE NOT NULL,
  referral_code text,
  own_referral_code text UNIQUE NOT NULL,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_own_referral_code ON users(own_referral_code);