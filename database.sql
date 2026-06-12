-- SQLINES DEMO ***  Distrib 8.0.19, for Win64 (x86_64)
--
-- SQLINES DEMO ***   Database: snapsell
-- SQLINES DEMO *** -------------------------------------
-- SQLINES DEMO *** 0.19

/* SQLINES DEMO *** CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/* SQLINES DEMO *** CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/* SQLINES DEMO *** COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/* SQLINES DEMO ***  utf8 */;
/* SQLINES DEMO *** TIME_ZONE=@@TIME_ZONE */;
/* SQLINES DEMO *** ZONE='+00:00' */;
/* SQLINES DEMO *** UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/* SQLINES DEMO *** FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/* SQLINES DEMO *** SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/* SQLINES DEMO *** SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- SQLINES DEMO *** or table `liking`
--

DROP TABLE IF EXISTS liking;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
-- SQLINES FOR EVALUATION USE ONLY (14 DAYS)
CREATE TABLE liking (
  id int NOT NULL GENERATED ALWAYS AS identity,
  fk_liker_id int NOT NULL,
  fk_listing_id int NOT NULL,
  created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT unit UNIQUE (fk_listing_id,fk_liker_id),
  CONSTRAINT like_listings FOREIGN KEY (fk_listing_id) REFERENCES listings (id) ON DELETE CASCADE,
  CONSTRAINT likegss FOREIGN KEY (fk_liker_id) REFERENCES users (id) ON DELETE CASCADE
) ;

CREATE INDEX likegss ON liking (fk_liker_id);
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `liking`
--

LOCK TABLES liking WRITE;
/* SQLINES DEMO *** LE `liking` DISABLE KEYS */;
/* SQLINES DEMO *** LE `liking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `listings`
--

DROP TABLE IF EXISTS listings;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE listings (
  id int NOT NULL GENERATED ALWAYS AS identity PRIMARY KEY,
  title varchar(45) NOT NULL,
  description varchar(255) DEFAULT NULL,
  price double precision NOT NULL,
  fk_poster_id int NOT NULL,
  created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "like" int DEFAULT '0',
  picture_url varchar(255) NOT NULL,
  CONSTRAINT fk_poster_id FOREIGN KEY (fk_poster_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ;

CREATE INDEX title ON listings (title);
CREATE INDEX fk_poster_id ON listings (fk_poster_id);
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `listings`
--

LOCK TABLES listings WRITE;
/* SQLINES DEMO *** LE `listings` DISABLE KEYS */;
/* SQLINES DEMO *** LE `listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `offers`
--

DROP TABLE IF EXISTS offers;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE offers (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  offer double precision NOT NULL,
  fk_listing_id int NOT NULL,
  fk_offeror_id int NOT NULL,
  created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  accepted smallint DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT offerlisting FOREIGN KEY (fk_listing_id) REFERENCES listings (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT offeruser FOREIGN KEY (fk_offeror_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ;

CREATE INDEX user_idx ON offers (fk_offeror_id);
CREATE INDEX offerlisting_idx ON offers (fk_listing_id);
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `offers`
--

LOCK TABLES offers WRITE;
/* SQLINES DEMO *** LE `offers` DISABLE KEYS */;
/* SQLINES DEMO *** LE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `users`
--

DROP TABLE IF EXISTS users;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE users (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  username varchar(45) NOT NULL,
  profile_pic_url varchar(255) DEFAULT NULL,
  created_at timestamp(0) DEFAULT (now()),
  password varchar(255) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT username_UNIQUE UNIQUE (username),
) ;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `users`
--

LOCK TABLES users WRITE;
/* SQLINES DEMO *** LE `users` DISABLE KEYS */;
/* SQLINES DEMO *** LE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** r database 'snapsell'
--
/* SQLINES DEMO *** ZONE=@OLD_TIME_ZONE */;

/* SQLINES DEMO *** ODE=@OLD_SQL_MODE */;
/* SQLINES DEMO *** GN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/* SQLINES DEMO *** E_CHECKS=@OLD_UNIQUE_CHECKS */;
/* SQLINES DEMO *** CTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/* SQLINES DEMO *** CTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/* SQLINES DEMO *** TION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/* SQLINES DEMO *** OTES=@OLD_SQL_NOTES */;

-- SQLINES DEMO ***  2020-02-09 17:36:12
