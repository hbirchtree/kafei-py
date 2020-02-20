<script>
    export let source;
    export let sourceKey;
    export let chartType;
    export let endpoints;
    export let title;

    let canvas;

    async function get_json_data(source) {
        return fetch(endpoints.data + source)
                .then((content) => {
                    return content.json();
                })
                .then((content) => {
                    return content;
                })
                .catch((err) => {console.log(err)});
    }

    async function create_graph() {
        let glabels = [];
        let gcounts = [];
       
        const data = (await get_json_data(source)).data;
        data.forEach(datapoint =>
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
