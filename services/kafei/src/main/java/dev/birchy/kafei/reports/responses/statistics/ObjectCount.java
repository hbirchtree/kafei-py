package dev.birchy.kafei.reports.responses.statistics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public final class ObjectCount<T> {
    private T item;
    private long count;

    public void increment() {
        count ++;
    }
}
