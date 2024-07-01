<script>
    import { dev } from "$app/environment";
    import { Container, Row, Col, NavLink } from '@sveltestrap/sveltestrap';

    let BASE = "";

    if(dev)
        BASE = "http://localhost:10002"+BASE
</script>
<svelte:head>
    <title>APIs nicredmor</title>
</svelte:head>
<Container>
    <h1>SOS2324-jul-nrm</h1><hr>
    <Row>
        <Col><strong>Project Description:</strong> Our information sources are aimed at analyzing the ufc events all over the world.</Col>
    </Row>
    <br>
    <Row>
        <Col><strong>Front-End: </strong><NavLink href="/ufc-events-data">ufc-events-data</NavLink></Col>
    </Row>
    <br>
    <Row>
        <Col><strong>API Base: </strong><NavLink href="/api/v1/ufc-events-data">ufc-events-data</NavLink></Col>
    </Row>
    <br>
    <Row>
        <Col><strong>URL:</strong> <NavLink href="https://sos2324-jul-nrm-428011.ew.r.appspot.com/">https://sos2324-jul-nrm-428011.ew.r.appspot.com/</NavLink></Col>
    </Row>
    <br>
    <Row>
        <Col><strong>Documentación:</strong><NavLink href="https://documenter.getpostman.com/view/32992444/2sA3duHDdS">/api/v2/ufc-events-data/docs (developed by Nicolás Redondo Moreno)</NavLink></Col>
    </Row>
    <br>
    <Row>
        <Col><strong>Repository:</strong> <NavLink href="https://github.com/gti-sos/SOS2324-jul-nrm">gti-sos/SOS2324-jul-nrm</NavLink></Col>
    </Row>
    <br>
    <Row>
        <Col><strong>Developed by:</strong> <NavLink width="20px" href="https://github.com/NicoRedondoo">Nicolás Redondo Moreno - <a href="https://docs.google.com/spreadsheets/d/1w-PwFC-4Cl3YDFELyqrB9bi7eR_ZPIYnrHOx83KctC8/edit#gid=1179082162"> ufc-events-data</a></NavLink></Col>
    </Row>
</Container>