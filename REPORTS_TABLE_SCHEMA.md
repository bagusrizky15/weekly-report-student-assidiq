# Database Schema for Reports

To create the reports table in your Supabase database, run the following SQL script in your Supabase SQL editor:

```sql
-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id), -- Reference to profiles table
  user_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_class VARCHAR(50),
  student_level VARCHAR(50),
  halaqoh_name VARCHAR(255),
  teacher_name VARCHAR(255),
  juz VARCHAR(10),
  surah VARCHAR(100),
  verses VARCHAR(50),
  amount_memorized VARCHAR(100),
  module VARCHAR(100),
  chapter VARCHAR(100),
  pages VARCHAR(50),
  lines VARCHAR(50),
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_email ON reports(user_email);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow admin to read reports" ON reports
  FOR SELECT TO authenticated
  USING ( EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Allow admin to insert reports" ON reports
  FOR INSERT TO authenticated
  WITH CHECK ( EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Allow admin to update reports" ON reports
  FOR UPDATE TO authenticated
  USING ( EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Allow admin to delete reports" ON reports
  FOR DELETE TO authenticated
  USING ( EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Create policies for user access (read-only)
CREATE POLICY "Allow users to read their own reports" ON reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

After running this script, the reports feature will work correctly.