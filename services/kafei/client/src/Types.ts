export type Color =
    'green'
    | 'red'
    | 'blue'
    | 'white'
    | 'black'
    | 'yellow'
    ;

export type HTTPMethod =
      'GET'
    | 'POST'
    | 'DELETE'
    ;

export type HwVendorIcon =
    | 'nvidia'
    | 'qualcomm'
    | 'amd'
    | 'intel'
    | 'google'
    | 'apple'
    | 'samsung'
    ;
export type ConsoleIcon =
    | 'nintendogamecube'
    | 'wii'
    | 'wiiu'
    ;
export type OSIcon = 
    | 'linux'
    | 'windows'
    | 'android'
    | 'macos'
    | 'webassembly'
    ;
export type BrowserIcon =
    | 'microsoftedge'
    | 'googlechrome'
    | 'mozillafirefox'
    | 'safari'
    | 'internetexplorer'
    ;
export type VendorIcon = HwVendorIcon | ConsoleIcon | OSIcon | BrowserIcon;

export type GithubProfile = {
    link: string;
    img: string;
};

export type GithubRepository = {
    link: string;
};

export type GithubRelease = {
    release?: {
        html_url: string;
        tag_name: string;
    };
    repository?: {
        /* Repository metadata */
        name: string;
        created_at: string;
        description: string;
        full_name: string;
        language: string;
        license?: {
            key: string;
            name: string;
            node_id: string;
            spdx_id: string;
            url: string;
        }

        has_issues: boolean;
        open_issues: number;

        has_downloads: boolean;


        has_projects: boolean;

        /* Associated resources */
        archive_url: string;
        clone_url: string;
        commits_url: string;

        languages_url: string;
        downloads_url: string;

        /* Git metadata */
        default_branch: string;
    };
};

export type GithubCommit = {
    head_commit?: {
        timestamp: string;
        id: string;
        message: string;
    };
    ref: string;
};

export type EndpointConfig = {
    data: string;
    profiler: string;
    crash: string;
};

export type NavLink = {
    name?: string;
    target?: string;
    icon?: string;
};

export type MenuLink = {
    text: string;
    icon: string;
    color: Color;
    action: () => Promise<void>;
};

export type LinkData = {
    uri: string;
    method?: HTTPMethod;
};

export type RESTMessage<T> = {
    data?: T;
    message?: string;
    code?: number;
    links?: LinkData[];
};

export type MachineData = {
    application: {
        name: string;
        organization: string;
        version: number;
    };
    build: {
        version: string;
        architecture: string;
        buildMode?: string;
        target?: string;
        compiler?: string;
        compilerVersion?: string;
    };
    device: {
        type: number;
        name: string;

        machineManufacturer?: string;
        machineModel?: string;
    };
    runtime: {
        system: string;
        architecture?: string;

        distro?: string;
        distroVersion?: string;

        kernel?: string;
        kernelVersion?: string;
    };
    processor: {
        model: string;
        cores: number;
        threads: number;
    };
    memory?: {
        bank: number;
    };
    extra: Map<string, string>;
};

export type CrashReportBase = {
    submitTime: Date;
};

export type CrashData = CrashReportBase & {
    crashId: number;
    exitCode: number;
};

export type ReportData = CrashReportBase & {
    reportId: number;
    system: string;
    buildVersion: string;
};

export type Stackframe = {
    frame: string;
    ip: string;
};

export let vendorToIcon = (source: string): VendorIcon => {
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
    return undefined;
};