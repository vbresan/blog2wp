# Extracts post title, date and content from a WordPress WXR export file
# and writes them as plain text to an output file.
#
# Usage: python extract.py input.xml output.txt

import xml.etree.ElementTree as ET
import re
import sys

def strip_html(text):
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

def extract(input_file, output_file):
    namespaces = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'wp':      'http://wordpress.org/export/1.2/',
        'dc':      'http://purl.org/dc/elements/1.1/',
    }

    tree = ET.parse(input_file)
    root = tree.getroot()
    items = root.findall('./channel/item')

    with open(output_file, 'w', encoding='utf-8') as f:
        for item in items:
            title   = item.findtext('title') or ''
            date    = item.findtext('wp:post_date', namespaces=namespaces) or ''
            encoded = item.findtext('content:encoded', namespaces=namespaces) or ''
            content = strip_html(encoded)
            content = re.sub(r'\n{3,}', '\n\n', content)

            f.write(f"Datum:   {date.split()[0]}\n")
            f.write(f"Naslov:  {title}\n")
            f.write(f"Sadržaj:\n{content}\n")
            f.write('-' * 60 + '\n')

    print(f"Extracted {len(items)} posts to {output_file}")

if __name__ == '__main__':
    input_file  = sys.argv[1] if len(sys.argv) > 1 else 'export.xml'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'output.txt'
    extract(input_file, output_file)