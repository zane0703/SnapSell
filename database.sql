-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

-- DROP SEQUENCE public.liking_id_seq;

CREATE SEQUENCE public.liking_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.listings_id_seq;

CREATE SEQUENCE public.listings_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.offers_id_seq;

CREATE SEQUENCE public.offers_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	username varchar(45) NOT NULL,
	profile_pic_url varchar(255) DEFAULT NULL::character varying NULL,
	created_at timestamp(0) DEFAULT now() NULL,
	"password" bpchar(118) NOT NULL,
	CONSTRAINT id_unique PRIMARY KEY (id),
	CONSTRAINT username_unique UNIQUE (username)
);


-- public.listings definition

-- Drop table

-- DROP TABLE public.listings;

CREATE TABLE public.listings (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	title varchar(45) NOT NULL,
	description varchar(255) DEFAULT NULL::character varying NULL,
	price numeric NOT NULL,
	fk_poster_id int4 NOT NULL,
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NULL,
	"like" int4 DEFAULT 0 NULL,
	picture_url varchar(255) NOT NULL,
	CONSTRAINT listings_pkey PRIMARY KEY (id),
	CONSTRAINT fk_poster_id FOREIGN KEY (fk_poster_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX fk_poster_id ON public.listings USING btree (fk_poster_id);
CREATE INDEX title ON public.listings USING btree (title);


-- public.offers definition

-- Drop table

-- DROP TABLE public.offers;

CREATE TABLE public.offers (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	offer numeric NOT NULL,
	fk_listing_id int4 NOT NULL,
	fk_offeror_id int4 NOT NULL,
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NULL,
	accepted bool NULL,
	CONSTRAINT offers_pkey PRIMARY KEY (id),
	CONSTRAINT offerlisting FOREIGN KEY (fk_listing_id) REFERENCES public.listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT offeruser FOREIGN KEY (fk_offeror_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX offerlisting_idx ON public.offers USING btree (fk_listing_id);
CREATE INDEX user_idx ON public.offers USING btree (fk_offeror_id);


-- public.liking definition

-- Drop table

-- DROP TABLE public.liking;

CREATE TABLE public.liking (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	fk_liker_id int4 NOT NULL,
	fk_listing_id int4 NOT NULL,
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT liking_pkey PRIMARY KEY (id),
	CONSTRAINT unit UNIQUE (fk_listing_id, fk_liker_id),
	CONSTRAINT like_listings FOREIGN KEY (fk_listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
	CONSTRAINT likegss FOREIGN KEY (fk_liker_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX likegss ON public.liking USING btree (fk_liker_id);
