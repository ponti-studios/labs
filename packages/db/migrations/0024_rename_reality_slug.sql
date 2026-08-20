DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM "labs"."games_topics"
		WHERE "slug" = 'rhobh'
	) THEN
		RAISE EXCEPTION 'expected legacy games_topics slug rhobh';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "labs"."games_topics"
		WHERE "slug" = 'reality'
	) THEN
		RAISE EXCEPTION 'cannot rename games_topics slug rhobh: reality already exists';
	END IF;

	UPDATE "labs"."games_topics"
	SET "slug" = 'reality', "updated_at" = now()
	WHERE "slug" = 'rhobh';
END
$$;
