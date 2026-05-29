import { Recipe } from '../app/context/AppContext';
export const INITIAL_RECIPES : Recipe[] = [
    // ==========================================
    // ANTIPASTI (15 Ricette)
    // ==========================================
    {
      id: "ant_1",
      nome: "Bruschette al Pomodoro e Basilico",
      descrizione: "Classico antipasto estivo con pomodorini freschi, aglio e basilico su pane tostato.",
      categoria: "antipasto",
      tempoPreparazione: 10,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Taglia i pomodorini, condiscili con olio, sale e basilico. Tosta il pane, strofina un po' d'aglio e aggiungi i pomodorini.",
      note: "Usa pane casereccio per un risultato migliore.",
      immagine: require("../assets/immagini_ricette/bruschette_al_pomodoro.png"),
      ingredienti: [
        { nome: "Pane casereccio", qta: "4", unita: "fette" },
        { nome: "Pomodorini", qta: "200", unita: "g" },
        { nome: "Basilico", qta: "1", unita: "mazzetto" },
        { nome: "Aglio", qta: "1", unita: "spicchio" }
      ]
    },
    {
      id: "ant_2",
      nome: "Caprese al Bicchiere",
      descrizione: "Una rivisitazione moderna della classica caprese servita in bicchierini monoporzione.",
      categoria: "antipasto",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Frulla il basilico con l'olio. Taglia a cubetti la mozzarella e i pomodori, poi stratificali nei bicchieri completando con l'olio al basilico.",
      note: "Servire ben freddo.",
      immagine: require("../assets/immagini_ricette/caprese_al_bicchiere.png"),
      ingredienti: [
        { nome: "Mozzarella di bufala", qta: "250", unita: "g" },
        { nome: "Pomodori ramati", qta: "2", unita: "pz" },
        { nome: "Olio EVO", qta: "30", unita: "ml" },
        { nome: "Basilico", qta: "10", unita: "foglie" }
      ]
    },
    {
      id: "ant_3",
      nome: "Fiori di Zucca Ripieni al Forno",
      descrizione: "Fiori di zucca farciti con ricotta e alici, cotti al forno leggeri e saporiti.",
      categoria: "antipasto",
      tempoPreparazione: 30,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Mescola la ricotta con sale, pepe e parmigiano. Inserisci un po' di composto e un'alica dentro ogni fiore, poi inforna a 180°C per 15 minuti.",
      note: "Pulisci i fiori delicatamente per non romperli.",
      immagine: require("../assets/immagini_ricette/Fiori_di_Zucca_Ripieni_al_Forno.png"),
      ingredienti: [
        { nome: "Fiori di zucca", qta: "12", unita: "pz" },
        { nome: "Ricotta vaccina", qta: "200", unita: "g" },
        { nome: "Alici sott'olio", qta: "12", unita: "filetti" },
        { nome: "Parmigiano", qta: "30", unita: "g" }
      ]
    },
    {
      id: "ant_4",
      nome: "Rotolini di Salmone e Caprino",
      descrizione: "Involtini freddi veloci e senza cottura, perfetti per i menu di pesce.",
      categoria: "antipasto",
      tempoPreparazione: 12,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Lavora il caprino con l'erba cipollina. Spalma il composto sulle fette di salmone affumicato e arrotola delicatamente.",
      note: "Taglia a rondelle prima di servire.",
      immagine: require("../assets/immagini_ricette/Rotolini_di_Salmone_e_Caprino.png"),
      ingredienti: [
        { nome: "Salmone affumicato", qta: "150", unita: "g" },
        { nome: "Formaggio caprino", qta: "160", unita: "g" },
        { nome: "Erba cipollina", qta: "1", unita: "ciuffo" }
      ]
    },
    {
      id: "ant_5",
      nome: "Arancinetti al Ragù",
      descrizione: "Piccoli arancini siciliani fritti croccanti dal cuore filante.",
      categoria: "antipasto",
      tempoPreparazione: 60,
      difficolta: "Alta",
      porzioni: 6,
      procedimento: "Prepara il riso allo zafferano e lascialo raffreddare. Forma delle palline inserendo al centro il ragù ristretto e un cubetto di caciocavallo, impana e friggi.",
      note: "Il ragù deve essere densissimo e freddo di frigo.",
      immagine: require("../assets/immagini_ricette/arancinetti_al_ragu.png"),
      ingredienti: [
        { nome: "Riso per risotti", qta: "300", unita: "g" },
        { nome: "Ragù di carne", qta: "150", unita: "g" },
        { nome: "Caciocavallo", qta: "80", unita: "g" },
        { nome: "Pan grattato", qta: "100", unita: "g" }
      ]
    },
    {
      id: "ant_6",
      nome: "Crostoni Polenta e Funghi",
      descrizione: "Crostini caldi invernali fatti con polenta grigliata e funghi trifolati.",
      categoria: "antipasto",
      tempoPreparazione: 35,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Prepara la polenta, stendila e lasciala rassodare. Tagliala a fette e grigliala. Cuoci i funghi in padella con aglio e prezzemolo e adagiali sulla polenta.",
      note: "Puoi aggiungere una fetta di scamorza fusa sopra.",
      immagine: require("../assets/immagini_ricette/crostini_polenta_e_funghi.png"),
      ingredienti: [
        { nome: "Polenta istantanea", qta: "200", unita: "g" },
        { nome: "Funghi misti", qta: "300", unita: "g" },
        { nome: "Aglio", qta: "1", unita: "spicchio" },
        { nome: "Prezzemolo", qta: "1", unita: "ciuffo" }
      ]
    },
    {
      id: "ant_7",
      nome: "Tartare di Tonno e Avocado",
      descrizione: "Fresco e raffinato antipasto crudo di mare marinato agli agrumi.",
      categoria: "antipasto",
      tempoPreparazione: 18,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Taglia a cubetti piccoli il tonno abbattuto e l'avocado. Condisci il tonno con succo di lime, olio, sale e unisci la composizione usando un coppapasta.",
      note: "Assicurati che il pesce sia freschissimo e precedentemente abbattuto.",
      immagine: require("../assets/immagini_ricette/Tartare_di_tonno_e_avocado.png"),
      ingredienti: [
        { nome: "Filetto di tonno", qta: "200", unita: "g" },
        { nome: "Avocado", qta: "1", unita: "pz" },
        { nome: "Lime", qta: "1", unita: "pz" }
      ]
    },
    {
      id: "ant_8",
      nome: "Carpaccio di Zucchine e Parmigiano",
      descrizione: "Un antipasto vegetariano crudo, sottile, rinfrescante e velocissimo.",
      categoria: "antipasto",
      tempoPreparazione: 10,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Affetta finemente le zucchine con una mandolina. Disponile su un piatto, condisci con limone, olio, sale e scaglie di parmigiano.",
      note: "Lascia marinare 5 minuti prima di servire.",
      immagine: require("../assets/immagini_ricette/carpaccio_di_zucchine.png"),
      ingredienti: [
        { nome: "Zucchine chiare", qta: "3", unita: "pz" },
        { nome: "Parmigiano reggiano", qta: "50", unita: "g" },
        { nome: "Limone (succo)", qta: "0.5", unita: "pz" }
      ]
    },
    {
      id: "ant_9",
      nome: "Muffin Salati Zucchine e Pancetta",
      descrizione: "Muffin rustici cotti al forno, soffici e saporiti, ideali per iniziare il pasto.",
      categoria: "antipasto",
      tempoPreparazione: 45,
      difficolta: "Media",
      porzioni: 6,
      procedimento: "Mescola farina, uova, latte e olio. Aggiungi zucchine grattugiate, pancetta a cubetti e lievito istantaneo. Versa negli stampini e inforna a 180°C per 25 min.",
      note: "Ottimi sia caldi che freddi.",
      immagine: require("../assets/immagini_ricette/muffin_zucchine_e_pancetta.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "200", unita: "g" },
        { nome: "Zucchine", qta: "1", unita: "pz" },
        { nome: "Pancetta affumicata", qta: "80", unita: "g" },
        { nome: "Uova", qta: "2", unita: "txt" }
      ]
    },
    {
      id: "ant_10",
      nome: "Vol-au-vent Fonduta e Noci",
      descrizione: "Cestini di pasta sfoglia ripieni di golosa crema al formaggio.",
      categoria: "antipasto",
      tempoPreparazione: 25,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Scalda la panna con il gorgonzola finché non si scioglie. Riempi i vol-au-vent pronti con la crema e guarnisci ogni pezzo con un gheriglio di noce.",
      note: "Scalda i cestini in forno 2 minuti prima di riempirli.",
      immagine: require("../assets/immagini_ricette/voul-au-vent_fonduta_e_noci.png"),
      ingredienti: [
        { nome: "Vol-au-vent pronti", qta: "12", unita: "pz" },
        { nome: "Gorgonzola dolce", qta: "100", unita: "g" },
        { nome: "Panna da cucina", qta: "50", unita: "ml" },
        { nome: "Noci sgusciate", qta: "30", unita: "g" }
      ]
    },
    {
      id: "ant_11",
      nome: "Gamberi in Crosta di Pasta Sfoglia",
      descrizione: "Finger food scenografico ma semplice: gamberi avvolti da strisce di sfoglia.",
      categoria: "antipasto",
      tempoPreparazione: 20,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Pulisci i gamberi lasciando la coda. Avvolgi ogni gambero con una strisciolina di sfoglia, spennella con uovo ed inforna a 200°C per 12 minuti.",
      note: "Accompagnali con della salsa rosa.",
      immagine: require("../assets/immagini_ricette/gamberi_in_sfoglia.png"),
      ingredienti: [
        { nome: "Code di gambero", qta: "12", unita: "pz" },
        { nome: "Pasta sfoglia rotolo", qta: "1", unita: "pz" },
        { nome: "Uovo (per spennellare)", qta: "1", unita: "pz" }
      ]
    },
    {
      id: "ant_12",
      nome: "Hummus di Ceci con Crostini",
      descrizione: "Crema mediorientale di ceci speziata servita con pane arabo tostato.",
      categoria: "antipasto",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Frulla nel mixer i ceci cotti con la tahina, il succo di limone, lo spicchio d'aglio, un filo d'olio e cumino fino a consistenza vellutata.",
      note: "Aggiungi acqua fredda se l'hummus risulta troppo denso.",
      immagine: require("../assets/immagini_ricette/hummus_di_ceci_e_crostino.png"),
      ingredienti: [
        { nome: "Ceci precotti", qta: "240", unita: "g" },
        { nome: "Tahina (pasta di sesamo)", qta: "2", unita: "cucchiai" },
        { nome: "Limone (succo)", qta: "0.5", unita: "pz" },
        { nome: "Cumino", qta: "1", unita: "pizzico" }
      ]
    },
    {
      id: "ant_13",
      nome: "Polpettine di Ricotta e Taralli",
      descrizione: "Senza cottura, sfiziose palline saporite passate nella granella croccante.",
      categoria: "antipasto",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Amalgama la ricotta asciutta con parmigiano, sale e pepe. Crea delle polpettine con le mani e rotolale nei taralli precedentemente sbriciolati.",
      note: "Fai riposare in frigo mezz'ora.",
      immagine: require("../assets/immagini_ricette/poplpette_di_ricotta.png"),
      ingredienti: [
        { nome: "Ricotta pecora", qta: "250", unita: "g" },
        { nome: "Parmigiano", qta: "40", unita: "g" },
        { nome: "Taralli pugliesi", qta: "60", unita: "g" }
      ]
    },
    {
      id: "ant_14",
      nome: "Uova Ripiene Rustiche",
      descrizione: "Un grande classico dei buffet saporito con tonno e capperi.",
      categoria: "antipasto",
      tempoPreparazione: 22,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Rendi le uova sode, tagliale a metà ed estrai i tuorli. Frulla i tuorli con tonno, maionese e capperi. Riempi gli albumi con il composto.",
      note: "Usa una sac-à-poche per un effetto più elegante.",
      immagine: require("../assets/immagini_ricette/uova_ripiene.png"),
      ingredienti: [
        { nome: "Uova", qta: "4", unita: "pz" },
        { nome: "Tonno sott'olio sgocciolato", qta: "80", unita: "g" },
        { nome: "Maionese", qta: "2", unita: "cucchiai" },
        { nome: "Capperi", qta: "1", unita: "cucchiaino" }
      ]
    },
    {
      id: "ant_15",
      nome: "Tagliere Sfizioso di Pasta Fritta",
      descrizione: "Crescentine emiliane fritte da servire calde insieme a salumi misti.",
      categoria: "antipasto",
      tempoPreparazione: 50,
      difficolta: "Alta",
      porzioni: 4,
      procedimento: "Impasta farina, acqua, un pizzico di lievito e strutto. Fai riposare l'impasto, stendilo, taglia dei rombi e friggi in abbondante olio caldo.",
      note: "Servi immediatamente con prosciutto crudo e stracchino.",
      immagine: require("../assets/immagini_ricette/tagliere_pasta_fritta.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "250", unita: "g" },
        { nome: "Lievito di birra fresco", qta: "5", unita: "g" },
        { nome: "Acqua tiepida", qta: "130", unita: "ml" },
        { nome: "Salumi misti affettati", qta: "200", unita: "g" }
      ]
    },
  
    // ==========================================
    // PRIMI PIATTI (15 Ricette)
    // ==========================================
    {
      id: "prim_1",
      nome: "Pasta alla Carbonara",
      descrizione: "La regina dei primi romani a base di guanciale, uova e pecorino.",
      categoria: "primo",
      tempoPreparazione: 20,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Rosola il guanciale. Sbatti i tuorli con il pecorino romano e pepe. Scola la pasta al dente, uniscila al guanciale, spegni il fuoco e versa la crema d'uovo.",
      note: "Niente panna, mi raccomando!",
      immagine: require("../assets/immagini_ricette/carbonara.png"),
      ingredienti: [
        { nome: "Spaghetti", qta: "200", unita: "g" },
        { nome: "Guanciale", qta: "100", unita: "g" },
        { nome: "Tuorli d'uovo", qta: "3", unita: "pz" },
        { nome: "Pecorino Romano", qta: "50", unita: "g" }
      ]
    },
    {
      id: "prim_2",
      nome: "Spaghetti all'Aglio, Olio e Peperoncino",
      descrizione: "Il primo piatto salva-cena per eccellenza, rapido ed esplosivo.",
      categoria: "primo",
      tempoPreparazione: 12,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Mentre la pasta cuoce, fai soffriggere dolcemente l'aglio schiacciato e il peperoncino nell'olio. Salta la pasta direttamente nella padella con acqua di cottura.",
      note: "L'aglio non deve assolutamente bruciare.",
      immagine: require("../assets/immagini_ricette/spaghetti_aglio_olio_peperoncino.png"),
      ingredienti: [
        { nome: "Spaghetti", qta: "180", unita: "g" },
        { nome: "Olio EVO", qta: "4", unita: "cucchiai" },
        { nome: "Aglio", qta: "2", unita: "spicchi" },
        { nome: "Peperoncino fresco", qta: "1", unita: "pz" }
      ]
    },
    {
      id: "prim_3",
      nome: "Risotto ai Funghi Porcini",
      descrizione: "Un risotto cremoso e profumato, perfetto per le domeniche autunnali.",
      categoria: "primo",
      tempoPreparazione: 35,
      difficolta: "Media",
      porzioni: 3,
      procedimento: "Tosta il riso con uno scalogno, sfuma con vino bianco e cuoci aggiungendo brodo bollente poco alla volta insieme ai porcini. Manteca alla fine con burro e parmigiano.",
      note: "Usa brodo vegetale leggero.",
      immagine: require("../assets/immagini_ricette/risotto_funghi.png"),
      ingredienti: [
        { nome: "Riso Carnaroli", qta: "240", unita: "g" },
        { nome: "Funghi porcini (freschi o surgelati)", qta: "250", unita: "g" },
        { nome: "Burro", qta: "30", unita: "g" },
        { nome: "Brodo vegetale", qta: "1", unita: "L" }
      ]
    },
    {
      id: "prim_4",
      nome: "Lasagne alla Bolognese",
      descrizione: "Sfoglia all'uovo, ricco ragù tradizionale, besciamella e tanto parmigiano.",
      categoria: "primo",
      tempoPreparazione: 150,
      difficolta: "Alta",
      porzioni: 6,
      procedimento: "Prepara il ragù (cottura 2 ore) e la besciamella. In una teglia alterna strati di sfoglia, ragù, besciamella e parmigiano. Inforna a 180°C per 35 minuti.",
      note: "Fai riposare le lasagne 10 minuti fuori dal forno prima di tagliarle.",
      immagine: require("../assets/immagini_ricette/lasagna_alla_bolognese.png"),
      ingredienti: [
        { nome: "Sfoglie all'uovo", qta: "250", unita: "g" },
        { nome: "Ragù misto bolognese", qta: "500", unita: "g" },
        { nome: "Latte intero (per besciamella)", qta: "500", unita: "ml" },
        { nome: "Parmigiano", qta: "100", unita: "g" }
      ]
    },
    {
      id: "prim_5",
      nome: "Gnocchi alla Sorrentina",
      descrizione: "Gnocchi di patate affogati nel sugo di pomodoro e fiordilatte filante.",
      categoria: "primo",
      tempoPreparazione: 25,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Cuoci gli gnocchi in acqua salata. Scolali e mescolali con il sugo di pomodoro basilico. Metti tutto in una pirofila con il fiordilatte e passa al grill per 5 minuti.",
      note: "Usa gnocchi freschi di buona qualità.",
      immagine: require("../assets/immagini_ricette/gnocchi_sorrentina.png"),
      ingredienti: [
        { nome: "Gnocchi di patate", qta: "800", unita: "g" },
        { nome: "Passata di pomodoro", qta: "400", unita: "g" },
        { nome: "Fiordilatte", qta: "200", unita: "g" },
        { nome: "Basilico", qta: "1", unita: "ciuffo" }
      ]
    },
    {
      id: "prim_6",
      nome: "Penne all'Arrabbiata",
      descrizione: "Piatto laziale piccante, gustoso, economico e super svelto.",
      categoria: "primo",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Soffriggi aglio e peperoncino nell'olio, aggiungi i pomodori pelati schiacciati e cuoci per 10 minuti. Salta le penne al dente nel sugo.",
      note: "Completa con prezzemolo fresco tritato alla fine se gradito.",
      immagine: require("../assets/immagini_ricette/penne_all'arrrabbiata.png"),
      ingredienti: [
        { nome: "Penne rigate", qta: "180", unita: "g" },
        { nome: "Pomodori pelati", qta: "250", unita: "g" },
        { nome: "Peperoncino secco", qta: "2", unita: "pz" },
        { nome: "Aglio", qta: "1", unita: "spicchio" }
      ]
    },
    {
      id: "prim_7",
      nome: "Vellutata di Zucca e Zenzero",
      descrizione: "Primo piatto al cucchiaio caldo, leggero, leggermente piccante ed avvolgente.",
      categoria: "primo",
      tempoPreparazione: 30,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Cuoci a cubetti la zucca e le patate nel brodo. Verso fine cottura aggiungi lo zenzero grattugiato. Frulla tutto con un mixer a immersione fino a crema.",
      note: "Accompagna con crostini di pane al rosmarino.",
      immagine: require("../assets/immagini_ricette/vellutata_di_zucca.png"),
      ingredienti: [
        { nome: "Zucca pulita", qta: "600", unita: "g" },
        { nome: "Patate", qta: "1", unita: "pz" },
        { nome: "Brodo vegetale", qta: "700", unita: "ml" },
        { nome: "Zenzero fresco", qta: "10", unita: "g" }
      ]
    },
    {
      id: "prim_8",
      nome: "Trofie al Pesto, Patate e Fagiolini",
      descrizione: "La versione classica ligure arricchita che rende il piatto cremosissimo.",
      categoria: "primo",
      tempoPreparazione: 20,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Lessa nella stessa acqua della pasta le patate a cubetti e i fagiolini. Aggiungi le trofie. Scola tutto insieme e condisci a freddo con il pesto genovese.",
      note: "Conserva un po' di acqua di cottura per diluire il pesto.",
      immagine: require("../assets/immagini_ricette/trofie_pesto_patate_fagiolini.png"),
      ingredienti: [
        { nome: "Trofie fresche", qta: "400", unita: "g" },
        { nome: "Pesto alla Genovese", qta: "150", unita: "g" },
        { nome: "Patata piccola", qta: "1", unita: "pz" },
        { nome: "Fagiolini freschi", qta: "100", unita: "g" }
      ]
    },
    {
      id: "prim_9",
      nome: "Risotto allo Zafferano (Milanese)",
      descrizione: "Elegante, dorato ed intramontabile, con midollo opzionale o solo burro ottimo.",
      categoria: "primo",
      tempoPreparazione: 30,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Tosta il riso con cipolla e burro, sfuma col vino. Cuoci aggiungendo brodo poco alla volta. Sciogli lo zafferano alla fine e manteca energicamente al dente fuori dal fuoco.",
      note: "Manteca a fuoco spento ('all'onda').",
      immagine: require("../assets/immagini_ricette/risotto_zafferano.png"),
      ingredienti: [
        { nome: "Riso Carnaroli", qta: "160", unita: "g" },
        { nome: "Zafferano in pistilli o bustina", qta: "1", unita: "bustina" },
        { nome: "Burro freddo", qta: "40", unita: "g" },
        { nome: "Vino bianco secco", qta: "50", unita: "ml" }
      ]
    },
    {
      id: "prim_10",
      nome: "Calamarata ai Frutti di Mare",
      descrizione: "Primo di mare d'eccellenza con calamari, cozze e pomodorini.",
      categoria: "primo",
      tempoPreparazione: 45,
      difficolta: "Alta",
      porzioni: 4,
      procedimento: "Apri le cozze in padella. In un'altra cucina i calamari a rondelle con aglio e pomodorini per 15 min. Unisci i liquidi filtrati, la pasta al dente e salta intensamente.",
      note: "Usa frutti di mare freschi.",
      immagine: require("../assets/immagini_ricette/calamarata_allo_scoglio.png"),
      ingredienti: [
        { nome: "Pasta Calamarata", qta: "350", unita: "g" },
        { nome: "Calamari freschi", qta: "300", unita: "g" },
        { nome: "Cozze pulite", qta: "500", unita: "g" },
        { nome: "Pomodorini", qta: "150", unita: "g" }
      ]
    },
    {
      id: "prim_11",
      nome: "Pasta Cacio e Pepe",
      descrizione: "Solo tre ingredienti ma una tecnica fondamentale per evitare grumi.",
      categoria: "primo",
      tempoPreparazione: 15,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Tosta il pepe macinato in padella. Crea un pastone denso unendo pecorino e acqua tiepida di cottura. Scola la pasta sul pepe, muovi e inserisci la crema di formaggio.",
      note: "Attenzione alla temperatura dell'acqua, non deve scottare la crema.",
      immagine: require("../assets/immagini_ricette/pasta_cacio_e_pepe.png"),
      ingredienti: [
        { nome: "Tonnarelli o Spaghetti", qta: "200", unita: "g" },
        { nome: "Pecorino Romano", qta: "80", unita: "g" },
        { nome: "Pepe nero in grani da macinare", qta: "1", unita: "cchiaio" }
      ]
    },
    {
      id: "prim_12",
      nome: "Orecchiette alle Cime di Rapa",
      descrizione: "Piatto tipico pugliese verace, amarognolo e saporitissimo.",
      categoria: "primo",
      tempoPreparazione: 25,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Pulisci le cime di rapa e lessale con le orecchiette. In una padella sciogli i filetti di acciuga nell'olio con aglio e peperoncino. Scola la pasta e ripassa.",
      note: "I taralli sbriciolati sopra donano un tocco croccante superbo.",
      immagine: require("../assets/immagini_ricette/orecchiette_rape.png"),
      ingredienti: [
        { nome: "Orecchiette fresche", qta: "350", unita: "g" },
        { nome: "Cime di rapa pulite", qta: "500", unita: "g" },
        { nome: "Alici sott'olio", qta: "3", unita: "filetti" },
        { nome: "Aglio", qta: "1", unita: "spicchio" }
      ]
    },
    {
      id: "prim_13",
      nome: "Spaghetti alle Vongole",
      descrizione: "Primo intramontabile della cucina mediterranea, profumato e cremoso.",
      categoria: "primo",
      tempoPreparazione: 30,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Fai spurgare le vongole. Aprile in padella con olio, aglio e gambi di prezzemolo. Scola gli spaghetti molto al dente e finisci la cottura nel liquido delle vongole.",
      note: "Filtra sempre il liquido delle vongole per eliminare residui di sabbia.",
      immagine: require("../assets/immagini_ricette/spaghetti_alle_vongole.png"),
      ingredienti: [
        { nome: "Spaghetti", qta: "180", unita: "g" },
        { nome: "Vongole veraci", qta: "500", unita: "g" },
        { nome: "Aglio", qta: "2", unita: "spicchi" },
        { nome: "Prezzemolo", qta: "1", unita: "mazzetto" }
      ]
    },
    {
      id: "prim_14",
      nome: "Crema di Porri e Patate (Vichyssoise)",
      descrizione: "Una zuppa delicata e vellutata, ottima sia calda che tiepida d'inizio estate.",
      categoria: "primo",
      tempoPreparazione: 40,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Affetta i porri e falli appassire nel burro. Aggiungi le patate a cubetti e il brodo vegetale. Cuoci per 25 minuti, poi frulla il tutto aggiungendo un goccio di panna.",
      note: "Puoi servirla guarnita con erba cipollina tritata.",
      immagine: require("../assets/immagini_ricette/crema_porri_patate.png"),
      ingredienti: [
        { nome: "Porri", qta: "3", unita: "pz" },
        { nome: "Patate medie", qta: "2", unita: "pz" },
        { nome: "Brodo vegetale", qta: "800", unita: "ml" },
        { nome: "Panna fresca", qta: "50", unita: "ml" }
      ]
    },
    {
      id: "prim_15",
      nome: "Cannelloni Ricotta e Spinaci",
      descrizione: "Cottura al forno classica per la domenica vegetariana, ricca e filante.",
      categoria: "primo",
      tempoPreparazione: 55,
      difficolta: "Alta",
      porzioni: 4,
      procedimento: "Lessa gli spinaci, strizzali benissimo e tritali. Mescolali con ricotta, uovo e noce moscata. Riempi i cannelloni, adagiali in teglia coperti di besciamella e inforna a 190°C per 25 minuti.",
      note: "Copri con carta alluminio i primi 15 minuti di cottura.",
      immagine: require("../assets/immagini_ricette/cannelloni.png"),
      ingredienti: [
        { nome: "Cannelloni di pasta pronti", qta: "12", unita: "pz" },
        { nome: "Ricotta vaccina", qta: "400", unita: "g" },
        { nome: "Spinaci surgelati", qta: "300", unita: "g" },
        { nome: "Besciamella ready", qta: "400", unita: "ml" }
      ]
    },
  // ==========================================
    // SECONDI PIATTI (15 Ricette)
    // ==========================================
    {
      id: "sec_1",
      nome: "Cotoletta alla Milanese",
      descrizione: "Costoletta di vitello con l'osso alta, impanata e dorata nel burro chiarificato.",
      categoria: "secondo",
      tempoPreparazione: 25,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Passa la carne prima nell'uovo sbattuto e poi nel pangrattato pressando bene. Friggi nel burro spumeggiante voltandola una sola volta.",
      note: "Non bucare mai la carne durante la cottura.",
      immagine: require("../assets/immagini_ricette/cotoletta_alla_milanese.png"),
      ingredienti: [
        { nome: "Costolette di vitello con osso", qta: "2", unita: "pz" },
        { nome: "Uova", qta: "2", unita: "pz" },
        { nome: "Pan grattato", qta: "120", unita: "g" },
        { nome: "Burro", qta: "100", unita: "g" }
      ]
    },
    {
      id: "sec_2",
      nome: "Polpette al Sugo della Nonna",
      descrizione: "Morbide sfere di carne macinata cotte a lungo in un saporito sugo di pomodoro.",
      categoria: "secondo",
      tempoPreparazione: 50,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Impasta la carne con uovo, pane bagnato nel latte, parmigiano e aglio. Forma le polpette, tuffale nella passata di pomodoro e cuoci coperto per 35 minuti.",
      note: "Il giorno dopo sono ancora più buone.",
      immagine: require("../assets/immagini_ricette/polpette_al_sugo_della_nonna.png"),
      ingredienti: [
        { nome: "Macinato misto (bovino/suino)", qta: "400", unita: "g" },
        { nome: "Uova", qta: "1", unita: "pz" },
        { nome: "Mollica di pane", qta: "50", unita: "g" },
        { nome: "Passata di pomodoro", qta: "500", unita: "g" }
      ]
    },
    {
      id: "sec_3",
      nome: "Scaloppine al Limone",
      descrizione: "Fettine di lonza tenerissime e avvolte da una cremina agra e vellutata.",
      categoria: "secondo",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Infarina le fettine. Rosolale nel burro un paio di minuti per lato. Toglile dalla padella, versa il succo di limone per creare la salsa e reinstaura la carne.",
      note: "Usa fuoco vivo per velocizzare la cremina.",
      immagine: require("../assets/immagini_ricette/scaloppine_al_limone.png"),
      ingredienti: [
        { nome: "Fettine di lonza di maiale", qta: "6", unita: "pz" },
        { nome: "Farina 00", qta: "30", unita: "g" },
        { nome: "Limone (succo)", qta: "1", unita: "pz" },
        { nome: "Burro", qta: "25", unita: "g" }
      ]
    },
    {
      id: "sec_4",
      nome: "Filetto di Orata al Cartoccio",
      descrizione: "Pesce leggero e salutare cotto con pomodorini, olive e aromi.",
      categoria: "secondo",
      tempoPreparazione: 30,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Disponi i filetti su un foglio di carta forno. Aggiungi pomodorini a metà, olive, un filo d'oilio e chiudi a pacchetto. Inforna a 180°C per 20 minuti.",
      note: "Mantiene intatti tutti i succhi del pesce.",
      immagine: require("../assets/immagini_ricette/filetto_di_orata_al_cartoccio.png"),
      ingredienti: [
        { nome: "Filetti di orata puliti", qta: "2", unita: "pz" },
        { nome: "Pomodorini", qta: "8", unita: "pz" },
        { nome: "Olive taggiasche", qta: "20", unita: "g" }
      ]
    },
    {
      id: "sec_5",
      nome: "Frittata di Patate e Cipolle",
      descrizione: "Un secondo rustico, economico e sostanzioso, ottimo anche da asporto.",
      categoria: "secondo",
      tempoPreparazione: 25,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Cuoci le patate a fette sottili in padella con abbondante cipolla finché non sono tenere. Sbattile uova e rovesciale sopra, cuocendo da ambo i lati.",
      note: "Usa un piatto piano grande per girarla senza romperla.",
      immagine: require("../assets/immagini_ricette/frittata_di_patate_e_cipolle.png"),
      ingredienti: [
        { nome: "Uova grandi", qta: "5", unita: "txt" },
        { nome: "Patate", qta: "2", unita: "pz" },
        { nome: "Cipolla bianca", qta: "1", unita: "pz" }
      ]
    },
    {
      id: "sec_6",
      nome: "Straccetti di Manzo con Rucola e Grana",
      descrizione: "Un piatto velocissimo della tradizione laziale, fresco ed estivo.",
      categoria: "secondo",
      tempoPreparazione: 10,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Salta gli straccetti di manzo a fuoco altissimo in padella con olio per un paio di minuti soltanto. Impiatta subito sopra un letto di rucola e scaglie di grana.",
      note: "La padella deve fumare per cuocere la carne all'istante senza far uscire i liquidi.",
      immagine: require("../assets/immagini_ricette/straccetti_di_manzo_con_rucola_e_grana.png"),
      ingredienti: [
        { nome: "Straccetti di manzo sottili", qta: "300", unita: "g" },
        { nome: "Rucola fresca", qta: "50", unita: "g" },
        { nome: "Grana Padano in scaglie", qta: "40", unita: "g" }
      ]
    },
    {
      id: "sec_7",
      nome: "Spezzatino con Patate e Piselli",
      descrizione: "Cottura lenta per bocconcini di carne morbidi che si sciolgono in bocca.",
      categoria: "secondo",
      tempoPreparazione: 90,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Rosola la carne infarina con un trito di sedano carota cipolla. Sfuma con vino, copri con brodo o pomodoro e stracuoce per 1 ora. Unisci patate e piselli l'ultima mezz'ora.",
      note: "Usa tagli di carne adatti alle lunghe cotture (es. cappello del prete).",
      immagine: require("../assets/immagini_ricette/spezzatino_con_patate_e_piselli.png"),
      ingredienti: [
        { nome: "Bocconcini di manzo", qta: "600", unita: "g" },
        { nome: "Patate grandi", qta: "3", unita: "pz" },
        { nome: "Piselli surgelati", qta: "150", unita: "g" },
        { nome: "Vino rosso", qta: "100", unita: "ml" }
      ]
    },
    {
      id: "sec_8",
      nome: "Pollo alla Cacciatora",
      descrizione: "Piatto rustico profumato con aromi, sfumato all'aceto/vino e pomodoro.",
      categoria: "secondo",
      tempoPreparazione: 50,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Rosola i pezzi di pollo con aglio e rosmarino. Sfuma con il vino bianco, aggiungi i pomodori pelati e le olive. Lascia sobbollire coperto per 40 minuti.",
      note: "Puoi usare anche il pollo intero tagliato a pezzi piccoli.",
      immagine: require("../assets/immagini_ricette/pollo_alla_cacciatora.png"),
      ingredienti: [
        { nome: "Pollo a pezzi", qta: "800", unita: "g" },
        { nome: "Pomodori pelati", qta: "400", unita: "g" },
        { nome: "Olive nere", qta: "50", unita: "g" },
        { nome: "Rosmarino", qta: "2", unita: "rametti" }
      ]
    },
    {
      id: "sec_9",
      nome: "Salmone in Crosta di Patate",
      descrizione: "Un secondo piatto di pesce scenografico ed elegante ma sorprendentemente semplice.",
      categoria: "secondo",
      tempoPreparazione: 35,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Affetta una patata finissimamente. Adagia le patate sopra i filetti di salmone a scaglie. Spennella d'olio e rosmarino e inforna a 200°C per 20 minuti fino a doratura.",
      note: "Usa una mandolina per tagliare le patate trasparenti.",
      immagine: require("../assets/immagini_ricette/salmone_in_crosta_di_patate.png"),
      ingredienti: [
        { nome: "Filetto di salmone fresco", qta: "2", unita: "pz" },
        { nome: "Patata grande", qta: "1", unita: "pz" },
        { nome: "Olio EVO", qta: "15", unita: "ml" }
      ]
    },
    {
      id: "sec_10",
      nome: "Parmigiana di Melanzane",
      descrizione: "Il trionfo mediterraneo a strati di melanzane fritte, sugo e mozzarella.",
      categoria: "secondo",
      tempoPreparazione: 75,
      difficolta: "Alta",
      porzioni: 4,
      procedimento: "Affetta e friggi le melanzane. Componi a strati alternando melanzane, sugo ristretto, mozzarella asciutta e parmigiano. Inforna a 180°C per 30 minuti.",
      note: "Fai spurgare le melanzane sotto sale prima di friggerle per togliere l'amaro.",
      immagine: require("../assets/immagini_ricette/parmigiana_di_melanzane.png"),
      ingredienti: [
        { nome: "Melanzane tonde", qta: "3", unita: "pz" },
        { nome: "Passata di pomodoro", qta: "500", unita: "g" },
        { nome: "Mozzarella fior di latte", qta: "250", unita: "g" },
        { nome: "Parmigiano", qta: "80", unita: "g" }
      ]
    },
    {
      id: "sec_11",
      nome: "Seppie con i Piselli",
      descrizione: "Un classico di mare e terra stufato, saporito e tenero.",
      categoria: "secondo",
      tempoPreparazione: 45,
      difficolta: "Media",
      porzioni: 3,
      procedimento: "Taglia le seppie a strisce. Cuocile in padella con cipolla, sfuma con vino e aggiungi un goccio di concentrato. Unisci i piselli a metà cottura lasciando sobbollire.",
      note: "Se le seppie sono grandi avranno bisogno di qualche minuto in più.",
      immagine: require("../assets/immagini_ricette/seppie_con_i_piselli.png"),
      ingredienti: [
        { nome: "Seppie pulite", qta: "500", unita: "g" },
        { nome: "Piselli surgelati", qta: "250", unita: "g" },
        { nome: "Passata di pomodoro", qta: "2", unita: "cucchiai" }
      ]
    },
    {
      id: "sec_12",
      nome: "Uova in Purgatorio",
      descrizione: "Piatto napoletano veloce ed economico: uova cotte dentro un sugo piccante.",
      categoria: "secondo",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Prepara un sugo veloce con aglio, olio e pomodoro. Fai delle piccole conche nel sugo e rompici dentro le uova intere. Copri e cuoci 5 minuti finché l'albume si rapprende.",
      note: "Il tuorlo deve rimanere cremoso e liquido.",
      immagine: require("../assets/immagini_ricette/uova_in_purgatorio.png"),
      ingredienti: [
        { nome: "Uova", qta: "4", unita: "pz" },
        { nome: "Passata di pomodoro", qta: "300", unita: "g" },
        { nome: "Peperoncino", qta: "1", unita: "pizzico" }
      ]
    },
    {
      id: "sec_13",
      nome: "Involtini di Vitello al Sugo",
      descrizione: "Fettine ripiene di prosciutto e formaggio arrotolate e cotte nel pomodoro.",
      categoria: "secondo",
      tempoPreparazione: 40,
      difficolta: "Media",
      porzioni: 3,
      procedimento: "Farcisci le fettine con prosciutto e una fetta di formaggio. Arrotola e fissa con stuzzicandenti. Rosola in padella, poi cuoci nel pomodoro per 25 minuti.",
      note: "Il sugo ottenuto diventa eccezionale per condire la pasta.",
      immagine: require("../assets/immagini_ricette/involtini_di_vitello_al_sugo.png"),
      ingredienti: [
        { nome: "Fettine di vitello", qta: "6", unita: "pz" },
        { nome: "Prosciutto cotto", qta: "3", unita: "fette" },
        { nome: "Provolone dolce", qta: "6", unita: "fette" },
        { nome: "Passata di pomodoro", qta: "350", unita: "g" }
      ]
    },
    {
      id: "sec_14",
      nome: "Hamburger Gourmet fatto in Casa",
      descrizione: "Un secondo moderno e amatissimo preparato con ottima carne bovina.",
      categoria: "secondo",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Cucina l'hamburger sulla piastra rovente per 3-4 minuti a lato. Negli ultimi istanti metti il cheddar sopra a fondere. Componi il panino con insalata e salse.",
      note: "Non schiacciare mai l'hamburger sulla piastra con la spatola.",
      immagine: require("../assets/immagini_ricette/hamburger_gourmet_fatto_in_casa.png"),
      ingredienti: [
        { nome: "Svizzerone di scottona", qta: "2", unita: "pz" },
        { nome: "Cheddar a fette", qta: "2", unita: "fette" },
        { nome: "Panini morbidi per burger", qta: "2", unita: "pz" }
      ]
    },
    {
      id: "sec_15",
      nome: "Arrosto della Domenica con Patate",
      descrizione: "Un caposaldo dei pranzi familiari, cotto al forno lento e morbidissimo.",
      categoria: "secondo",
      tempoPreparazione: 100,
      difficolta: "Alta",
      porzioni: 6,
      procedimento: "Lega la carne con gli aromi. Sigillala in padella caldissima con olio e burro. Trasferisci in una teglia capiente con le patate a tocchetti, bagna col vino e inforna a 180°C per un'ora abbondante.",
      note: "Fai riposare coperto da stagnola 15 minuti prima di affettarlo così da distribuire i succhi.",
      immagine: require("../assets/immagini_ricette/arrosto_della_domenica_con_patate.png"),
      ingredienti: [
        { nome: "Sottofesa di vitello o arista", qta: "1", unita: "kg" },
        { nome: "Patate", qta: "800", unita: "g" },
        { nome: "Vino bianco", qta: "150", unita: "ml" },
        { nome: "Rosmarino e Salvia", qta: "1", unita: "misto" }
      ]
    },
  
    // ==========================================
    // DOLCI (15 Ricette)
    // ==========================================
    {
      id: "dol_1",
      nome: "Tiramisù Classico",
      descrizione: "Il dolce italiano più amato nel mondo a strati di savoiardi bagnati nel caffè.",
      categoria: "dolce",
      tempoPreparazione: 25,
      difficolta: "Media",
      porzioni: 6,
      procedimento: "Monta i tuorli con lo zucchero, unisci il mascarpone e gli albumi a neve. Alterna savoiardi inzuppati nel caffè con la crema, termina con cacao in polvere.",
      note: "Usa uova freschissime a temperatura ambiente.",
      immagine: require("../assets/immagini_ricette/tiramisu_classico.png"),
      ingredienti: [
        { nome: "Mascarpone", qta: "500", unita: "g" },
        { nome: "Savoiardi", qta: "300", unita: "g" },
        { nome: "Uova fresche", qta: "4", unita: "pz" },
        { nome: "Caffè espresso", qta: "300", unita: "ml" }
      ]
    },
    {
      id: "dol_2",
      nome: "Torta Margherita Soffice",
      descrizione: "La torta da credenza semplice, profumata e spolverata di zucchero a velo.",
      categoria: "dolce",
      tempoPreparazione: 45,
      difficolta: "Bassa",
      porzioni: 8,
      procedimento: "Monta uova e zucchero a lungo. Unisci farina e fecola setacciate, il burro fuso tiepido e il lievito. Inforna a 180°C per 35 minuti.",
      note: "La fecola garantisce una sofficità unica.",
      immagine: require("../assets/immagini_ricette/torta_margherita_soffice.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "150", unita: "g" },
        { nome: "Fecola di patate", qta: "100", unita: "g" },
        { nome: "Zucchero", qta: "150", unita: "g" },
        { nome: "Burro", qta: "90", unita: "g" }
      ]
    },
    {
      id: "dol_3",
      nome: "Salame al Cioccolato",
      descrizione: "Un dolce sfizioso senza cottura amato da grandi e piccini.",
      categoria: "dolce",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 6,
      procedimento: "Mescola il burro morbido con lo zucchero, il cacao e l'uovo. Aggiungi i biscotti spezzettati con le mani. Forma un cilindro nella carta forno e metti in frigo 3 ore.",
      note: "Puoi aggiungere gocce di cioccolato o nocciole tritate.",
      immagine: require("../assets/immagini_ricette/salame_al_cioccolato.png"),
      ingredienti: [
        { nome: "Biscotti secchi tipo oro saiwa", qta: "200", unita: "g" },
        { nome: "Burro", qta: "100", unita: "g" },
        { nome: "Zucchero", qta: "100", unita: "g" },
        { nome: "Cacao amaro", qta: "50", unita: "g" }
      ]
    },
    {
      id: "dol_4",
      nome: "Panna Cotta alle Fragole",
      descrizione: "Dolce al cucchiaio fresco e delicato ricoperto da coulis di fragole fresche.",
      categoria: "dolce",
      tempoPreparazione: 20,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Scalda panna, latte e zucchero. Unisci la gelatina ammollata e versa negli stampini facendoli rassodare in frigo 4 ore. Frulla le fragole per guarnire alla fine.",
      note: "Non portare la panna a bollore estremo.",
      immagine: require("../assets/immagini_ricette/panna_cotta_alle_fragole.png"),
      ingredienti: [
        { nome: "Panna fresca liquida", qta: "400", unita: "ml" },
        { nome: "Zucchero", qta: "80", unita: "g" },
        { nome: "Fogli di colla di pesce", qta: "6", unita: "g" },
        { nome: "Fragole", qta: "150", unita: "g" }
      ]
    },
    {
      id: "dol_5",
      nome: "Crostata alla Marmellata",
      descrizione: "Il classico dolce della nonna preparato con friabile pasta frolla burrosa.",
      categoria: "dolce",
      tempoPreparazione: 50,
      difficolta: "Media",
      porzioni: 8,
      procedimento: "Lavora velocemente farina, burro freddo, zucchero e uova per formare la frolla. Stendila in una teglia, riempi di confettura, crea le losanghe e inforna a 180°C per 30 min.",
      note: "Fai riposare la frolla in frigo 30 minuti prima di stenderla.",
      immagine: require("../assets/immagini_ricette/crostata_alla_marmellata.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "300", unita: "g" },
        { nome: "Burro freddo", qta: "150", unita: "g" },
        { nome: "Zucchero", qta: "100", unita: "g" },
        { nome: "Marmellata d'albicocche", qta: "300", unita: "g" }
      ]
    },
    {
      id: "dol_6",
      nome: "Mousse al Cioccolato Fondente",
      descrizione: "Golosità al cucchiaio spumosa, ricca e intensa.",
      categoria: "dolce",
      tempoPreparazione: 15,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Sciogli il cioccolato a bagnomaria col burro. Incorpora i tuorli d'uovo uno alla volta. Aggiungi gli albumi precedentemente montati a neve fermissima mescolando dal basso.",
      note: "Fai riposare in frigo almeno 2 ore.",
      immagine: require("../assets/immagini_ricette/mousse_al_cioccolato_fondente.png"),
      ingredienti: [
        { nome: "Cioccolato fondente 70%", qta: "150", unita: "g" },
        { nome: "Uova", qta: "3", unita: "txt" },
        { nome: "Burro", qta: "20", unita: "g" }
      ]
    },
    {
      id: "dol_7",
      nome: "Torta Caprese",
      descrizione: "Dolce napoletano di mandorle e cioccolato, naturalmente privo di farina.",
      categoria: "dolce",
      tempoPreparazione: 55,
      difficolta: "Alta",
      porzioni: 8,
      procedimento: "Frulla le mandorle. Monta burro e zucchero, unisci il cioccolato fuso, i tuorli, la farina di mandorle e per ultimi gli albumi a neve. Inforna a 170°C per 40 min.",
      note: "L'interno deve rimanere leggermente umido e morbido.",
      immagine: require("../assets/immagini_ricette/torta_caprese.png"),
      ingredienti: [
        { nome: "Mandorle pelate", qta: "200", unita: "g" },
        { nome: "Cioccolato fondente", qta: "150", unita: "g" },
        { nome: "Zucchero", qta: "150", unita: "g" },
        { nome: "Burro", qta: "150", unita: "g" }
      ]
    },
    {
      id: "dol_8",
      nome: "Crema Catalana",
      descrizione: "Crema vellutata ricoperta da una sfiziosa crosticina di zucchero caramellato.",
      categoria: "dolce",
      tempoPreparazione: 30,
      difficolta: "Media",
      porzioni: 4,
      procedimento: "Scalda il latte con la cannella e scorza di limone. Sbatte i tuorli con l'amido and lo zucchero, versa il latte e addensa sul fuoco. Fai raffreddare e brucia lo zucchero sopra prima di servire.",
      note: "Usa un cannello da cucina (caramellatore) per lo strato croccante.",
      immagine: require("../assets/immagini_ricette/crema_catalana.png"),
      ingredienti: [
        { nome: "Latte intero", qta: "500", unita: "ml" },
        { nome: "Tuorli d'uovo", qta: "4", unita: "pz" },
        { nome: "Zucchero di canna", qta: "40", unita: "g" },
        { nome: "Amido di mais", qta: "20", unita: "g" }
      ]
    },
    {
      id: "dol_9",
      nome: "Muffins Americani con Gocce di Cioccolato",
      descrizione: "Tipici dolcetti da colazione gonfi, soffici e ricchi di cioccolato.",
      categoria: "dolce",
      tempoPreparazione: 30,
      difficolta: "Bassa",
      porzioni: 6,
      procedimento: "Mescola gli ingredienti secchi in una ciotola e quelli liquidi in un'altra. Unisci i due composti brevemente, aggiungi le gocce di cioccolato e inforna negli stampi a 190°C per 18 min.",
      note: "Non mescolare troppo l'impasto altrimenti i muffin perdono la sofficità.",
      immagine: require("../assets/immagini_ricette/muffins_americani_con_gocce_di_cioccolato.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "250", unita: "g" },
        { nome: "Gocce di cioccolato", qta: "100", unita: "g" },
        { nome: "Latte", qta: "150", unita: "ml" },
        { nome: "Burro fuso", qta: "80", unita: "g" }
      ]
    },
    {
      id: "dol_10",
      nome: "Torta alle Mele Classica",
      descrizione: "Soffice, casalinga, umida e ricca di fettine di mela caramellate.",
      categoria: "dolce",
      tempoPreparazione: 60,
      difficolta: "Bassa",
      porzioni: 8,
      procedimento: "Monta uova e zucchero, unisci farina, latte e burro fuso. Taglia le mele a fettine e inseriscile nell'impasto tenendone qualcuna per la superficie. Inforna a 180°C per 45 minuti.",
      note: "Profuma l'impasto con della cannella in polvere.",
      immagine: require("../assets/immagini_ricette/torta_alle_mele_classica.png"),
      ingredienti: [
        { nome: "Mele golden", qta: "3", unita: "pz" },
        { nome: "Farina 00", qta: "200", unita: "g" },
        { nome: "Zucchero", qta: "120", unita: "g" },
        { nome: "Burro", qta: "70", unita: "g" }
      ]
    },
    {
      id: "dol_11",
      nome: "Cantucci Pratesi alle Mandorle",
      descrizione: "Biscotti toscani secchi cotti due volte, perfetti da inzuppare nel Vin Santo.",
      categoria: "dolce",
      tempoPreparazione: 45,
      difficolta: "Media",
      porzioni: 6,
      procedimento: "Crea un impasto con uova, zucchero, farina e mandorle intere. Forma dei filoncini e inforna a 180°C per 20 minuti. Taglia a fettine oblique e rinforna per 5 minuti a tostare.",
      note: "Vanno tagliati quando il filoncino è ancora caldo.",
      immagine: require("../assets/immagini_ricette/cantucci_pratesi_alle_mandorle.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "250", unita: "g" },
        { nome: "Zucchero", qta: "150", unita: "g" },
        { nome: "Mandorle intere con la buccia", qta: "100", unita: "g" },
        { nome: "Uova", qta: "2", unita: "pz" }
      ]
    },
    {
      id: "dol_12",
      nome: "Biscotti Occhio di Bue",
      descrizione: "Frollini doppi ripieni di golosa nutella che spunta dal centro.",
      categoria: "dolce",
      tempoPreparazione: 35,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Prepara la frolla. Ricava dei cerchi, a metà dei quali farai un foro centrale più piccolo. Inforna a 180°C per 10 minuti. Farcisci la base integra con nutella e chiudi col biscotto bucato.",
      note: "Spolvera di zucchero a velo prima di unire le due parti.",
      immagine: require("../assets/immagini_ricette/biscotti_occhio_di_bue.png"),
      ingredienti: [
        { nome: "Pasta frolla pronta", qta: "1", unita: "rotolo" },
        { nome: "Nutella o crema spalmabile", qta: "150", unita: "g" },
        { nome: "Zucchero a velo", qta: "20", unita: "g" }
      ]
    },
    {
      id: "dol_13",
      nome: "Chiacchiere di Carnevale",
      descrizione: "Sfoglie fritte croccanti, bollose e fragranti tipiche delle feste.",
      categoria: "dolce",
      tempoPreparazione: 40,
      difficolta: "Alta",
      porzioni: 6,
      procedimento: "Impasta farina, uova, burro, zucchero e un goccio di grappa o liquore. Stendi la sfoglia sottilissima col matterello, taglia dei rettangoli e friggi in olio bollente.",
      note: "La sfoglia deve essere quasi trasparente per fare le bolle.",
      immagine: require("../assets/immagini_ricette/chiacchiere_di_carnevale.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "300", unita: "g" },
        { nome: "Uova", qta: "2", unita: "pz" },
        { nome: "Burro morbido", qta: "40", unita: "g" },
        { nome: "Grappa o Anice", qta: "20", unita: "ml" }
      ]
    },
    {
      id: "dol_14",
      nome: "Crema Pasticcera alla Vaniglia",
      descrizione: "La crema di base per eccellenza della pasticceria, ottima da sola o per farcire.",
      categoria: "dolce",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Scalda il latte con la vaniglia. Sbatti i tuorli con lo zucchero e l'amido. Versa il latte caldo a filo, rimetti sul fuoco basso e mescola continuamente fino a densità desiderata.",
      note: "Copri con pellicola a contatto per evitare la pellicina sopra.",
      immagine: require("../assets/immagini_ricette/crema_pasticcera_alla_vaniglia.png"),
      ingredienti: [
        { nome: "Latte intero", qta: "500", unita: "ml" },
        { nome: "Tuorli d'uovo", qta: "4", unita: "txt" },
        { nome: "Zucchero", qta: "100", unita: "g" },
        { nome: "Amido di mais", qta: "45", unita: "g" }
      ]
    },
    {
      id: "dol_15",
      nome: "Soufflé al Cioccolato dal Cuore Caldo",
      descrizione: "Monoporzioni spettacolari dal ripieno fondente e cremoso appena aperti.",
      categoria: "dolce",
      tempoPreparazione: 20,
      difficolta: "Alta",
      porzioni: 4,
      procedimento: "Sciogli cioccolato e burro. Unisci zucchero, uova e farina. Versa nei pirottini imburrati e congela oppure inforna subito a 200°C per esattamente 12 minuti.",
      note: "Il tempo di cottura è la chiave del successo: controlla il forno accuratamente.",
      immagine: require("../assets/immagini_ricette/souffle_al_cioccolato_dal_cuore_caldo.png"),
      ingredienti: [
        { nome: "Cioccolato fondente 60%", qta: "150", unita: "g" },
        { nome: "Burro", qta: "80", unita: "g" },
        { nome: "Uova", qta: "3", unita: "pz" },
        { nome: "Farina 00", qta: "30", unita: "g" }
      ]
    },

   // ==========================================
    // SPUNTINI (15 Ricette)
    // ==========================================
    {
      id: "spu_1",
      nome: "Toast Classico Prosciutto e Formaggio",
      descrizione: "Lo snack caldo, veloce e filante per placare la fame improvvisa.",
      categoria: "spuntino",
      tempoPreparazione: 5,
      difficolta: "Bassa",
      porzioni: 1,
      procedimento: "Farcisci due fette di pane con il prosciutto cotto e il formaggio a fette. Scalda nel tostapane o in padella un paio di minuti per lato finché non fonde.",
      note: "Spalma un velo invisibile di burro all'esterno del pane per renderlo extra dorato.",
      immagine: require("../assets/immagini_ricette/toast_classico_prosciutto_e_formaggio.png"),
      ingredienti: [
        { nome: "Pane in cassetta", qta: "2", unita: "fette" },
        { nome: "Prosciutto cotto", qta: "2", unita: "fette" },
        { nome: "Edamer o Fontina", qta: "2", unita: "fette" }
      ]
    },
    {
      id: "spu_2",
      nome: "Tramezzino Veneziano Tonno e Olive",
      descrizione: "Triangolo morbidissimo e panciuto strabordante di condimento goloso.",
      categoria: "spuntino",
      tempoPreparazione: 8,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Mescola il tonno sgocciolato con abbondante maionese e olive tritate. Farcisci il pane per tramezzini concentrando il condimento al centro, taglia a triangolo.",
      note: "Copri con un panno umido fino al servizio per non far seccare il pane.",
      immagine: require("../assets/immagini_ricette/tramezzino_veneziano_tonno_e_olive.png"),
      ingredienti: [
        { nome: "Pane per tramezzini bianco", qta: "2", unita: "fette" },
        { nome: "Tonno sott'olio", qta: "120", unita: "g" },
        { nome: "Maionese", qta: "3", unita: "cucchiai" },
        { nome: "Olive verdi denocciolate", qta: "30", unita: "g" }
      ]
    },
    {
      id: "spu_3",
      nome: "Bruschetta all'Avocado e Uovo in Camicia",
      descrizione: "Spuntino o brunch moderno, proteico, salutare e saporito.",
      categoria: "spuntino",
      tempoPreparazione: 12,
      difficolta: "Media",
      porzioni: 1,
      procedimento: "Schiaccia l'avocado con succo di limone e sale e spalma sul pane tostato. Cuoci l'uovo in camicia in acqua acidulata bollente per 3 minuti e adagialo sopra.",
      note: "Rompi il tuorlo sul momento.",
      immagine: require("../assets/immagini_ricette/bruschetta_all_avocado_e_uovo_in_camicia.png"),
      ingredienti: [
        { nome: "Pane di segale", qta: "1", unita: "fetta" },
        { nome: "Avocado maturo", qta: "0.5", unita: "pz" },
        { nome: "Uovo", qta: "1", unita: "pz" }
      ]
    },
    {
      id: "spu_4",
      nome: "Piadina Romagnola Stracchino e Rucola",
      descrizione: "L'abbinamento stracchino, rucola (e crudo opzionale) avvolto nella piadina calda.",
      categoria: "spuntino",
      tempoPreparazione: 8,
      difficolta: "Bassa",
      porzioni: 1,
      procedimento: "Scalda la piadina un minuto per lato su una piastra rovente. Togli dal fuoco, spalma lo stracchino, aggiungi la rucola fresca, piega a metà e servi calda.",
      note: "Usa piadine sottili se ami la croccantezza.",
      immagine: require("../assets/immagini_ricette/piadina_romagnola_stracchino_e_rucola.png"),
      ingredienti: [
        { nome: "Piadina romagnola pronta", qta: "1", unita: "pz" },
        { nome: "Stracchino", qta: "100", unita: "g" },
        { nome: "Rucola", qta: "20", unita: "g" }
      ]
    },
    {
      id: "spu_5",
      nome: "Pizzette di Sfoglia da Aperitivo",
      descrizione: "Crosticine fragranti e irresistibili pronte in un lampo.",
      categoria: "spuntino",
      tempoPreparazione: 20,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Ricava dei dischetti dalla sfoglia. Metti al centro un cucchiaino di pomodoro condito e un cubetto di mozzarella. Inforna a 200°C per 12 minutes.",
      note: "Finisci con un pizzico di origano secco all'uscita dal forno.",
      immagine: require("../assets/immagini_ricette/pizzette_di_sfoglia_da_aperitivo.png"),
      ingredienti: [
        { nome: "Rotolo di pasta sfoglia rotondo", qta: "1", unita: "pz" },
        { nome: "Passata di pomodoro", qta: "4", unita: "cucchiai" },
        { nome: "Mozzarella per pizza", qta: "50", unita: "g" }
      ]
    },
    {
      id: "spu_6",
      nome: "Nuggets di Pollo Light in Friggitrice ad Aria",
      descrizione: "Bocconcini dorati e croccanti senza i grassi della frittura classica.",
      categoria: "spuntino",
      tempoPreparazione: 18,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Taglia il petto di pollo a cubetti. Passali nell'uovo sbattuto e poi nei corn flakes sbriciolati finemente. Cuoci in airfryer a 190°C per 10-12 minuti.",
      note: "Spruzza un velo d'olio spray per uniformare la doratura.",
      immagine: require("../assets/immagini_ricette/nuggets_di_pollo_light_in_friggitrice_ad_aria.png"),
      ingredienti: [
        { nome: "Petto di pollo", qta: "300", unita: "g" },
        { nome: "Uovo", qta: "1", unita: "pz" },
        { nome: "Corn flakes senza zucchero", qta: "60", unita: "g" }
      ]
    },
    {
      id: "spu_7",
      nome: "Rotolini di Tortilla con Pollo e Formaggio",
      descrizione: "Involtini tex-mex freddi tagliati a girelle, perfetti da condividere.",
      categoria: "spuntino",
      tempoPreparazione: 15,
      difficolta: "Bassa",
      porzioni: 3,
      procedimento: "Spalma il formaggio cremoso sulla tortilla. Aggiungi insalata sottile e straccetti di pollo avanzato (o tacchino affettato). Arrotola stretto, avvolgi in pellicola e taglia a rondelle dopo 15 min.",
      note: "Ottima ricetta svuota-frigo.",
      immagine: require("../assets/immagini_ricette/rotolini_di_tortilla_con_pollo_e_formaggio.png"),
      ingredienti: [
        { nome: "Tortilla di frumento", qta: "2", unita: "pz" },
        { nome: "Formaggio spalmabile", qta: "80", unita: "g" },
        { nome: "Fesa di tacchino o pollo", qta: "100", unita: "g" }
      ]
    },
    {
      id: "spu_8",
      nome: "Nachos con Salsa Guacamole Homemade",
      descrizione: "Snack da divano per eccellenza: patatine di mais e crema messicana di avocado.",
      categoria: "spuntino",
      tempoPreparazione: 10,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Schiaccia la polpa dell'avocado con una forchetta. Unisci pomodoro a cubetti piccolissimi, cipolla tritata fine, succo di lime, sale e coriandolo. Servi con i nachos.",
      note: "Il guacamole si ossida in fretta: aggiungi il lime immediatamente.",
      immagine: require("../assets/immagini_ricette/nachos_con_salsa_guacamole_homemade.png"),
      ingredienti: [
        { nome: "Chips di tortilla (Nachos)", qta: "150", unita: "g" },
        { nome: "Avocado maturo", qta: "1", unita: "pz" },
        { nome: "Pomodoro piccolo", qta: "1", unita: "pz" },
        { nome: "Lime (succo)", qta: "0.5", unita: "pz" }
      ]
    },
    {
      id: "spu_9",
      nome: "Focaccina Veloce in Padella",
      descrizione: "Senza lievitazione, pronta in 15 minuti per voglie improvvise di carboidrati.",
      categoria: "spuntino",
      tempoPreparazione: 15,
      difficolta: "Media",
      porzioni: 2,
      procedimento: "Impasta farina, acqua, olio, un pizzico di sale e lievito istantaneo per torte salate. Dividi in due, stendi e cuoci in padella antiaderente coperta 6 minuti per lato.",
      note: "Puoi farcirla all'interno con del formaggio prima di cuocerla.",
      immagine: require("../assets/immagini_ricette/focaccina_veloce_in_padella.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "150", unita: "g" },
        { nome: "Acqua", qta: "70", unita: "ml" },
        { nome: "Olio di semi o oliva", qta: "1", unita: "cucchiaio" },
        { nome: "Lievito istantaneo per salati", qta: "1", unita: "cucchiaino" }
      ]
    },
    {
      id: "spu_10",
      nome: "Popcorn Gourmet Cacio e Pepe",
      descrizione: "Al cinema sì, ma con una marcia in più saporita all'italiana.",
      categoria: "spuntino",
      tempoPreparazione: 8,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Fai scoppiare i chicchi di mais in padella con un filo d'olio coperti da coperchio. Appena caldi, versali in una ciotola capiente e mescolali velocemente con pecorino e tanto pepe.",
      note: "Il formaggio si attacca grazie al vapore caldo dei popcorn appena fatti.",
      immagine: require("../assets/immagini_ricette/popcorn_gourmet_cacio_e_pepe.png"),
      ingredienti: [
        { nome: "Mais per popcorn", qta: "70", unita: "g" },
        { nome: "Pecorino grattugiato fine", qta: "30", unita: "g" },
        { nome: "Pepe nero macinato", qta: "1", unita: "pizzico" }
      ]
    },
    {
      id: "spu_11",
      nome: "Edamame Salati",
      descrizione: "I famosi baccelli di soia dei ristoranti giapponesi, snack salutare e proteico.",
      categoria: "spuntino",
      tempoPreparazione: 8,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Lessa i baccelli congelati in acqua bollente salata per 5 minuti. Scola, passali sotto acqua fredda e cospargi generosamente con sale in fiocchi prima di sgranocchiarli.",
      note: "Si mangia solo il fagiolo interno, non la buccia!",
      immagine: require("../assets/immagini_ricette/edamame_salati.png"),
      ingredienti: [
        { nome: "Baccelli edamame surgelati", qta: "200", unita: "g" },
        { nome: "Sale in fiocchi", qta: "1", unita: "pizzico" }
      ]
    },
    {
      id: "spu_12",
      nome: "Chips di Cavolo Nero (Kale Chips)",
      descrizione: "Snack alternativo vegetale croccante come patatine, ma super leggero.",
      categoria: "spuntino",
      tempoPreparazione: 18,
      difficolta: "Bassa",
      porzioni: 2,
      procedimento: "Pulisci il cavolo togliendo la costa centrale dura. Spezza le foglie, condiscile con pochissimo olio sfregandole con le mani. Inforna a 170°C per 10 minuti fino a renderle friabili.",
      note: "Controlla spesso per non farle bruciare assumendo sapore amaro.",
      immagine: require("../assets/immagini_ricette/chips_di_cavolo_nero_kale_chips.png"),
      ingredienti: [
        { nome: "Cavolo nero", qta: "150", unita: "g" },
        { nome: "Olio EVO", qta: "1", unita: "cucchiaino" }
      ]
    },
    {
      id: "spu_13",
      nome: "Girelle di Sfoglia alla Nutella",
      descrizione: "Tre ingredienti per merende dell'ultimo minuto dolci e profumate.",
      categoria: "spuntino",
      tempoPreparazione: 25,
      difficolta: "Bassa",
      porzioni: 4,
      procedimento: "Srotola la sfoglia, spalma uno strato sottile di Nutella. Arrotola dal lato lungo stringendo bene. Taglia a rondelle di circa 2 cm, adagiale sulla teglia e cuoci a 200°C per 15 min.",
      note: "Lasciale intiepidire prima di addentarle.",
      immagine: require("../assets/immagini_ricette/girelle_di_sfoglia_alla_nutella.png"),
      ingredienti: [
        { nome: "Pasta sfoglia rettangolare", qta: "1", unita: "pz" },
        { nome: "Nutella", qta: "4", unita: "cucchiai" }
      ]
    },
    {
      id: "spu_14",
      nome: "Frullato Energetico Banana e Peanut Butter",
      descrizione: "Snack da bere ideale prima dell'allenamento sportivo.",
      categoria: "spuntino",
      tempoPreparazione: 5,
      difficolta: "Bassa",
      porzioni: 1,
      procedimento: "Metti nel frullatore la banana a pezzi, il latte freddo, il burro d'arachidi e un pizzico di cannella. Frulla alla massima potenza fino a consistenza spumosa e liscia.",
      note: "Se usi la banana congelata otterrai la consistenza di un milkshake.",
      immagine: require("../assets/immagini_ricette/frullato_energetico_banana_e_peanut_butter.png"),
      ingredienti: [
        { nome: "Banana matura", qta: "1", unita: "pz" },
        { nome: "Latte di mandorla o vaccino", qta: "200", unita: "ml" },
        { nome: "Burro d'arachidi", qta: "1", unita: "cucchiaio" }
      ]
    },
    {
      id: "spu_15",
      nome: "Plumcake Salato Feta e Olive",
      descrizione: "Soffice torta salata di ispirazione greca ottima tagliata a cubetti.",
      categoria: "spuntino",
      tempoPreparazione: 50,
      difficolta: "Media",
      porzioni: 6,
      procedimento: "Sbatti uova, olio e latte. Unisci farina e lievito istantaneo salato. Incorpora delicatamente a mano la feta a cubetti e le olive denocciolate. Inforna a 180°C per 35-40 min.",
      note: "Usa uno stecchino per verificare la cottura al centro.",
      immagine: require("../assets/immagini_ricette/plumcake_salato_feta_e_olive.png"),
      ingredienti: [
        { nome: "Farina 00", qta: "200", unita: "g" },
        { nome: "Formaggio Feta", qta: "120", unita: "g" },
        { nome: "Olive nere greche", qta: "50", unita: "g" },
        { nome: "Uova", qta: "3", unita: "txt" }
      ]
    }
  ];