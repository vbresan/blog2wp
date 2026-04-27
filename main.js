const dropZone       = document.getElementById('drop-zone');
const fileInput      = document.getElementById('file-input');
const downloadButton = document.getElementById('download-btn');
const errorMessage   = document.getElementById('error-message');

let selectedFile = null;

function showError(message) {

  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  setTimeout(() => { errorMessage.style.display = 'none'; }, 4000);
}

function isZipFile(file) {

  const types = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip'
  ];

  return file.name.toLowerCase().endsWith('.zip') || types.includes(file.type);
}

function getSlug(title) {

  return title
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[ž]/g, 'z')
    .replace(/[š]/g, 's')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getWrappedContent(content) {

  return content
    .split(/\r\n\r\n|\n\n/)
    .map(p => `<!-- wp:paragraph -->\n<p>${p.trim()}</p>\n<!-- /wp:paragraph -->`)
    .join('\n\n');
}

function getXMLHeader() {

  const currentTime = new Date();
  const nowISO = currentTime.toISOString().slice(0, 16).replace('T', ' ');
  const nowUTC = currentTime.toUTCString().replace('GMT', '+0000');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Ovo je WordPress eXtended RSS datoteka koju je generirao blog2wp. -->
<!-- Sadrži isključivo objave (postove) sa vaše blog.hr stranice. -->
<!-- Možete koristiti ovu datoteku za prijenos objava na WordPress blog. -->

<!-- Da biste uvezli ovu datoteku u WordPress blog, slijedite ove korake: -->
<!-- 1. Prijavite se na WordPress blog kao administrator. -->
<!-- 2. Idite na Tools: Import. -->
<!-- 3. Instalirajte "WordPress" importer s popisa. -->
<!-- 4. Aktivirajte i pokrenite importer. -->
<!-- 5. Uploadajte ovu datoteku koristeći ponuđenu formu. -->
<!-- 6. Prvo ćete biti upitani da mapirate autora iz ove datoteke na autora -->
<!--    na WordPress stranici. Možete odabrati mapiranje na postojećeg -->
<!--    korisnika bloga ili stvaranje novog korisnika. -->
<!-- 7. WordPress će zatim uvesti sve postove sadržane u ovoj datoteci na -->
<!--    vaš blog. -->

<!-- generator="blog2wp/1.0" created="${nowISO}" -->
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/"
    >

    <channel>
        <title>Naslov bloga</title>
        <link>https://example.com</link>
        <description></description>
        <pubDate>${nowUTC}</pubDate>
        <language>hr</language>
        <wp:wxr_version>1.2</wp:wxr_version>
        <wp:base_site_url>https://example.com</wp:base_site_url>
        <wp:base_blog_url>https://example.com</wp:base_blog_url>

        <wp:author>
            <wp:author_id>1</wp:author_id>
            <wp:author_login><![CDATA[blog2wp]]></wp:author_login>
            <wp:author_email><![CDATA[]]></wp:author_email>
            <wp:author_display_name><![CDATA[blog2wp]]></wp:author_display_name>
            <wp:author_first_name><![CDATA[]]></wp:author_first_name>
            <wp:author_last_name><![CDATA[]]></wp:author_last_name>
        </wp:author>

        <generator>https://vbresan.github.io/blog2wp/</generator>
        `;
}

function getXMLItem(time, title, content, postId) {

  const [datePart, timePart] = time.split(' ');
  const [day, month, year]   = datePart.split('.', 3);

  const postDateObj = new Date(`${year}-${month}-${day}T${timePart}`);
  const pubDate     = postDateObj.toUTCString().replace('GMT', '+0000');
  const postDate    = `${year}-${month}-${day} ${timePart}`;
  const postDateGmt = postDateObj.toISOString().slice(0, 19).replace('T', ' ');

  const slug = getSlug(title);
  const url  = `https://example.com/${year}/${month}/${day}/${slug}/`;

  const contentXml = getWrappedContent(content);

  return `
        <item>
            <title><![CDATA[${title}]]></title>
            <link>${url}</link>
            <pubDate>${pubDate}</pubDate>
            <dc:creator><![CDATA[blog2wp]]></dc:creator>
            <guid isPermaLink="false">https://example.com/?p=${postId}</guid>
            <description></description>
            <content:encoded><![CDATA[${contentXml}]]></content:encoded>
            <excerpt:encoded><![CDATA[]]></excerpt:encoded>
            <wp:post_id>${postId}</wp:post_id>
            <wp:post_date><![CDATA[${postDate}]]></wp:post_date>
            <wp:post_date_gmt><![CDATA[${postDateGmt}]]></wp:post_date_gmt>
            <wp:post_modified><![CDATA[${postDate}]]></wp:post_modified>
            <wp:post_modified_gmt><![CDATA[${postDateGmt}]]></wp:post_modified_gmt>
            <wp:comment_status><![CDATA[open]]></wp:comment_status>
            <wp:ping_status><![CDATA[open]]></wp:ping_status>
            <wp:post_name><![CDATA[${slug}]]></wp:post_name>
            <wp:status><![CDATA[publish]]></wp:status>
            <wp:post_parent>0</wp:post_parent>
            <wp:menu_order>0</wp:menu_order>
            <wp:post_type><![CDATA[post]]></wp:post_type>
            <wp:post_password><![CDATA[]]></wp:post_password>
            <wp:is_sticky>0</wp:is_sticky>
            <category domain="category" nicename="uncategorized"><![CDATA[Uncategorized]]></category>
        </item>`;
}

function getXMLFooter() {
  return `
    </channel>
</rss>`;
}

async function processZip(zipFile) {

  if (!isZipFile(zipFile)) {
    showError('Prihvaćaju se samo .zip datoteke. Pokušajte ponovo.');
    return;
  }

  selectedFile = zipFile;
  errorMessage.style.display = 'none';

  try {
    
    let xml = getXMLHeader();

    const zip = await JSZip.loadAsync(zipFile);
    const files = Object.values(zip.files)
      .filter(entry => !entry.dir)
      .sort((a, b) => a.name.localeCompare(b.name)
    );

    let postId = 1;
    for (const file of files) {

      const text    = await file.async('string');
      const parts   = text.split('------------------------------------');
      const time    = parts[0]?.replace('Vrijeme objave:', '').trim();
      const title   = parts[1]?.replace('Naslov:', '').trim();
      const content = parts[2]?.trim();

      console.groupCollapsed(`${file.name}`);
      console.log('Time:   ', time);
      console.log('Title:  ', title);
      console.log('Content:', content);
      console.groupEnd();

      xml += getXMLItem(time, title, content, postId);
      postId++;
    }

    xml += getXMLFooter();
    console.log(xml);

    const blob = new Blob([xml], { type: 'application/xml' });
    const url  = URL.createObjectURL(blob);
    downloadButton.style.visibility = 'visible';
    downloadButton.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blog2wp.xml';
      a.click();
    };

  } catch (err) {
    showError('Greška pri čitanju ZIP datoteke.');
    console.error(err);
  }
}

dropZone.addEventListener('dragenter', e => { 
  e.preventDefault(); 
  dropZone.classList.add('drag-over'); 
});
dropZone.addEventListener('dragover',  e => { 
  e.preventDefault(); 
  dropZone.classList.add('drag-over'); 
});
dropZone.addEventListener('dragleave', () => 
  dropZone.classList.remove('drag-over')
);
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  processZip(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', () => processZip(fileInput.files[0]));
dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { 
    e.preventDefault(); 
    fileInput.click(); 
  }
});
