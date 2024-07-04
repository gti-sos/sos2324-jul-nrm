<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from '$app/environment';
    import { Container } from "@sveltestrap/sveltestrap";

    let nombres = [];
    let puntos = [];
    let torneosJugados = [];

    async function fetchTopPlayersData() {
        
        try {
            let API = 'https://sos2324-jul-nrm-428011.ew.r.appspot.com/api/v1'; 
            if (dev) API = 'http://localhost:10002/api/v1'; 

            const response = await fetch(`${API}/proxyTennis`);

            if (response.ok) {
                const data = await response.json();
                // console.log(data);
                const rankings = data.rankings;
                // console.log('Rankings ->'+rankings);  
                return rankings.slice(0, 20); // Obtener los primeros 10 jugadores
                
            } else {
                console.error('Error al obtener los datos de los jugadores:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            return null;
        }
    }

    onMount(async () => {
        const topPlayersData = await fetchTopPlayersData();
        if (topPlayersData) {
            // Procesar los datos obtenidos
            // console.log(topPlayersData);
            topPlayersData.forEach(player => {
                nombres.push(player.rowName);
                puntos.push(player.points);
                torneosJugados.push(player.tournamentsPlayed);
            });

            crearGrafica();
        } else {
            console.error('No se pudieron obtener los datos de los jugadores.');
        }
    });

    function crearGrafica() {
    const ctx = document.getElementById('graficaPuntos').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Torneos Jugados vs Puntos',
                data: puntos.map((punto, index) => ({ x: punto, y: torneosJugados[index], label: nombres[index] })),
                backgroundColor: 'red' // Color de los puntos
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Puntos'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Torneos Jugados'
                    }
                }
            },
            plugins: {
              title: {
                    display: true,
                    text: 'Top 20 ATP Players',
                    font: {
                        size: 24,
                        weight: 'bold'
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Puntos x Torneos Jugados',
                    font: {
                        size: 16
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Puntos'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Torneos Jugados'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = context.dataset.data[context.dataIndex];
                            const playerName = dataPoint.label;
                            return playerName ? playerName : '';
                        }
                    }
                }
            }
        }
    });
}
</script>

<Container>
    <canvas id="graficaPuntos" width="970px" height="420px"></canvas>
</Container>