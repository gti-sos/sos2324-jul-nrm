<script>
    import { dev } from "$app/environment";
    import { Container } from '@sveltestrap/sveltestrap';

    let mode = "production"

    if(dev)
        mode = "development"
</script>

<Container>
    Estas en modo {mode}
    <br>
	<h1>Vídeos</h1>
	<ul>
        <li><a href="https://www.loom.com/share/a266187220b04de093b1dd673d028c94">Nicolás Redondo Moreno</a></li>
	</ul>
</Container>
