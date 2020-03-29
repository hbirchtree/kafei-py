<script>
    import Group from './Group.svelte';
    import Row from './Row.svelte';

    export let report;
    export let summary;
</script>

<Group icon="box" headerName="General Info">
    <Row name="submission time" content="{new Date(summary.submitTime).toGMTString()}"/>
</Group>
<Group icon="box" headerName="Application">
    <Row name="name" content={report.application.name} />
    <Row name="writer" content={report.application.organization} />
    <Row name="version" content={report.application.version} />
</Group>
<Group icon="cog" headerName="Build">
    <Row name="mode" content={report.build.buildMode} />
    <Row name="version" content={report.build.version} />
    {#if report.build.target}
        <Row name="compiled for" content={report.build.target} />
    {/if}
    <Row name="compiler" content="{report.build.compiler} {report.build.compilerVersion ? report.build.compilerVersion : ""}" />
    <Row name="architecture" content={report.build.architecture} />
</Group>
<Group headerName="System"
       icon="{report.device.type == 4 ? "mobile alternate" : 
                report.device.type == 3 ? "laptop" :
                report.device.type == 2 ? "microchip" :
                report.device.type == 5 ? "tablet alternate" :
                report.device.type == 8 ? "hdd" :
                "server"}">
    {#if report.runtime.distro && report.runtime.distroVersion}
        <Row name="system" content="">
            <p slot="content">
                <i class="circular inverted blue icon {report.runtime.distro == "Android" ? "android" :
                    report.runtime.distro == "macOS" ? "apple" :
                    report.runtime.distro == "iOS" ? "apple" :
                    report.runtime.kernel == "Linux" ? "linux" :
                    report.runtime.kernel == "Windows" ? "windows" : "hdd"}"></i>
                {report.runtime.distro} {report.runtime.distroVersion}
            </p>
        </Row>
    {:else}
        <Row name="system" content={report.runtime.system.split(' (')[0]} />
    {/if}
    <Row name="architecture" content={report.runtime.architecture ? report.runtime.architecture : report.runtime.system.split('(')[1].split(')')[0]} />
    <Row name="device" content={report.device.name.split(' running ')[0]} />
    {#if report.runtime.kernel && report.runtime.kernelVersion}
        <Row name="kernel" content="{report.runtime.kernel} {report.runtime.kernelVersion}" />
    {/if}
</Group>
<Group icon="microchip" headerName="Processor">
    <Row name="model" content={report.processor.model} />
    <Row name="cores" content={report.processor.cores} />
    <Row name="threads" content={report.processor.threads} />
    {#if report.memory}
        <Row name="memory" content="{Math.ceil(report.memory.bank / (1024 * 1024 * 1024))} GB ({report.memory.bank} B)" />
    {/if}
</Group>
{#if report.extra["window:library"]}
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
{/if}

