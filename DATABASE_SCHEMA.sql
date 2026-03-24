-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create stickers table
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 3,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create collection_items table (junction table)
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  UNIQUE(collection_id, sticker_id)
);

-- Create indexes for better performance
CREATE INDEX idx_stickers_user_id ON stickers(user_id);
CREATE INDEX idx_stickers_created_at ON stickers(created_at DESC);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_sticker_id ON collection_items(sticker_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies for stickers
CREATE POLICY "Anyone can view stickers"
  ON stickers FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own stickers"
  ON stickers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stickers"
  ON stickers FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for collections
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own collections"
  ON collections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for collection_items
CREATE POLICY "Users can manage items in their collections"
  ON collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Create function to increment uses count
CREATE OR REPLACE FUNCTION increment_uses()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE stickers SET uses_count = uses_count + 1 WHERE id = $1;
END;
$$;

-- Create storage buckets (do this via Supabase dashboard or API)
-- - stickers (public bucket for video storage)
