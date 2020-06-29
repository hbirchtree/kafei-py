<script>
    import Group from './Group.svelte';
    import Row from './Row.svelte';
    import Icon from '../Icon.svelte';
    import BrandIcon from '../BrandIcon.svelte';
    import {onMount} from 'svelte';
    
    onMount(() => {
        feather.replace();
    });

    export let report;
    export let summary;

    let vendorToIcon = (source) => {
        source = source.toLowerCase();

        // Hardware manufacturers
        if(source.substr(0, 6) == "nvidia")
            return "nvidia";
        if(source.substr(0, 8) == "qualcomm")
            return "qualcomm";
        if(source.substr(0, 3) == "ati" || source.substr(0, 3) == "amd")
            return "amd";
        if(source.substr(0, 5) == "intel")
            return "intel";
        if(source.substr(0, 6) == "google")
            return "google";
        if(source.substr(0, 5) == "apple" || source.substr(0, 5) == "macos" || source.substr(0, 3) == "ios")
            return "apple";
        if(source.substr(0, 7) == "samsung" || source.substr(0, 4) == "smdk")
            return "samsung";

        // Operating systems
        if(source.substr(0, 5) == "linux")
            return "linux";
        if(source.substr(0, 7) == "windows")
            return "windows";
        if(source.substr(0, 7) == "android")
            return "android";

        // Consoles
        if(source.indexOf("gamecube") != -1)
            return "nintendogamecube";
        if(source.indexOf("wii u") != -1)
            return "wiiu";
        if(source.indexOf("wii") != -1)
            return "wii";

        // WebAsm
        if(source.indexOf("emscripten") != -1 || source.indexOf("webasm") != -1)
            return "webassembly";

        // Browsers
        if(source.indexOf("edge") != -1)
            return "microsoftedge";
        if(source.indexOf("chrom") != -1)
            return "googlechrome";
        if(source.indexOf("firefox") != -1)
            return "mozillafirefox";
        if(source.indexOf("safari") != -1)
            return "safari";
        if(source.indexOf("msie") != -1 || source.indexOf("trident") != -1)
        {
            console.log("What? How did you do that?");
            return "internetexplorer";
        }
        return "";
    };
</script>

<Group icon="box" headerName="General Info">
    <Row name="submission time" content="{new Date(summary.submitTime).toGMTString()}"/>
</Group>
<Group icon="package" headerName="Application">
    <Row name="name" content={report.application.name} />
    <Row name="writer" content={report.application.organization} />
    <Row name="version" content={report.application.version} />
</Group>
<Group icon="tool" headerName="Build">
    <Row name="mode" content={report.build.buildMode} />
    <Row name="version" content={report.build.version} />
    {#if report.build.target}
        <Row name="compiled for" content={report.build.target} />
    {/if}
    <Row name="compiler" content="{report.build.compiler} {report.build.compilerVersion ? report.build.compilerVersion : ""}" />
    <Row name="architecture" content={report.build.architecture} />
</Group>
<Group headerName="System"
       icon="{report.device.type == 4 ? "smartphone" :
                report.device.type == 2 ? "cpu" :
                report.device.type == 5 ? "tablet" :
                report.device.type == 8 ? "hard-drive" :
                "server"}">
    {#if report.runtime.distro && report.runtime.distroVersion}
        <Row name="system" content="">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={vendorToIcon(report.runtime.distro)} />
                <span style="margin-left: 1em;">{report.runtime.distro} {report.runtime.distroVersion}</span>
            </p>
        </Row>
    {:else}
        <Row name="system" content={report.runtime.system.split(' (')[0]} />
    {/if}
    <Row name="architecture" content={report.runtime.architecture ? report.runtime.architecture : report.runtime.system.split('(')[1].split(')')[0]} />
    {#if report.device.machineManufacturer && report.device.machineModel}
        <Row name="device">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={vendorToIcon(report.device.machineManufacturer)} />
                <span style="margin-left: 1em;">{report.device.machineManufacturer} {report.device.machineModel}</span>
            </p>
        </Row>
    {:else}
        <Row name="device">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={vendorToIcon(report.device.name)} />
                <span style="margin-left: 1em;">{report.device.name.split(' running ')[0]}</span>
            </p>
        </Row>
    {/if}
    {#if report.runtime.kernel && report.runtime.kernelVersion}
        <Row name="kernel" content="{report.runtime.kernel} {report.runtime.kernelVersion}" />
    {/if}
</Group>
<Group icon="cpu" headerName="Processor">
    <Row name="model" content={report.processor.model}>
        <p class="flex-centered" slot="content">
            <BrandIcon icon={vendorToIcon(report.processor.model)} />
            <span style="margin-left: 1em;">{report.processor.model}</span>
        </p>
    </Row>
    <Row name="cores" content={report.processor.cores} />
    <Row name="threads" content={report.processor.threads} />
    {#if report.memory}
        <Row name="memory" content="{Math.ceil(report.memory.bank / (1024 * 1024 * 1024))} GB ({report.memory.bank} B)" />
    {/if}
</Group>
{#if report.extra["window:library"]}
<Group icon="tv" headerName="Graphics">
    {#if report.extra["window:library"]}
        <Row name="windowing library" content={report.extra["window:library"]} />
    {/if}
    {#if report.extra["gl:renderer"]}
        <Row name="renderer">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={ report.extra["gl:vender"] 
                                                    ? vendorToIcon(report.extra["gl:vendor"]) 
                                                    : vendorToIcon(report.extra["gl:renderer"]) } />
                <span style="margin-left: 1em;">{report.extra["gl:renderer"]}</span>
            </p>
        </Row>
    {/if}
    {#if report.extra["gl:version"]}
        <Row name="version" content="{report.extra["gl:api"] ? report.extra["gl:api"] : "OpenGL"} {report.extra["gl:version"]}" />
    {/if}
    {#if report.extra["gl:glsl_version"]}
        <Row name="shader version" content="GLSL {report.extra["gl:glsl_version"]}" />
    {/if}
    {#if report.extra["gl:driver"] && report.extra["gl:driver"].length > 0}
        <Row name="graphics driver" content={report.extra["gl:driver"]} />
    {/if}
</Group>
{/if}

