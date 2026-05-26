import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
        
        tree = ET.XML(xml_content)
        NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        TEXT = NAMESPACE + 't'
        
        text = []
        for node in tree.iter(TEXT):
            if node.text:
                text.append(node.text)
                
        return '\n'.join(text)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    print(extract_text_from_docx(sys.argv[1]))
