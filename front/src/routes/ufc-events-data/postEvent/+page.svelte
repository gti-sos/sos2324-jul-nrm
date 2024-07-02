<script>
    import {onMount} from "svelte";
    import { Container, Button, Col, Row, Input, Alert } from '@sveltestrap/sveltestrap';
    import { dev } from "$app/environment";

    let API = "/api/v1/ufc-events-data";

    if(dev)
        API = "http://localhost:10002"+API

    onMount(() => {
        getEvents();
    });

    let placeholderEvent = {"location": "USA", "fighter1": "Rocky", "fighter2": "Balboa", "fighter_1_kd": 0, "fighter_2_kd": 1, 
    "fighter_1_str": 0, "fighter_2_str": 1, "fighter_1_td": 1, "fighter_2_td": 0, "fighter_1_sub": 0, "fighter_2_sub": 1, 
    "weight_class": "Welterweight", "method": "KO/TKO Punch", "round": 5, "time": "1:11", "event_name": "UFC Night", 
    "date": "1-Jan-11", "winner": "Rocky", "views": "1111"}
    
    let events = []
    let errorMsg = ""
    let successMsg = ""

    let totalEvents = []
    let eventCount = 0

    async function getEvents() {
        successMsg, errorMsg = "", "";
        try {
            let response = await    fetch(API, {
                                        method: "GET"
                                    });
            let data = await response.json();
            events = data;
            totalEvents = events;
            eventCount = totalEvents.length
            
            if (response.status != 200) {
                errorMsg = "No se ha encontrado la colección."
            }
        } catch (error) {
            errorMsg = error;
        }
    }

    async function createEvent() {
        successMsg, errorMsg = "", "";
        try {
            let response = await    fetch(API, {
                                        method: "POST",
                                        headers:{
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify(placeholderEvent)
                                    });
            let status = await response.status;
            console.log(`Creation response status ${status}`); 
            
            if (status == 201) {
                successMsg = "Evento añadido con éxito."
                setTimeout(() => {
                    history.back();
                }, 2000);
            }
            else
                errorMsg = `Ya existe un evento de ${placeholderEvent.fighter1} vs ${placeholderEvent.fighter2} en la fecha ${placeholderEvent.date}.`
        } catch (error) {
            errorMsg = error;
        }
        
    }
</script>
<Container>
    <Row>
        {#if errorMsg != ""}
        <Alert color="danger">
            <h4>Error</h4>
            {errorMsg}
        </Alert>
        {:else if successMsg != ""}
        <Alert color="success">
            <h4>Exito</h4>
            {successMsg}
        </Alert>
        {/if}
    </Row>
    <Row>
        <Col><h1>Crear Nuevo Evento</h1></Col><hr>
    </Row>
    <Row cols={4}>
        {#each Object.keys(placeholderEvent) as key}    
            <Col><strong>{key}:</strong> <Input bind:value={placeholderEvent[key]}/></Col>
        {/each}
    </Row>
    <Row>
        <Col xs="auto"><Button size="md" color="success" on:click={createEvent}>Crear</Button></Col>
        <Col xs="auto"><Button color="danger" size="md" href="/ufc-events-data">Volver a la API</Button></Col>
    </Row>
</Container>