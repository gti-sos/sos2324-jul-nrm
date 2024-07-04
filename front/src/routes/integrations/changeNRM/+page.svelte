<script>
	import { onMount } from "svelte";
    import { Container, Row, Input, Col, Button } from "@sveltestrap/sveltestrap";

    let change;
    let currencyList = [];
    let inputAmount;
    let selectedCurrencyFrom;
    let selectedCurrencyTo;
    let result =0;

    async function getCurrencies() {

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '88a523cd96msh3544e0ee37800ebp1845b1jsnf31a7971dadb',
                'X-RapidAPI-Host': 'currency-exchange.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch('https://currency-exchange.p.rapidapi.com/listquotes', options);
            if (response.ok) {
                const result = await response.json();    
                console.log(result);
                currencyList = result;
                console.log(currencyList);
            }
            

            
        } catch (error) {
            console.error(error);
        }
    }


    async function getChange(){

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '88a523cd96msh3544e0ee37800ebp1845b1jsnf31a7971dadb',
                'X-RapidAPI-Host': 'currency-exchange.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(`https://currency-exchange.p.rapidapi.com/exchange?from=${selectedCurrencyFrom}&to=${selectedCurrencyTo}&q=1.0`, options);
            if (response.ok) {
                const data = await response.json();
                
                change=data;
                console.log('Cambio ->'+change);
                console.log('Cantidad-> '+inputAmount);
                console.log(inputAmount * change);
                

                result = inputAmount * change
                
            }
            
        } catch (error) {
            console.error(error);
        }   
    }

    onMount(() => {
        getCurrencies();
    });
    
</script>

<style>
    

    .output {
        height: 38px;
        width: 100%;
        display: flex;
        align-items: left;
        justify-content: center;
        border: solid 1px;
        border: 1px solid rgba(0, 0, 0, 0.295);
        border-radius: 8px;
    }

   
</style>

<Container class="converter-container">
    <h1 class="text-center">Money Converter SOS</h1>

    <Row class="my-4">
        <Col sm="4">
            <Input type="number" bind:value={inputAmount} placeholder="Amount" />
        </Col>
        <Col sm="2">
            <select class="form-select" bind:value={selectedCurrencyFrom}>
                {#each currencyList as currency}
                    <option>{currency}</option>
                {/each}
            </select>
        </Col>
        <Col sm="1" class="d-flex align-items-center justify-content-center">
            <span>to</span>
        </Col>
        <Col sm="2">
            <select class="form-select" bind:value={selectedCurrencyTo}>
                {#each currencyList as currency}
                    <option>{currency}</option>
                {/each}
            </select>
        </Col>
        <Col sm="3" class="d-flex align-items-center justify-content-center ">
            <div class="output">{result}</div>
        </Col>
    </Row>
    <Row>
        <Col sm="12" class="d-flex justify-content-center mt-3">
            <Button class="btn btn-primary" on:click={getChange}>Convertir</Button>
        </Col>
    </Row>
</Container>