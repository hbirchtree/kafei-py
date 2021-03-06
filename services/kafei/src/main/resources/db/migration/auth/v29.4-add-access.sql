ALTER TABLE AUTH.TOKENS
    DROP CONSTRAINT USER_NAME_UNIQUENESS,
    ADD CONSTRAINT USER_UTILITY_PKEY PRIMARY KEY (USER_ID, UTILITY);

CREATE TABLE AUTH.ACCESS(
    USER_ID SERIAL NOT NULL,
    UTILITY TEXT NOT NULL,
    SCOPE VARCHAR(20) NOT NULL,
    PERMISSION VARCHAR(2) NOT NULL,
    FOREIGN KEY (USER_ID, UTILITY) REFERENCES AUTH.TOKENS,
    PRIMARY KEY (USER_ID, UTILITY, SCOPE));
