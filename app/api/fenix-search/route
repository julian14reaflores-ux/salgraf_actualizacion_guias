import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { guia } = await request.json();

    if (!guia) {
      return NextResponse.json(
        { success: false, error: 'Guía no proporcionada' },
        { status: 400 }
      );
    }

    // Construir URL con la guía SINLC
    const url = `https://fenixoper.laarcourier.com/Tracking/Guiacompleta.aspx?Guia=${guia}`;
    
    console.log('Buscando en Fenix:', url);

    // Hacer petición HTTP simple
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Parsear HTML con Cheerio
    const $ = cheerio.load(html);

    // Extraer datos de la tabla DetView_DatosGuia
    const data: any = {
      estado: '',
      entregadoA: '',
      fechaEntrega: '',
      ciudadOrigen: '',
      ciudadDestino: '',
      fechaEnvio: '',
      nombreCliente: '',
    };

    // Buscar en la tabla DetView_DatosGuia
    $('#DetView_DatosGuia tr').each((index, element) => {
      const cells = $(element).find('td');
      if (cells.length === 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();

        if (label.includes('estado')) {
          data.estado = value;
        } else if (label.includes('entregado a')) {
          data.entregadoA = value;
        } else if (label.includes('fecha de entrega')) {
          data.fechaEntrega = value;
        } else if (label.includes('ciudad origen')) {
          data.ciudadOrigen = value;
        } else if (label.includes('ciudad destino')) {
          data.ciudadDestino = value;
        } else if (label.includes('fecha de envío')) {
          data.fechaEnvio = value;
        } else if (label.includes('nombre cliente')) {
          data.nombreCliente = value;
        }
      }
    });

    // También buscar en el badge superior si no se encontró en la tabla
    if (!data.estado) {
      const badge = $('#lbltituloT').text().trim();
      if (badge) {
        data.estado = badge.replace(/\s+/g, ' ').trim();
      }
    }

    console.log('Datos extraídos:', data);

    if (!data.estado && !data.entregadoA) {
      return NextResponse.json(
        { success: false, error: 'No se encontró información de la guía' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error en búsqueda Fenix:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Configuración para que funcione en Vercel Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
