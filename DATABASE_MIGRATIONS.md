# Database Migrations

Run these SQL commands in Supabase SQL Editor to set up the new tables for likes and favorites.

## Create sticker_likes table

```sql
CREATE TABLE sticker_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sticker_id, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_sticker_likes_sticker_id ON sticker_likes(sticker_id);
CREATE INDEX idx_sticker_likes_user_id ON sticker_likes(user_id);

-- Enable RLS
ALTER TABLE sticker_likes ENABLE ROW LEVEL SECURITY;

-- Allow public to read like counts
CREATE POLICY "Public read likes" 
ON sticker_likes FOR SELECT USING (true);

-- Allow authenticated users to modify their own likes
CREATE POLICY "Users can like/unlike" 
ON sticker_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" 
ON sticker_likes FOR DELETE 
USING (auth.uid() = user_id);
```

## Run these in order:

1. Copy the SQL above
2. Go to Supabase Dashboard → SQL Editor → New Query
3. Paste the SQL
4. Click "Run"
5. You should see success message

Then restart your backend and test!
