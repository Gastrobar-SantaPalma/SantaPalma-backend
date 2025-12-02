import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES Modules (__dirname equivalente)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Importa cliente Supabase y servicios
import supabase from '../src/config/supabaseClient.js';
import reportesService from '../src/services/reportes.service.js';

(async () => {
  try {
    console.log('====== TEST DE REPORTES ======');

    // 1. Ventas Total
    const ventasSemana = await reportesService.ventasTotal('week');
    const ventasMes = await reportesService.ventasTotal('month');
    const ventasAnio = await reportesService.ventasTotal('year');
    console.log('Ventas total semana:', ventasSemana);
    console.log('Ventas total mes:', ventasMes);
    console.log('Ventas total año:', ventasAnio);

    // 2. Ingresos por días
    const ingresos7dias = await reportesService.ingresosSeries(7);
    const ingresos30dias = await reportesService.ingresosSeries(30);
    console.log('Ingresos últimos 7 días:', ingresos7dias);
    console.log('Ingresos últimos 30 días:', ingresos30dias);

    // 3. Pedidos count by day
    const pedidos7dias = await reportesService.pedidosCountByDay(7);
    console.log('Pedidos últimos 7 días:', pedidos7dias);

    // 4. Orders by status
    const ordersStatus7dias = await reportesService.ordersByStatus(7);
    console.log('Pedidos por status últimos 7 días:', ordersStatus7dias);

    // 5. Reviews count by day
    const reviews7dias = await reportesService.reviewsCountByDay(7);
    console.log('Reseñas últimos 7 días:', reviews7dias);

    // 6. Nuevos clientes
    const clientes30dias = await reportesService.newClients(30);
    console.log('Nuevos clientes últimos 30 días:', clientes30dias);

    // 7. Top productos
    const top10productos = await reportesService.topProducts(10);
    console.log('Top 10 productos:', top10productos);

    // 8. Top categorías
    const top10categorias = await reportesService.topCategories(10);
    console.log('Top 10 categorías:', top10categorias);

    // 9. Ventas por mes (puedes pasar año y mes específicos)
    const ventasMeses = await reportesService.ventasPorMes(new Date().getFullYear());
    console.log('Ventas por mes:', ventasMeses);

    console.log('====== FIN DE TEST ======');
  } catch (err) {
    console.error('Error en testReportes:', err);
  }
})();
