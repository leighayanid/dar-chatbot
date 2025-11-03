import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, HeadingLevel, TextRun } from 'docx'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages data' },
        { status: 400 }
      )
    }

    // Create table rows for each message
    const tableRows: TableRow[] = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Date & Time',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: '4F46E5',
            },
            width: {
              size: 25,
              type: WidthType.PERCENTAGE,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: 'Role',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: '4F46E5',
            },
            width: {
              size: 15,
              type: WidthType.PERCENTAGE,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: 'Message',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: '4F46E5',
            },
            width: {
              size: 60,
              type: WidthType.PERCENTAGE,
            },
          }),
        ],
      }),
    ]

    // Add message rows
    messages.forEach((message: any) => {
      const timestamp = message.timestamp
        ? new Date(message.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'N/A'

      const role = message.role === 'user' ? 'You' : 'AI Assistant'

      // Extract text from parts if available, otherwise use content
      let content = ''
      if (message.parts && Array.isArray(message.parts)) {
        content = message.parts.map((part: any) => part.text || '').join(' ')
      } else if (message.content) {
        content = message.content
      }

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: timestamp,
                  alignment: AlignmentType.LEFT,
                }),
              ],
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: role,
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: role,
                      bold: true,
                      color: message.role === 'user' ? '3B82F6' : '6366F1',
                    }),
                  ],
                }),
              ],
              width: {
                size: 15,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: content,
                  alignment: AlignmentType.LEFT,
                }),
              ],
              width: {
                size: 60,
                type: WidthType.PERCENTAGE,
              },
            }),
          ],
        })
      )
    })

    // Create the table
    const table = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      },
    })

    // Create the document with 8.5 x 13 inch page size (Legal)
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 12240, // 8.5 inches in twips (8.5 * 1440)
                height: 18720, // 13 inches in twips (13 * 1440)
              },
              margin: {
                top: 720,    // 0.5 inch
                right: 720,  // 0.5 inch
                bottom: 720, // 0.5 inch
                left: 720,   // 0.5 inch
              },
            },
          },
          children: [
            new Paragraph({
              text: 'Daily Accomplishment Report',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),
            new Paragraph({
              text: `Generated on ${new Date().toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}`,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),
            table,
          ],
        },
      ],
    })

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc)

    // Return the file
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="DAR_Report_${new Date().toISOString().split('T')[0]}.docx"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
