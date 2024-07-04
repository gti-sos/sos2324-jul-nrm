<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { Container } from "@sveltestrap/sveltestrap";
  import { dev } from "$app/environment";

  async function fetchCryptoData() {
    try {
      let API = 'https://sos2324-jul-nrm-428011.ew.r.appspot.com/api/v1'; 
            if (dev) API = 'http://localhost:10002/api/v1';
      const response = await fetch(`${API}/proxyCrypto`);
      if (response.ok) {
        return response.json();
      } else {
        console.error(`Error al obtener datos de la API de criptomonedas: ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos de la API:', error);
      return null;
    }
  }

  const symbols = [];
  const prices = [];
  const names = [];
  

  onMount(async () => {

    const data = await fetchCryptoData();

    if (data && data.data && data.data.coins) {
        // Filtrar las criptomonedas para excluir BTC y WBTC
        const filteredCoins = data.data.coins.filter(coin => coin.symbol !== 'BTC' && coin.symbol !== 'WBTC');
        // Ordenar las criptomonedas por precio de mayor a menor
        const sortedCoins = filteredCoins.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        const top20Coins = sortedCoins.slice(0, 20); // Obtener las 20 criptomonedas con mayor precio
        const top5Coins = sortedCoins.slice(0, 5); // Obtener las 5 criptomonedas con mayor precio para la gráfica de línea

        top20Coins.forEach(coin => {
            symbols.push(coin.symbol);
            prices.push(parseFloat(coin.price));
            names.push(coin.name);
        });

      

      crearGrafica();
      
    } else {
      console.error('No se pudieron obtener los datos de las criptomonedas.');
    }
  });

  function crearGrafica() {
    const ctx = document.getElementById('graficaPrecios').getContext('2d');
    new Chart(ctx, {
      type: 'bar', // Cambiar a 'bar' con configuración horizontal en las opciones
      data: {
        labels: symbols,
        datasets: [{
          label: 'Precio de las Criptomonedas',
          data: prices,
          backgroundColor: 'blue' // Color de las barras
        }]
      },
      options: {
        indexAxis: 'y', // Establecer el índice del eje a 'y' para una gráfica horizontal
        responsive: true,
        maintainAspectRatio: false, // Para permitir ajustar manualmente las dimensiones del canvas
        plugins: {
            title: {
            display: true,
            text: 'Visualización precio de las 20 cryptomonedas más caras',
            font: {
              size: 18
            }
          },
          subtitle: {
            display: true,
            text: 'BTC y WBTC excluidos',
            font: {
              size: 14
            }
        },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${names[tooltipItem.dataIndex]}: $${tooltipItem.formattedValue}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Precios (USD)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Símbolos'
            },
            ticks: {
              autoSkip: false, // Desactivar el auto-skip para mostrar todos los nombres
              maxRotation: 0, // Evitar la rotación de los nombres
              minRotation: 0,
              padding: 10 // Añadir espacio extra entre los nombres
            }
          }
        }
      }
    });
  }


</script>

<Container>

    


        <canvas id="graficaPrecios" width="970px" height="420px"></canvas> 
    
  
</Container>