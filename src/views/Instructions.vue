<template>
  <div class="instructions">
    <h1>Questa è un applicazione per gli Andrei.</h1>
    <ol class="list">
        <li>Attendere il caricamento della pagina e la visualizzazione delle immagini.</li>
        <li>Scorrere le varie pagine di immagini/video/audio/pdf attraverso il selezionatore di pagina, oppure scrivendo una pagina specifica nell'apposito input, oppure usando le freccie da tastiera per andare avanti e indietro.</li>
        <li>Per ricercare immagini taggate si può usare:
            <ol>
                <li>Common Tags: cliccare su uno dei tag piu comuni per visualizzare i multimedia associati a quel tag.</li>
                <li>Usare l'apposito campo per scrivere e cercare uno o piu tag separati da uno <b>spazio</b> " ".</li>
                <li>In modalità <b>AND</b> si trovano le immagini che contengono <b>tutti</b> i tag, con <b>OR</b> invece le immagini che contengono <b>almeno uno</b> dei tag. </li>
                <li>Se si usano le <b>virgolette</b> 'ricerca' o "ricerca" la ricerca trova solo i tag che corrispondono <b>esattamente</b> alla ricerca, altrimenti trova anche tag che hanno una sottostringa che matcha la ricerca. </li>
                <li>Utilizzando invece il simbolo "-" davanti ai tag ricercati si possono <b>escludere</b> dalla ricerca: es. la ricerca "soci -brescia" trova tutte le immagini contenenti il soci ma non il brescia. </li>
            </ol>
        </li>
        <li>Si può poi filtrare i risultati per tipologia di file con gli appositi checkboxes.</li>
        <li>Con il bottone "Show Untagged" si possono invece mostrare tutti i media che ancora non hanno nessun tag e sono quindi da revisionare e taggare.</li>
        <li>Cliccando su uno dei media si aprirà una finestra modale in cui è possibile visualizzare il media e aggiungere/rimuovere tags modificando l'apposito input (esprimere i tag come una lista di parole, lo spazio " " è un separatore di tag). Per chiudere la finestra modale usare i bottoni "X" o "Chiudi" oppure premere "ESC" o "TAB".</li>
    </ol>
  </div>
  <BackToTop />
</template>

<script>
import BackToTop from '@/components/BackToTop.vue';

export default {
  name: 'Instructions',
  components: {
    BackToTop
  }
}
</script>

<style scoped>
.list {
    margin: 50px;
    text-align: left;
    font-size: 16pt;
}
</style>