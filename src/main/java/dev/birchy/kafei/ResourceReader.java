package dev.birchy.kafei;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public final class ResourceReader {
    private ResourceReader() {}

    public static String readResource(final String file) throws IOException {
        ClassLoader ldr = ResourceReader.class.getClassLoader();

        BufferedReader rdr = new BufferedReader(
                new InputStreamReader(ldr.getResourceAsStream(file)));

        StringBuilder out = new StringBuilder();

        rdr.lines().forEach(out::append);

        return out.toString();
    }
}
