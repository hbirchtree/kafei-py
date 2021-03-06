ALTER TABLE REPORTS.RUN
    ADD LIBC_VERSION VARCHAR(40)
    ;

CREATE TABLE REPORTS.BUILD (
    BUILD_ID SERIAL NOT NULL,
    VERSION VARCHAR(40) NOT NULL,
    COMPILER VARCHAR(20) NOT NULL,
    COMPILER_VERSION VARCHAR(20) DEFAULT '0.0.0',
    ARCHITECTURE VARCHAR(20) NOT NULL,

    BUILD_MODE VARCHAR(20) DEFAULT 'DEBUG',

    LIBC_RUNTIME VARCHAR(40) DEFAULT '<unknown>',
    LIBC_VERSION VARCHAR(40) DEFAULT '0',

    PRIMARY KEY (VERSION, COMPILER, COMPILER_VERSION, ARCHITECTURE, BUILD_MODE, LIBC_RUNTIME, LIBC_VERSION),

    TARGET VARCHAR(20),

    ANDROID_TARGET VARCHAR(40),
    ANDROID_SDK VARCHAR(40),

    MAC_TARGET VARCHAR(40),
    MAC_MIN_TARGET VARCHAR(40),

    IOS_TARGET VARCHAR(40),
    IOS_MIN_TARGET VARCHAR(40),

    WINDOWS_TARGET VARCHAR(40),
    WINDOWS_WDK VARCHAR(40),
    WINDOWS_SERVER VARCHAR(40)
);

ALTER TABLE REPORTS.BUILD
    ADD CONSTRAINT BUILD_ID_UNIQUE UNIQUE (BUILD_ID);

CREATE TABLE REPORTS.RUN_BUILD (
    RUN_ID INT REFERENCES REPORTS.RUN(RUN_ID),
    BUILD_ID INT REFERENCES REPORTS.BUILD(BUILD_ID)
);

INSERT INTO REPORTS.BUILD
    SELECT
            0,
            BUILD_VERSION AS VERSION,
            COMPILER_NAME AS COMPILER,
            VERSION AS COMPILER_VERSION,
            ARCH_NAME AS ARCHITECTURE,
            COALESCE(BUILD_MODE, 'DEBUG'),
            '<unknown>' AS LIBC_RUNTIME,
            '0' AS LIBC_VERSION,
            TARGET
        FROM REPORTS.RUN
            INNER JOIN REPORTS.RUN_COMPILER USING (RUN_ID)
            INNER JOIN REPORTS.RUN_ARCH USING (RUN_ID)
    ON CONFLICT DO NOTHING;

INSERT INTO REPORTS.RUN_BUILD
    SELECT
            RUN.RUN_ID,
            BUILD_ID
        FROM REPORTS.RUN
            INNER JOIN REPORTS.RUN_COMPILER USING (RUN_ID)
            INNER JOIN REPORTS.RUN_ARCH USING (RUN_ID)
            INNER JOIN REPORTS.RUN_BUILD USING (RUN_ID)
            INNER JOIN REPORTS.BUILD USING (BUILD_ID)
        WHERE
            BUILD_VERSION = BUILD.VERSION AND
            COMPILER_NAME = BUILD.COMPILER AND
            VERSION = BUILD.COMPILER_VERSION AND
            ARCH_NAME = BUILD.ARCHITECTURE AND
            BUILD_MODE = BUILD.BUILD_MODE AND
            TARGET = BUILD.TARGET
    ;

--INSERT INTO REPORTS.BUILD
--    (
--        VERSION,
--        COMPILER,
--        COMPILER_VERSION,
--        ARCHITECTURE,
--        BUILD_MODE,
--        LIBC_RUNTIME,
--        LIBC_VERSION,
--        TARGET
--    )
--
--    SELECT
--            COALESCE(CONVERT_FROM(REPORT, 'UTF8')::JSON->'runtime'->>'version', '0.0'),
--            COALESCE(CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'compiler', 'GCC'),
--            COALESCE(CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'compilerVersion', '0.0.0'),
--            COALESCE(CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'architecture', '<unknown>'),
--            COALESCE(CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'buildMode', 'DEBUG'),
--            '<unknown>',
--            '0',
--            COALESCE(CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'target', '<unknown>')
--        FROM REPORTS.RUN_REPORT
--    ON CONFLICT DO NOTHING
--    ;

INSERT INTO REPORTS.RUN_BUILD
    SELECT
            RUN_REPORT.RUN_ID,
            BUILD.BUILD_ID
        FROM REPORTS.RUN_REPORT
            LEFT JOIN REPORTS.BUILD
        ON
            CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'version' = VERSION AND
            CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'buildMode' = BUILD_MODE AND
            CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'compiler' = COMPILER AND
            CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'compilerVersion' = COMPILER_VERSION AND
            CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'architecture' = ARCHITECTURE AND
            CONVERT_FROM(REPORT, 'UTF8')::JSON->'build'->>'target' = TARGET
    ;

ALTER TABLE REPORTS.RUN
    DROP BUILD_VERSION,
    DROP TARGET,
    DROP BUILD_MODE
    ;

DROP TABLE REPORTS.RUN_COMPILER;
DROP TABLE REPORTS.COMPILER;

DROP TABLE REPORTS.RUN_ARCH;
DROP TABLE REPORTS.ARCHITECTURE;
