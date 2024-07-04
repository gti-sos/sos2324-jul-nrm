import {ufc_data}  from './index-api.js';
const API_BASE = '/api/v1';
import fetch from 'node-fetch';

function apiUfc(app, dbUfc) {

    let dataset = [];

    
    // CREAR initial data
    app.get(API_BASE+"/ufc-events-data/loadInitialData", (req, res) => {
        dbUfc.find({}, (err, docs) => {
            if (err) {
                res.sendStatus(500, 'Internal Error');
            } else {
                if (docs.length === 0) {
                    for (let i = 0; i < ufc_data.length; i++) {
                        const fields = ufc_data[i].split('\t');
                        const obj = {
                            location: fields[0],
                            fighter1: fields[1],
                            fighter2: fields[2],
                            fighter_1_kd: parseFloat(fields[3]),
                            fighter_2_kd: parseFloat(fields[4]),
                            fighter_1_str: parseFloat(fields[5]),
                            fighter_2_str: parseFloat(fields[6]),
                            fighter_1_td: parseFloat(fields[7]),
                            fighter_2_td: parseFloat(fields[8]),
                            fighter_1_sub: parseFloat(fields[9]),
                            fighter_2_sub: parseFloat(fields[10]),
                            weight_class: fields[11],
                            method: fields[12],
                            round: parseFloat(fields[13]),
                            time: fields[14],
                            event_name: fields[15],
                            date: fields[16],
                            winner: fields[17],
                            views: parseInt(fields[18])
                        }
                        dbUfc.insert(obj);
                    
                } 
                res.sendStatus(201, "Created");
            } else {
                    res.sendStatus(409, 'Conflict');
            }   
            }
        });
    }); 
    
    //Documentación Postman
    app.get(API_BASE + "/ufc-events-data/docs", (req, res) => {
        res.status(301).redirect("https://documenter.getpostman.com/view/32992444/2sA3duEYA3")
    });

    // Validar campos requeridos para POST y PUT
    function validateFields(fields, requiredFields) {
        for (const field of requiredFields) {
            if (!(field in fields) || fields[field] === null || fields[field] === undefined) {
                return false;
            }
        }
        return true;
    };

    // GET BASE
    app.get(API_BASE+"/ufc-events-data", (req, res) => {
        dbUfc.find({}, (err, events) => {
            if (err) {
                res.sendStatus(500, 'Internal Error');
            } else {
                events.forEach(event => delete event._id);
                // Consultas con parámetros
                if (!(Object.keys(req.query).length === 0)) {
    
                    if (req.query.limit && req.query.offset) {
                        let limit = parseInt(req.query.limit);
                        let offset = parseInt(req.query.offset);
                        res.send(JSON.stringify(events.slice(offset, limit)));
                    } else if(req.query.limit && !req.query.offset){
                        let limit = parseInt(req.query.limit);
                        res.send(JSON.stringify(events.slice(0, limit)));
                    } else if (!req.query.limit && req.query.offset) {
                        let offset = parseInt(req.query.offset);
                        res.send(JSON.stringify(events.slice(offset)));
                    } else {
                        let mostrar = []
                        let queryParams = Object.keys(req.query);
                        let valoresNumericos = ['fighter_1_kd', 'fighter_2_kd', 'fighter_1_str', 'fighter_2_str', 'fighter_1_td', 'fighter_2_td', 'fighter_1_sub', 'fighter_2_sub', 'round', 'views'];
    
                        for (let i = 0; i < events.length; i++) {
                            let match = true;
                            for (let j = 0; j < queryParams.length; j++) {
    
                                let paramName = queryParams[j]; 
                                let paramValue = req.query[paramName];
                                if (valoresNumericos.includes(paramName)) {
                                    paramValue = parseInt(paramValue);
                                    console.log(typeof paramValue)
                                    // console.log("-----------------")
                                }
                                if (events[i][paramName] !== paramValue) {
                                    match = false;
                                    break;
                                }
                                // console.log("1 ->"+events[i][paramName]) // También corregido aquí
                                // console.log("2 ->"+paramValue)
                            }
                            if (match) {
                                mostrar.push(events[i]);
                            }
                        }
                        res.send(JSON.stringify(mostrar));
                    }
                // Consultas sin parámetros
                } else {
                    res.send(JSON.stringify(events));
                }
            }
        })
    });

    // POST Nuevo evento
    app.post(API_BASE + "/ufc-events-data", (req, res) => {
        const requiredFields = ['location', 'fighter1', 'fighter2', 'fighter_1_kd', 'fighter_2_kd', 
            'fighter_1_str', 'fighter_2_str', 'fighter_1_td', 'fighter_2_td', 'fighter_1_sub', 'fighter_2_sub', 
            'weight_class', 'method', 'round', 'time', 'event_name', 'date', 'winner', 'views'];
    
        // Verificar si el tipo de contenido es JSON
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(400).send('Content not application/JSON');
        }
    
        const fight = req.body;
    
        // Verificar si todos los campos requeridos están presentes y no son nulos o indefinidos
        const isValid = validateFields(fight, requiredFields);
        if (!isValid) {
            return res.status(400).send('Incorrect JSON');
        }
        // Verificar si ya existe un evento con los mismos luchadores y fecha
        dbUfc.findOne({fighter1: fight.fighter1, fighter2: fight.fighter2, date: fight.date}, (err, existingFight) => {
            if (err) {
                return res.status(500).send('Internal Error');
            }

            if (existingFight) {
                return res.status(409).send('Conflict');
            }
            dbUfc.insert(fight, (err, newFight) => {
                if (err) {
                    return res.status(500).send('Internal Error');
                } else {
                    return res.status(201).send('Created');
                }
            });
        });
    });

    // DELETE de todo
    app.delete(API_BASE+"/ufc-events-data", (req, res) => {
        dbUfc.find({}, (err, dat) => {
            if (err) {
                res.sendStatus(500, "Internal Error");
            } else {
                if (dat.length === 0) {
                    res.sendStatus(404, 'No data found to delete.')
                } else {
                    dbUfc.remove({}, {multi: true}, (err, removed) => {
                        if (err) {
                            res.sendStatus(500, "Internal Error");
                        } else {
                            res.status(200).send(`OK, ${removed} data deleted.`)
                        }
                    });
                }
            }
        });
    });

    // 16.4 GET Rec inexistente
    app.get(API_BASE+"/ufc-events", (req, res) =>{
        res.sendStatus(404, "Not Found");
    });

    // 16.5 PUT No permitido
    app.put(API_BASE+"/ufc-events-data", (req, res) => {
        res.sendStatus(405, "Method Not Allowed");
    });

    // GET del recurso especificado
    app.get(API_BASE+"/ufc-events-data/:peso", (req, res) => {
        const peso = req.params.peso;

        dbUfc.find({weight_class: peso}, (err, datosFiltrados) => {
            if (err) {
                res.sendStatus(500, "Internal Error");
            } else {
                if (datosFiltrados.length === 0) {
                    res.sendStatus(404, "Not Found");
                } else {
                    res.send(JSON.stringify(datosFiltrados));
                }
            }
        })
    });

    // POST No permitido en un recurso
    app.post(API_BASE+"/ufc-events-data/:peso", (req, res) => {
        res.sendStatus(405, "Method Not Allowed");
    });

    // 16.1 PUT recurso existente
    app.put(API_BASE+"/ufc-events-data/stats/:fighter1/:fighter2/:date", (req, res) => {
        const f1 = decodeURIComponent(req.params.fighter1);
        const f2 = decodeURIComponent(req.params.fighter2);
        const fdate = req.params.date;
        const sw = req.body;


        // Verificación
        if (!f1 || !f2 || !fdate || !sw) {
            res.sendStatus(400, "Bad Request: Missing required data");
            return;
        }

        // Validar si los campos enviados son válidos
        const isValid = validateFields(sw, ['location', 'fighter1', 'fighter2', 'fighter_1_kd', 'fighter_2_kd', 
        'fighter_1_str', 'fighter_2_str', 'fighter_1_td', 'fighter_2_td', 'fighter_1_sub', 'fighter_2_sub', 
        'weight_class', 'method', 'round', 'time', 'event_name', 'date', 'winner', 'views']);
        
        if (!isValid) {
            return res.status(400).send('Incorrect JSON or missing required fields');
        }

        dbUfc.update(
            {fighter1: f1, fighter2: f2, date: fdate},
            { $set: sw},
            {},
            (err, affected) => {
                if (err) {
                    res.status(500).send('Internal Error');
                } else {
                    if (affected === 1) {
                        res.status(200).send("OK");
                    } else {
                        res.status(404).send("Not Found");
                    }
                }
            }
        )
    });

    // DELETE El recurso peso
    app.delete(API_BASE+"/ufc-events-data/:peso", (req, res) => {
        const peso = req.params.peso;
        
        dbUfc.remove({weight_class: peso}, { multi: true}, (err, removed) => {

            if (err) {
                return res.sendStatus(500, "Internal Error");
            } else {
                if (removed >= 1) {
                    return res.sendStatus(200, `OK, ${removed} data removed.`);
                } else {
                    return res.sendStatus(404, "Not Found");
                }
            }
        })
    });

    // GET recurso existente
    app.get(API_BASE+"/ufc-events-data/stats/:fighter1/:fighter2/:date", (req, res) => {
        const f1 = decodeURIComponent(req.params.fighter1);
        const f2 = decodeURIComponent(req.params.fighter2);
        const fdate = req.params.date;

    // Verificación
        if (!f1 || !f2 || !fdate) {
            res.status(400).send("Bad Request: Missing required data");
            return;
        }

        dbUfc.findOne({ fighter1: f1, fighter2: f2, date: fdate }, (err, event) => {
            if (err) {
                res.status(500).send('Internal Error');
            } else {
                if (event) {
                    res.status(200).json(event);
                } else {
                    res.status(404).send("Not Found");
                }
            }
        });
    });

    // DELETE recurso existente
    app.delete(API_BASE+"/ufc-events-data/stats/:fighter1/:fighter2/:date", (req, res) => {
        const f1 = decodeURIComponent(req.params.fighter1);
        const f2 = decodeURIComponent(req.params.fighter2);
        const fdate = req.params.date;

    // Verificación
        if (!f1 || !f2 || !fdate) {
            res.status(400).send("Bad Request: Missing required data");
            return;
        }

        dbUfc.remove({ fighter1: f1, fighter2: f2, date: fdate }, { multi: true }, (err, numRemoved) => {
            if (err) {
                res.status(500).send('Internal Error');
            } else {
                if (numRemoved === 1) {
                    res.status(200).send("OK");
                } else {
                    res.status(404).send("Not Found");
                }
            }
        });
    });

    // GET Búsqueda por luchador
    app.get(API_BASE + "/ufc-events-data/fighter/:fighter", (req, res) => {
        const fighter = decodeURIComponent(req.params.fighter);

        dbUfc.find({ $or: [{ fighter1: fighter }, { fighter2: fighter }] }, (err, fights) => {
            if (err) {
                res.status(500).send('Internal Error');
            } else {
                if (fights.length === 1) {
                    res.status(200).json(fights[0]);
                } else if (fights.length > 0) {
                    res.status(200).json(fights);
                } else {
                    res.status(404).send('Not Found');
                }
            }
        });
    });

    // GET Búsqueda por fecha
    app.get(API_BASE + "/ufc-events-data/date/:date", (req, res) => {
        const date = req.params.date;

        dbUfc.find({ date: date }, (err, fights) => {
            if (err) {
                res.status(500).send('Internal Error');
            } else {
                if (fights.length === 1) {
                    res.status(200).json(fights[0]);
                } else if (fights.length > 0) {
                    res.status(200).json(fights);
                } else {
                    res.status(404).send('Not Found');
                }
            }
        });
    });

    // GET Búsqueda por ganador
    app.get(API_BASE + "/ufc-events-data/winner/:winner", (req, res) => {
        const winner = decodeURIComponent(req.params.winner);

        dbUfc.find({ winner: winner }, (err, fights) => {
            if (err) {
                res.status(500).send('Internal Error');
            } else {
                if (fights.length === 1) {
                    res.status(200).json(fights[0]);
                } else if (fights.length > 0) {
                    res.status(200).json(fights);
                } else {
                    res.status(404).send('Not Found');
                }
            }
        });
    });

    // Proxy tenis
    app.get(API_BASE+'/proxyTennis', async (req, res) => {
        try {
            // Endpoint de la API para obtener los 500 mejores jugadores de la ATP
            const url = 'https://tennisapi1.p.rapidapi.com/api/tennis/rankings/atp';

            const response = await fetch(url, {
                headers: {
                    
                    'X-RapidAPI-Key': '88a523cd96msh3544e0ee37800ebp1845b1jsnf31a7971dadb'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener los datos de la API: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            res.json(data);
        } catch (error) {
            console.error('Error en el proxy al obtener datos desde la API:', error);
            res.status(500).json({ error: 'Hubo un error al obtener los datos desde la API' });
        }
    }); 

    // Proxy Crypto
    app.get(API_BASE+'/proxyCrypto', async (req, res) => {
        try {
            const url = 'https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0';
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '88a523cd96msh3544e0ee37800ebp1845b1jsnf31a7971dadb',
                    'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
                }
            };
    
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error('Error al obtener datos desde la API:', error);
            res.status(500).json({ error: 'Hubo un error al obtener los datos desde la API' });
        }
    });

}
export  { apiUfc };