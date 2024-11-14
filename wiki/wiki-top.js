const axios = require('axios');
const yargs = require('yargs');

// Namespace configurations
const namespaces = {
    'en': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'Draft:', 'User:', 'MediaWiki:'],
    'zh': ['特殊:', '维基百科:', '文件:', '模板:', '帮助:', '分类:', '门户:', '用户:', 'MediaWiki:'],
    'hi': ['विशेष:', 'विकिपीडिया:', 'चित्र:', 'साँचा:', 'सहायता:', 'श्रेणी:', 'पोर्टल:', 'सदस्य:', 'MediaWiki:'],
    'es': ['Especial:', 'Wikipedia:', 'Archivo:', 'Plantilla:', 'Ayuda:', 'Categoría:', 'Portal:', 'Usuario:', 'MediaWiki:'],
    'fr': ['Spécial:', 'Wikipédia:', 'Fichier:', 'Modèle:', 'Aide:', 'Catégorie:', 'Portail:', 'Utilisateur:', 'MediaWiki:'],
    'ar': ['خاص:', 'ويكيبيديا:', 'ملف:', 'قالب:', 'مساعدة:', 'تصنيف:', 'بوابة:', 'مستخدم:', 'MediaWiki:'],
    'bn': ['বিশেষ:', 'উইকিপিডিয়া:', 'চিত্র:', 'টেমপ্লেট:', 'সাহায্য:', 'বিষয়শ্রেণী:', 'প্রবেশদ্বার:', 'ব্যবহারকারী:', 'MediaWiki:'],
    'ru': ['Служебная:', 'Википедия:', 'Файл:', 'Шаблон:', 'Справка:', 'Категория:', 'Портал:', 'Участник:', 'MediaWiki:'],
    'pt': ['Especial:', 'Wikipédia:', 'Ficheiro:', 'Predefinição:', 'Ajuda:', 'Categoria:', 'Portal:', 'Usuário:', 'MediaWiki:'],
    'ur': ['خاص:', 'ویکیپیڈیا:', 'فائل:', 'سانچہ:', 'معاونت:', 'زمرہ:', 'باب:', 'صارف:', 'MediaWiki:'],
    'id': ['Istimewa:', 'Wikipedia:', 'Berkas:', 'Templat:', 'Bantuan:', 'Kategori:', 'Portal:', 'Pengguna:', 'MediaWiki:'],
    'de': ['Spezial:', 'Wikipedia:', 'Datei:', 'Vorlage:', 'Hilfe:', 'Kategorie:', 'Portal:', 'Benutzer:', 'MediaWiki:'],
    'ja': ['特別:', 'Wikipedia:', 'ファイル:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'sw': ['Maalum:', 'Wikipedia:', 'Faili:', 'Kigezo:', 'Msaada:', 'Jamii:', 'Lango:', 'Mtumiaji:', 'MediaWiki:'],
    'mr': ['विशेष:', 'विकिपीडिया:', 'चित्र:', 'साचा:', 'सहाय्य:', 'वर्ग:', 'दालन:', 'सदस्य:', 'MediaWiki:'],
    'te': ['ప్రత్యేక:', 'వికీపీడియా:', 'దస్త్రం:', 'మూస:', 'సహాయం:', 'వర్గం:', 'వేదిక:', 'వాడుకరి:', 'MediaWiki:'],
    'pa': ['ਖਾਸ:', 'ਵਿਕੀਪੀਡੀਆ:', 'ਫਾਈਲ:', 'ਫਰਮਾ:', 'ਮਦਦ:', 'ਸ਼੍ਰੇਣੀ:', 'ਪੋਰਟਲ:', 'ਵਰਤੋਂਕਾਰ:', 'MediaWiki:'],
    'ta': ['சிறப்பு:', 'விக்கிப்பீடியா:', 'கோப்பு:', 'வார்ப்புரு:', 'உதவி:', 'பகுப்பு:', 'வலைவாசல்:', 'பயனர்:', 'MediaWiki:'],
    'tr': ['Özel:', 'Vikipedi:', 'Dosya:', 'Şablon:', 'Yardım:', 'Kategori:', 'Portal:', 'Kullanıcı:', 'MediaWiki:'],
    'it': ['Speciale:', 'Wikipedia:', 'File:', 'Template:', 'Aiuto:', 'Categoria:', 'Portale:', 'Utente:', 'MediaWiki:'],
    'th': ['พิเศษ:', 'วิกิพีเดีย:', 'ไฟล์:', 'แม่แบบ:', 'วิธีใช้:', 'หมวดหมู่:', 'สถานีย่อย:', 'ผู้ใช้:', 'MediaWiki:'],
    'gu': ['વિશેષ:', 'વિકિપીડિયા:', 'ફાઇલ:', 'ઢાંચો:', 'મદદ:', 'શ્રેણી:', 'દ્વાર:', 'સભ્ય:', 'MediaWiki:'],
    'fa': ['ویژه:', 'ویکی‌پدیا:', 'پرونده:', 'الگو:', 'راهنما:', 'رده:', 'درگاه:', 'کاربر:', 'MediaWiki:'],
    'pl': ['Specjalna:', 'Wikipedia:', 'Plik:', 'Szablon:', 'Pomoc:', 'Kategoria:', 'Portal:', 'Użytkownik:', 'MediaWiki:'],
    'uk': ['Спеціальна:', 'Вікіпедія:', 'Файл:', 'Шаблон:', 'Довідка:', 'Категорія:', 'Портал:', 'Користувач:', 'MediaWiki:'],
    'kn': ['ವಿಶೇಷ:', 'ವಿಕಿಪೀಡಿಯ:', 'ಚಿತ್ರ:', 'ಟೆಂಪ್ಲೇಟು:', 'ಸಹಾಯ:', 'ವರ್ಗ:', 'ಪೋರ್ಟಲ್:', 'ಸದಸ್ಯ:', 'MediaWiki:'],
    'ml': ['പ്രത്യേകം:', 'വിക്കിപീഡിയ:', 'പ്രമാണം:', 'ഫലകം:', 'സഹായം:', 'വർഗ്ഗം:', 'കവാടം:', 'ഉപയോക്താവ്:', 'MediaWiki:'],
    'or': ['ବିଶେଷ:', 'ଉଇକିପିଡ଼ିଆ:', 'ଫାଇଲ:', 'ଛାଞ୍ଚ:', 'ସହଯୋଗ:', 'ଶ୍ରେଣୀ:', 'ପୋର୍ଟାଲ:', 'ବ୍ୟବହାରକାରୀ:', 'MediaWiki:'],
    'my': ['အထူး:', 'ဝီကီပီးဒီးယား:', 'ဖိုင်:', 'တမ်းပလိတ်:', 'အကူအညီ:', 'ကဏ္ဍ:', 'ဝင်ပေါက်:', 'အသုံးပြုသူ:', 'MediaWiki:'],
    'ro': ['Special:', 'Wikipedia:', 'Fișier:', 'Format:', 'Ajutor:', 'Categorie:', 'Portal:', 'Utilizator:', 'MediaWiki:'],
    'nl': ['Speciaal:', 'Wikipedia:', 'Bestand:', 'Sjabloon:', 'Help:', 'Categorie:', 'Portaal:', 'Gebruiker:', 'MediaWiki:'],
    'el': ['Ειδικό:', 'Βικιπαίδεια:', 'Αρχείο:', 'Πρότυπο:', 'Βοήθεια:', 'Κατηγορία:', 'Πύλη:', 'Χρήστης:', 'MediaWiki:'],
    'hu': ['Speciális:', 'Wikipédia:', 'Fájl:', 'Sablon:', 'Segítség:', 'Kategória:', 'Portál:', 'Szerkesztő:', 'MediaWiki:'],
    'cs': ['Speciální:', 'Wikipedie:', 'Soubor:', 'Šablona:', 'Nápověda:', 'Kategorie:', 'Portál:', 'Uživatel:', 'MediaWiki:'],
    'sv': ['Special:', 'Wikipedia:', 'Fil:', 'Mall:', 'Hjälp:', 'Kategori:', 'Portal:', 'Användare:', 'MediaWiki:'],
    'jv': ['Astamiwa:', 'Wikipedia:', 'Barkas:', 'Cithakan:', 'Pitulung:', 'Kategori:', 'Gapura:', 'Panganggo:', 'MediaWiki:'],
    'tl': ['Natatangi:', 'Wikipedia:', 'Talaksan:', 'Padron:', 'Tulong:', 'Kategorya:', 'Portal:', 'Tagagamit:', 'MediaWiki:'],
    'az': ['Xüsusi:', 'Vikipediya:', 'Fayl:', 'Şablon:', 'Kömək:', 'Kateqoriya:', 'Portal:', 'İstifadəçi:', 'MediaWiki:'],
    'ha': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'he': ['מיוחד:', 'ויקיפדיה:', 'קובץ:', 'תבנית:', 'עזרה:', 'קטגוריה:', 'פורטל:', 'משתמש:', 'MediaWiki:'],
    'sh': ['Posebno:', 'Wikipedia:', 'Datoteka:', 'Šablon:', 'Pomoć:', 'Kategorija:', 'Portal:', 'Korisnik:', 'MediaWiki:'],
    'yo': ['Pàtàkì:', 'Wikipedia:', 'Fáìlì:', 'Àdàkọ:', 'Ìrànlọ́wọ́:', 'Ẹ̀ka:', 'Èbúté:', 'Oníṣe:', 'MediaWiki:'],
    'ff': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'qu': ['Especial:', 'Wikipedia:', 'Archivo:', 'Plantilla:', 'Ayuda:', 'Categoría:', 'Portal:', 'Usuario:', 'MediaWiki:'],
    'ug': ['ئالاھىدە:', 'ۋىكىپېدىيە:', 'ھۆججەت:', 'قېلىپ:', 'ياردەم:', 'تۈر:', 'پورتال:', 'ئىشلەتكۈچى:', 'MediaWiki:'],
    'xh': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'zu': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'am': ['ልዩ:', 'ውክፔዲያ:', 'ፋይል:', 'መለጠፊያ:', 'እርዳታ:', 'መደብ:', 'ፖርታል:', 'አባል:', 'MediaWiki:'],
    'sn': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'so': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'ne': ['विशेष:', 'विकिपिडिया:', 'फा���ल:', 'ढाँचा:', 'मद्दत:', 'श्रेणी:', 'पोर्टल:', 'प्रयोगकर्ता:', 'MediaWiki:'],
    'si': ['විශේෂ:', 'විකිපීඩියා:', 'ගොනුව:', 'සැකිල්ල:', 'උදවු:', 'ප්‍රවර්ගය:', 'ද්වාරය:', 'පරිශීලක:', 'MediaWiki:'],
    'mg': ['Manokana:', 'Wikipedia:', 'Rakitra:', 'Endrika:', 'Fanoroana:', 'Sokajy:', 'Portal:', 'Mpikambana:', 'MediaWiki:'],
    'tt': ['Махсус:', 'Википедия:', 'Файл:', 'Калып:', 'Ярдәм:', 'Төркем:', 'Портал:', 'Кулланучы:', 'MediaWiki:'],
    'km': ['ពិសេស:', 'វិគីភីឌា:', 'ឯកសារ:', 'ទំព័រគំរូ:', 'ជំនួយ:', 'ចំណាត់ថ្នាក់ក្រុម:', 'លំហចូល:', 'អ្នកប្រើប្រាស់:', 'MediaWiki:'],
    'lo': ['ພິເສດ:', 'ວິກິພີເດຍ:', 'ແຟ້ມ:', 'ແມ່ແບບ:', 'ຊ່ວຍເຫຼືອ:', 'ໝວດ:', 'ໂພທໍ:', 'ຜູ້ໃຊ້:', 'MediaWiki:'],
    'fy': ['Wiki:', 'Wikipedy:', 'Ofbyld:', 'Berjocht:', 'Help:', 'Kategory:', 'Portaal:', 'Meidogger:', 'MediaWiki:'],
    'su': ['Husus:', 'Wikipedia:', 'Gambar:', 'Citakan:', 'Pitulung:', 'Kategori:', 'Portal:', 'Pamaké:', 'MediaWiki:'],
    'lb': ['Spezial:', 'Wikipedia:', 'Fichier:', 'Schabloun:', 'Hëllef:', 'Kategorie:', 'Portal:', 'Benotzer:', 'MediaWiki:'],
    'dv': ['ހާއްސަ:', 'ވިކިޕީޑިއާ:', 'ފައިލް:', 'ފަންވަތް:', 'އެހީ:', 'ޤިސްމު:', 'ޕޯޓަލް:', 'މެންބަރު:', 'MediaWiki:'],
    'ps': ['ځانګړی:', 'ويکيپېډيا:', 'دوتنه:', 'کينډۍ:', 'لارښود:', 'وېشنيزه:', 'تانبه:', 'کارن:', 'MediaWiki:'],
    'ky': ['Атайын:', 'Википедия:', 'Файл:', 'Калып:', 'Жардам:', 'Категория:', 'Портал:', 'Колдонуучу:', 'MediaWiki:'],
    'nv': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'sc': ['Speciale:', 'Wikipedia:', 'File:', 'Template:', 'Agiudu:', 'Categoria:', 'Portal:', 'Usuàriu:', 'MediaWiki:'],
    'ia': ['Special:', 'Wikipedia:', 'File:', 'Patrono:', 'Adjuta:', 'Categoria:', 'Portal:', 'Usator:', 'MediaWiki:'],
    'gd': ['Sònraichte:', 'Uicipeid:', 'Faidhle:', 'Teamplaid:', 'Cobhair:', 'Roinn-seòrsa:', 'Portal:', 'Cleachdaiche:', 'MediaWiki:'],
    'lg': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'mi': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'ak': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'ln': ['Spécial:', 'Wikipedia:', 'Fichier:', 'Modèle:', 'Aide:', 'Catégorie:', 'Portail:', 'Utilisateur:', 'MediaWiki:'],
    'br': ['Dibar:', 'Wikipedia:', 'Restr:', 'Patrom:', 'Skoazell:', 'Rummad:', 'Portal:', 'Implijer:', 'MediaWiki:'],
    'bs': ['Posebno:', 'Wikipedia:', 'Datoteka:', 'Šablon:', 'Pomoć:', 'Kategorija:', 'Portal:', 'Korisnik:', 'MediaWiki:'],
    'mt': ['Speċjali:', 'Wikipedija:', 'Stampa:', 'Mudell:', 'Għajnuna:', 'Kategorija:', 'Portal:', 'Utent:', 'MediaWiki:'],
    'ti': ['ፍሉይ:', 'ዊኪፔዲያ:', 'ፋይል:', 'ሞደል:', 'ሓገዝ:', 'መደብ:', 'Portal:', 'ተጠቃሚ:', 'MediaWiki:'],
    'sg': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'gv': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'oc': ['Especial:', 'Wikipèdia:', 'Fichièr:', 'Modèl:', 'Ajuda:', 'Categoria:', 'Portal:', 'Utilizaire:', 'MediaWiki:'],
    'af': ['Spesiaal:', 'Wikipedia:', 'Lêer:', 'Sjabloon:', 'Hulp:', 'Kategorie:', 'Portaal:', 'Gebruiker:', 'MediaWiki:'],
    'is': ['Kerfissíða:', 'Wikipedia:', 'Mynd:', 'Snið:', 'Hjálp:', 'Flokkur:', 'Gátt:', 'Notandi:', 'MediaWiki:'],
    'ba': ['Махсус:', 'Википедия:', 'Файл:', 'Ҡалып:', 'Белешмә:', 'Категория:', 'Портал:', 'Ҡатнашыусы:', 'MediaWiki:'],
    'mk': ['Специјална:', 'Википедија:', 'Податотека:', 'Шаблон:', 'Помош:', 'Категорија:', 'Портал:', 'Корисник:', 'MediaWiki:'],
    'mn': ['Тусгай:', 'Википедиа:', 'Файл:', 'Загвар:', 'Тусламж:', 'Ангилал:', 'Portal:', 'Хэрэглэгч:', 'MediaWiki:'],
    'wa': ['Sipeciås:', 'Wikipedia:', 'Fitchî:', 'Modele:', 'Aidance:', 'Categoreye:', 'Potå:', 'Uzeu:', 'MediaWiki:'],
    'rm': ['Special:', 'Wikipedia:', 'Datoteca:', 'Model:', 'Agid:', 'Categoria:', 'Portal:', 'Utilisader:', 'MediaWiki:'],
    'cu': ['Наро́чьна:', 'Википєдїꙗ:', 'Дѣло:', 'Обраꙁьць:', 'Помощь:', 'Катигорїꙗ:', 'Портал:', 'Польꙃєватєл҄ь:', 'MediaWiki:'],
    'yi': ['באַזונדער:', 'װיקיפּעדיע:', 'טעקע:', 'מוסטער:', 'הילף:', 'קאַטעגאָריע:', 'פארטאל:', 'באַניצער:', 'MediaWiki:'],
    'cv': ['Ятарлă:', 'Википеди:', 'Файл:', 'Шаблон:', 'Пулăшу:', 'Категори:', 'Портал:', 'Хутшăнакан:', 'MediaWiki:'],
    'os': ['Сæрмагонд:', 'Википеди:', 'Файл:', 'Шаблон:', 'Æххуыс:', 'Категори:', 'Портал:', 'Архайæг:', 'MediaWiki:'],
    'tn': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'rn': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'st': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'ts': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'ss': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    've': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'nr': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'tw': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:'],
    'ik': ['Special:', 'Wikipedia:', 'File:', 'Template:', 'Help:', 'Category:', 'Portal:', 'User:', 'MediaWiki:']
};

// Common main page titles in different languages
const mainPageTitles = [
    // English and major European
    'Main_Page',                    // en
    'Hauptseite',                   // de
    'Página_principal',             // es
    'Page_d\'accueil',             // fr
    'Pagina_principale',            // it
    'Portada',                      // es variant
    'Primeira_página',              // pt
    'Hoofdpagina',                  // nl
    
    // Asian languages
    '首页',                         // zh
    'メインページ',                 // ja
    '대문',                         // ko
    'หน้าหลัก',                     // th
    'មុខទំព័រ',                     // km
    'ໜ້າຫຼັກ',                      // lo
    
    // Indic languages
    'मुख्य_पृष्ठ',                  // hi
    'প্রধান_পাতা',                 // bn
    'मुखपृष्ठ',                     // mr
    'ప్రధాన_పేజీ',                // te
    'ਮੁੱਖ_ਸਫ਼ਾ',                    // pa
    'முதற்_பக்கம்',                // ta
    'ಮುಖ್ಯ_ಪುಟ',                    // kn
    'പ്രധാന_താൾ',                 // ml
    'ପ୍ରଧାନ_ପୃଷ୍ଠା',                // or
    'મુખપૃષ્ઠ',                     // gu
    'मुख्य_पन्ना',                  // bh
    'मुख्य_पृष्ठ',                  // ne
    'මුල්_පිටුව',                   // si
    
    // Middle Eastern
    'الصفحة_الرئيسية',             // ar
    'صفحہ_اول',                    // ur
    'صفحهٔ_اصلی',                  // fa
    'עמוד_ראשי',                   // he
    'باش_بەت',                     // ug
    'Ana_Sayfa',                   // tr
    'Ana_səhifə',                  // az
    'Башкы_барак',                 // ky
    'لومړی_مخ',                    // ps
    'މައި_ޞަފްޙާ',                  // dv
    
    // Slavic
    'Заглавная_страница',          // ru
    'Головна_сторінка',            // uk
    'Strona_główna',               // pl
    'Hlavní_strana',               // cs
    'Glavna_stranica',             // sh
    'Главна_страница',             // mk
    
    // Southeast Asian
    'Halaman_Utama',               // id
    'Kaca_Utama',                  // jv, su
    'Unang_Pahina',                // tl
    'ဗဟိုစာမျက်နှာ',               // my
    
    // African
    'Bogga_Hore',                  // so
    'Nyaya_Khulu',                 // sn
    'Iphepha_Elingundoqo',         // xh
    'Ikhasi_Elikhulu',             // zu
    'Babban_shafi',                // ha
    'Ojúewé_Àkọ́kọ́',               // yo
    'Hello_jaɓɓorgo',              // ff
    'Krataafa_Nyohoa',             // ak
    'Lokásá_ya_libosó',            // ln
    
    // Other European
    'Kezdőlap',                    // hu
    'Κύρια_Σελίδα',                // el
    'Huvudsida',                   // sv
    'Qhapaq_p\'anqa',              // qu
    'Haaptsäit',                   // lb
    'Pàgina_principali',           // sc
    'Pagina_principala',           // ia
    'Prìomh-Dhuilleag',            // gd
    'Olupapula_Olusooka',          // lg
    'Hau_Whārangi',                // mi
    'Pajenn_bennañ',               // br
    'Početna_strana',              // bs
    'Il-Paġna_prinċipali',         // mt
    'ገጽ_መእተዊ',                    // ti
    'Gaa_Nzönö',                   // sg
    'Duillag_Hame',                // gv
    'Acuèlh',                      // oc
    'Tuisblad',                    // af
    'Forsíða',                     // is
    'Баш_бит',                     // ba, tt
    'Нүүр_нюур',                   // mn
    'Mwaibe_principå',             // wa
    'Pagina_principala',           // rm
    'בלאַט',                       // yi
    'Тĕп_страница',                // cv
    'Сæйраг_фарс',                 // os
    'Tsebe_Kgolo',                 // tn
    'Intangiriro',                 // rn
    'Leqephe_la_pele',             // st
    'Khasi_ro_Kulu',               // ts
    'Likhasi_Lelikhulu',           // ss
    'Ṱhoho_ya_Vhuṱambo',           // ve
    'Ikhasi_Elikhulu',             // nr
    'Krataatɔ_Titiriw',            // tw
    'Nakatamit',                   // ik
    
    // Others
    'Thèu-Ya̍p',                   // hak
    'አውደ_ዋና',                    // am
    'Pejy_voalohany',             // mg
    'Haadside',                    // fy
    'T\'áá_bą́ą́h_íiyisíí'          // nv
];

// Language-specific article patterns to exclude
const languageExclusions = {
    'fr': [/^Cookie_/],
    'es': [/^Cleopatra$/, /^Cleopatra_I_de_Egipto$/],
    'hi': [/^फेसबुक$/],
    'ur': [/^صفحۂ_اول$/, /^انا_لله_و_انا_الیه_راجعون$/],
    'sw': [/^Aina_za_maneno$/],
    'th': [/^เฟซบุ๊ก$/],
    'gu': [/^રાશી$/],
    'he': [/^פייסבוק$/],
    'ug': [/^ۋىكىپېدىيە$/]
};

// Parse command line arguments
const argv = yargs
    .option('date', {
        alias: 'd',
        description: 'Date in YYYY-MM-DD format',
        type: 'string',
        default: getYesterday()
    })
    .option('lang', {
        alias: 'l',
        description: 'Language code (e.g., en, es, fr)',
        type: 'string',
        default: 'en'
    })
    .help()
    .alias('help', 'h')
    .argv;

function getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

async function getTopArticles(date, lang) {
    const [year, month, day] = date.split('-');
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${lang}.wikipedia.org/all-access/${year}/${month}/${day}`;

    const languagePrefixes = namespaces[lang] || namespaces['en'];
    const languageSpecificExclusions = languageExclusions[lang] || [];

    const excludePatterns = [
        /^-$/,
        /^404\.php$/i,
        /^Search$/i,
        /^Pornhub$/i,
        /^Facebook[^a-zA-Z]*$/i,
        /^YouTube$/i,
        new RegExp(`^(${mainPageTitles.join('|')})$`, 'i'),
        ...languagePrefixes.map(prefix => new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')),
        ...languageSpecificExclusions
    ];

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'WikiTopArticles/1.0 (example@email.com)'
            }
        });

        console.log('\nTop 20 before filtering:');
        response.data.items[0].articles
            .slice(0, 20)
            .forEach((article, index) => {
                console.log(`${index + 1}. ${article.article}`);
            });

        const articles = response.data.items[0].articles
            .filter(article => {
                if (article.article.includes(':')) {
                    return false;
                }
                return !excludePatterns.some(pattern => pattern.test(article.article));
            })
            .slice(0, 10)
            .map((article, index) => ({
                rank: index + 1,
                title: article.article,
                views: article.views
            }));

        return articles;
    } catch (error) {
        if (error.response) {
            console.error('Error:', error.response.status, error.response.statusText);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

async function main() {
    const articles = await getTopArticles(argv.date, argv.lang);
    
    console.log(`\nTop 10 after filtering:`);
    articles.forEach(article => {
        const url = `https://${argv.lang}.wikipedia.org/wiki/${encodeURIComponent(article.title)}`;
        console.log(`${article.rank}. ${article.title} (${article.views.toLocaleString()} views) - ${url}`);
    });
}

main();

module.exports = { getTopArticles }; 