import { EmployeeDirectory } from '../types/EmployeeInventoryType';
import { Tool, ToolId, ToolInventory } from '../types/ToolInventoryType';
import { DataStore } from './DataStore';

/**
 * Service for managing calibration certificate operations.
 * Handles generating and downloading calibration certificates for tools.
 */
export class CertificateService extends DataStore {
  private readonly delay: number;

  constructor(tools: ToolInventory, employees: EmployeeDirectory, delay: number = 300) {
    super(tools, employees);
    this.delay = delay;
  }

  /**
   * Generates and downloads a calibration certificate for a specific tool as a PDF.
   * A simulated network delay is applied before returning the certificate data.
   * @param {ToolId} toolId - The ID of the tool to generate the certificate for.
   * @returns {Promise<{ ok: true; pdfBlob: Blob; filename: string } | { ok: false; error: string }>}
   * A promise that resolves to either a success object with PDF blob data and filename, or an error object.
   */
  async downloadCalibrationCertificate(
    toolId: ToolId,
  ): Promise<{ ok: true; pdfBlob: Blob; filename: string } | { ok: false; error: string }> {
    await DataStore.simulateDelay(this.delay);

    const tool = this.toolById(toolId);
    if (tool == null) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} does not exist.`,
      };
    }

    // Simulate PDF generation on the backend
    const pdfContent = this.generatePDFContent(tool);
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const filename = `Calibration_Certificate_${tool.id}_${tool.calibrationDueDate}.pdf`;

    return {
      ok: true,
      pdfBlob,
      filename,
    };
  }

  /**
   * Generates mock PDF content for a calibration certificate.
   * In a real implementation, this would use a proper PDF generation library on the backend.
   * @private
   * @param {Tool} tool - The tool to generate the certificate for.
   * @returns {string} Mock PDF content as a string.
   */
  private generatePDFContent(tool: Tool): string {
    // Get assigned employee information
    const assignedEmployee = tool.assignedTo ? this.employees[tool.assignedTo] : null;
    const assignedTo = assignedEmployee ? assignedEmployee.name : 'Unassigned';

    // PDF Header - defines the PDF version
    const pdfHeader = '%PDF-1.4';

    // Document catalog - root of the PDF structure
    const catalog = `1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj`;

    // Pages object - contains references to all pages
    const pages = `2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj`;

    // Page object - defines the actual page properties
    const pageDefinition = `3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj`;

    // Content stream - the actual text content of the certificate
    const contentStream = `4 0 obj
<<
/Length 400
>>
stream
BT
/F1 12 Tf
50 750 Td
(CALIBRATION CERTIFICATE) Tj
0 -30 Td
(Tool ID: ${tool.id}) Tj
0 -20 Td
(Tool Type: ${tool.type}) Tj
0 -20 Td
(Model: ${tool.model}) Tj
0 -20 Td
(Serial Number: ${tool.serialNumber}) Tj
0 -20 Td
(Calibration Due Date: ${tool.calibrationDueDate}) Tj
0 -20 Td
(Assigned To: ${assignedTo}) Tj
0 -30 Td
(This certificate confirms that the above tool has been calibrated) Tj
0 -20 Td
(according to applicable standards and procedures.) Tj
0 -30 Td
(Generated on: ${DataStore.today()}) Tj
ET
endstream
endobj`;

    // Font definition - defines the Helvetica font used
    const fontDefinition = `5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj`;

    // Cross-reference table - tells PDF reader where to find each object
    const xrefTable = `xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000713 00000 n`;

    // Trailer - points to the root catalog and provides metadata
    const trailer = `trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
792
%%EOF`;

    // Combine all parts into the complete PDF
    return [pdfHeader, catalog, pages, pageDefinition, contentStream, fontDefinition, xrefTable, trailer].join('\n');
  }
}
