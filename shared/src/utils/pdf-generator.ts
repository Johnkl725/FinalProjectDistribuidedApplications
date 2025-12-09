// ===============================================
// PDF GENERATOR - Policy Documents
// ===============================================

import PDFDocument from "pdfkit";

export interface PolicyPDFData {
  policyNumber: string;
  customerName: string;
  customerEmail: string;
  insuranceType: "life" | "rent" | "vehicle";
  status: "issued" | "active" | "cancelled";
  startDate: string;
  endDate?: string | null;
  premiumAmount: number;
  coverageAmount: number;
  details?: any; // Specific details for each insurance type
  createdAt: string;
}

/**
 * Generate PDF document for insurance policy
 * @param data Policy data to include in PDF
 * @returns PDF buffer
 */
export async function generatePolicyPDF(data: PolicyPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on("error", (error) => {
        reject(error);
      });

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("CERTIFICADO DE PÓLIZA DE SEGURO", { align: "center" });

      doc.moveDown(1);

      // Company Info
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text("Insurance Platform", { align: "center" })
        .text("Plataforma de Seguros", { align: "center" })
        .moveDown(0.5);

      // Separator
      doc
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(2);

      // Policy Information Section
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("INFORMACIÓN DE LA PÓLIZA", { align: "left" });

      doc.moveDown(1);

      // Policy Number
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#374151")
        .text("Número de Póliza:", { continued: true })
        .font("Helvetica")
        .text(` ${data.policyNumber}`, { align: "left" });

      doc.moveDown(0.5);

      // Insurance Type
      const typeLabels: Record<string, string> = {
        life: "Seguro de Vida",
        rent: "Seguro de Renta",
        vehicle: "Seguro de Vehículo",
      };

      doc
        .font("Helvetica-Bold")
        .text("Tipo de Seguro:", { continued: true })
        .font("Helvetica")
        .text(` ${typeLabels[data.insuranceType] || data.insuranceType}`);

      doc.moveDown(0.5);

      // Status
      const statusLabels: Record<string, string> = {
        issued: "Emitida (Pendiente de Aprobación)",
        active: "Activa",
        cancelled: "Cancelada",
      };

      const statusColors: Record<string, string> = {
        issued: "#f59e0b",
        active: "#10b981",
        cancelled: "#ef4444",
      };

      doc
        .font("Helvetica-Bold")
        .text("Estado:", { continued: true })
        .font("Helvetica")
        .fillColor(statusColors[data.status] || "#374151")
        .text(` ${statusLabels[data.status] || data.status}`);

      doc.fillColor("#374151"); // Reset color

      doc.moveDown(1);

      // Customer Information
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("INFORMACIÓN DEL CLIENTE", { align: "left" });

      doc.moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#374151")
        .text(`Nombre: ${data.customerName}`)
        .moveDown(0.5)
        .text(`Email: ${data.customerEmail}`);

      doc.moveDown(1);

      // Coverage Information
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("COBERTURA Y PRIMAS", { align: "left" });

      doc.moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#374151")
        .text(`Monto de Cobertura: S/ ${formatCurrency(data.coverageAmount)}`)
        .moveDown(0.5)
        .text(`Prima Anual: S/ ${formatCurrency(data.premiumAmount)}`)
        .moveDown(0.5)
        .text(`Fecha de Inicio: ${formatDate(data.startDate)}`);

      if (data.endDate) {
        doc.text(`Fecha de Fin: ${formatDate(data.endDate)}`);
      }

      doc.moveDown(1);

      // Specific Details Section
      if (data.details) {
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text("DETALLES ESPECÍFICOS", { align: "left" });

        doc.moveDown(1);

        doc.fontSize(12).font("Helvetica").fillColor("#374151");

        if (data.insuranceType === "life" && data.details.life_details) {
          const lifeDetails = data.details.life_details;
          doc
            .text(`Edad: ${lifeDetails.age} años`)
            .moveDown(0.5)
            .text(
              `Historial Médico: ${lifeDetails.medical_history || "Ninguno"}`
            )
            .moveDown(0.5)
            .text(`Fumador: ${lifeDetails.smoker ? "Sí" : "No"}`);

          if (
            lifeDetails.beneficiaries &&
            lifeDetails.beneficiaries.length > 0
          ) {
            doc
              .moveDown(0.5)
              .font("Helvetica-Bold")
              .text("Beneficiarios:")
              .font("Helvetica");
            lifeDetails.beneficiaries.forEach((ben: any) => {
              doc.text(
                `  • ${ben.name} (${ben.relationship}) - ${ben.percentage}%`
              );
            });
          }
        } else if (
          data.insuranceType === "vehicle" &&
          data.details.vehicle_details
        ) {
          const vehicleDetails = data.details.vehicle_details;
          doc
            .text(`Marca: ${vehicleDetails.make || "N/A"}`)
            .moveDown(0.5)
            .text(`Modelo: ${vehicleDetails.model || "N/A"}`)
            .moveDown(0.5)
            .text(`Año: ${vehicleDetails.year || "N/A"}`)
            .moveDown(0.5)
            .text(`VIN: ${vehicleDetails.vin || "N/A"}`)
            .moveDown(0.5)
            .text(`Placa: ${vehicleDetails.license_plate || "N/A"}`);
        } else if (data.insuranceType === "rent" && data.details.rent_details) {
          const rentDetails = data.details.rent_details;
          doc
            .text(`Dirección: ${rentDetails.address || "N/A"}`)
            .moveDown(0.5)
            .text(
              `Valor de la Propiedad: S/ ${formatCurrency(
                rentDetails.property_value || 0
              )}`
            )
            .moveDown(0.5)
            .text(
              `Tipo de Uso: ${
                rentDetails.usage_type === "residential"
                  ? "Residencial"
                  : "Comercial"
              }`
            )
            .moveDown(0.5)
            .text(`Metros Cuadrados: ${rentDetails.square_meters || "N/A"} m²`);
        }
      }

      // Footer
      doc.moveDown(2);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#9ca3af")
        .text("Este documento es generado automáticamente por el sistema.", {
          align: "center",
        })
        .moveDown(0.3)
        .text(`Generado el: ${formatDate(new Date().toISOString())}`, {
          align: "center",
        });

      // Terms and Conditions
      doc.moveDown(1);
      doc
        .fontSize(9)
        .fillColor("#6b7280")
        .text("TÉRMINOS Y CONDICIONES:", { align: "left" })
        .moveDown(0.3)
        .text(
          "Este certificado es válido solo si la póliza está activa y los pagos están al día.",
          { align: "left", width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format currency value
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

