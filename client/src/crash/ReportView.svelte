<script>
    import Group from './Group.svelte';
    import Row from './Row.svelte';

    export let report;
</script>

<Group icon="box" headerName="Application">
    <Row name="name" content={report.application.name} />
    <Row name="writer" content={report.application.organization} />
    <Row name="version" content={report.application.version} />
</Group>
<Group icon="cog" headerName="Build">
    <Row name="mode" content={report.build.buildMode} />
    <Row name="version" content={report.build.version} />
    <Row name="compiled for" content="TODO" />
    <Row name="compiler" content={report.build.compiler} />
    <Row name="architecture" content={report.build.architecture} />
</Group>
<Group icon="microchip" headerName="System">
    <Row name="system" content={report.runtime.system} />
    <Row name="architecture" content={report.runtime.system.split('(')[1].split(')')[0]} />
    <Row name="device" content={report.device.name.split(' running ')[0]} />
</Group>
<Group icon="desktop" headerName="Graphics">
    {#if report.extra["window:library"]}
        <Row name="windowing library" content={report.extra["window:library"]} />
    {/if}
    {#if report.extra["gl:renderer"]}
        <Row name="renderer" content={report.extra["gl:renderer"]} />
    {/if}
    {#if report.extra["gl:version"]}
        <Row name="version" content="OpenGL {report.extra["gl:version"]}" />
    {/if}
    {#if report.extra["gl:glsl_version"]}
        <Row name="shader version" content="GLSL {report.extra["gl:glsl_version"]}" />
    {/if}
    {#if report.extra["gl:driver"] && report.extra["gl:driver"].length > 0}
        <Row name="graphics driver" content={report.extra["gl:driver"]} />
    {/if}
</Group>

