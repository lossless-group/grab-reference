-- Enable the pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Log the extension creation for debugging
DO $$
BEGIN
    RAISE NOTICE 'pgcrypto extension has been enabled';
END $$; 