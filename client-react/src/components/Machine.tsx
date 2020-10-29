import React from 'react';
import { ReportViewState } from '../control/States';
import PropertyGroup from './PropertyGroup';
import PropertyRow from './PropertyRow';
import { BrandIcon } from './BrandIcon';
import Button from './Button';
import { mapArchToReadable } from '../control/Types';

interface Props {
    data: ReportViewState;
    name: string;
    id: number;

    delete?: () => void;
    view?: () => void;
    download?: () => void;
}

interface Display {
    application?: JSX.Element;
    build?: JSX.Element;
    device?: JSX.Element;
    processor?: JSX.Element;
    runtime?: JSX.Element;
    memory?: JSX.Element;
    graphics?: JSX.Element;
}

export default function Machine(props: Props) {
    const machine = props.data.machine;

    let machineInfo: Display = {};

    if(machine)
    {
        const {
            application,
            build,
            device,
            extra,
            processor,
            runtime,
            memory,
        } = machine;
        
        const emitProperty = (prop: string, from: any, name?: string) => {
            if(from[prop])
                return (
                <PropertyRow name={name ? name : prop}>
                    {from[prop]}
                </PropertyRow>);
            else
                return (<></>);
        };

        const args: JSX.Element[] = runtime.arguments ? runtime.arguments.map((arg, i) => {
            return (<PropertyRow key={i} name={`arg[${i}]`}>{arg}</PropertyRow>);
        }) : [];

        const gpuInfo = extra && {
            manufacturer: extra['gl:vendor'],
            model: extra['gl:renderer'],
            driver: extra['gl:driver'],

            api: extra['graphics:library'],

            context: extra['gl:version'],
            shadercontext: extra['glsl:version'],

            sdl2ver: extra['sdl2:version'],
            windowing: extra['window:library'],
        };
        const deviceInfo = device && {
            model: device.machineModel,
            manufacturer: device.machineManufacturer,
        };
        const runtimeInfo = runtime && {
            kernel: runtime.kernel && runtime.kernelVersion && 
                        runtime.kernel + ' ' + runtime.kernelVersion,
            distro: runtime.distro && runtime.distroVersion && 
                        runtime.distro + ' ' + runtime.distroVersion,
        };

        if(!deviceInfo.model)
            deviceInfo.manufacturer = device.name.split(' running ')[0];

        if(!runtimeInfo.distro)
            runtimeInfo.distro = device.name.split(' running ')[1];

        machineInfo = {
            application: application && (
                <PropertyGroup icon='package' title='Application'>
                    {emitProperty('name', application)}
                    {emitProperty('organization', application, 'source')}
                    {emitProperty('version', application)}
                </PropertyGroup>
            ),
            build: build && (
                <PropertyGroup key='build' icon='tool' title='Engine build'>
                    {emitProperty('version', build, 'engine version')}
                    {emitProperty('buildMode', build, 'mode')}
                    <PropertyRow name='compiler'>
                        {build.compiler} {' '}
                        {build.compilerVersion !== '0.0.0'
                            ? build.compilerVersion
                            : ''}
                    </PropertyRow>
                    {build.target ? (
                        <PropertyRow name='target kernel'>
                            <>
                                <BrandIcon basedOn={build.target} />
                                {build.target}
                            </>
                        </PropertyRow>
                    ) : <></>}
                    {emitProperty('architecture', build, 'target architecture')}
                </PropertyGroup>
            ),
            runtime: runtime && (
                <PropertyGroup key='runtime' icon='terminal' title='Runtime Info'>
                    {runtimeInfo.kernel ? (
                        <PropertyRow name='kernel'>
                            <>
                                <BrandIcon basedOn={runtimeInfo.kernel} />
                                {runtimeInfo.kernel}
                            </>
                        </PropertyRow>
                    ) : <></>}
                    {runtimeInfo.distro ? (
                        <PropertyRow name='distro'>
                            <>
                                <BrandIcon basedOn={runtimeInfo.distro} />
                                {runtimeInfo.distro}
                            </>
                        </PropertyRow>
                    ) : <></>}
                    {runtime.architecture ? (
                        <PropertyRow name='architecture'>
                            {mapArchToReadable(runtime.architecture)}
                        </PropertyRow>
                    ) : <></>}
                    {emitProperty('cwd', runtime)}
                    <>
                        {args}
                    </>
                </PropertyGroup>
            ),
            device: device && (
                <PropertyGroup icon='server' title='Device'>
                    <PropertyRow name='device'>
                        <>
                            <BrandIcon basedOn={deviceInfo.manufacturer} />
                            {deviceInfo.manufacturer} {deviceInfo.model}
                        </>
                    </PropertyRow>
                    <PropertyRow name='motherboard'>
                        {device.motherboard} {device.motherboardVersion}
                    </PropertyRow>
                    <PropertyRow name='dpi'>
                        {device.dpi.toFixed(2)}
                    </PropertyRow>
                </PropertyGroup>
            ),
            processor: processor && (
                <PropertyGroup icon='cpu' title='Processor'>
                    <PropertyRow name='model'>
                        <>
                            <BrandIcon basedOn={processor.model} />
                            {processor.model} ({processor.firmware})
                        </>
                    </PropertyRow>
                    <PropertyRow name='layout'>
                        {processor.cores + ''} cores, {processor.threads + ''} threads
                    </PropertyRow>
                    <>
                        {memory && (
                            <PropertyRow name='memory'>
                                {Math.ceil(memory.bank / (1024 * 1024))
                                + 'MB / '
                                + Math.ceil(memory.bank / (1024 * 1024 * 1024))
                                + 'GB'}
                            </PropertyRow>
                        )}
                    </>
                </PropertyGroup>
            ),
            graphics: gpuInfo && gpuInfo.model && (
                <PropertyGroup icon='tv' title='Graphics'>
                    <PropertyRow name='gpu'>
                        <BrandIcon basedOn={gpuInfo.model} />
                        {gpuInfo.model.startsWith(gpuInfo.manufacturer)
                            ? '' 
                            : gpuInfo.manufacturer}
                        {gpuInfo.model}
                    </PropertyRow>
                    {gpuInfo.driver && (
                    <PropertyRow name='gpu driver'>
                        {gpuInfo.driver}
                    </PropertyRow>
                    )}
                    {gpuInfo.api && (
                    <PropertyRow name='gpu api'>
                        <BrandIcon basedOn={gpuInfo.api} />
                        {gpuInfo.api}
                    </PropertyRow>
                    )}
                    {gpuInfo.api && gpuInfo.api.startsWith('OpenGL') &&
                        gpuInfo.context && gpuInfo.shadercontext && (
                            <>
                                <PropertyRow name='OpenGL ver'>
                                    {gpuInfo.context}
                                </PropertyRow>
                                <PropertyRow name='OpenGL SL ver'>
                                    {gpuInfo.shadercontext}
                                </PropertyRow>
                            </>
                        )
                    }
                    {gpuInfo.windowing && (
                    <PropertyRow name='windowing lib'>
                        {gpuInfo.windowing}
                    </PropertyRow>
                    )}
                </PropertyGroup>
            ),
        };
    }

    return (
        <div>
            <PropertyGroup icon='box' title='Basic Information'>
                <PropertyRow name={`${props.name} ID`}>
                    {props.id + ''}
                </PropertyRow>
                <PropertyRow name='submission time'>
                    {props.data.submitTime.toString()}
                </PropertyRow>
            </PropertyGroup>
            <PropertyGroup icon='edit' title='Actions'>
                <>
                {props.delete && (
                    <Button
                        label='Delete'
                        color='red'
                    />
                )}
                {props.view && (
                    <Button
                        label='View'
                        icon='cloud'
                        action={props.view}
                    />
                )}
                {props.download && (
                    <Button
                        label='Download'
                        icon='download'
                        action={props.download}
                    />
                )}
                </>
            </PropertyGroup>
            {machineInfo.application}
            {machineInfo.build}
            {machineInfo.runtime}
            {machineInfo.device}
            {machineInfo.processor}
            {machineInfo.graphics}
        </div>
    );
}
