<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import { page } from '$app/stores';
    import { Button, Container, Row, Col, ListGroup, ListGroupItem, NavLink, Alert, Pagination, PaginationItem, PaginationLink } from '@sveltestrap/sveltestrap';
  
    let API = "/api/v1/ufc-events-data";
  
    if (dev)
      API = "http://localhost:10002" + API;
  
    let events = [];
    let errorMsg = "";
    let successMsg="";
    
    let offset = 0;
    let limit = 10;
    
    let listaPeleas = [];
    let cantPeleas = 0;

    let allFilters = ['location','fighter1','fighter2','fighter_1_kd','fighter_2_kd','fighter_1_str','fighter_2_str','fighter_1_td','fighter_2_td','fighter_1_sub','fighter_2_sub','weight_class','method','round','time','event_name','date','winner','views'];
    let numericFilters = ['fighter_1_kd','fighter_2_kd','fighter_1_str','fighter_2_str','fighter_1_td','fighter_2_td','fighter_1_sub','fighter_2_sub','round','views']
    let filterParams = {};

    onMount(getEvents);

    function clearSuccessMsg() {
        successMsg = "";
    }

    function clearErrorMsg() {
        errorMsg = "";
    }

    function checkError(error) {
      if (error === 409)
        errorMsg = "Estás intentando introducir datos que ya están en la base de datos.";
      else if (error === 400)
        errorMsg = "Mala petición. Has introducido valores erróneos.";
      else if (error === 201)
        successMsg = "Contenido añadido con éxito.";
      else
        errorMsg = "";

      if (errorMsg !== "") {
          setTimeout(clearErrorMsg, 3000);
      } else if (successMsg !== "") {
          setTimeout(clearSuccessMsg, 3000);
      }
    }
  
    async function loadInitialData() {
      try {
        let response = await fetch(API + "/loadInitialData", { method: "GET" });
        if (response.ok) {
          console.log(`Éxito cargando eventos de UFC.`);
          getEvents();
          checkError(response.status);
        } else {
          checkError(response.status);
        }
      } catch (error) {
        checkError(error);
      }
    }
  
    async function getEvents() {
      successMsg, errorMsg = "", "";
      listaPeleas = []
      
      if($page.url.searchParams.get('offset'))
            offset=$page.url.searchParams.get('offset');

      if (!offset)
        offset = 0;
      console.log("offset: "+offset);
      try {
        let cantidad = await fetch(API, { 
          method: "GET" 
        });
        let cant = await cantidad.json();
        cantPeleas = cant.length;
        console.log("peleas:"+cantPeleas + " y offset "+offset);
        console.log(Math.ceil(cantPeleas / 10));
        for (let i = 1; i <= Math.ceil(cantPeleas / 10); i++) {
            listaPeleas.push(i);
        };
        console.log(listaPeleas)
        console.log('off-> '+offset)
        console.log(limit)
        let response = await fetch(`${API}?offset=${offset}limit=${limit}}`, { 
          method: "GET" 
        });
        let data = await response.json();
        console.log('data-> '+data)
        events = data.slice(0,limit); // Update events with fetched data
        console.log('events-> '+events);
        console.log(response.status);
        // checkError(response.status);            
        if($page.url.searchParams.get('offset')){
          window.location.reload;
        } else if (response.status != 200) {
          errorMsg = "No se ha encontrado la colección."
        } 
      } catch (error) {
        checkError(error);
      }
    }
 
    async function deleteEvent(fighter1, fighter2, date) {
        try {
        // Encode fighter names and date for URL safety
            const encodedFighter1 = encodeURIComponent(fighter1);
            const encodedFighter2 = encodeURIComponent(fighter2);
            const encodedDate = encodeURIComponent(date);

            const response = await fetch(`${API}/stats/${encodedFighter1}/${encodedFighter2}/${encodedDate}`, {
                method: "DELETE",
            });

            console.log("Response status:", response.status);

            if (response.ok) {
                getEvents(); // Refresh the event list after successful deletion
                successMsg = "Elemento eliminado con éxito"
            } else {
                checkError(response.status);
            }
        } catch (error) {
            checkError(error);
        }
    }

  
    async function deleteAllEvents() {
      try {
        let response = await fetch(API, { method: "DELETE" });
        console.log(`Deleted`);
        if (response.ok) {
          getEvents();
          checkError(response.status);
          successMsg = "Colección eliminada con éxito"
        } else {
          checkError(response.status);
        }
      } catch (error) {
        checkError(error);
      }
    }

    function siguientePagina(ofs) {
        let sigPag = parseInt(ofs) + 10;
        paginar(sigPag);
        getEvents();
    }

    function paginar(pagina) {
      let ofs = $page.url.searchParams.get('offset');

      ofs = (pagina - 1) * limit;
      
      window.location.href = `/ufc-events-data?offset=${ofs}&limit=${limit}`;
    }

    let filterDropdownOpen = false; // Variable para controlar si el menú desplegable de filtros está abierto o cerrado

    function toggleFilterDropdown() {
      filterDropdownOpen = !filterDropdownOpen;
    }

    async function applyFilters() {

      try {
        filterParams = {};
        // Obtener todos los inputs dentro del ul
  
        const inputs = document.querySelectorAll('.filter-dropdown input');
        console.log('inputs: '+inputs);
        
        let filterString = '';
        inputs.forEach(input => {
            
            const key = input.id;
            console.log(key)
            const value = input.value;
            console.log(value)
            filterParams[key] = value;
            if (value !== '') {
              filterString += `&${key}=${encodeURIComponent(value)}`;
            }
        });
        console.log('params: '+filterParams);
    
        console.log(filterString);

        let response = await fetch(`${API}?${filterString}`, {
          method: "GET"
        });
        console.log(response)
        let data = await response.json();
        events = data;
        console.log('Eventos filtrados: ', events);
        if (!response.ok) {
          errorMsg = "No se ha encontrado la colección.";
          console.error("Error al obtener eventos:", response.status);
        }
      } catch (error) {
        
      }
    }
    
  
    
</script>
  
<style>
  .event-box {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
  }

  .filter-dropdown {
    display: none;
  }

  .filter-dropdown.open {
    display: block;
  }
</style>

<svelte:head>
  <title>UFC Events</title>
</svelte:head>
<Container>
  <Row>
    {#if errorMsg != ""}
        <Alert color="danger">
            <h4>Error</h4>
            {errorMsg}
            <script>
              setTimeout(clearErrorMsg, 2000);
            </script>
        </Alert>
    {:else if successMsg != ""}
        <Alert color="success">
            <h4>Exito</h4>
            {successMsg}
            <script>
              setTimeout(clearSuccessMsg, 2000);
            </script>
        </Alert>
    {/if}
</Row>

  <h1><strong>Eventos de UFC</strong></h1>
  <Row>
    {#if events.length === 0}
      <p>La lista está vacía</p>
    {/if}
  </Row>
  <div class="event-box">
    <ListGroup>
        {#each events as event }
          <ListGroupItem class=fightItem>
            <Row class="event-box">
              <Col xs="10">
                <NavLink href="ufc-events-data/{encodeURIComponent(event.fighter1)}/{encodeURIComponent(event.fighter2)}/{encodeURIComponent(event.date)}">
                  <strong>{event.fighter1} vs {event.fighter2} </strong><br>
                  <span><strong>Fecha:</strong> {event.date}, <strong>Lugar:</strong> {event.location}</span>
                </NavLink>
              </Col>
              <Col xs="2">
                <Button size="sm" color="danger" on:click={deleteEvent(event.fighter1, event.fighter2, event.date)}>Borrar</Button>

              </Col>
            </Row>
          </ListGroupItem>
        {/each}
      </ListGroup>
      
  </div>
  <Button color="primary" on:click={toggleFilterDropdown} class="filter-dropdown-toggle">Filtrar</Button>
  <Row class="justify-content-center">
    <div class="filter-dropdown" class:open={filterDropdownOpen}>
        <ul>
            {#each allFilters as filter}
            {#if numericFilters.includes(filter)}
              <li>
                <label for={filter}>{filter}</label>
                <input type="number" id={filter} placeholder="0">
              </li>
            {:else}
                <li>
                    <label for={filter}>{filter}</label>
                    <input type="text" id={filter} placeholder="example">
                </li>
            {/if}
            {/each}
        </ul>
        <Button color="primary" on:click={applyFilters}>Aplicar filtros</Button>
    </div>
</Row>
  {#if events.length !== 0}
  
  
  <Row class="justify-content-center">
    <!-- <Col xs="auto">Página actual: {currentPage}</Col> -->
    <Col xs="auto">Total de eventos: {cantPeleas}</Col>
  </Row>
  <Row class="justify-content-center">
    <Col xs="auto">Eliminar todos los eventos -> <Button outline size="sm" color="danger" on:click={deleteAllEvents}>Borrar Todo</Button></Col>
    <Col xs="auto">Crear un nuevo evento -> <Button href="/ufc-events-data/postEvent" outline size="sm" color="success">Crear Evento</Button></Col>
    <Col xs="auto">Visualizar datos -> <Button href="/ufc-events-data/graph" outline size="sm" color="warning">Visualizar</Button></Col>
  </Row>
  <Row>
    {#if listaPeleas.length != 0}
    <Row>
      <Pagination size="md" ariaLabel="Paginacion del front-end">
        <PaginationItem>
          <PaginationLink first on:click={() => {
            window.location.href = `?offset=0&limit=${limit}`;
            getEvents();
            
            // paginar(1);
        }}/>
        </PaginationItem>
        {#each listaPeleas as pelea}
        <PaginationItem>
            <PaginationLink on:click={paginar(pelea)}>{pelea}</PaginationLink>
        </PaginationItem>
        {/each}
        <PaginationItem>
          <PaginationLink next on:click={() => {
            window.location.href = `?offset=${parseInt($page.url.searchParams.get('offset'))+10}&limit=${limit}`;
            getEvents();
            
            //const currentPage = parseInt($page.url.searchParams.get('offset')) || 0;
            //const nextPage = currentPage + limit;
            //paginar(nextPage)
          }}/>
        </PaginationItem>
        <PaginationItem>
            <PaginationLink last on:click={() => {
              getEvents();
              window.location.href = `?offset=${-((listaPeleas.length - 1) * limit)}&limit=${limit}`;
              // const totalPages = Math.ceil(cantPeleas / limit);
              // const lastPageOffset = (totalPages - 1) * limit;
              // paginar(lastPageOffset); // Ir a la última página
          }}/>
        </PaginationItem>
    </Pagination>
    </Row>
    {/if}
</Row>
  {/if}
  {#if events.length === 0}
    <Row class="justify-content-center">
      <Col xs="auto">Insertar datos -> <Button size="sm" outline color="primary" href="/ufc-events-data?offset=0&limit=10" on:click={loadInitialData}>Insertar</Button></Col>
      <Col xs="auto">Crear un nuevo evento -> <Button href="/ufc-events-data/postEvent" outline size="sm" color="success">Crear Evento</Button></Col>
    </Row>
  {/if}
</Container>
