<svelte:head>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</svelte:head>


<script>
    import { onMount } from "svelte";
    import { dev } from '$app/environment';
    import { Container } from "@sveltestrap/sveltestrap";

    let nombresYT = [];
    let vistasYT = [];
    let nombresUFC = [];
    let vistasUFC = [];

    function asignarColor(d) {
 
        if (d.tipo === "video") {
            return "steelblue";
        } else if (d.tipo === "UFC") {
            return "darkorange";
        } else {
            return "gray"; // Color por defecto si el tipo no es reconocido
        }
    }

    async function fetchTop10VideosData() {
        const url = 'https://youtube-search-and-download.p.rapidapi.com/trending?type=mu&hl=en&gl=US';
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '88a523cd96msh3544e0ee37800ebp1845b1jsnf31a7971dadb',
                'x-rapidapi-host': 'youtube-search-and-download.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            if (response.ok) {
                const data = await response.json();
                console.log(`Datos de Youtube${JSON.stringify(data)}`);
                console.log(data.contents.slice(0, 10));
                return data.contents.slice(2, 12); // Obtener los primeros 10 videos
            } else {
                console.error('Error al obtener datos de YouTube:', response.status, response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            return null;
        }
    }

    async function fetchTop10UFCEvents() {
        try {
            let API = 'https://sos2324-jul-nrm-428011.ew.r.appspot.com/api/v1'; 

            const response = await fetch(`${API}/ufc-events-data`);
            if (response.ok) {
                const data = await response.json();
                data.sort((a, b) => b.views - a.views); // Ordenar por vistas en orden descendente
                console.log(`Datos de UFC${JSON.stringify(data)}`);
                return data.slice(0, 10); // Obtener los primeros 10 eventos
            } else {
                console.error('Error al obtener datos de UFC:', response.status, response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            return null;
        }
    }

    function parseViews(viewsString) {
        // Eliminar todas las comas y la palabra "views"
        const numberString = viewsString.replace(/,/g, '').replace(' views', '');
        // Convertir el string resultante a entero
        const viewsInt = parseInt(numberString, 10);
        return viewsInt;
    }

    onMount(async () => {
        const topVideoData = await fetchTop10VideosData();
        const topUFCEvents = await fetchTop10UFCEvents();

        console.log('TopVideoData');
        console.log(JSON.stringify(topVideoData));
        if (topVideoData) {
            topVideoData.forEach(video => {
                nombresYT.push(video.video.title);
                vistasYT.push(parseViews(video.video.viewCountText));
            });
        } else {
            console.error('No se pudo obtener datos de YouTube.');
        }

        if (topUFCEvents) {
            topUFCEvents.forEach(event => {
                nombresUFC.push(`${event.fighter1} vs ${event.fighter2}`);
                vistasUFC.push(event.views);
            });
        } else {
            console.error('No se pudo obtener datos de UFC.');
        }

        if (nombresYT.length > 0 && nombresUFC.length > 0) {
            crearGrafica();
        } else {
            console.error('No hay datos suficientes para crear la gráfica.');
        }
    });
    
    function crearGrafica() {
        
        const dataYT = vistasYT.map((vistas, index) => ({ index: index + 1, vistas: vistas, nombre: nombresYT[index], tipo: 'video' }));
        const dataUFC = vistasUFC.map((vistas, index) => ({ index: index + 1, vistas: vistas, nombre: nombresUFC[index], tipo: 'UFC' }));

        
        dataYT.sort((a,b) => b.vistas - a.vistas);
        
        const allData = [];
        for (let i = 0; i < dataYT.length; i++) {
            allData.push(dataUFC[i]);
            allData.push(dataYT[i]);
        }
        

        const margin = { top: 30, right: 40, bottom: 50, left: 60 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#grafica")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        const x = d3.scaleBand()
            .domain(allData.map(d => `${d.nombre}`)) // Nombres concatenados con índice
            .range([0, width])
            .padding(0.5);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(allData, d => d.vistas)]) // Usa el máximo valor de vistas
            .nice() // Ajusta la escala para mejorar la legibilidad
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".17em")
            .attr("transform", "rotate(-65)") // Rotar para mejor visibilidad
            .text(d => d.split("-")[0]); // Extraer el nombre (primera parte)

        svg.append("g")
            .call(d3.axisLeft(y));
            
        svg.selectAll(".bar")
            .data(allData)
            .enter()
            .append("rect")
            .attr("class", d => d.tipo === 'video' ? "barVideo" : "barUFC")
            .attr("x", d => x(d.nombre))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.vistas))
            .attr("height", d => height - y(d.vistas))
            .attr("fill", asignarColor)
            .on("mouseover", function(event, d) {
                const tooltip = d3.select("#tooltip");
                tooltip.style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .text(d.nombre);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("visibility", "hidden");
            });;


        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text("Comparación de Top 10 Videos de YouTube y Eventos de UFC");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Índice");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Vistas");

        // Leyenda
        svg.append("rect")
            .attr("x", width - 150)
            .attr("y", margin.top)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "steelblue");

        svg.append("text")
            .attr("x", width - 130)
            .attr("y", margin.top + 10)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text("Videos de YouTube");

        svg.append("rect")
            .attr("x", width - 150)
            .attr("y", margin.top + 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "darkorange");

        svg.append("text")
            .attr("x", width - 130)
            .attr("y", margin.top + 30)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text("Eventos de UFC");
    }
</script>

<Container>
    <div id="tooltip" style="position: absolute; visibility: hidden; background-color: white; border: 1px solid black; padding: 5px; font-size: 12px;"></div>
    <div id="grafica" style="padding-top: 50px;"></div>
</Container>
