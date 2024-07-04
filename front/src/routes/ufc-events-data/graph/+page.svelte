<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>

</svelte:head>
<script>
	import { onMount } from "svelte";
    import { Container, Button, Row, Col } from '@sveltestrap/sveltestrap';
    import { dev } from "$app/environment";
    import * as d3 from 'd3';
    // import Highcharts from 'highcharts/highstock';


    let API = "/api/v1/ufc-events-data";
    if(dev)
        API = "http://localhost:10002" + API;

    async function getData() {
        
        try {
            const res = await fetch(API);
            const dataJSON = await res.json();
            console.log(`fetched data: ${dataJSON}`)
            fillChart(dataJSON);
            fillPieChart(dataJSON);
            fillChartd3(dataJSON);
            fillPieChartD3(dataJSON);
        } catch (error) {
            console.log(`error => ${error}`)
        }
    }
   

    async function fillChart(dt) {
        
        const weights = [...new Set(dt.map(item => item.weight_class))];
        const methods =[...new Set(dt.map(item => item.method))];

        const seriesData = methods.map(method => ({
            name: method,
            data: weights.map(weight => {
                const victories = dt.filter(item => item.method === method && item.weight_class === weight).length;
                return victories;
            })
        }));
        console.log(`series -> ${seriesData}`)

        const chart = Highcharts.chart('container', {
            chart: {
                type: 'bar', 
                backgroundColor: '#D3D3D3',
                borderColor: '66CDAA',
                borderWidth: 2

            },
            title: {
                text: 'Victorias de Método x peso',
                style: {
                        fontFamily: 'Monserrat, sans-serif',
                        color: '#36454F',
                        fontWeight: 'bold'
                    }
            },
            xAxis: {
                categories: weights, 
                title: {
                    text: 'Pesos',
                    style: {
                        fontFamily: 'Monserrat, sans-serif',
                        color: '#36454F'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Cantidad de Victorias',
                    style: {
                        fontFamily: 'Monserrat, sans-serif',
                        color: '#36454F'
                    }
                },
                labels: {
                    style: {
                        fontFamily: 'Monserrat, sans-serif',
                        color: '#36454F'
                    }
                }
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    shadow: true
                }
            },
            series: seriesData
        });
        console.log('Fin fill charts')
    }

    async function fillChartd3(dt) {
        const weights = [...new Set(dt.map(item => item.weight_class))];

    // Agrupar por peso y sumar las visualizaciones
        const weightData = weights.map(weight => ({
            weight,
            totalViews: dt.filter(item => item.weight_class === weight)
                          .reduce((acc, curr) => acc + curr.views, 0)
        }));

        const margin = { top: 50, right: 30, bottom: 180, left: 100 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#container-d3")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escala para los pesos (eje x)
        const xScale = d3.scaleBand()
            .domain(weightData.map(d => d.weight))
            .range([0, width])
            .padding(0.1);

    // Escala para las visualizaciones acumuladas (eje y)
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(weightData, d => d.totalViews)])
            .nice()
            .range([height, 0]);

    // Esquema de color ordinal para los pesos
        const color = d3.scaleOrdinal()
            .domain(weightData.map(d => d.weight))
            .range(d3.schemeCategory10);

        svg.append("g")
            .selectAll("rect")
            .data(weightData)
            .join("rect")
            .attr("x", d => xScale(d.weight))
            .attr("y", d => yScale(d.totalViews))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.totalViews))
            .attr("fill", d => color(d.weight))
            .append("title")
            .text(d => `${d.weight}: ${d.totalViews} visualizaciones`);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .attr("dy", "0.15em")
            .attr("dx", "-0.8em");

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(null, "d"));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top)
        .style("text-anchor", "middle")
        .text("Pesos");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Cantidad de Visualizaciones");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Visualizaciones por Peso");

    return svg.node();
}


    async function fillPieChart(dt) {
        console.log('Entro en pie charts');
        const durationMap = new Map();
        dt.forEach(item => {
            // parseo duracion
            const min = item.time.split(':')[0];
            let interval;
            if (min < 1) {
                interval = '-1 min';
            } else if (min >= 1 && min < 2) {
                interval = '1-2 min';
            } else if (min >= 2 && min < 3) {
                interval = '2-3 min';
            } else if (min >= 3 && min < 4) {
                interval = '3-4 min';
            } else {
                interval = '+4 min';
            }
            durationMap.set(interval, (durationMap.get(interval) || 0) + 1);
        });
        console.log('durationMap:');
        for (let [key, value] of durationMap) {
            console.log(`${key}: ${value}`);
        }

        const durationDistributionData = Array.from(durationMap).map(([interval, fights]) => ({
        interval,
        fights
        }));

        const dataPie = durationDistributionData.map(item => ({
            name: item.interval,
            y: item.fights
        }));
        
        console.log('dataPie:');
        console.log(dataPie);

        const charts = Highcharts.chart('pie-container', {
            chart: {
                type: 'pie', 
                backgroundColor: '#D3D3D3',
                borderColor: '66CDAA',
                borderWidth: 2

            },
            title: {
                text: 'Distribución de Peleas x Duración',
                style: {
                        fontFamily: 'Monserrat, sans-serif',
                        color: '#36454F',
                        fontWeight: 'bold'
                    }
            },
            tooltip: {
                pointFormat: '<b>{point.name}:</b> {point.y}'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                }
            },
            series: [{
                name:'Peleas',
                colorByPoint: true,
                data: dataPie
            }]
        });
    }

    async function fillPieChartD3(dt) {
    const durationMap = new Map();
    dt.forEach(item => {
        const min = parseInt(item.time.split(':')[0], 10);
        let interval;
        if (min < 1) {
            interval = '-1 min';
        } else if (min >= 1 && min < 2) {
            interval = '1-2 min';
        } else if (min >= 2 && min < 3) {
            interval = '2-3 min';
        } else if (min >= 3 && min < 4) {
            interval = '3-4 min';
        } else {
            interval = '+4 min';
        }
        durationMap.set(interval, (durationMap.get(interval) || 0) + 1);
    });

    const dataPie = Array.from(durationMap, ([key, value]) => ({ interval: key, fights: value }));

    const width = 450;
    const height = 450;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    console.log('Entro d3');
    const svg = d3.select("#pie-container-d3")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 - margin)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Distribución de peleas x duración");

    const color = d3.scaleOrdinal()
        .domain(dataPie.map(d => d.interval))
        .range(d3.schemeSet2);

    const pie = d3.pie()
        .value(d => d.fights)
        .sort(null);

    const data_ready = pie(dataPie);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.interval))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => `${d.data.interval}: ${d.data.fights}`)
        .attr("transform", function(d) {
            const _d = arc.centroid(d);
            _d[0] *= 1.5;
            _d[1] *= 1.5;
            return `translate(${_d})`;
        })
        .style("text-anchor", "middle")
        .style("font-size", 12);
}
    

    onMount(() => {

        getData();
        

    })
</script>
<Container>
<Row class="justify-content-center">
    <div id="container" style="width:100%; height:400px;"></div>
    <div id="pie-container" style="width:100%; height:400px;"></div>
    <div id="container-d3" style="width:100%; height:400px;"></div>
    <div id="pie-container-d3" style="width:100%; height:400px;"></div>
    <Col xs="auto">Volver -> <Button href="/ufc-events-data" outline size="sm" color="danger">Volver</Button></Col>
</Row>
</Container>

