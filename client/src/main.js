import {default as App} from './App.svelte';

const app = new App({
	target: document.body,
	props: {
        endpoints: {
            data: "https://api.birchy.dev",
            profiler: "https://coffee.birchy.dev",
            crash: "https://crash.birchy.dev"
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

