# DOCUMENTAZIONE PROGETTO PWM AFSE MARVEL
> [name=Firriolo Gabriele 12435A][time=Settembre 18,2024]

[Per una grafica della docs migliore cliccare qui](https://hedgedoc.studentiunimi.it/gziN5zv4RVC6KyaReVPfhw)

:::info
Documentazione e progettazione del progetto di "AFSE" per il corso 
"Programmazione Web e Mobile" 
(a.a. 2024-2025, appello di settembre).
Realizzato da Firriolo Gabriele (12435A)
:::
## Setup and avvio del progetto
### Pre-requisiti
- Node.js
- MongoDB
- Marvel Developer account
### Setup pkgs e progetto
1. Clonare repository (o aprire il progetto dallo zip):
```
https://github.com/GabrieleFirriolo/afse_marvel.git
```
2. Navigare nella dir del frontend e installare le dipendenze:
```bash=
cd afse_marvel/frontend
npm install
```
3. Navigare nella dir del backend  e installare le dipendenze:
```bash=
cd afse_marvel/backend
npm install
```
### Setup .env
1. Creare un file .env nella directory /backend e inserire tutte le chiavi necessarie, come nell'esempio qua sotto.
```bash=
PORT=5000

MONGO_URI="YOUR_MONGODB_URI"
JWT_SECRET="YOUR_JWT_SECRET"
JWT_EXPIRES_IN=30d

MARVEL_API_KEY="YOUR_MARVEL_API_KEY"
MARVEL_PRIVATE_KEY="YOUR_MARVEL_API_PRIVATE_KEY"
```
### Avvio
1. Navigare nella dir del backend:
```bash=
cd afse_marvel/backend
npm start
```
1. Navigare nella dir del frontend:
```bash=
cd afse_marvel/frontend
npm start
```
## Organizzazione progetto dir
```
AFSE_MARVEL/
│
├── backend/               # Parte backend del progetto
│   ├── config/            # Configurazioni del server (es. database, autenticazione, variabili ambiente)
│   ├── controllers/       # Funzioni che gestiscono la logica per le richieste API
│   ├── middleware/        # Funzioni middleware per la gestione di autorizzazioni
│   ├── models/            # Definizione dei modelli dati (es. schemi Mongoose per MongoDB)
│   ├── node_modules/      # Moduli di Node.js installati per il backend
│   ├── routes/            # Definizione delle rotte per le API, che mappano le URL ai controller
│   ├── scripts/           # Script utilitari, come popolazione del database, o altre operazioni
│   ├── utils/             # Funzioni helper o strumenti di utilità per il backend
│   ├── .env               # File contenente variabili d'ambiente per la configurazione del server
│   └── server.js          # File principale per l'avvio del server Express
│
├── frontend/              # Parte frontend del progetto
│   ├── node_modules/      # Moduli di Node.js installati per il frontend
│   ├── public/            # Contiene file pubblici (es. HTML, immagini, favicon) accessibili direttamente dal browser
│   ├── src/               # Contiene il codice sorgente del frontend
│   │   ├── app/           # Definizione dell'architettura principale dell'app React, come il routing e la struttura generale
│   │   ├── assets/        # File statici come immagini, font, e altre risorse usate nel frontend
│   │   ├── components/    # Componenti React riutilizzabili nell'interfaccia utente
│   │   ├── context/       # Gestione dello stato globale utilizzando il Context API di React
│   │   ├── pages/         # Pagine principali dell'applicazione React, ciascuna rappresentante una route
│   │   ├── utils/         # Funzioni di utilità e helper per il frontend
│   │   ├── index.css      # Foglio di stile principale dell'applicazione
│   │   └── index.js       # Punto di ingresso principale dell'app React
```

## Scelte Implementative progettuali
> Tutte le funzionalità "base" e "aggiuntive" sono state implementate nel progetto, le seguenti sono ulteriori scelte progettuali.
### Inserimento Rarità
Ho deciso di introdurre il concetto di rarità perchè arricchisce l'esperienza di "gioco" e rende la collezione più coinvolgente. Dal punto di vista "tecnico" le rarità sono state inserite randomicamente con le loro rispettive percentuali.
### Pacchetti con carte rare garantite
Offrire pacchetti che garantiscono delle carte di un certo di livello di rarità è una strategia per migliorare l'esperienza di acquisto e rende la piattaforma più simile ad un gioco di carte collezionabili vero e proprio.
### Gestione pacchetti
Nell'AFSE gli utenti quando comprano i pacchetti hanno la possibilità di aprirli in un secondo momento, e quindi visualizzarli in un "inventario".
All'eliminazione di un tipo di pacchetto, tutti i pacchetti posseduti dagli utenti verranno "auto-aperti" e successivamente il tipo di pacchetto verrà rimosso.
### Gestione carte in un trade
Tutte le carte che gli utenti offrono in uno scambio, vengono temporaneamente rimosse dall'album dell'utente, in modo che non possano essere offerte in un altro scambio o vendute. Se il trade verrà cancellato dall'utente proprietario, le carte verranno reinserite automaticamente nel suo album.
### Possibile offrire o richiedere crediti in un trade
Aggiungere la possibilità di includere crediti nelle proposte di scambio rende il sistema di trading più flessibile e dinamico, in modo anche di poter richiedere, oltre a delle figurine, dei crediti in più, per bilanciare il valore del trade.
## Scelte Implementative tecniche
### JWT
Ho gestito l'autenticazione con l'uso dei JWT (JSON Web Tokens).    Il JWT viene generato quando un utente effettua il login e contiene un payload con l'ID dell'utente. Questo token viene utilizzato per autenticare le richieste future semplificando l'architettura.
```javascript=
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
```
### Middleware
- #### adminOnly
    il middleware `adminOnly` serve a garantire che solo gli utenti con il ruolo di admin possano accedere a determinate risorse o eseguire determinate operazioni. Questo approccio è fondamentale per mantenere i livelli di autorizzazione all'interno dell'applicazione.
- #### protect
    il middleware `protect` viene utilizzato per proteggere le rotte dell'applicazione, garantendo che solo gli utenti autenticati possono accedervi.
### Chiamate a Marvel API
Il progetto utilizza le API di Marvel per fetchare dati come eroi, informazioni in dettaglio sugli eroi (comics, stories, ecc...). Sono stati pre-inseriti nel database 500 eroi ( che sono le figurine ), per evitare caricamenti molto lunghi dati i temi di attesa dell'api.
```javascript=
// Funzione generica per fetchare dati dal Marvel API
const fetchMarvelData = async (resource, heroId, page, search) => {
  const limit = 6;
  const offset = (page - 1) * limit;
  const ts = new Date().getTime();
  const hash = require("crypto")
    .createHash("md5")
    .update(ts + PRIVATE_KEY + API_KEY)
    .digest("hex");
  const params = {
    ts,
    apikey: API_KEY,
    hash,
    limit,
    offset,
    ...(search && { titleStartsWith: search }),
  };

  try {
    const response = await axios.get(
      `${MARVEL_API_BASE_URL}/characters/${heroId}/${resource}`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${resource}:`, error.message);
    throw new Error(`Failed to fetch ${resource}`);
  }
};
```
### Debounce
Ho utilizzato una funzione di `debounce` di lodash per migliorare l'esperienza utente dicudendo le chiamate API non necessarie. In questo caso, debounce assicura che l'operazione di ricerca avvenga eseguita solo dopo che l'utente ha smesso di digtare per un certo periodo di tempo. Ciò evita di sovraccaricare il server con richieste ad ogni tasto premuto, riducendo l'impatto sulle prestazione e prevenendo eventuali limitazioni di richiesta da parte del provider dell'API.
### Paginazione e limitazione richieste
La `paginazione` è utilizzata per gestire e limitare il numero di elementi caricati alla volta. Questo approccio migliora le prestazioni caricando, ad esempio, la collezione di album in piccoli blocchi mentre lo si scorre, invece di recuperare tutti i dati in una sola volta.
### Struttura Database
La connessione al db è situata nel modulo connectDb in `config/db.js`
#### Hero
Il modello Hero rappresenta gli eroi del sistema e contiene informazioni specifiche come:

- `marvelId`: un identificatore univoco dell'eroe, che corrisponde all'ID di un database di Marvel
- `name`: il nome dell'eroe.
- `description`, image, comics, stories, events, series: informazioni aggiuntive per arricchire i dettagli sull'eroe.
- `rarity`: classifica la rarità dell'eroe su una scala (da comune a leggendario), utile per le meccaniche di gioco e per creare un valore differente per ogni eroe.

Questa struttura consente di collegare un eroe a diverse collezioni e pacchetti, mantenendo il focus sulle caratteristiche principali che lo rendono desiderabile per l'utente.
#### User
Il modello *User* rappresenta gli utenti dell'applicazione e gestisce:

- Informazioni personali (`username`, `email`, `password`): tutte queste informazioni sono necessarie per l'autenticazione e la gestione degli utenti.
- Favoriti e collezioni (`favoriteHero`, `album`): permette agli utenti di scegliere il loro eroe preferito e gestire la loro collezione di eroi sotto forma di album, dove ogni eroe ha un conteggio.
- Ruolo (`role`): permette di differenziare utenti standard e amministratori, aprendo la possibilità di avere funzionalità di gestione avanzata per gli admin.
- `Credits`: valuta interna che gli utenti possono utilizzare per comprare o scambiare eroi.
#### Trade
Il modello *Trade* gestisce gli scambi tra utenti. Permette di definire scambi multipli di eroi o di crediti:

- `Proposer` e `Acceptor`: sono rispettivamente gli utenti che propongono e accettano lo scambio.
- `proposedHeroes` e `requestedHeroes`: array di eroi proposti e richiesti per lo scambio, rendendo possibile lo scambio di più eroi in un'unica transazione.
- `proposedCredits` e `requestedCredits`: permettono di scambiare anche crediti virtuali oltre agli eroi.
- `Status`: gestisce lo stato dello scambio, che può essere `pending`, `accepted`, o `rejected`.

Questo sistema consente agli utenti di interagire tra loro e di scambiare risorse all'interno della piattaforma.
#### Package
Il modello *Package* rappresenta un pacchetto di eroi acquistabile dagli utenti, collegato a un determinato tipo di pacchetto e ad un utente specifico:

- `user`: rappresenta l'utente proprietario del pacchetto.
- `packageType`: collega il pacchetto a un tipo di pacchetto predefinito che stabilisce le regole su come viene generato (vedi sotto).
- `heroes`: è un array di oggetti Hero che contiene gli eroi presenti nel pacchetto.
- `opened`: indica se il pacchetto è stato aperto o meno, permettendo di implementare meccaniche di apertura pacchetti (simile a un sistema di loot box).
#### PackageType
Il modello *PackageType* definisce le caratteristiche di base di un tipo di pacchetto che può essere generato:

- `name`, `description`, `price`: informazioni basilari per identificare e descrivere il pacchetto e il suo costo.
- `numberOfHeroes`: definisce quanti eroi saranno inclusi nel pacchetto.
- `guaranteedRare`, `guaranteedEpic`, `guaranteedLegendary`: questi campi specificano la probabilità o il numero garantito di eroi di rarità superiore che verranno inclusi in un pacchetto.
- `createdBy`: identifica l'amministratore che ha creato il pacchetto, utile per la gestione del contenuto.
- `isAvailable`: permette di attivare o disattivare un pacchetto dal sistema di vendita, ad esempio per promozioni a tempo.
### Salvataggio password
La password viene salvata in modo sicuro utilizzando la crittografia con `bcrypt`. Prima del salvataggio, viene generato un `sale` (salt) per aumentare la sicurezza e la password viene crittografata per prevenire attacchi come quelli con rainbow table. Il sistema utilizza un hook `pre-save` per crittografare automaticamente la password solo se modificata.
```javascript=
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```
### UserContext
L' `UserContext` consente una gestione centralizzata dello stato dell'utente all'interno dell'applicazione React. Grazie a questo componente, si riescono a recuperare ed aggiornare facilmente le informazioni base dell'utente visualizzate sulla dashboard, senza necessità di passare esplicitamente i dati come props agli altri componenti.
## Demo Progetto
[link del video](https://www.youtube.com/watch?v=yl41z9-7HbI)


### Elenco delle azioni, in ordine, svolte nella demo presente nel video:
- Utente base:
    - Registrazione
    - Shop crediti
    - Shop pacchetti singoli e multipli
    - Apertura pacchetti di vario tipo
    - Visualizzazione album con scroll
    - Filtri dell'album
    - Vendita di un eroe
    - Visualizza informazioni dettagliate di un eroe
    - Pagina Trade
    - Inserimento di un trade sulla piattaforma (successo) (Beta -> 3D)
    - Eliminazione di un trade già creato
    - Accept di un trade  (Ender e Ant -> Abyss)
    - Tentativo di accettare trade che offre carte già in possesso (Ender e Ant -> Abyss)
    - Visualizzazione della carta ottenuta dallo scambio e quantità aggiornata
    - Gestione profilo utente
    - cambio password
    - cambio eroe preferito
- Utente Admin:
    - Creazione pacchetto "personalizzato"
    - Shop pacchetto e apertura
    - Toggle pacchetti
## Tecnologie Utilizzate
- React.JS con MaterialUI (Front-end)
- Node.JS, Express (Back-end)
- MongoDB (Database)
## Migliorie possibili
- Inserire history dei trade:
 In una futura estensione si potrebbe inserire uno storico dei trade effettuati dall'utente, cosa già possibile grazie all'attuale struttura del database, che tiene traccia di tutte le informazioni necessarie di un trade.
- Inserire notifiche dei trade:
 Un sistema di notifiche per quando uno dei trade inseriti sulla piattaforma viene accettato in modo da migliorare l'esperienza utente.
- Possibilità di vedere album di altri utenti
- Pacchetti troppo vecchi (e unavailable) vengono "autoaperti" e rimossi dal database.
- Pacchetti aperti vecchi vegono rimossi dal database.
