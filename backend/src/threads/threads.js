const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Questo codice viene eseguito nel thread principale
  
  // Creiamo un nuovo worker
  const worker = new Worker(__filename, {
    workerData: { input: 'example 1' }
  });

  // Gestiamo i messaggi inviati dal worker
  worker.on('message', (message) => {
    console.log('Il worker ha inviato:', message);
    worker.terminate(); // Terminiamo il worker dopo aver ricevuto il messaggio
  });

  // Gestiamo gli errori del worker
  worker.on('error', (error) => {
    console.error('Errore nel worker:', error);
  });

  // Alla chiusura del worker
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error('Il worker si è chiuso con il codice di uscita:', code);
    }
  });

  // Questo codice viene eseguito nel thread principale
  
  // Creiamo un nuovo worker
  const w = new Worker(__filename, {
    workerData: { input: 'example 2' }
  });

  // Gestiamo i messaggi inviati dal worker
  w.on('message', (message) => {
    console.log('Il worker ha inviato:', message);
    w.terminate(); // Terminiamo il worker dopo aver ricevuto il messaggio
  });

  // Gestiamo gli errori del worker
  w.on('error', (error) => {
    console.error('Errore nel worker:', error);
  });

  // Alla chiusura del worker
  w.on('exit', (code) => {
    if (code !== 0) {
      console.error('Il worker si è chiuso con il codice di uscita:', code);
    }
  });
} else {
  // Questo codice viene eseguito nel worker
  
  // Otteniamo i dati passati dal thread principale
  const inputData = workerData.input;

  // Simuliamo un elaborazione intensiva
  const result = performHeavyTask(inputData);

  // Mandiamo il risultato al thread principale
  parentPort.postMessage(result);
}

function performHeavyTask(data) {
  // Simuliamo un ritardo
  const start = Date.now();
  while (Date.now() - start < 1) {} // Ritardo di 3 secondi

  // Ritorno un risultato basico
  return `Elaborazione completata su "${data}"`;
}
