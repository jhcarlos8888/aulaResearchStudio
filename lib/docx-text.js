'use strict';

// Extracción de texto de archivos .docx sin dependencias externas.
//
// Un .docx es un archivo ZIP (ZIP AppNote) que contiene word/document.xml en
// formato Office Open XML. Este módulo localiza esa entrada, la descomprime con
// zlib (DEFLATE crudo) y convierte el XML en texto legible, conservando los
// saltos de párrafo y de tabla.
//
// Sustituye a la librería mammoth para la única operación que la aplicación
// necesitaba (extractRawText), eliminando así su cadena de dependencias.

const fs = require('node:fs/promises');
const zlib = require('node:zlib');
const { promisify } = require('node:util');

const inflateRaw = promisify(zlib.inflateRaw);

const EOCD_SIGNATURE = 0x06054b50; // End Of Central Directory
const EOCD64_LOCATOR_SIGNATURE = 0x07064b50;
const EOCD64_SIGNATURE = 0x06064b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const MAX_CENTRAL_DIR_ENTRIES = 65535;
const MAX_XML_BYTES = 64 * 1024 * 1024; // Tope de seguridad para XMLs absurdos.

// Busca el registro End Of Central Directory (y su extensión ZIP64 si existe).
function findCentralDirectory(buffer) {
  let eocdOffset = -1;
  const minScan = Math.max(0, buffer.length - 0xffff - 22);
  for (let i = buffer.length - 22; i >= minScan; i -= 1) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('El archivo no es un ZIP/DOCX válido (falta el registro central).');

  let entryCount = buffer.readUInt16LE(eocdOffset + 10);
  let centralOffset = buffer.readUInt32LE(eocdOffset + 16);

  // ZIP64: valores saturados en el registro EOCD clásico.
  const locatorOffset = eocdOffset - 20;
  if ((entryCount === 0xffff || centralOffset === 0xffffffff) && locatorOffset >= 0
    && buffer.readUInt32LE(locatorOffset) === EOCD64_LOCATOR_SIGNATURE) {
    const eocd64Offset = Number(buffer.readBigUInt64LE(locatorOffset + 8));
    if (buffer.readUInt32LE(eocd64Offset) === EOCD64_SIGNATURE) {
      entryCount = Number(buffer.readBigUInt64LE(eocd64Offset + 32));
      centralOffset = Number(buffer.readBigUInt64LE(eocd64Offset + 48));
    }
  }
  if (entryCount > MAX_CENTRAL_DIR_ENTRIES || centralOffset >= buffer.length) {
    throw new Error('El registro central del ZIP es inválido.');
  }
  return { entryCount, centralOffset };
}

// Lee la entrada central y devuelve offset y tamaño del dato comprimido.
function findEntry(buffer, entryCount, centralOffset, wantedName) {
  let offset = centralOffset;
  for (let i = 0; i < entryCount; i += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== CENTRAL_DIR_SIGNATURE) {
      throw new Error('Entrada central corrupta en el ZIP.');
    }
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

    if (name === wantedName) {
      return { compression, compressedSize, uncompressedSize, localHeaderOffset };
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

// Descomprime una entrada del ZIP leyendo su cabecera local.
async function readZipEntry(buffer, entry, wantedName) {
  const local = entry.localHeaderOffset;
  if (local + 30 > buffer.length || buffer.readUInt32LE(local) !== 0x04034b50) {
    throw new Error(`Cabecera local inválida para ${wantedName}.`);
  }
  const nameLength = buffer.readUInt16LE(local + 26);
  const extraLength = buffer.readUInt16LE(local + 28);
  const dataStart = local + 30 + nameLength + extraLength;
  const size = entry.compressedSize;
  if (dataStart + size > buffer.length) {
    throw new Error(`Tamaño inválido para ${wantedName} (¿ZIP con descriptor de datos?).`);
  }
  if (size === 0) return Buffer.alloc(0);
  const raw = buffer.subarray(dataStart, dataStart + size);
  if (entry.compression === 0) return raw;
  if (entry.compression !== 8) {
    throw new Error(`Método de compresión no soportado (${entry.compression}) en ${wantedName}.`);
  }
  try {
    // maxOutputLength acota la expansión real: el uncompressedSize del registro
    // central lo declara quien fabricó el ZIP y no es fiable (zip bomb).
    return await inflateRaw(raw, { maxOutputLength: MAX_XML_BYTES });
  } catch (error) {
    if (error && error.code === 'ERR_BUFFER_TOO_LARGE') {
      throw new Error('El documento supera el tamaño máximo procesable.');
    }
    throw error;
  }
}

function xmlToText(xml) {
  return xml
    // Fin de párrafo y de celda/tabla → saltos legibles.
    .replace(/<w:p\b[^>]*>/g, '\n')
    .replace(/<w:br\b[^>]*\/?>/g, '\n')
    .replace(/<w:tab\b[^>]*\/?>/g, '\t')
    .replace(/<\/w:tc>/g, '\t')
    .replace(/<\/w:tr>/g, '\n')
    .replace(/<[^>]+>/g, '')
    // Entidades XML básicas (tras quitar etiquetas ya no puede haber markup).
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (m, code) => (Number(code) <= 0x10FFFF ? String.fromCodePoint(Number(code)) : ''))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, code) => {
      const value = parseInt(code, 16);
      return value <= 0x10FFFF ? String.fromCodePoint(value) : '';
    })
    .replace(/&amp;/g, '&');
}

// Extrae el texto de un .docx. Devuelve { value } como la API que sustituye.
async function extractRawText({ path: filePath }) {
  const buffer = await fs.readFile(filePath);
  const { entryCount, centralOffset } = findCentralDirectory(buffer);
  const entry = findEntry(buffer, entryCount, centralOffset, 'word/document.xml');
  if (!entry) throw new Error('El archivo no contiene word/document.xml (¿no es un .docx?).');
  if (entry.uncompressedSize > MAX_XML_BYTES) throw new Error('El documento supera el tamaño máximo procesable.');
  const xml = (await readZipEntry(buffer, entry, 'word/document.xml')).toString('utf8');
  const text = xmlToText(xml)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { value: text };
}

module.exports = { extractRawText };
