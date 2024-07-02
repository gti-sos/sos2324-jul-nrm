<script>
    import { page } from '$app/stores';
    import { Button, Input, Container, Row, Col, Alert } from '@sveltestrap/sveltestrap';
    import { dev } from "$app/environment";
	import { onMount } from 'svelte';
    
    let fighter1 = $page.params.fighter1;
    let fighter2 = $page.params.fighter2;
    let date = $page.params.date;
    const encodedFighter1 = encodeURIComponent(fighter1);
    const encodedFighter2 = encodeURIComponent(fighter2);
    const encodedDate = date;

    let API = "/api/v1/ufc-events-data";

    if(dev)
        API = "http://localhost:10002"+API

    onMount(() => {
        getEventObject(fighter1, fighter2, date);
    })

    let event = {}
    let errorMsg = ''
    let successMsg = ''

    async function getEventObject(fighter1, fighter2, date) {

        const encodedFighter1 = encodeURIComponent(fighter1);
        const encodedFighter2 = encodeURIComponent(fighter2);
        const encodedDate = encodeURIComponent(date);

        try {
            let response = await    fetch(`${API}/stats/${encodedFighter1}/${encodedFighter2}/${encodedDate}`, {
                                        method: "GET"
                                    });
            let data = await response.json();
            event = data;
            console.log(event);
        } catch (error) {
            errorMsg = error;
        }
    }

    async function updateFight() {
    successMsg = errorMsg = "";

    // Verificar si fighter1, fighter2 o date han cambiado
    if (event.fighter1 !== $page.params.fighter1 || event.fighter2 !== $page.params.fighter2 || event.date !== $page.params.date) {
        errorMsg = "No está permitido cambiar el nombre de los luchadores o la fecha del evento.";
        return;
    }

    try {
        let response = await fetch(`${API}/stats/${encodedFighter1}/${encodedFighter2}/${encodedDate}`, {
            method: "PUT",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event)
        });

        let status = await response.status;
        console.log(`Creation response status ${status}`); 

        if (status == 200) {
            successMsg = "Evento actualizado correctamente.";
            setTimeout(() => {
                history.back();
            }, 2000);
        } else {
            console.log(status);
            errorMsg = "Ha ocurrido un error al actualizar el evento.";
        }
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
        <h1>Editar {fighter1} vs {fighter2}</h1><hr>
    </Row>
    <Row cols={4}>
        {#each Object.keys(event) as key}
            <Col><strong>{key}:</strong> <Input bind:value={event[key]}/></Col>
        {/each}
    </Row>
    <Row class="justify-content-center">
        <Col xs="auto"><Button size="md" color="success" on:click={updateFight}>Confirmar</Button></Col>
        <Col xs="auto"><Button color="danger" size="md" href="/ufc-events-data/{fighter1}/{fighter2}/{date}">Volver</Button></Col>
    </Row>
</Container>