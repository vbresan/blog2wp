# blog2wp

Alat koji radi u web pregledniku i pretvara ZIP arhivu blog.hr postova u WordPress WXR (XML) datoteku za uvoz — bez prijenosa podataka, sve se odvija lokalno u pregledniku.

## Korištenje

1. Otvorite https://vbresan.github.io/blog2wp/
2. Ispustite ZIP datoteku na označeno područje ili kliknite **Odaberite datoteku**
3. Nakon obrade kliknite **Preuzmi XML**
4. Uvezite preuzetu datoteku `blog2wp.xml` u WordPress putem **Alati → Uvoz → WordPress**

## Datoteke

| Datoteka | Opis |
|---|---|
| `index.html` | Glavna HTML stranica |
| `style.css` | Stilovi prema Material Design 3 smjernicama |
| `main.js` | Logika obrade ZIP arhive i generiranja XMLa |

## Ovisnosti

- [JSZip 3.10.1](https://stuk.github.io/jszip/) — učitava se s cdnjs, nije potrebna instalacija

## Dodatno

`extract.py` — Python alat koji pretvara WordPress WXR datoteku natrag u čisti tekst. Korisno za provjeru izvoza ili migraciju sadržaja.

`python extract.py export.xml output.txt`

## Licenca

MIT
