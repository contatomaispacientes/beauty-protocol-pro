
CREATE OR REPLACE FUNCTION public.get_top_searched_products(_since timestamptz, _lim int DEFAULT 12)
RETURNS TABLE (product_id uuid, name text, brand text, image_url text, avg_rating numeric, reviews_count int, searches bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH agg AS (
    SELECT lower(coalesce(brand,'')) || '|' || lower(product_name) AS nk, COUNT(*) AS c
    FROM public.product_search_history
    WHERE created_at >= _since AND product_name IS NOT NULL
    GROUP BY nk
  )
  SELECT p.id, p.name, p.brand, p.image_url, p.avg_rating, p.reviews_count, agg.c
  FROM agg JOIN public.products p ON p.normalized_key = agg.nk
  ORDER BY agg.c DESC LIMIT _lim;
$$;

CREATE OR REPLACE FUNCTION public.get_top_rated_products(_since timestamptz, _min_reviews int DEFAULT 2, _lim int DEFAULT 12)
RETURNS TABLE (product_id uuid, name text, brand text, image_url text, avg_rating numeric, reviews_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.name, p.brand, p.image_url, ROUND(AVG(r.rating)::numeric, 2), COUNT(r.id)
  FROM public.product_reviews r JOIN public.products p ON p.id = r.product_id
  WHERE r.created_at >= _since
  GROUP BY p.id
  HAVING COUNT(r.id) >= _min_reviews
  ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC LIMIT _lim;
$$;

CREATE OR REPLACE FUNCTION public.get_top_community_users(_since timestamptz, _lim int DEFAULT 10)
RETURNS TABLE (user_id uuid, display_name text, searches bigint, reviews bigint, score bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH s AS (SELECT user_id, COUNT(*)::bigint AS c FROM public.product_search_history WHERE created_at >= _since GROUP BY user_id),
  r AS (SELECT user_id, COUNT(*)::bigint AS c FROM public.product_reviews WHERE created_at >= _since GROUP BY user_id),
  u AS (SELECT user_id FROM s UNION SELECT user_id FROM r)
  SELECT u.user_id, p.display_name,
         COALESCE(s.c, 0), COALESCE(r.c, 0),
         (COALESCE(s.c, 0) + COALESCE(r.c, 0) * 2)
  FROM u
  LEFT JOIN s ON s.user_id = u.user_id
  LEFT JOIN r ON r.user_id = u.user_id
  LEFT JOIN public.profiles p ON p.user_id = u.user_id
  ORDER BY 5 DESC LIMIT _lim;
$$;

REVOKE ALL ON FUNCTION public.get_top_searched_products(timestamptz, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_top_rated_products(timestamptz, int, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_top_community_users(timestamptz, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_top_searched_products(timestamptz, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_rated_products(timestamptz, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_community_users(timestamptz, int) TO authenticated;
