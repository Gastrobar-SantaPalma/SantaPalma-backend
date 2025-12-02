import supabase from '../config/supabaseClient.js'
import productoRepository from '../repositories/producto.repository.js'

function formatDate(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

class ReportesService {

  async _fetchPedidosBetween(from, to) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id_pedido, fecha_pedido, total, pago, items, estado')
      .gte('fecha_pedido', from)
      .lte('fecha_pedido', to)

    if (error) throw new Error(error.message)
    return data || []
  }

  async ventasTotal(period = 'week') {
    const now = new Date()
    const toLocalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    let from
    if (period === 'week') {
      const temp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      from = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate(), 0, 0, 0, 0)
    } else if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    } else if (period === 'year') {
      from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
    } else {
      from = new Date(1970, 0, 1, 0, 0, 0, 0)
    }

    const pedidos = await this._fetchPedidosBetween(
      from.toISOString(),
      toLocalEnd.toISOString()
    )

    const total = pedidos
      .filter(p => p.pago === 'pagado')
      .reduce((s, p) => s + Number(p.total || 0), 0)

    return { total }
  }

  async ingresosSeries(days = 7) {
    const now = new Date()
    const toLocalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const fromTemp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (Number(days) - 1))
    const fromLocalStart = new Date(fromTemp.getFullYear(), fromTemp.getMonth(), fromTemp.getDate(), 0, 0, 0, 0)

    const pedidos = await this._fetchPedidosBetween(
      fromLocalStart.toISOString(),
      toLocalEnd.toISOString()
    )

    const map = new Map()

    for (let i = 0; i < days; i++) {
      const d = new Date(fromLocalStart.getFullYear(), fromLocalStart.getMonth(), fromLocalStart.getDate() + i)
      map.set(formatDate(d), 0)
    }

    for (const p of pedidos) {
      if (p.pago !== 'pagado') continue
      const d = new Date(p.fecha_pedido)
      const local = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const key = formatDate(local)
      map.set(key, (map.get(key) || 0) + Number(p.total || 0))
    }

    const data = [...map.entries()].map(([date, amount]) => ({ date, amount }))
    return { data }
  }

  async pedidosCountByDay(days = 7) {
    const now = new Date()
    const toLocalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const fromTemp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (Number(days) - 1))
    const fromLocalStart = new Date(fromTemp.getFullYear(), fromTemp.getMonth(), fromTemp.getDate(), 0, 0, 0, 0)

    const pedidos = await this._fetchPedidosBetween(
      fromLocalStart.toISOString(),
      toLocalEnd.toISOString()
    )

    const map = new Map()

    for (let i = 0; i < days; i++) {
      const d = new Date(fromLocalStart.getFullYear(), fromLocalStart.getMonth(), fromLocalStart.getDate() + i)
      map.set(formatDate(d), 0)
    }

    for (const p of pedidos) {
      const d = new Date(p.fecha_pedido)
      const local = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const key = formatDate(local)
      map.set(key, (map.get(key) || 0) + 1)
    }

    const data = [...map.entries()].map(([date, count]) => ({ date, count }))
    return { data }
  }

  async ordersByStatus(days = 7) {
    const now = new Date()
    const toLocalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const fromTemp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (Number(days) - 1))
    const fromLocalStart = new Date(fromTemp.getFullYear(), fromTemp.getMonth(), fromTemp.getDate(), 0, 0, 0, 0)

    const pedidos = await this._fetchPedidosBetween(
      fromLocalStart.toISOString(),
      toLocalEnd.toISOString()
    )

    const map = new Map()

    for (const p of pedidos || []) {
      const estado = String(p.estado || 'unknown').toLowerCase()
      map.set(estado, (map.get(estado) || 0) + 1)
    }

    const data = [...map.entries()].map(([status, count]) => ({ status, count }))
    return { data }
  }

  async reviewsCountByDay(days = 7) {
    const now = new Date()
    const toLocalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const fromTemp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (Number(days) - 1))
    const fromLocalStart = new Date(fromTemp.getFullYear(), fromTemp.getMonth(), fromTemp.getDate(), 0, 0, 0, 0)

    const { data, error } = await supabase
      .from('calificaciones_producto')
      .select('id_calificacion, fecha_creacion')
      .gte('fecha_creacion', fromLocalStart.toISOString())
      .lte('fecha_creacion', toLocalEnd.toISOString())

    if (error) throw new Error(error.message)

    const map = new Map()

    for (let i = 0; i < days; i++) {
      const d = new Date(fromLocalStart.getFullYear(), fromLocalStart.getMonth(), fromLocalStart.getDate() + i)
      map.set(formatDate(d), 0)
    }

    for (const r of data || []) {
      const d = new Date(r.fecha_creacion)
      const local = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const key = formatDate(local)
      map.set(key, (map.get(key) || 0) + 1)
    }

    const out = [...map.entries()].map(([date, count]) => ({ date, count }))
    return { data: out }
  }

  async newClients(days = 30) {
    const now = new Date()
    const toLocalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const fromTemp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (Number(days) - 1))
    const fromLocalStart = new Date(fromTemp.getFullYear(), fromTemp.getMonth(), fromTemp.getDate(), 0, 0, 0, 0)

    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, correo, fecha_registro')
      .gte('fecha_registro', fromLocalStart.toISOString())
      .lte('fecha_registro', toLocalEnd.toISOString())
      .order('fecha_registro', { ascending: false })

    if (error) throw new Error(error.message)

    return { count: (data || []).length, data }
  }

  async topProducts(limit = 10) {
    const { data: pedidos } = await supabase.from('pedidos').select('items')

    const map = new Map()

    for (const p of pedidos || []) {
      if (!Array.isArray(p.items)) continue
      for (const it of p.items) {
        const id = String(it.id_producto)
        const qty = Number(it.cantidad || 1)
        map.set(id, (map.get(id) || 0) + qty)
      }
    }

    const arr = [...map.entries()].map(([id, ventas]) => ({ id, ventas }))
    arr.sort((a, b) => b.ventas - a.ventas)
    const top = arr.slice(0, Number(limit))

    const ids = top.map(t => Number(t.id)).filter(n => !Number.isNaN(n))
    const prods = ids.length ? await productoRepository.findByIds(ids) : []
    const nameMap = new Map(prods.map(p => [String(p.id_producto), p.nombre || null]))

    return top.map(t => ({
      id: t.id,
      nombre: nameMap.get(t.id) || null,
      ventas: t.ventas
    }))
  }

  async topCategories(limit = 10) {
    const { data: pedidos } = await supabase.from('pedidos').select('items')

    const prodIds = new Set()
    for (const p of pedidos || []) {
      if (!Array.isArray(p.items)) continue
      for (const it of p.items) prodIds.add(Number(it.id_producto))
    }

    let prodList = []
    if (prodIds.size) {
      const { data, error } = await supabase
        .from('productos')
        .select('id_producto, nombre, id_categoria')
        .in('id_producto', [...prodIds])
      if (error) throw new Error(error.message)
      prodList = data || []
    }

    const prodMap = new Map(prodList.map(p => [String(p.id_producto), p]))

    const catMap = new Map()

    for (const p of pedidos || []) {
      if (!Array.isArray(p.items)) continue

      for (const it of p.items) {
        const prod = prodMap.get(String(it.id_producto))
        const cat = prod ? String(prod.id_categoria || 'unknown') : 'unknown'
        const qty = Number(it.cantidad || 1)
        catMap.set(cat, (catMap.get(cat) || 0) + qty)
      }
    }

    const arr = [...catMap.entries()].map(([id, ventas]) => ({ id, ventas }))
    arr.sort((a, b) => b.ventas - a.ventas)

    const top = arr.slice(0, Number(limit))

    const catIds = top.map(t => t.id).filter(id => id !== 'unknown')

    let cats = []
    if (catIds.length) {
      const { data, error } = await supabase
        .from('categorias')
        .select('id_categoria, nombre')
        .in('id_categoria', catIds)
      if (error) throw new Error(error.message)
      cats = data || []
    }

    const catNameMap = new Map(cats.map(c => [String(c.id_categoria), c.nombre]))

    return top.map(t => ({
      id: t.id,
      nombre: catNameMap.get(t.id) || t.id,
      ventas: t.ventas
    }))
  }

  async ventasPorMes(year, month) {
    const y = Number(year)
    const m = Number(month)
    if (Number.isNaN(y) || Number.isNaN(m)) return { data: [] }

    const from = new Date(y, m - 1, 1, 0, 0, 0, 0)
    const to = new Date(y, m, 0, 23, 59, 59, 999)

    const pedidos = await this._fetchPedidosBetween(from.toISOString(), to.toISOString())

    const map = new Map()

    for (let d = 1; d <= to.getDate(); d++) {
      const day = String(d).padStart(2, '0')
      map.set(day, 0)
    }

    for (const p of pedidos) {
      if (p.pago !== 'pagado') continue

      const raw = new Date(p.fecha_pedido)
      const local = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate())

      if (local.getMonth() + 1 !== m || local.getFullYear() !== y) continue

      const key = String(local.getDate()).padStart(2, '0')
      map.set(key, (map.get(key) || 0) + Number(p.total || 0))
    }

    const data = [...map.entries()].map(([day, amount]) => ({
      date: `${y}-${String(m).padStart(2,'0')}-${day}`,
      amount
    }))

    return { data }
  }
}

export default new ReportesService()
