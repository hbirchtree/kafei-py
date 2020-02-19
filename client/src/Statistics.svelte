<script>
    import Code from './Code.svelte';

    export let endpoints;
</script>

<p>
    These numbers are collected from devices sending runtime reports. This is made possible by embedding a profiler in the application, activated by the following arguments/variables:
</p>

<Code>
    COFFEE_REPORT_URL={endpoints.profiler} &lt;program&gt;
</Code>

<p>
    For Android, it may be invoked by starting it with extra strings:
</p>

<Code>
    adb shell am start -n &lt;com.package/.Activity&gt; --es COFFEE_REPORT_URL {endpoints.profiler}
</Code>

