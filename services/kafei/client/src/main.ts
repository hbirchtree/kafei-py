import {default as App} from './App.svelte';

const app = new App({
	target: document.body,
	props: {
        endpoints: {
            data: true ? "https://api.birchy.dev" : "http://localhost:8080/api",
            profiler: true ? "https://coffee.birchy.dev" : "http://localhost:8080/api/v2/reportSink",
            crash: true ? "https://crash.birchy.dev" : "http://localhost:8080/api/v2/crash"
        },
        github: {
            link: "https://github.com/hbirchtree", 
            img: "https://avatars3.githubusercontent.com/u/6828070?s=80&v=4"
        },
        repository: {
            link: "https://github.com/hbirchtree/coffeecutie"
        }
	}
});

export default app;
