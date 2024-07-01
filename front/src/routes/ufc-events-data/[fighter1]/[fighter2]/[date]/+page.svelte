<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import { Button, ListGroup, ListGroupItem, Container, Row, Col } from '@sveltestrap/sveltestrap';
    import { dev } from "$app/environment";
    

    let fighter1 = $page.params.fighter1;
    let fighter2 = $page.params.fighter2;
    let date = $page.params.date;
    const encodedFighter1 = encodeURIComponent(fighter1);
    const encodedFighter2 = encodeURIComponent(fighter2);
    const encodedDate = date;
    
    

    let API = "/api/v1/ufc-events-data";
    if(dev)
        API = "http://localhost:10002" + API;

    let event = {};
    let errorMsg = "";
    let successMsg = ""

    onMount(() => {
        getEventObject();
    });

    async function getEventObject() {
        successMsg, errorMsg = "", "";
        
        try {
            let response = await fetch(`${API}/stats/${encodedFighter1}/${encodedFighter2}/${encodedDate}`, {
                method: "GET"
            });
            console.log("Response status:", response.status);
            let data = await response.json();
            event = data;
            console.log(event);
            if (!response.ok) {
            
                errorMsg = `Error al obtener el evento: ${response.status}`;
            }           
        } catch (error) {
            errorMsg = error;
        }
    }
</script>

<Container>
    <Row>
        <Col><h2>{fighter1} vs {fighter2}</h2></Col> 
        <Col class="d-flex justify-content-end">
            <Button href="/ufc-events-data/{fighter1}/{fighter2}/{date}/edit" size="md" color="warning">Editar recurso</Button>
        </Col>
    </Row>
    <ListGroup>
        {#each Object.keys(event) as dato} 
            <ListGroupItem>
                <Row>
                    <Col><strong>{dato}</strong> : {event[dato]} </Col>
                </Row>
            </ListGroupItem>
        {/each}
    </ListGroup>
    <Row>
        <Col xs="6" sm="4"><Button color="danger" size="sm" href="/ufc-events-data">Volver a la API</Button></Col>
    </Row>
</Container>
