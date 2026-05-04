demo_transcript_02_tv_ops_cz
Fiktivní/demo přepis. Žádní skuteční účastníci, klienti ani důvěrné informace.

Meeting title: Newsroom FAQ Support Training
Department: TV Operations Demo
Meeting type: workflow training
Language hint: Czech with English workflow terms
Audience: editors, coordinators, internal AI ambassadors

Transcript
Facilitator: Dneska si projdeme demo workflow pro newsroom FAQ support. Je důležité říct hned na začátku, že nejde o produkční proces a nejde o automatizaci rozhodnutí. Cílem je ukázat, jak by AI mohla pomoci po interním školení připravit strukturovaný follow-up: návrh FAQ, seznam rizik, rozhodnutí, action items a krátkou zprávu pro ambasadory nebo editory. Všechno je demo-only. Nepoužíváme reálné přepisy porad, reálné incidenty ani žádná citlivá data.

Jana: Za redakci vidíme hlavní problém v tom, že se opakují stejné otázky. Lidé se ptají, kde najdou newsroom šablonu, jak označit urgentní dotaz, kdy už je potřeba zapojit editora, kdo má odpověď finálně potvrdit a co se nemá dávat do interního ticketu nebo transcript boxu. AI by mohla pomoct tím, že z přepisu školení připraví první draft FAQ. Ale ten draft nesmí jít nikam automaticky. Musí projít lidskou kontrolou.

Marek: Přesně. Za mě je klíčové, aby workflow neposílalo odpovědi samo. Nechci, aby se stalo, že AI něco shrne, formuluje to moc sebevědomě a někdo to začne brát jako schválenou policy. Proces by měl být: člověk vloží transcript, AI vytvoří draft, draft se uloží do Google Sheets, reviewer ho zkontroluje a teprve po approval může jít interní shrnutí dál třeba přes Telegram nebo e-mail.

Facilitator: Takže první rozhodnutí: MVP zůstává u manual transcript paste. Nebudeme teď řešit audio upload ani speech-to-text. Potřebujeme nejdřív ověřit, jestli AI follow-up dává smysl, jestli je review krok dostatečně jasný a jestli se dá výstup bezpečně schvalovat. Výstup půjde do Sheetu jako draft a notifikace se spustí až po schválení.

Editor A: Potřebujeme taky jasně definovat, co přesně workflow produkuje. Pokud z toho vypadne jen obecné summary, nebude to pro ambasadory moc užitečné. Já bych chtěl, aby výstup obsahoval pět částí: FAQ, seznam rizik, rozhodnutí, action items a krátkou interní zprávu, kterou lze poslat po školení. Ideálně tak, aby reviewer nemusel všechno psát od nuly.

Jana: Připravím fake demo dataset s top 20 opakovanými dotazy. Deadline bych dala 19. dubna. Budou tam otázky typu: kde je newsroom šablona, co znamená urgentní dotaz, kdy escalovat na editora, kdo schvaluje odpověď, co nedávat do transcript boxu a jak poznat, že otázka patří mimo FAQ workflow.

Coordinator B: U action items bych chtěl jedno pravidlo: workflow nesmí halucinovat owners a deadlines. Když někdo v transcriptu neřekne, kdo má úkol udělat, tak se owner nesmí vymyslet. A když není deadline, tak má být označený jako missing. Jinak to bude vypadat přesněji, než to ve skutečnosti je.

Facilitator: To je důležité. Druhé rozhodnutí: owners a deadlines se nesmí doplňovat odhadem. Pokud nejsou explicitně v transcriptu, workflow je označí jako missing. Reviewer pak může ručně doplnit informace ve schvalovací vrstvě, ale AI je nesmí sama vymýšlet.

Editor A: Máme ještě riziko, že někdo do demo workflow vloží citlivé informace z reálné porady. Potřebujeme mít viditelné pravidlo: jen demo data, žádné reálné záznamy, žádné osobní údaje, žádné informace o hostech, žádné neveřejné redakční plány a žádné interní incidenty. To musí být napsané přímo u vstupu.

Marek: Souhlas. A před produkcí musí někdo zkontrolovat právní a GDPR část. Deadline jsme k tomu neurčili, takže bych to nechal jako open risk nebo required pre-production review. Bez toho se workflow nesmí posunout mimo demo. Produkční verze by potřebovala retention rules, jasné ownership nad review procesem a audit trail, kdo co schválil.

Jana: Chtěla bych, aby follow-up rozlišoval mezi rozhodnutím a doporučením. Když AI navrhnu třeba “zvažte sjednocení newsroom šablon”, nesmí to vypadat jako hotové rozhodnutí. Ve výstupu musí být jasná sekce Decisions a zvlášť Suggestions nebo AI adoption opportunities.

Facilitator: Třetí rozhodnutí: AI adoption opportunities budou ve výstupu označené jako suggestions, ne jako závazná rozhodnutí. To je důležité pro očekávání týmu. AI může pomoct pojmenovat příležitosti, ale nemůže sama vytvořit policy.

Editor B: Mně by pomohl reviewer checklist. Něco krátkého, co člověk projde před approval. Například: používá vstup jen fake data? Nejsou ve výstupu citlivé údaje? Nejsou vymyšlení owners nebo deadlines? Není něco formulované jako finální policy, i když to bylo jen doporučení? A dává approved text smysl pro interní sdílení?

Coordinator B: Ještě bych doplnil vysvětlení approval stavů. Kdy má reviewer použít approve a kdy approve_with_sheet_edits? Pokud to nebude jasné, každý to bude používat jinak.

Facilitator: Dobrá poznámka. Do workflow guidance dáme, že approve znamená schválit AI draft beze změn. approve_with_sheet_edits znamená, že reviewer upravil text ve Sheetu a schvaluje lidsky upravenou verzi. Reject znamená, že výstup není vhodný ke sdílení a musí se přepracovat.

Marek: AI adoption opportunity je hlavně ve zrychlení follow-upu po školení. Druhá věc je vytvoření konzistentního FAQ pro ambasadory. Impact bych označil jako high, effort jako medium. Není to technicky extrémně složité, ale proces potřebuje governance, reviewer ownership a základní audit trail.

Jana: Pokud to bude fungovat, další fáze by mohl být agregovaný FAQ dataset z více školení. Ale to bych teď nedávala do MVP. Teď potřebujeme ověřit jeden transcript, jeden draft, jeden review krok a jednu schválenou interní zprávu.

Editor A: Pro ambasadory bych chtěl skoro hotovou formulaci: “AI nám pomáhá strukturovat otázky, odpovědi a další kroky po školení, ale obsah se před odesláním vždy kontroluje člověkem.” To je důležitá zpráva, protože nechceme vyvolat dojem, že AI nahrazuje editora nebo koordinátora.

Coordinator B: Jako open question bych přidal, jestli Google Sheets zůstane review layer i při vyšším objemu. Pro demo je to v pořádku, protože je to jednoduché a viditelné. Ale pokud by se z toho stal pravidelný proces, možná bude lepší ticketing tool nebo databáze.

Facilitator: Ano, zapíšeme to jako open question. Pro demo je Google Sheets dostatečný review layer, ale nebudeme tvrdit, že je to definitivní production solution. Produkční návrh by musel řešit objem, audit, přístupová práva a historii změn.

Marek: Ještě reliability poznámka. Pokud Telegram notifikace selže, workflow nesmí přepsat approved stav zpátky nebo vytvořit zmatek v review procesu. Approval a delivery musí být oddělené. Schválení je jedna věc, doručení zprávy druhá.

Facilitator: Souhlas. Pro MVP nám stačí, že approval je oddělený od delivery a že notifikace se spouští až po schválení. Do další iterace přidáme poznámku, že selhání notifikace má skončit bezpečně, ideálně s error stavem nebo retry mechanismem, ale bez změny schváleného obsahu.

Editor B: Ještě bych chtěl, aby výstup nebyl moc dlouhý. FAQ může být detailnější, ale interní zpráva musí být krátká. Lidé ji budou číst v chatu nebo e-mailu, takže by měla mít maximálně pár vět.

Jana: A tón by měl být interní, praktický, ne marketingový. Nechceme, aby to znělo jako prezentace vendorovi. Je to pracovní follow-up pro redakční tým.

Facilitator: Dobře. Shrnu dnešní závěry. MVP používá ručně vložený transcript, AI vytvoří draft do Google Sheets, reviewer výstup zkontroluje a potom zvolí approve, approve_with_sheet_edits nebo reject. Workflow nesmí vymýšlet owners ani deadlines. AI suggestions nesmí vypadat jako závazné policy. Notifikace se odešle až po schválení. Pro produkci zůstávají otevřené právní, GDPR, retention, audit trail a otázka, jestli Sheets stačí jako dlouhodobý review layer.