module.exports = {
  up: async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS gallery_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255),
            description TEXT,
            image_url VARCHAR(500) NOT NULL,
            artist VARCHAR(255),
            year INTEGER,
            tags VARCHAR(500),
            is_valid BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT year_range CHECK (year >= 1000 AND year <= 2100)
        );
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_gallery_items_user_id ON gallery_items(user_id);
        CREATE INDEX IF NOT EXISTS idx_gallery_items_is_valid ON gallery_items(is_valid);
        CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_gallery_items_title ON gallery_items(title);
        CREATE INDEX IF NOT EXISTS idx_gallery_items_artist ON gallery_items(artist);
        CREATE INDEX IF NOT EXISTS idx_gallery_items_tags ON gallery_items(tags);
    `);

    await db.query(`
        CREATE OR REPLACE FUNCTION update_gallery_items_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    await db.query(`
        CREATE OR REPLACE TRIGGER gallery_items_updated_at_trigger
        BEFORE UPDATE ON gallery_items
        FOR EACH ROW
        EXECUTE FUNCTION update_gallery_items_updated_at();
    `);
  },

  down: async (db) => {
    await db.query(`
      ALTER TABLE gallery_items 
      DROP COLUMN email_verified,
      DROP COLUMN email_verification_token,
      DROP COLUMN email_verification_expires,
      DROP COLUMN last_email_change,
      DROP COLUMN last_password_change;
    `);
  }
};