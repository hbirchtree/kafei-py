ALTER TABLE CRASH.OUTPUTS
    ALTER COLUMN STDOUT SET DATA TYPE OID USING lo_from_bytea(0, STDOUT),
    ALTER COLUMN STDERR SET DATA TYPE OID USING lo_from_bytea(0, STDERR),
    ALTER COLUMN PROFILE_FILE SET DATA TYPE OID USING lo_from_bytea(0, PROFILE_FILE),
    ALTER COLUMN MACHINE_INFO SET DATA TYPE OID USING lo_from_bytea(0, MACHINE_INFO),
    ALTER COLUMN STACKTRACE SET DATA TYPE OID USING lo_from_bytea(0, STACKTRACE);