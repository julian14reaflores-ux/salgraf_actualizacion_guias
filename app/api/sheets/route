import { NextResponse } from 'next/server';
import {
  initializeSheet,
  getAllShipments,
  addShipment,
  updateShipment,
  deleteShipment,
  addMultipleShipments,
} from '@/lib/googleSheets';

// GET - Obtener todas las guías
export async function GET() {
  try {
    await initializeSheet();
    const shipments = await getAllShipments();
    return NextResponse.json({ success: true, data: shipments });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Agregar guía(s)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'addSingle') {
      await addShipment(body.data);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'addMultiple') {
      await addMultipleShipments(body.data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar guía
export async function PUT(request: Request) {
  try {
    const shipment = await request.json();
    await updateShipment(shipment);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar guía
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteShipment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
