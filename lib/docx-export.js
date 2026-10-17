'use strict';

const fs = require('node:fs/promises');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Header,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  VerticalAlignTable,
  Tab,
  TabStopType
} = require('docx');

// Acepta encabezados como "Referencias", "## Bibliografía", "5. Referencias"
// o "Referencias:", que son formas habituales de titilar la sección final.
const REFERENCES_HEADING = /^(?:\d+[.)]\s*)?(referencias|bibliograf[ií]a|references)\s*:?$/i;

// ¿Esta línea es el encabezado de la sección de referencias/bibliografía?
// Se usa el mismo criterio para aplicar la sangría francesa y para evitar
// duplicar la lista preliminar de fuentes en la exportación.
function isReferencesHeading(line) {
  return REFERENCES_HEADING.test(line.trim().replace(/^#{1,6}\s+/, ''));
}

function stripInlineMarkdown(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    // Solo interpreta _..._ como énfasis cuando los guiones bajos exteriores no
    // forman parte de un identificador (campo_de_datos) ni rodean código (`_id_`).
    .replace(/(^|[^\w`])_([^_\s](?:[^_]*[^_\s])?|\S)_(?![\w`])/g, '$1$2')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)');
}

// `inReferences` indica que la línea pertenece a la sección de referencias/
// bibliografía: allí APA exige sangría francesa (izquierda + colgante de 0,5")
// y alineación a la izquierda, no sangría de primera línea.
function makeBodyParagraph(line, inReferences) {
  const trimmed = line.trim();
  if (!trimmed) return new Paragraph({ text: '', spacing: { before: 0, after: 0, line: 480 } });

  const plainHeading = trimmed.replace(/^#{1,6}\s+/, '');
  if (isReferencesHeading(trimmed)) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: plainHeading, bold: true })],
      spacing: { before: 240, after: 120, line: 480 },
      keepNext: true
    });
  }

  const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
  if (heading) {
    const level = Math.min(heading[1].length, 3);
    const map = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
    return new Paragraph({
      heading: map[level],
      children: [new TextRun({ text: stripInlineMarkdown(heading[2]), bold: level <= 2 })],
      spacing: { before: 240, after: 120, line: 480 },
      keepNext: true
    });
  }

  if (/^[-*]\s+/.test(trimmed)) {
    return new Paragraph({
      children: [new TextRun({ text: `• ${stripInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}` })],
      indent: { left: 720, hanging: 360 },
      spacing: { before: 0, after: 0, line: 480 }
    });
  }

  const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
  if (numbered) {
    return new Paragraph({
      children: [new TextRun({ text: `${trimmed.match(/^\d+/)[0]}. ${stripInlineMarkdown(numbered[1])}` })],
      indent: { left: 720, hanging: 360 },
      spacing: { before: 0, after: 0, line: 480 }
    });
  }

  if (trimmed.startsWith('>')) {
    return new Paragraph({
      children: [new TextRun({ text: stripInlineMarkdown(trimmed.replace(/^>\s?/, '')), italics: true })],
      indent: { left: 720, right: 720 },
      spacing: { before: 120, after: 120, line: 480 }
    });
  }

  return new Paragraph({
    children: [new TextRun({ text: stripInlineMarkdown(trimmed) })],
    alignment: inReferences ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
    indent: inReferences ? { left: 720, hanging: 720 } : { firstLine: 720 },
    spacing: { before: 0, after: 0, line: 480 },
    widowControl: true
  });
}


function splitTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => stripInlineMarkdown(cell.trim()));
}

function isTableSeparator(line) {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
}

function makeMarkdownTable(lines, font) {
  const parsed = lines.map(splitTableRow);
  const columnCount = Math.max(1, ...parsed.map((row) => row.length));
  const widthTotal = 9360; // 6.5 inches of usable width on a letter page with 1-inch margins.
  const baseWidth = Math.floor(widthTotal / columnCount);
  const columnWidths = Array.from({ length: columnCount }, (_, index) => index === columnCount - 1 ? widthTotal - baseWidth * (columnCount - 1) : baseWidth);
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'D9DEEA' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const rows = parsed.map((cells, rowIndex) => new TableRow({
    tableHeader: rowIndex === 0,
    children: Array.from({ length: columnCount }, (_, cellIndex) => {
      const text = cells[cellIndex] || '';
      return new TableCell({
        width: { size: columnWidths[cellIndex], type: WidthType.DXA },
        margins: { top: 90, bottom: 90, left: 100, right: 100 },
        borders,
        verticalAlign: VerticalAlignTable.CENTER,
        ...(rowIndex === 0 ? { shading: { fill: 'F0F2FF', type: ShadingType.CLEAR } } : {}),
        children: [new Paragraph({
          children: [new TextRun({ text, bold: rowIndex === 0, font, size: 20 })],
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 0, line: 300 }
        })]
      });
    })
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows
  });
}

// Convierte las líneas Markdown en bloques de Word. Detecta la sección de
// referencias (hasta el siguiente encabezado) para aplicarle sangría francesa.
function makeBodyBlocks(lines, font) {
  const blocks = [];
  let inReferences = false;
  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    if (/^\s*\|.*\|\s*$/.test(current) && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const tableLines = [current];
      index += 2; // Skip the Markdown separator row; it only describes alignment in Markdown.
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      blocks.push(makeMarkdownTable(tableLines, font));
      blocks.push(new Paragraph({ text: '', spacing: { before: 0, after: 120, line: 240 } }));
      continue;
    }
    if (isReferencesHeading(current)) {
      inReferences = true;
    } else if (/^#{1,6}\s+/.test(current.trim())) {
      inReferences = false; // Un nuevo encabezado cierra la sección de referencias.
    }
    blocks.push(makeBodyParagraph(current, inReferences));
  }
  return blocks;
}

function sourceReferenceParagraph(ref) {
  const author = (ref.author || '').trim();
  const year = (ref.year || '').trim() || 's. f.';
  const title = (ref.title || ref.originalName || '').replace(/\.[^.]+$/, '').trim();
  const url = (ref.url || '').trim();
  const children = [];
  const authorLine = author || '[Autor o entidad por verificar]';
  children.push(new TextRun({ text: `${authorLine}. (${year}). ` }));
  children.push(new TextRun({ text: title || '[Título por completar]', italics: true }));
  if (url) children.push(new TextRun({ text: `. ${url}` }));
  else children.push(new TextRun({ text: '. [Añadir URL, DOI o datos editoriales si corresponden].' }));
  if (!author || !ref.year || (!url && /\.(pdf|docx|txt)$/i.test(ref.originalName || ''))) {
    children.push(new TextRun({ text: ' [METADATOS POR VERIFICAR]', bold: true, color: 'A16207' }));
  }
  return new Paragraph({
    children,
    alignment: AlignmentType.LEFT,
    indent: { left: 720, hanging: 720 },
    spacing: { before: 0, after: 0, line: 480 },
    widowControl: true
  });
}

async function createWordDocument({ project, draftText, includeSources = false, outputPath }) {
  const lines = String(draftText || '').replace(/\r/g, '').split('\n');
  const font = 'Times New Roman';
  const title = project.title || 'Trabajo académico';
  const metaLines = [project.student, project.institution, project.course, project.professor, project.deliveryDate]
    .map((v) => String(v || '').trim()).filter(Boolean);
  const cover = [
    new Paragraph({ text: '', spacing: { before: 1600, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 24, font })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480, line: 480 },
      keepNext: true
    }),
    ...metaLines.map((line) => new Paragraph({
      children: [new TextRun({ text: line, size: 24, font })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160, line: 480 },
      keepNext: true
    })),
    new Paragraph({ children: [new PageBreak()] })
  ];

  // If the draft contains a Markdown title line matching the cover, omit that duplicate.
  const bodyLines = [...lines];
  while (bodyLines.length && !bodyLines[0].trim()) bodyLines.shift();
  if (bodyLines.length) {
    const first = bodyLines[0].trim().replace(/^#\s+/, '');
    if (first.localeCompare(title, undefined, { sensitivity: 'accent' }) === 0) bodyLines.shift();
  }
  const body = makeBodyBlocks(bodyLines, font);

  const hasReferencesHeading = bodyLines.some((line) => isReferencesHeading(line));
  const refs = Array.isArray(project.referenceFiles) ? project.referenceFiles : [];
  if (includeSources && refs.length && !hasReferencesHeading) {
    body.push(new Paragraph({ children: [new PageBreak()] }));
    body.push(new Paragraph({
      children: [new TextRun({ text: 'Referencias registradas (pendientes de revisión)', bold: true })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240, line: 480 },
      keepNext: true
    }));
    body.push(new Paragraph({
      children: [new TextRun({ text: 'Nota: estas entradas se generaron a partir de metadatos introducidos al cargar archivos. Verifica los datos en la fuente original y ajusta cada referencia a la guía institucional antes de entregar.', italics: true, size: 20 })],
      spacing: { before: 0, after: 240, line: 360 }
    }));
    refs.forEach((ref) => body.push(sourceReferenceParagraph(ref)));
  }

  const children = [...cover, ...body];

  // Encabezado según edición APA:
  //  - APA 6.ª: exige "encabezado corrido" (running head) con el título corto en
  //    mayúsculas a la izquierda y el número de página a la derecha; en la
  //    portada se antepone "Running head:".
  //  - APA 7.ª (y demás estilos): solo número de página arriba a la derecha.
  const isApa6 = String(project.apaVersion || '7') === '6';
  const runningHead = title.toUpperCase().slice(0, 50);
  const headerParagraph = (leftText) => new Paragraph({
    children: [
      ...(leftText ? [new TextRun({ text: leftText, size: 24, font }), new TextRun({ children: [new Tab()], size: 24, font })] : []),
      new TextRun({ children: [PageNumber.CURRENT], size: 24, font })
    ],
    ...(leftText ? { tabStops: [{ type: TabStopType.RIGHT, position: 9360 }] } : {}),
    alignment: leftText ? AlignmentType.LEFT : AlignmentType.RIGHT,
    spacing: { before: 0, after: 0, line: 240 }
  });

  const headers = { default: new Header({ children: [headerParagraph(isApa6 ? runningHead : '')] }) };
  if (isApa6) headers.first = new Header({ children: [headerParagraph(`Running head: ${runningHead}`)] });

  const document = new Document({
    creator: 'Aula Research Studio',
    title,
    subject: `${project.workType || 'Trabajo académico'} — ${project.citationStyle || 'APA'} ${project.apaVersion || '7'}`,
    description: 'Exportación de borrador. Revise los requisitos específicos de la institución antes de entregar.',
    styles: {
      default: {
        document: {
          run: { font, size: 24 },
          paragraph: { spacing: { line: 480, before: 0, after: 0 } }
        },
        heading1: {
          run: { font, size: 24, bold: true },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120, line: 480 }, keepNext: true }
        },
        heading2: {
          run: { font, size: 24, bold: true },
          paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 240, after: 120, line: 480 }, keepNext: true }
        },
        heading3: {
          run: { font, size: 24, bold: true, italics: true },
          paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 240, after: 120, line: 480 }, keepNext: true }
        }
      }
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        ...(isApa6 ? { titlePage: true } : {})
      },
      headers,
      children
    }]
  });
  const buffer = await Packer.toBuffer(document);
  await fs.writeFile(outputPath, buffer);
}

module.exports = { createWordDocument };
