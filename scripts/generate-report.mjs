import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'docs', 'bai-nop-buoi4.docx');
const sourceImage = path.join(root, 'assets', 'anhhung.webp');
const repoUrl = 'https://github.com/nhhoang782006-dotcom/BT-BUOI4';
if (!fs.existsSync(sourceImage)) throw new Error(`Khong tim thay anh nhan vat: ${sourceImage}`);
if (fs.existsSync(output)) throw new Error(`Bao cao da ton tai: ${output}`);

fs.mkdirSync(path.dirname(output), { recursive: true });
const jpgPath = path.join(os.tmpdir(), `buoi4-hero-${process.pid}.jpg`);
const magick = 'C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe';
execFileSync(magick, [sourceImage, '-resize', '900x1320', '-quality', '86', jpgPath]);
const image = fs.readFileSync(jpgPath);
fs.rmSync(jpgPath, { force: true });

const escapeXml = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const p = (text, { style = 'Normal', align = '', after = 120, bold = false, color = '202833', size = '' } = {}) => {
  const props = `<w:pStyle w:val="${style}"/><w:spacing w:after="${after}"/>${align ? `<w:jc w:val="${align}"/>` : ''}`;
  const run = `<w:color w:val="${color}"/>${bold ? '<w:b/>' : ''}${size ? `<w:sz w:val="${size}"/>` : ''}`;
  return `<w:p><w:pPr>${props}</w:pPr><w:r><w:rPr>${run}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
};
const heading = (text, level = 1) => p(text, { style: `Heading${level}`, after: 70, bold: true, color: '203346' });
const bullet = (text) => p(`•  ${text}`, { after: 35 });

const drawing = `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="45"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="2600000" cy="3840000"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="1" name="Anh nhan vat" descr="Captain America cam khien trong thanh pho khoi lua"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="anhhung.jpg"/><pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId3"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="2600000" cy="3840000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;

const rows = [
  ['Nhân vật', 'HP', 'STR', 'AGI', 'INT'],
  ['Chiến binh', '105', '78', '111', '48'],
  ['Sát thủ', '105', '48', '131', '58'],
  ['Thợ săn', '105', '48', '121', '68'],
  ['Rồng Già', '600', '100', '15', '80'],
];
const cell = (value, row, col) => {
  const fill = row === 0 ? '394B5B' : row === 4 ? 'F5EEEE' : row % 2 === 0 ? 'F1F4F6' : 'FFFFFF';
  const color = row === 0 ? 'FFFFFF' : '202833';
  const isBold = row === 0 || col > 0 || row === 4;
  const align = col === 0 ? 'left' : 'center';
  return `<w:tc><w:tcPr><w:shd w:fill="${fill}"/><w:tcW w:w="${[3900, 1200, 1200, 1200, 1200][col]}" w:type="dxa"/><w:tcMar><w:top w:w="85" w:type="dxa"/><w:start w:w="110" w:type="dxa"/><w:bottom w:w="85" w:type="dxa"/><w:end w:w="110" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="${align}"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:color w:val="${color}"/>${isBold ? '<w:b/>' : ''}</w:rPr><w:t>${escapeXml(value)}</w:t></w:r></w:p></w:tc>`;
};
const table = `<w:tbl><w:tblPr><w:tblW w:w="8700" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9DEE3"/><w:left w:val="single" w:sz="4" w:color="D9DEE3"/><w:bottom w:val="single" w:sz="4" w:color="D9DEE3"/><w:right w:val="single" w:sz="4" w:color="D9DEE3"/><w:insideH w:val="single" w:sz="4" w:color="D9DEE3"/><w:insideV w:val="single" w:sz="4" w:color="D9DEE3"/></w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="3900"/><w:gridCol w:w="1200"/><w:gridCol w:w="1200"/><w:gridCol w:w="1200"/><w:gridCol w:w="1200"/></w:tblGrid>${rows.map((r, ri) => `<w:tr>${r.map((v, ci) => cell(v, ri, ci)).join('')}</w:tr>`).join('')}</w:tbl>`;

const body = [
  p('Bài tập Buổi 4', { style: 'Title', align: 'center', after: 50, bold: true, color: '101820' }),
  p('GAME JAVASCRIPT · CAPTAIN AMERICA ĐẤU RỒNG GIÀ', { style: 'Subtitle', align: 'center', after: 90, bold: true, color: '465667', size: '23' }),
  p('Sinh viên: Nguyễn Huy Hoàng', { align: 'center', after: 15, bold: true }),
  p('MSSV: 31241026670', { align: 'center', after: 75, color: '465667' }),
  p('Trò chơi nhập vai đánh theo lượt, xây dựng bằng HTML, CSS và JavaScript thuần. Người chơi chọn một trong ba lớp anh hùng, điều khiển Captain America chiến đấu với Rồng Già và theo dõi từng lượt trong nhật ký.', { align: 'center', after: 10 }),
  drawing,
  p('Ảnh nhân vật được sử dụng trong trò chơi.', { style: 'Caption', align: 'center', after: 0, color: '596675', size: '18' }),
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
  heading('Cách chơi và hệ thống nhân vật'),
  p('Người chơi chọn Chiến binh, Sát thủ hoặc Thợ săn rồi lần lượt đối đầu với Rồng Già. Anh hùng tấn công trước; nếu rồng còn HP, rồng phản công sau 300 ms. Thanh HP, chỉ số và nhật ký được cập nhật sau mỗi lượt.'),
  heading('Chỉ số nhân vật', 2),
  table,
  heading('Luật chiến đấu', 2),
  bullet('STR quyết định sát thương cơ bản; đòn chí mạng gây gấp đôi sát thương.'),
  bullet('AGI quyết định xác suất né. Khả năng né của anh hùng được giới hạn ở 80%.'),
  bullet('Nút tấn công bị khóa trong lượt phản công để tránh tạo thêm lượt chồng nhau.'),
  bullet('Khi một nhân vật hết HP, trận đấu kết thúc và người chơi có thể chơi lại.'),
  heading('Kiểm thử và mã nguồn', 2),
  p('9 kiểm thử tự động đạt: chỉ số, sát thương, né đòn, chí mạng ×2, HP về 0, khóa lượt liên tiếp và hủy lượt phản công cũ khi bắt đầu trận mới. Chạy bằng node --test tests/game.test.js trong thư mục bài nộp.'),
  p('Mã nguồn GitHub', { after: 15, bold: true, color: '465667' }),
  `<w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:hyperlink r:id="rId2"><w:r><w:rPr><w:color w:val="32648E"/><w:u w:val="single"/></w:rPr><w:t>${escapeXml(repoUrl)}</w:t></w:r></w:hyperlink></w:p>`,
].join('');

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="760" w:right="900" w:bottom="760" w:left="900" w:header="350" w:footer="350" w:gutter="0"/></w:sectPr></w:body></w:document>`;
const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:eastAsia="Aptos"/><w:sz w:val="21"/><w:color w:val="202833"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="260" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="21"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:after="50"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:sz w:val="48"/><w:color w:val="101820"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="100" w:after="75"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="203346"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="70" w:after="50"/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="203346"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="Caption"/><w:basedOn w:val="Normal"/><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="596675"/></w:rPr></w:style></w:styles>`;
const typesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${repoUrl}" TargetMode="External"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/anhhung.jpg"/></Relationships>`;
const now = new Date().toISOString();
const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Bài tập Buổi 4 - Game JavaScript</dc:title><dc:creator>Nguyễn Huy Hoàng</dc:creator><dc:subject>Game Captain America đấu Rồng Già</dc:subject><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Word</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop></Properties>`;

const entries = [
  ['[Content_Types].xml', Buffer.from(typesXml)], ['_rels/.rels', Buffer.from(rootRels)],
  ['word/document.xml', Buffer.from(documentXml)], ['word/styles.xml', Buffer.from(stylesXml)],
  ['word/_rels/document.xml.rels', Buffer.from(docRels)], ['word/media/anhhung.jpg', image],
  ['docProps/core.xml', Buffer.from(core)], ['docProps/app.xml', Buffer.from(app)],
];
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
const crc32 = (buf) => { let c = 0xFFFFFFFF; for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const dosDateTime = (date) => ({
  time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
  date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
});
const stamp = dosDateTime(new Date());
const localParts = [], centralParts = [];
let offset = 0;
for (const [name, data] of entries) {
  const filename = Buffer.from(name, 'utf8');
  const compressed = deflateRawSync(data);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034B50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
  local.writeUInt16LE(stamp.time, 10); local.writeUInt16LE(stamp.date, 12); local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(filename.length, 26);
  localParts.push(local, filename, compressed);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014B50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10);
  central.writeUInt16LE(stamp.time, 12); central.writeUInt16LE(stamp.date, 14); central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(filename.length, 28);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, filename);
  offset += local.length + filename.length + compressed.length;
}
const centralDirectory = Buffer.concat(centralParts);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054B50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(centralDirectory.length, 12); end.writeUInt32LE(offset, 16);
fs.writeFileSync(output, Buffer.concat([...localParts, centralDirectory, end]));
console.log(`REPORT=${output}`);
