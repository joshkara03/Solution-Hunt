-- First, let's delete all existing data
DELETE FROM public.comments;
DELETE FROM public.votes;
DELETE FROM public.product_requests;

-- Insert 3 product requests
INSERT INTO public.product_requests (request_id, title, description, user_id, tags, created_at)
VALUES
  (
    gen_random_uuid(),
    'AI-Powered Code Review Assistant',
    'Develop an AI assistant that can automatically review code changes, suggest improvements, and catch potential bugs before they make it to production. The assistant should understand best practices, patterns, and common pitfalls across different programming languages.',
    '0daa9696-bc82-4b6d-a437-8191132b03f8', -- Liam Taylor
    ARRAY['AI', 'Development', 'Code Quality'],
    '2025-01-18 14:30:00-05:00'
  ),
  (
    gen_random_uuid(),
    'Real-time Collaboration Features',
    'Add real-time collaboration features similar to Google Docs. Developers should be able to see each other''s cursor positions, live edits, and comments in real-time without conflicts.',
    '19554e5c-dee4-446d-aa7d-ec5af3abe9c0', -- Zoe Anderson
    ARRAY['Collaboration', 'Real-time', 'Editor'],
    '2025-01-18 16:45:00-05:00'
  ),
  (
    gen_random_uuid(),
    'Cross-Platform Desktop App',
    'Create a native desktop application that works seamlessly across Windows, Mac, and Linux. Should include offline support and native OS integrations.',
    '1a221770-4a3a-4943-9efc-1215ca237f34', -- Daniel Cohen
    ARRAY['Desktop', 'Cross-Platform', 'Offline'],
    '2025-01-02 09:15:00-05:00'
  );

-- Add votes
WITH request_info AS (
  SELECT request_id, user_id as author_id, created_at
  FROM public.product_requests
)
INSERT INTO public.votes (vote_id, request_id, user_id, vote_type, created_at)
SELECT 
  gen_random_uuid(),
  r.request_id,
  v.user_id,
  'up',
  r.created_at + interval '1 hour'
FROM request_info r
CROSS JOIN (
  SELECT user_id
  FROM public.profiles
  WHERE user_id IN (
    '1c69227a-4d5a-4737-b3eb-64c92d9cbe42', -- William Zhang
    '1f3d111b-56ff-4396-ae55-004c08aba8ae', -- Mia Patel
    '26711ee9-6329-40a9-9e92-a7634f982dc8', -- Mason Wang
    '3b0851b0-ecac-4f67-8522-ce816c5dcb91', -- James Rodriguez
    '5396cab0-446b-4c2c-8f70-8cdb255f45ab'  -- Amelia Davis
  )
) v
WHERE r.author_id != v.user_id;

-- Add comments
WITH request_info AS (
  SELECT request_id, created_at
  FROM public.product_requests
)
INSERT INTO public.comments (comment_id, content, user_id, request_id, parent_id, created_at)
VALUES
  (
    gen_random_uuid(),
    'This would be a game-changer for our development workflow!',
    '61c58cfd-de70-4ef3-b0aa-a8d487dec835', -- Chloe White
    (SELECT request_id FROM public.product_requests WHERE title LIKE 'AI-Powered%'),
    NULL,
    '2025-01-18 15:30:00-05:00'
  ),
  (
    gen_random_uuid(),
    'The real-time aspect would make pair programming so much better.',
    '7bacc9a8-797a-4db2-a02b-5c52c177ad89', -- Ethan Nguyen
    (SELECT request_id FROM public.product_requests WHERE title LIKE 'Real-time%'),
    NULL,
    '2025-01-18 17:45:00-05:00'
  ),
  (
    gen_random_uuid(),
    'Offline support is crucial for developers who work on the go.',
    '8e1e33d6-ece4-4993-8a0a-0ecdc1c777b', -- Noah Kim
    (SELECT request_id FROM public.product_requests WHERE title LIKE 'Cross-Platform%'),
    NULL,
    '2025-01-02 10:15:00-05:00'
  );
