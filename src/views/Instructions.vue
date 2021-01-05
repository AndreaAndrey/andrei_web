<template>
  <div class="instructions">
    <h1>Questa è un applicazione per gli Andrei.</h1>
    <ol class="list">
        <li>Attendere il caricamento della pagina e la visualizzazione delle immagini.</li>
        <li>Scorrere le varie pagine di immagini/video/audio/pdf attraverso il selezionatore di pagina, oppure scrivendo una pagina specifica nell'apposito input, oppure usando le freccie da tastiera per andare avanti e indietro.</li>
        <li>Per ricercare immagini taggate si può usare:
            <ol>
                <li>Common Tags: cliccare su uno dei tag piu comuni per visualizzare i multimedia associati a quel tag.</li>
                <li>Usare l'apposito campo per scrivere e cercare uno o piu tag separati da uno <b>spazio</b> " ". In modalità AND si trovano le immagini che contengono tutti i tag, con OR invece le immagini che contengono almeno uno dei tag.</li>
            </ol>
        </li>
        <li>Si può poi filtrare i risultati per tipologia di file con gli appositi checkboxes.</li>
        <li>Con il bottone "Show Untagged" si possono invece mostrare tutti i media che ancora non hanno nessun tag e sono quindi da revisionare e taggare.</li>
        <li>Cliccando su uno dei media si aprirà una finestra modale in cui è possibile visualizzare il media e aggiungere/rimuovere tags modificando l'apposito input (esprimere i tag come una lista di parole, lo spazio " " è un separatore di tag). Per chiudere la finestra modale usare i bottoni "X" o "Chiudi" oppure premere "ESC" o "TAB".</li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'Instructions',
}
</script>

<style scoped>
.list {
    margin: 50px;
    text-align: left;
    font-size: 16pt;
}
</style>