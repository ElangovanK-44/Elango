/*
  # Create KYC Documents Table

  ## Overview
  This migration creates the kyc_documents table for storing user KYC document information.

  ## New Tables
  
  ### `kyc_documents`
  - `id` (uuid, primary key) - Unique identifier for the document record
  - `user_id` (uuid, foreign key) - References the user who uploaded the document
  - `document_type` (text) - Type of document (aadhaar, pan)
  - `document_url` (text) - URL/path to the stored document
  - `status` (text) - Verification status (pending, approved, rejected)
  - `uploaded_at` (timestamptz) - Document upload timestamp
  - `verified_at` (timestamptz, optional) - Document verification timestamp

  ## Security
  - Enable RLS on `kyc_documents` table
  - Users can read their own documents
  - Users can insert their own documents
  - Users can update their own documents (for re-uploading)
  - Users cannot delete documents (admin only)

  ## Notes
  - Each user can have multiple document entries (for re-uploads)
  - Document type is restricted to 'aadhaar' or 'pan'
  - Status defaults to 'pending' until admin verification
*/

CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('aadhaar', 'pan')),
  document_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON kyc_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON kyc_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_document_type ON kyc_documents(document_type);