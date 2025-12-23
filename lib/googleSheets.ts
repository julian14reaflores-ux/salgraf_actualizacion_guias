import { google } from 'googleapis';

// ==============================================
//  🔐 MANEJO SEGURO DE CREDENCIALES
// ==============================================
function getCredentials() {
  // Opción 1: Usar JSON completo
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      // Normalizar la clave privada
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing GOOGLE_CREDENTIALS_JSON:', e);
      throw e;
    }
  }

  // Opción 2: Usar variables separadas
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('❌ No se encontraron credenciales de Google. Verifica GOOGLE_PRIVATE_KEY y GOOGLE_CLIENT_EMAIL');
  }

  // Normalizar la clave privada - múltiples intentos
  let normalizedKey = privateKey;
  
  // Si tiene \\n literales, reemplazarlos
  if (normalizedKey.includes('\\n')) {
    normalizedKey = normalizedKey.replace(/\\n/g, '\n');
  }
  
  // Si NO tiene saltos de línea, intentar agregarlos
  if (!normalizedKey.includes('\n') && normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // La clave está en una sola línea, necesitamos separarla
    normalizedKey = normalizedKey
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
  }
  
  // Quitar comillas extras si existen
  normalizedKey = normalizedKey.replace(/^["']|["']$/g, '');
  
  // Asegurar que termina con salto de línea
  if (!normalizedKey.endsWith('\n')) {
    normalizedKey += '\n';
  }

  console.log('🔑 Clave privada normalizada. Longitud:', normalizedKey.length);
  console.log('📧 Client email:', clientEmail);

  return {
    client_email: clientEmail,
    private_key: normalizedKey,
  };
}

// ==============================================
//  ⚙️ AUTENTICACIÓN CON GOOGLE SHEETS API
// ==============================================
const credentials = getCredentials();

const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Verificar credenciales en logs (solo para debug)
console.log('🔐 Autenticación configurada:', {
  email: credentials.client_email,
  keyLength: credentials.private_key?.length || 0,
  keyStart: credentials.private_key?.substring(0, 30) || 'NO KEY'
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Guias';

// ==============================================
//  📦 INTERFACE SIMPLIFICADA
// ==============================================
export interface Shipment {
  id: number;
  guia: string;
  fechaCarga: string;
  estado: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  entregadoA: string;
  fechaEntrega: string;
  ultimaActualizacion: string;
}

// ==============================================
//  🚀 FUNCIONES CRUD SIMPLIFICADAS
// ==============================================
export async function initializeSheet() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'ID',
            'Guía',
            'Fecha Carga',
            'Estado',
            'Ciudad Origen',
            'Ciudad Destino',
            'Entregado A',
            'Fecha Entrega',
            'Última Actualización'
          ]],
        },
      });
    }

    console.log('✅ Hoja inicializada correctamente');
  } catch (error) {
    console.error('❌ Error initializing sheet:', error);
    throw error;
  }
}

export async function getAllShipments(): Promise<Shipment[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:I`,
    });

    if (!response.data.values) return [];

    return response.data.values.map((row) => ({
      id: parseInt(row[0]) || 0,
      guia: row[1] || '',
      fechaCarga: row[2] || '',
      estado: row[3] || '',
      ciudadOrigen: row[4] || '',
      ciudadDestino: row[5] || '',
      entregadoA: row[6] || '',
      fechaEntrega: row[7] || '',
      ultimaActualizacion: row[8] || '',
    }));
  } catch (error) {
    console.error('Error getting shipments:', error);
    throw error;
  }
}

export async function addShipment(shipment: Shipment): Promise<void> {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          shipment.id,
          shipment.guia,
          shipment.fechaCarga,
          shipment.estado,
          shipment.ciudadOrigen,
          shipment.ciudadDestino,
          shipment.entregadoA,
          shipment.fechaEntrega,
          shipment.ultimaActualizacion,
        ]],
      },
    });
  } catch (error) {
    console.error('Error adding shipment:', error);
    throw error;
  }
}

export async function updateShipment(shipment: Shipment): Promise<void> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rowIndex = response.data.values?.findIndex(
      (row) => parseInt(row[0]) === shipment.id
    );

    if (rowIndex === undefined || rowIndex === -1) {
      throw new Error('Shipment not found');
    }

    const rowNumber = rowIndex + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          shipment.id,
          shipment.guia,
          shipment.fechaCarga,
          shipment.estado,
          shipment.ciudadOrigen,
          shipment.ciudadDestino,
          shipment.entregadoA,
          shipment.fechaEntrega,
          shipment.ultimaActualizacion,
        ]],
      },
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    throw error;
  }
}

export async function deleteShipment(id: number): Promise<void> {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAME
    );

    if (!sheet || sheet.properties?.sheetId === undefined) {
      throw new Error(`No se encontró la hoja "${SHEET_NAME}"`);
    }

    const sheetId = sheet.properties.sheetId;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rowIndex = response.data.values?.findIndex(
      (row) => parseInt(row[0]) === id
    );

    if (rowIndex === undefined || rowIndex === -1) {
      throw new Error('Guía no encontrada');
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    throw error;
  }
}

export async function addMultipleShipments(shipments: Shipment[]): Promise<void> {
  try {
    const values = shipments.map((shipment) => [
      shipment.id,
      shipment.guia,
      shipment.fechaCarga,
      shipment.estado,
      shipment.ciudadOrigen,
      shipment.ciudadDestino,
      shipment.entregadoA,
      shipment.fechaEntrega,
      shipment.ultimaActualizacion,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
  } catch (error) {
    console.error('Error adding multiple shipments:', error);
    throw error;
  }
}
