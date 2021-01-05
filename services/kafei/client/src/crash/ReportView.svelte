<script lang="ts">
    import Group from './Group.svelte';
    import Row from './Row.svelte';
    import Icon from '../Icon.svelte';
    import BrandIcon from '../BrandIcon.svelte';
    import {onMount} from 'svelte';
    import type { CrashReportBase, MachineData, ReportData } from '../Types';
	import { vendorToIcon } from '../Types.ts';
    import type { ReportViewState } from './States';
    
    onMount(() => {
        feather.replace();
    });

    export let state: ReportViewState;

    const {
        build, 
        application, 
        runtime,
        device, 
        extra, 
        memory,
        processor } = state.machine;

    let summary: CrashReportBase = state.base;
</script>

<Group icon="box" headerName="General Info">
    <Row
        name="submission time"
        content="{new Date(summary.submitTime).toGMTString()}"
    />
</Group>
<Group icon="package" headerName="Application">
    <Row name="name" content={application.name} />
    <Row name="writer" content={application.organization} />
    <Row name="version" content={application.version} />
</Group>
<Group icon="tool" headerName="Build">
    <Row name="mode" content={build.buildMode} />
    <Row name="version" content={build.version} />
    {#if build.target}
        <Row name="compiled for" content={build.target} />
    {/if}
    <Row name="compiler" content="{build.compiler} {build.compilerVersion ? build.compilerVersion : ""}" />
    <Row name="architecture" content={build.architecture} />
</Group>
<Group headerName="System"
       icon="{device.type == 4 ? "smartphone" :
                device.type == 2 ? "cpu" :
                device.type == 5 ? "tablet" :
                device.type == 8 ? "hard-drive" :
                "server"}">
    {#if runtime.distro && runtime.distroVersion}
        <Row name="system" content="">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={vendorToIcon(runtime.distro)} />
                <span style="margin-left: 1em;">{runtime.distro} {runtime.distroVersion}</span>
            </p>
        </Row>
    {:else}
        <Row name="system" content={runtime.system.split(' (')[0]} />
    {/if}
    <Row name="architecture" content={runtime.architecture ? runtime.architecture : runtime.system.split('(')[1].split(')')[0]} />
    {#if device.machineManufacturer && device.machineModel}
        <Row name="device">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={vendorToIcon(device.machineManufacturer)} />
                <span style="margin-left: 1em;">{device.machineManufacturer} {device.machineModel}</span>
            </p>
        </Row>
    {:else}
        <Row name="device">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={vendorToIcon(device.name)} />
                <span style="margin-left: 1em;">{device.name.split(' running ')[0]}</span>
            </p>
        </Row>
    {/if}
    {#if runtime.kernel && runtime.kernelVersion}
        <Row name="kernel" content="{runtime.kernel} {runtime.kernelVersion}" />
    {/if}
</Group>
<Group icon="cpu" headerName="Processor">
    <Row name="model" content={processor.model}>
        <p class="flex-centered" slot="content">
            <BrandIcon icon={vendorToIcon(processor.model)} />
            <span style="margin-left: 1em;">{processor.model}</span>
        </p>
    </Row>
    <Row name="cores" content={processor.cores} />
    <Row name="threads" content={processor.threads} />
    {#if memory}
        <Row name="memory" content="{Math.ceil(memory.bank / (1024 * 1024 * 1024))} GB ({memory.bank} B)" />
    {/if}
</Group>
{#if extra["window:library"]}
<Group icon="tv" headerName="Graphics">
    {#if extra["window:library"]}
        <Row name="windowing library" content={extra["window:library"]} />
    {/if}
    {#if extra["gl:renderer"]}
        <Row name="renderer">
            <p class="flex-centered" slot="content">
                <BrandIcon icon={ extra["gl:vender"] 
                                                    ? vendorToIcon(extra["gl:vendor"]) 
                                                    : vendorToIcon(extra["gl:renderer"]) } />
                <span style="margin-left: 1em;">{extra["gl:renderer"]}</span>
            </p>
        </Row>
    {/if}
    {#if extra["gl:version"]}
        <Row name="version" content="{extra["gl:api"] ? extra["gl:api"] : "OpenGL"} {extra["gl:version"]}" />
    {/if}
    {#if extra["gl:glsl_version"]}
        <Row name="shader version" content="GLSL {extra["gl:glsl_version"]}" />
    {/if}
    {#if extra["gl:driver"] && extra["gl:driver"].length > 0}
        <Row name="graphics driver" content={extra["gl:driver"]} />
    {/if}
</Group>
{/if}
