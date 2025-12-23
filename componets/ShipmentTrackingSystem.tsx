'use client';

import React, { useState, useEffect } from "react";
import {
  Upload,
  Plus,
  Search,
  Download,
  Check,
  X,
  Edit2,
  RefreshCw,
} from "lucide-react";

interface Shipment {
  id: number;
  guiaOriginal: string;
  fechaCarga: string;
  fechaEnvio: string;
  guiaRec: string;
  guiaSinlc: string;
  recuperado: string;
  fechaRecuperacion: string;
  observacion: string;
  regional: string;
  estado: string;
  contadorGestiones: number;
}

const ShipmentTrackingSystem = () => {
  const [userRole, setUserRole] = useState("usuario1");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkUpdateText, setBulkUpdateText] = useState("");
  const [loading, setLoading] = useState(false);
  const [newShipment, setNewShipment] = useState({
    guiaOriginal: "",
  });
  const [regionalInput, setRegionalInput] = useState("");
  const [showRegionalOtherInput, setShowRegionalOtherInput] = useState(false);
  const [sortField, setSortField] = useState<string>("fechaCarga");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const REGIONALES = [
"24 DE MAYO",
"ALAUSI",
"AMBATO",
"ANTONIO ANTE",
"ARCHIDONA",
"ARENILLAS",
"ATACAMES",
"ATUNTAQUI",
"AZOGUES",
"BABAHOYO",
"BAHIA DE CARAQUEZ",
"BIBLIAN",
"CALCETA",
"CALDERON",
"CALUMA",
"CAYAMBE",
"CHARAPOTO",
"CHONE",
"CONOCOTO",
"COTACACHI",
"CUENCA",
"CUMANDA",
"CUMBAYA",
"DAULE",
"DURAN",
"EL CARMEN",
"EL CHACO",
"EL COCA",
"EL EMPALME",
"EL GUABO",
"ESMERALDAS",
"FLAVIO ALFARO",
"FRANCISCO DE ORELLANA",
"GUALACEO",
"GUALAQUIZA",
"GUARANDA",
"GUAYAQUIL",
"GUAYTACAMA",
"HUAQUILLAS",
"IBARRA",
"JIPIJAPA",
"LA CONCORDIA",
"LA JOYA DE LOS SACHAS",
"LA LIBERTAD",
"LA MANA",
"LA TRONCAL",
"LAGO AGRIO",
"LATACUNGA",
"LOJA",
"LOMAS DE SARGENTILLO",
"MACARA",
"MACAS",
"MACHALA",
"MANTA",
"MILAGRO",
"MONTALVO (LOS RIOS)",
"NO HAY REGIONAL",
"OTAVALO",
"PALESTINA",
"PASAJE",
"PAUTE",
"PELILEO",
"PIÑAS",
"PLAYAS",
"PONCE ENRIQUEZ",
"PORTOVIEJO",
"PUERTO LOPEZ",
"PUERTO QUITO",
"PUYO",
"QUEVEDO",
"QUININDE",
"QUITO",
"RIOBAMBA",
"ROCAFUERTE",
"SALCEDO",
"SAMBORONDON",
"SAN ANTONIO IBARRA",
"SAN CAMILO",
"SAN PEDRO DE PELILEO",
"SAN VICENTE",
"SANGOLQUI",
"SANTA ELENA",
"SANTA LUCIA",
"SANTA ROSA",
"SANTO DOMINGO",
"SHUSHUFINDI",
"SIG SIG",
"TABACUNDO",
"TENA",
"TULCAN",
"TUMBACO",
"URCUQUI",
"VALLE DE LOS CHILLOS",
"VENTANAS",
"YAGUACHI",
"YANTZAZA",
"ZAMORA",
"ZARUMA",
  ];

// ⭐ AGREGAR ESTAS DOS FUNCIONES AQUÍ:
const getFechaEcuadorDDMMYYYY = (): string => {
  // Obtener fecha actual en Ecuador (UTC-5)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ecuadorTime = new Date(utc + (3600000 * -5)); // UTC-5 para Ecuador
  
  const dia = String(ecuadorTime.getUTCDate()).padStart(2, '0');
  const mes = String(ecuadorTime.getUTCMonth() + 1).padStart(2, '0');
  const anio = ecuadorTime.getUTCFullYear();
  
  return `${dia}/${mes}/${anio}`;
};
  
const formatDateToDDMMYYYY = (date: Date | string): string => {
  if (!date) return "";
  
  if (typeof date === 'string') {
    // Si ya está en formato DD/MM/YYYY, retornarlo tal cual
    if (date.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      return date;
    }
    
    // Si es formato YYYY-MM-DD, convertir directamente SIN usar Date
    if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parts = date.split('T')[0].split('-');
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    
    // Si es formato D/M/YYYY o DD/M/YYYY, normalizar
    if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
      const parts = date.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }
  }
  
  return "";
};
  
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  
  // DD/MM/YYYY -> YYYY-MM-DD (para el input date)
  if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const parts = dateString.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  
  // Ya está en YYYY-MM-DD
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString.split('T')[0];
  }
  
  return "";
};
const convertInputDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return "";
  
  // YYYY-MM-DD -> DD/MM/YYYY (el input date siempre devuelve en este formato)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  
  // Si ya está en formato DD/MM/YYYY, retornar tal cual
  if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const parts = dateString.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${day}/${month}/${year}`;
  }
  
  return dateString;
};
  // Cargar datos al inicio
  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, statusFilter]);

const loadShipments = async (updateFenix = false) => {
  setLoading(true);
  try {
    const response = await fetch('/api/sheets');
    const result = await response.json();
    if (result.success) {
      let data = result.data;

      // Si se solicita actualización de Fenix
      if (updateFenix) {
        const updatedData = [];
        let contadorActualizados = 0;
        let contadorOmitidos = 0;
        
        // Estados finales que NO deben actualizarse desde Fenix
        const estadosFinales = [
          'RECUPERADO',
          'NO PROCEDE',
          'CLIENTE DESISTE',
          'EXTRAVIO',
          'CERRAR',
          'RECLAMO FINALIZADO',
          'SIN GUÍA SINL',
          'CLIENTE NO RESPONDE'
        ];
        
        for (const shipment of data) {
          // CONDICIONES PARA ACTUALIZAR DESDE FENIX:
          // 1. Tiene guía SINLC
          // 2. NO tiene un estado final (está vacío o es SEGUIMIENTO)
          const tieneEstadoFinal = estadosFinales.includes(shipment.recuperado);
          const debeActualizar = shipment.guiaSinlc && !tieneEstadoFinal;
          
          if (debeActualizar) {
            try {
              const fenixData = await searchFenix(shipment.guiaSinlc);
              
              if (fenixData && fenixData.estado) {
                const updated = { ...shipment };
                
                // Si está entregado, actualizar a RECUPERADO
                if (fenixData.estado.toLowerCase().includes('entregado')) {
                  updated.recuperado = 'RECUPERADO';
                  
                  // Actualizar fecha de envío desde Fenix
                  if (fenixData.fechaEnvio && !updated.fechaEnvio) {
                    try {
                      const fechaEnvioMatch = fenixData.fechaEnvio.match(/(\d{1,2})\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{4})/i);
                      
                      if (fechaEnvioMatch) {
                        const meses: { [key: string]: string } = {
                          'enero': '01', 'ene': '01', 'jan': '01', 'january': '01',
                          'febrero': '02', 'feb': '02', 'february': '02',
                          'marzo': '03', 'mar': '03', 'march': '03',
                          'abril': '04', 'abr': '04', 'apr': '04', 'april': '04',
                          'mayo': '05', 'may': '05',
                          'junio': '06', 'jun': '06', 'june': '06',
                          'julio': '07', 'jul': '07', 'july': '07',
                          'agosto': '08', 'ago': '08', 'aug': '08', 'august': '08',
                          'septiembre': '09', 'sep': '09', 'sept': '09', 'september': '09',
                          'octubre': '10', 'oct': '10', 'october': '10',
                          'noviembre': '11', 'nov': '11', 'november': '11',
                          'diciembre': '12', 'dic': '12', 'dec': '12', 'december': '12'
                        };
                        
                        const dia = fechaEnvioMatch[1].padStart(2, '0');
                        const mesTexto = fechaEnvioMatch[2].toLowerCase();
                        const mes = meses[mesTexto];
                        const anio = fechaEnvioMatch[3];
                        
                        if (mes) {
                          updated.fechaEnvio = `${dia}/${mes}/${anio}`;
                        }
                      }
                    } catch (e) {
                      console.error('Error parseando fecha de envío:', e);
                    }
                  }
                  
                  // Convertir fecha de Fenix a formato DD/MM/YYYY
                  if (fenixData.fechaEntrega) {
                    try {
                      const fechaMatch = fenixData.fechaEntrega.match(/(\d{1,2})\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{4})/i);
                      
                      if (fechaMatch) {
                        const meses: { [key: string]: string } = {
                          'enero': '01', 'ene': '01', 'jan': '01', 'january': '01',
                          'febrero': '02', 'feb': '02', 'february': '02',
                          'marzo': '03', 'mar': '03', 'march': '03',
                          'abril': '04', 'abr': '04', 'apr': '04', 'april': '04',
                          'mayo': '05', 'may': '05',
                          'junio': '06', 'jun': '06', 'june': '06',
                          'julio': '07', 'jul': '07', 'july': '07',
                          'agosto': '08', 'ago': '08', 'aug': '08', 'august': '08',
                          'septiembre': '09', 'sep': '09', 'sept': '09', 'september': '09',
                          'octubre': '10', 'oct': '10', 'october': '10',
                          'noviembre': '11', 'nov': '11', 'november': '11',
                          'diciembre': '12', 'dic': '12', 'dec': '12', 'december': '12'
                        };
                        
                        const dia = fechaMatch[1].padStart(2, '0');
                        const mesTexto = fechaMatch[2].toLowerCase();
                        const mes = meses[mesTexto];
                        const anio = fechaMatch[3];
                               
                        if (mes) {
                          updated.fechaRecuperacion = `${dia}/${mes}/${anio}`;
                        } else {
                         updated.fechaRecuperacion = getFechaEcuadorDDMMYYYY();
                        }
                      } else {
                        updated.fechaRecuperacion = getFechaEcuadorDDMMYYYY();
                      }
                    } catch (e) {
                      console.error('Error parseando fecha:', e);
                      updated.fechaRecuperacion = getFechaEcuadorDDMMYYYY();
                    }
                  } else {
                    console.warn('No hay fechaEntrega en los datos de Fenix');
                  }
                  
                  // Actualizar regional con ciudad origen
                  updated.regional = fenixData.ciudadOrigen || '';
                  
                  updated.observacion = fenixData.entregadoA 
                    ? `RECIBIDO POR ${fenixData.entregadoA}` 
                    : 'RECUPERADO';
                } else {
                  // Si no está entregado, mantener o poner SEGUIMIENTO
                  if (!updated.recuperado || updated.recuperado === '') {
                    updated.recuperado = 'SEGUIMIENTO';
                  }
                  updated.regional = fenixData.ciudadOrigen || '';
                  
                  // Actualizar fecha de envío también para casos en seguimiento
                  if (fenixData.fechaEnvio && !updated.fechaEnvio) {
                    try {
                      const fechaEnvioMatch = fenixData.fechaEnvio.match(/(\d{1,2})\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{4})/i);
                      
                      if (fechaEnvioMatch) {
                        const meses: { [key: string]: string } = {
                          'enero': '01', 'ene': '01', 'jan': '01', 'january': '01',
                          'febrero': '02', 'feb': '02', 'february': '02',
                          'marzo': '03', 'mar': '03', 'march': '03',
                          'abril': '04', 'abr': '04', 'apr': '04', 'april': '04',
                          'mayo': '05', 'may': '05',
                          'junio': '06', 'jun': '06', 'june': '06',
                          'julio': '07', 'jul': '07', 'july': '07',
                          'agosto': '08', 'ago': '08', 'aug': '08', 'august': '08',
                          'septiembre': '09', 'sep': '09', 'sept': '09', 'september': '09',
                          'octubre': '10', 'oct': '10', 'october': '10',
                          'noviembre': '11', 'nov': '11', 'november': '11',
                          'diciembre': '12', 'dic': '12', 'dec': '12', 'december': '12'
                        };
                        
                        const dia = fechaEnvioMatch[1].padStart(2, '0');
                        const mesTexto = fechaEnvioMatch[2].toLowerCase();
                        const mes = meses[mesTexto];
                        const anio = fechaEnvioMatch[3];
                        
                        if (mes) {
                          updated.fechaEnvio = `${dia}/${mes}/${anio}`;
                        }
                      }
                    } catch (e) {
                      console.error('Error parseando fecha de envío:', e);
                    }
                  }
                }
                        
                updated.estado = getEstado(updated);
                updated.usuario = userRole;
                
                // Guardar cambios en Google Sheets
                await fetch('/api/sheets', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                });
                
                updatedData.push(updated);
                contadorActualizados++;
              } else {
                updatedData.push(shipment);
              }
            } catch (error) {
              console.error(`Error buscando guía ${shipment.guiaSinlc}:`, error);
              updatedData.push(shipment);
            }
          } else {
            // No actualizar - ya tiene estado final o no tiene guía SINLC
            if (shipment.guiaSinlc && tieneEstadoFinal) {
              contadorOmitidos++;
            }
            updatedData.push(shipment);
          }
        }
        
        setShipments(updatedData);
        
        let mensaje = `Actualización completada.\n`;
        mensaje += `✅ ${contadorActualizados} guías actualizadas desde Fenix.\n`;
        if (contadorOmitidos > 0) {
          mensaje += `⏭️ ${contadorOmitidos} guías omitidas (ya tienen estado final).`;
        }
        
        alert(mensaje);
      } else {
        setShipments(data);
      }
    } else {
      alert('Error al cargar datos: ' + result.error);
    }
  } catch (error) {
    console.error('Error loading shipments:', error);
    alert('Error al cargar datos de Google Sheets');
  } finally {
    setLoading(false);
  }
};
  
  const filterShipments = () => {
    let filtered = [...shipments];

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.guiaOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.guiaRec &&
            s.guiaRec.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.guiaSinlc &&
            s.guiaSinlc.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.regional &&
            s.regional.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((s) => s.estado === statusFilter);
    }

    setFilteredShipments(filtered);
  };
const sortShipments = (field: string) => {
  const newDirection = 
    sortField === field && sortDirection === "asc" ? "desc" : "asc";
  
  setSortField(field);
  setSortDirection(newDirection);
};

const getSortedShipments = () => {
  const sorted = [...filteredShipments].sort((a, b) => {
    let aValue: any = a[sortField as keyof Shipment];
    let bValue: any = b[sortField as keyof Shipment];

    // Convertir fechas DD/MM/YYYY a Date para comparar
    if (sortField === "fechaCarga" || sortField === "fechaEnvio" || sortField === "fechaRecuperacion") {
      const parseDate = (dateStr: string) => {
        if (!dateStr || dateStr === "-") return new Date(0);
        const [day, month, year] = dateStr.split("/");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      };
      aValue = parseDate(aValue);
      bValue = parseDate(bValue);
    }

    // Comparar números
    if (sortField === "contadorGestiones") {
      aValue = aValue || 0;
      bValue = bValue || 0;
    }

    // Comparar strings
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
};
  
const getEstado = (shipment: Shipment) => {
  // 1. RECUPERADO (prioridad más alta)
  if (shipment.recuperado === "RECUPERADO") {
    return "recuperado";
  }
  
  // 2. CASOS FINALIZADOS (casos cerrados negativos - NO REQUIERE GUÍA SINLC)
  // Estos estados finales no necesitan guías REC ni SINLC
  if (
    shipment.recuperado === "NO PROCEDE" ||
    shipment.recuperado === "CLIENTE DESISTE" ||
    shipment.recuperado === "EXTRAVIO" ||
    shipment.recuperado === "CERRAR" ||
    shipment.recuperado === "RECLAMO FINALIZADO" ||
    shipment.recuperado === "NO ES DAÑO - NI HURTO" ||
    shipment.recuperado === "COMPOSTURA" ||
    shipment.recuperado === "ACTA DE DESTRUCCION" ||
    shipment.recuperado === "REPARACION"
  ) {
    return "casos-finalizados";
  }
  
  // 3. EN PROCESO - SEGUIMIENTO (estados activos específicos)
  if (
    shipment.recuperado === "SEGUIMIENTO" ||
    shipment.recuperado === "SOL UBI" ||
    shipment.recuperado === "SOL DOCS" ||
    shipment.recuperado === "PENDIENTE"
  ) {
    return "pendiente";
  }
  
  // 4. SIN PROCESAR (no tiene guía SINLC Y no tiene ningún estado)
  if (
    (!shipment.guiaSinlc || shipment.recuperado === "SIN GUÍA SINL") &&
    (!shipment.recuperado || shipment.recuperado === "" || shipment.recuperado === "SIN GUÍA SINL")
  ) {
    return "sin-procesar";
  }
  
  // 5. PROCESADO (todos los demás casos con cualquier estado definido)
  // Incluye:
  // - Casos con guía SINLC y estado definido
  // - Casos sin guía SINLC pero con estado definido
  // - Cualquier otro estado no contemplado arriba
  return "procesado";
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "recuperado":
      return "bg-green-500";
    case "pendiente":
      return "bg-yellow-400";
    case "procesado":
      return "bg-blue-500";
case "casos-finalizados":
  return "bg-red-500";
    case "sin-procesar":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

// AGREGAR ESTA FUNCIÓN AQUÍ:
const isDuplicate = (guiaOriginal: string, currentId: number) => {
  return shipments.filter(
    (s) => s.guiaOriginal === guiaOriginal && s.id !== currentId
  ).length > 0;
};

const getDuplicateCount = (guiaOriginal: string) => {
  return shipments.filter((s) => s.guiaOriginal === guiaOriginal).length;
};



const updateShipmentLocal = (id: number, field: string, value: any) => {
  setShipments(
    shipments.map((s) => {
      if (s.id === id) {
        const updated = { ...s } as any; // Hacer el objeto mutable temporalmente
        
        // Convertir fechas de input a DD/MM/YYYY
        if ((field === 'fechaEnvio' || field === 'fechaRecuperacion') && value) {
          updated[field] = convertInputDateToDDMMYYYY(value);
        } else {
          updated[field] = value;
        }

        if (field === "recuperado" && value === "RECUPERADO") {
  if (!updated.fechaRecuperacion) {
    updated.fechaRecuperacion = getFechaEcuadorDDMMYYYY();
  }
}

        return updated as Shipment; // Devolver con el tipo correcto
      }
      return s;
    })
  );
};
  
// Reemplaza estas funciones en tu ShipmentTrackingSystem.tsx

const saveShipmentEdits = async (id: number) => {
  const shipment = shipments.find((s) => s.id === id);
  if (!shipment) return;

  if (editingId === id) {
    if (
      shipment.recuperado === "RECUPERADO" &&
      !shipment.fechaRecuperacion
    ) {
      alert("Por favor, complete la fecha de recuperación.");
      return;
    }
  }

  // Incrementar contador de gestiones al guardar
  const nuevoContador = (shipment.contadorGestiones || 0) + 1;

  // Recalcular estado antes de guardar
  const updatedShipment = {
    ...shipment,
    contadorGestiones: nuevoContador,
    estado: getEstado(shipment),
    usuario: userRole // ⭐ AGREGAR ESTO
  };

  setLoading(true);
  try {
    const response = await fetch('/api/sheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedShipment),
    });

    const result = await response.json();
    if (result.success) {
      setEditingId(null);
      await loadShipments();
    } else {
      alert('Error al actualizar: ' + result.error);
    }
  } catch (error) {
    console.error('Error updating shipment:', error);
    alert('Error al actualizar registro');
  } finally {
    setLoading(false);
  }
};

const deleteShipment = async (id: number) => {
  if (!confirm("¿Está seguro de eliminar esta guía?")) return;

  const shipment = shipments.find(s => s.id === id);
  const guiaOriginal = shipment?.guiaOriginal || 'Desconocida';

  setLoading(true);
  try {
    const response = await fetch(
      `/api/sheets?id=${id}&guia=${encodeURIComponent(guiaOriginal)}&usuario=${encodeURIComponent(userRole)}`, // ⭐ AGREGAR usuario
      { method: 'DELETE' }
    );

    const result = await response.json();
    if (result.success) {
      await loadShipments();
    } else {
      alert('Error al eliminar: ' + result.error);
    }
  } catch (error) {
    console.error('Error deleting shipment:', error);
    alert('Error al eliminar guía');
  } finally {
    setLoading(false);
  }
};

const addShipment = async () => {
  if (!newShipment.guiaOriginal.trim()) {
    alert("Por favor ingrese la guía original");
    return;
  }

  const guiaTrimmed = newShipment.guiaOriginal.trim();
  const existeDuplicado = shipments.some(s => s.guiaOriginal === guiaTrimmed);
  
  if (existeDuplicado) {
    const confirmar = confirm(
      `⚠️ ADVERTENCIA: La guía ${guiaTrimmed} ya existe en el sistema.\n\n¿Desea agregarla de todos modos?`
    );
    if (!confirmar) return;
  }

  const fechaCargaFormateada = getFechaEcuadorDDMMYYYY();
  const shipmentToAdd = {
    id: Date.now(),
    guiaOriginal: newShipment.guiaOriginal.trim(),
    fechaCarga: fechaCargaFormateada,
    fechaEnvio: "",
    guiaRec: "",
    guiaSinlc: "",
    recuperado: "",
    fechaRecuperacion: "",
    observacion: "",
    regional: "",
    estado: "sin-procesar",
    contadorGestiones: 0,
  };

  setLoading(true);
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'addSingle', 
        data: shipmentToAdd,
        usuario: userRole // ⭐ AGREGAR ESTO
      }),
    });

    const result = await response.json();
    if (result.success) {
      await loadShipments();
      setNewShipment({ guiaOriginal: "" });
      setShowAddModal(false);
    } else {
      alert('Error al agregar guía: ' + result.error);
    }
  } catch (error) {
    console.error('Error adding shipment:', error);
    alert('Error al agregar guía');
  } finally {
    setLoading(false);
  }
};

const handleBulkUpload = async () => {
  const lines = bulkText.split("\n").filter((l) => l.trim());

  if (lines.length === 0) {
    alert("No hay datos para cargar");
    return;
  }

  const guiasNuevas = lines.map(l => l.trim());
  const duplicadosExistentes = guiasNuevas.filter(guia => 
    shipments.some(s => s.guiaOriginal === guia)
  );
  
  const duplicadosInternos = guiasNuevas.filter((guia, index) => 
    guiasNuevas.indexOf(guia) !== index
  );

  let mensajeAdvertencia = "";
  if (duplicadosExistentes.length > 0) {
    mensajeAdvertencia += `⚠️ ${duplicadosExistentes.length} guías ya existen en el sistema:\n${duplicadosExistentes.slice(0, 5).join(", ")}${duplicadosExistentes.length > 5 ? "..." : ""}\n\n`;
  }
  if (duplicadosInternos.length > 0) {
   mensajeAdvertencia += `⚠️ ${duplicadosInternos.length} guías están duplicadas en el texto que pegó:\n${Array.from(new Set(duplicadosInternos)).slice(0, 5).join(", ")}${duplicadosInternos.length > 5 ? "..." : ""}\n\n`;
  }

  if (mensajeAdvertencia) {
    const confirmar = confirm(
      mensajeAdvertencia + "¿Desea continuar con la carga de todos modos?"
    );
    if (!confirmar) return;
  }

const fechaCargaFormateada = getFechaEcuadorDDMMYYYY();

const newShipments = lines.map((line, index) => {
    const guia = line.trim();
    return {
      id: Date.now() + index,
      guiaOriginal: guia,
      fechaCarga: fechaCargaFormateada,
      fechaEnvio: "",
      guiaRec: "",
      guiaSinlc: "",
      recuperado: "",
      fechaRecuperacion: "",
      observacion: "",
      regional: "",
      estado: "sin-procesar",
      contadorGestiones: 0,
    };
  });

  setLoading(true);
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'addMultiple', 
        data: newShipments,
        usuario: userRole // ⭐ AGREGAR ESTO
      }),
    });

    const result = await response.json();
    if (result.success) {
      await loadShipments();
      setBulkText("");
      setShowBulkModal(false);
      alert(`Se agregaron ${newShipments.length} guías correctamente`);
    } else {
      alert('Error al cargar guías: ' + result.error);
    }
  } catch (error) {
    console.error('Error in bulk upload:', error);
    alert('Error al cargar guías masivamente');
  } finally {
    setLoading(false);
  }
};

const handleBulkUpdate = async () => {
  const lines = bulkUpdateText.split("\n").filter((l) => l.trim());

  if (lines.length === 0) {
    alert("No hay datos para actualizar");
    return;
  }

  // ACTIVAR LOADING INMEDIATAMENTE
  setLoading(true);

  try {
    let updated = 0;
    let notFound: string[] = [];
    const updatedShipments = [...shipments];

    lines.forEach((line) => {
      const parts = line.split("\t").map((p) => p.trim());
      if (parts.length < 6) return;

      const guiaOriginal = parts[0];
      const fechaEnvio = parts[1] || "";
      const guiaRec = parts[2] || "";
      const guiaSinlc = parts[3] || "";
      const recuperado = parts[4] || "";
      const fechaRecuperacion = parts[5] || "";
      const regional = parts[6] || "";
      const observacion = parts[7] || "";

      const index = updatedShipments.findIndex(
        (s) => s.guiaOriginal === guiaOriginal
      );

      if (index !== -1) {
        updatedShipments[index] = {
          ...updatedShipments[index],
          fechaEnvio,
          guiaRec,
          guiaSinlc,
          recuperado,
          fechaRecuperacion:
            recuperado === "RECUPERADO" ? fechaRecuperacion : "",
          regional,
          observacion,
        };

        updatedShipments[index].estado = getEstado(updatedShipments[index]);
        updated++;
      } else {
        notFound.push(guiaOriginal);
      }
    });

    // Actualizar todos los registros modificados
    const shipmentsToUpdate = updatedShipments.filter((s) => 
      lines.some(line => line.startsWith(s.guiaOriginal))
    );

    // Procesar actualizaciones con feedback visual
    for (let i = 0; i < shipmentsToUpdate.length; i++) {
      await fetch('/api/sheets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentsToUpdate[i]),
      });
      
      // Pequeña pausa para evitar sobrecarga del servidor
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    await loadShipments();
    setBulkUpdateText("");
    setShowBulkUpdateModal(false);

    let message = `Se actualizaron ${updated} guías correctamente`;
    if (notFound.length > 0) {
      message += `\n\nNo se encontraron ${notFound.length} guías: ${notFound
        .slice(0, 5)
        .join(", ")}${notFound.length > 5 ? "..." : ""}`;
    }
    alert(message);
  } catch (error) {
    console.error('Error in bulk update:', error);
    alert('Error al actualizar guías masivamente');
  } finally {
    // DESACTIVAR LOADING AL FINALIZAR
    setLoading(false);
  }
};

const exportToExcel = () => {
  const headers = [
    "Fecha Carga",
    "Guia Original",
    "Gestiones",
    "Fecha Envio",
    "Guia REC",
    "Guia SINLC",
    "Estado Final",
    "Fecha Recuperacion",
    "Regional",
    "Observacion",
  ];
  const rows = filteredShipments.map((s) => [
    formatDateToDDMMYYYY(s.fechaCarga) || "-",
    s.guiaOriginal || "",
    s.contadorGestiones || 0,
    s.fechaEnvio || "",
    s.guiaRec || "",
    s.guiaSinlc || "",
    s.recuperado || "",
    s.fechaRecuperacion || "",
    s.regional || "",
    s.observacion || "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join("\t")).join("\n");
  
  // Agregar BOM UTF-8 para correcta codificación
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csv;
  
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `guias_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const stats = {
  total: shipments.length,
  sinProcesar: shipments.filter((s) => s.estado === "sin-procesar").length,
  procesados: 0,
  recuperados: shipments.filter((s) => s.estado === "recuperado").length,
  pendientes: shipments.filter((s) => s.estado === "pendiente").length,
  casosFinalizados: shipments.filter((s) => s.estado === "casos-finalizados").length,
  duplicados: shipments.filter((s) => isDuplicate(s.guiaOriginal, s.id)).length,
};

// Calcular procesados como: Total - Sin Procesar
stats.procesados = stats.total - stats.sinProcesar;
const searchFenix = async (guiaSinlc: string) => {
  if (!guiaSinlc) {
    alert('No hay guía SINLC para buscar');
    return null;
  }

  try {
    const response = await fetch('/api/fenix-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guia: guiaSinlc }),
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      console.error('Error en búsqueda Fenix:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error buscando en Fenix:', error);
    return null;
  }
};
  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
            <RefreshCw className="animate-spin" size={24} />
            <span className="font-semibold">Cargando...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#fce200" }}>
                Sistema de Recuperación de Guías
              </h1>
              <p className="text-gray-300 mt-1">
                Control de siniestros y recuperación
              </p>
            </div>
            <div className="flex gap-3">
                <button
                  onClick={() => loadShipments(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw size={20} />
                  Actualizar con Fenix
                </button>
              
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
              >
                <option value="usuario1">Usuario 1 - Carga de Guías</option>
                <option value="usuario2">
                  Usuario 2 - Recuperación y Seguimiento
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-7 gap-4 mb-6">
          <div
            className="bg-white p-4 rounded-lg shadow border-l-4"
            style={{ borderColor: "#fce200" }}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total Guías</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400">
            <div className="text-2xl font-bold text-gray-600">
              {stats.sinProcesar}
            </div>
            <div className="text-gray-600 text-sm">Sin Procesar</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">
              {stats.procesados}
            </div>
            <div className="text-gray-600 text-sm">Procesados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">
              {stats.recuperados}
            </div>
            <div className="text-gray-600 text-sm">Recuperados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-400">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendientes}
            </div>
            <div className="text-gray-600 text-sm">En Proceso</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">
              {stats.casosFinalizados}
            </div>
            <div className="text-gray-600 text-sm">Casos Finalizados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">
              {stats.duplicados}
            </div>
            <div className="text-gray-600 text-sm">Duplicados</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por guía, regional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

          <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
>
  <option value="todos">Procesados</option>
  <option value="sin-procesar">Sin Procesar</option>
  <option value="recuperado">Recuperados</option>
  <option value="pendiente">En Proceso</option>
 <option value="casos-finalizados">Casos Finalizados</option>
</select>

            {userRole === "usuario1" && (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-lg text-black font-semibold hover:opacity-80 transition flex items-center gap-2"
                  style={{ backgroundColor: "#fce200" }}
                  disabled={loading}
                >
                  <Plus size={20} />
                  Agregar Guía
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                  disabled={loading}
                >
                  <Upload size={20} />
                  Carga Masiva
                </button>
              </>
            )}

            {userRole === "usuario2" && (
              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                disabled={loading}
              >
                <Upload size={20} />
                Actualización Masiva
              </button>
            )}

            <button
              onClick={exportToExcel}
              className="px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition flex items-center gap-2"
            >
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: "#e1e1e1" }}>
                <tr>
                  <th className="px-2 py-3 text-left text-sm font-semibold w-[50px]">
                    Estado
                  </th>
                  <th 
                    className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => sortShipments("fechaCarga")}
                  >
                    Fecha Carga {sortField === "fechaCarga" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => sortShipments("guiaOriginal")}
                  >
                    Guía Original {sortField === "guiaOriginal" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => sortShipments("contadorGestiones")}
                  >
                    Gestiones {sortField === "contadorGestiones" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-2 py-3 text-left text-sm font-semibold">
                    Fecha Envío
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold w-[140px] min-w-[140px]">
                    Guía REC
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold w-[150px] min-w-[150px]">
                    Guía SINLC
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-sm font-semibold w-[120px] cursor-pointer hover:bg-gray-200"
                    onClick={() => sortShipments("recuperado")}
                  >
                    Estado Final {sortField === "recuperado" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  {userRole === "usuario2" && (
                    <th 
                      className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => sortShipments("fechaRecuperacion")}
                    >
                      Fecha de Recuperación {sortField === "fechaRecuperacion" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                  )}
                  {userRole === "usuario2" && (
                    <th 
                      className="px-3 py-3 text-left text-sm font-semibold w-[100px] cursor-pointer hover:bg-gray-200"
                      onClick={() => sortShipments("regional")}
                    >
                      Regional {sortField === "regional" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                  )}
                  <th className="px-3 py-3 text-left text-sm font-semibold">
                    Observación
                  </th>
                  <th className="px-2 py-3 text-left text-sm font-semibold w-[50px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedShipments().map((shipment) => (
                <tr
                  key={shipment.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                    isDuplicate(shipment.guiaOriginal, shipment.id)
                      ? "bg-orange-100 border-l-4 border-l-orange-500"
                      : shipment.estado === "recuperado"
                      ? "bg-green-50"
                      : shipment.estado === "pendiente"
                      ? "bg-yellow-50"
                      : shipment.estado === "no-recuperado"
                      ? "bg-red-50"
                      : "bg-white"
                  }`}
                >
                    <td className="px-4 py-3">
                      <div
                        className={`w-4 h-4 rounded-full ${getEstadoColor(
                          shipment.estado
                        )} shadow`}
                        title={shipment.estado}
                      ></div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {formatDateToDDMMYYYY(shipment.fechaCarga) || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          isDuplicate(shipment.guiaOriginal, shipment.id) 
                            ? "text-orange-600" 
                            : "text-black"
                        }`}>
                          {shipment.guiaOriginal}
                        </span>
                        {isDuplicate(shipment.guiaOriginal, shipment.id) && (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800"
                            title={`Esta guía aparece ${getDuplicateCount(shipment.guiaOriginal)} veces`}
                          >
                            ⚠️ x{getDuplicateCount(shipment.guiaOriginal)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            (shipment.contadorGestiones || 0) > 0
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {shipment.contadorGestiones || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                    {userRole === "usuario2" && editingId === shipment.id ? (
                      <input
                        type="date"
                        value={formatDateForInput(shipment.fechaEnvio)}
                        onChange={(e) =>
                          updateShipmentLocal(
                            shipment.id,
                            "fechaEnvio",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      />
                    ) : (
                      <span className="text-sm">
                        {formatDateToDDMMYYYY(shipment.fechaEnvio) || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                      {userRole === "usuario2" && editingId === shipment.id ? (
                        <input
                          type="text"
                          value={shipment.guiaRec}
                          onChange={(e) =>
                            updateShipmentLocal(
                              shipment.id,
                              "guiaRec",
                              e.target.value
                            )
                          }
                          placeholder="REC2258651"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      ) : (
                        <span className="text-sm">
                          {shipment.guiaRec || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {userRole === "usuario2" && editingId === shipment.id ? (
                        <input
                          type="text"
                          value={shipment.guiaSinlc}
                          onChange={(e) =>
                            updateShipmentLocal(
                              shipment.id,
                              "guiaSinlc",
                              e.target.value
                            )
                          }
                          placeholder="SINLC51616728"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      ) : (
                        <span className="text-sm">
                          {shipment.guiaSinlc || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {userRole === "usuario2" && editingId === shipment.id ? (
                        <select
                          value={shipment.recuperado}
                          onChange={(e) =>
                            updateShipmentLocal(
                              shipment.id,
                              "recuperado",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="RECUPERADO">RECUPERADO</option>
                          <option value="NO PROCEDE">NO PROCEDE</option>
                          <option value="CERRAR">CERRAR</option>
                          <option value="CLIENTE DESISTE">CLIENTE DESISTE</option>
                          <option value="EXTRAVIO">EXTRAVIO</option>
                          <option value="SOL DOCS">SOL DOCS</option>
                          <option value="SOL UBI">SOL UBI</option>
                          <option value="SEGUIMIENTO">SEGUIMIENTO</option>
                          <option value="CERRAR">CERRAR</option>
                          <option value="REPARACION">REPARACION</option>
                          <option value="SIN GUÍA SINL">SIN GUÍA SINL</option>
                          <option value="CLIENTE NO RESPONDE">CLIENTE NO RESPONDE</option>
                          <option value="RECLAMO FINALIZADO">RECLAMO FINALIZADO</option>
                        </select>
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            shipment.recuperado === "RECUPERADO"
                              ? "text-green-700"
                              : shipment.recuperado === "NO PROCEDE" ||
                                shipment.recuperado === "CLIENTE DESISTE" ||
                                shipment.recuperado === "EXTRAVIO"
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {shipment.recuperado || "-"}
                        </span>
                      )}
                    </td>
                      {userRole === "usuario2" && (
                        <td className="px-4 py-3">
                          {editingId === shipment.id &&
                          shipment.recuperado === "RECUPERADO" ? (
                            <input
                              type="date"
                              value={formatDateForInput(shipment.fechaRecuperacion)}
                              onChange={(e) =>
                                updateShipmentLocal(
                                  shipment.id,
                                  "fechaRecuperacion",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                            />
                          ) : (
                            <span className="text-sm">
                              {shipment.recuperado === "RECUPERADO" &&
                              shipment.fechaRecuperacion
                                ? formatDateToDDMMYYYY(shipment.fechaRecuperacion) || "-"
                                : "-"}
                            </span>
                          )}
                        </td>
                      )}
                    {userRole === "usuario2" && (
                      <td className="px-4 py-3">
                        {editingId === shipment.id ? (
                          <>
                            <select
                              value={shipment.regional}
                              onChange={(e) => {
                                updateShipmentLocal(
                                  shipment.id,
                                  "regional",
                                  e.target.value
                                );
                                setShowRegionalOtherInput(
                                  e.target.value === "OTRO"
                                );
                                if (e.target.value !== "OTRO")
                                  setRegionalInput("");
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm mb-1"
                            >
                              <option value="">Seleccionar Regional...</option>
                              {REGIONALES.map((regional) => (
                                <option key={regional} value={regional}>
                                  {regional}
                                </option>
                              ))}
                              <option value="OTRO">OTRO</option>
                            </select>
                            {(showRegionalOtherInput ||
                              (editingId === shipment.id &&
                                shipment.regional &&
                                !REGIONALES.includes(shipment.regional))) && (
                              <input
                                type="text"
                                value={regionalInput || shipment.regional}
                                onChange={(e) => {
                                  setRegionalInput(e.target.value);
                                  updateShipmentLocal(
                                    shipment.id,
                                    "regional",
                                    e.target.value
                                  );
                                }}
                                placeholder="Especifique otra regional"
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm mt-1"
                              />
                            )}
                          </>
                        ) : (
                          <span className="text-sm">
                            {shipment.regional || "-"}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {userRole === "usuario2" && editingId === shipment.id ? (
                        <input
                          type="text"
                          value={shipment.observacion}
                          onChange={(e) =>
                            updateShipmentLocal(
                              shipment.id,
                              "observacion",
                              e.target.value
                            )
                          }
                          placeholder="Observaciones..."
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">
                          {shipment.observacion || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {userRole === "usuario2" && (
                          <button
                            onClick={() =>
                              editingId === shipment.id
                                ? saveShipmentEdits(shipment.id)
                                : setEditingId(shipment.id)
                            }
                            className={`p-2 rounded transition ${
                              editingId === shipment.id
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            title={
                              editingId === shipment.id
                                ? "Guardar cambios"
                                : "Editar"
                            }
                            disabled={loading}
                          >
                            {editingId === shipment.id ? (
                              <Check size={16} />
                            ) : (
                              <Edit2 size={16} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => deleteShipment(shipment.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-600 transition"
                          title="Eliminar"
                          disabled={loading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredShipments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <div className="font-medium">No se encontraron guías</div>
              <div className="text-sm">
                {userRole === "usuario1"
                  ? "Comienza agregando nuevas guías"
                  : "Esperando guías del Usuario 1"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal - Solo Usuario 1 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Agregar Nueva Guía</h3>
<p className="text-sm text-gray-600 mb-4">
  La fecha de carga se registrará automáticamente:{" "}
  <strong>{getFechaEcuadorDDMMYYYY()}</strong>
</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Guía Original *
                </label>
                <input
                  type="text"
                  value={newShipment.guiaOriginal}
                  onChange={(e) =>
                    setNewShipment({ guiaOriginal: e.target.value })
                  }
                  placeholder="LC51509922"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addShipment}
                className="flex-1 px-4 py-2 rounded-lg text-black font-semibold hover:opacity-80"
                style={{ backgroundColor: "#fce200" }}
                disabled={loading}
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal - Solo Usuario 1 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">Carga Masiva de Guías</h3>
            <p className="text-sm text-gray-600 mb-2">
              Ingrese o pegue las guías originales,{" "}
              <strong>una por línea</strong>:
            </p>
<p className="text-sm text-gray-600 mb-4">
  Fecha de carga:{" "}
  <strong>{getFechaEcuadorDDMMYYYY()}</strong>
</p>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full h-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                placeholder={"LC51509922\nLC51507517\nLC50719191\nLC50448705\n..."}
              />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBulkUpload}
                className="flex-1 px-4 py-2 rounded-lg text-black font-semibold hover:opacity-80"
                style={{ backgroundColor: "#fce200" }}
                disabled={loading}
              >
                Cargar Guías
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkText("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal - Solo Usuario 2 */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              Actualización Masiva de Seguimiento
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Pegue los datos desde Excel separados por{" "}
              <strong>tabulaciones</strong>:
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Formato:</strong> Guía Original | Fecha Envío | Guía REC |
              Guía SINLC | Estado Final | Fecha Recuperación | Regional |
              Observación
            </p>

            <div className="bg-gray-50 p-3 rounded mb-4 text-xs font-mono">
              <div className="text-gray-600 mb-1">Ejemplo:</div>
              <div>
                LC51509922{"\t"}01/09/2025{"\t"}REC2258651{"\t"}SINLC51616728
                {"\t"}RECUPERADO{"\t"}05/09/2025{"\t"}QUITO{"\t"}RECIBIDO POR DANIEL SILVA
              </div>
              <div>
                LC51507517{"\t"}01/09/2025{"\t"}REC2258930{"\t"}SINLC51617039
                {"\t"}NO PROCEDE{"\t"}
                {"\t"}AMBATO{"\t"}Guía duplicada
              </div>
            </div>

            <textarea
              value={bulkUpdateText}
              onChange={(e) => setBulkUpdateText(e.target.value)}
              className="w-full h-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
              placeholder="LC51509922	2024-09-01	REC2258651	SINLC51616728	RECUPERADO	2024-09-05	QUITO	RECIBIDO POR DANIEL SILVA&#10;LC51507517	2024-09-01	REC2258930	SINLC51617039	NO PROCEDE		AMBATO	Guía duplicada"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBulkUpdate}
                className="flex-1 px-4 py-2 rounded-lg text-black font-semibold hover:opacity-80"
                style={{ backgroundColor: "#fce200" }}
                disabled={loading}
              >
                Actualizar Guías
              </button>
              <button
                onClick={() => {
                  setShowBulkUpdateModal(false);
                  setBulkUpdateText("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTrackingSystem;
