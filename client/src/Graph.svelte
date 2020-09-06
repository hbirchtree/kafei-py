<script lang="ts">
    import type { EndpointConfig, RESTMessage } from "./Types";

    export let source: string;
    export let sourceKey: string;
    export let chartType: string;
    export let endpoints: EndpointConfig;
    export let title: string;

    let canvas: HTMLCanvasElement;

    async function get_json_data<T>(source: string) {
        return fetch(endpoints.data + source)
                .then((content) =>  content.json() as RESTMessage<any>)
                .catch((err) => err as RESTMessage<void>);
    }

    async function create_graph() {
        let glabels: string[] = [];
        let gcounts: number[] = [];
       
        const request = await get_json_data<any>(source);

        if(!request.data)
            return;

        request.data.forEach((datapoint: any) =>
        {
            glabels = glabels.concat(datapoint[sourceKey]);
            gcounts = gcounts.concat(datapoint.count);
        });

        const context = canvas.getContext('2d');
        const chart = new Chart(context, {
                type: chartType,
                data: {
                    labels: glabels,
                    datasets: [{
                        label: 'Count', 
                        data: gcounts, 
                        backgroundColor: 'rgba(50, 50, 224, 0.5)'
                    }]
                }
            });
    }

    create_graph();
</script>

<style>
    .mobile {
        display: none !important;
    }

    @media screen and (max-width: 768px) {
        .desktop {
            display: none;
        }
        .mobile {
            display: flex !important;
        }
    }
</style>

<div class="ui segment inverted raised">
    <h3 class="ui header inverted">{title}</h3>
    <div class="ui segment fluid desktop">
        <canvas bind:this={canvas}></canvas>
    </div>
    <p class="mobile">
        (Sorry, these graphs don't really work on mobile)
    </p>
</div>
