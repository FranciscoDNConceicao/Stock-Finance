export interface Tile<T> {
  item: T
  x: number
  y: number
  w: number
  h: number
}

/** Squarified treemap (Bruls et al.). Items should be sorted by value, descending. */
export function squarify<T>(items: Array<{ value: number; item: T }>, width: number, height: number): Tile<T>[] {
  const valid = items.filter((d) => d.value > 0)
  const total = valid.reduce((s, d) => s + d.value, 0)
  if (!total || width <= 0 || height <= 0) return []

  const scale = (width * height) / total
  const nodes = valid.map((d) => ({ area: d.value * scale, item: d.item }))
  const out: Tile<T>[] = []
  let x = 0
  let y = 0
  let w = width
  let h = height

  const worst = (row: number[], side: number) => {
    const sum = row.reduce((a, b) => a + b, 0)
    const max = Math.max(...row)
    const min = Math.min(...row)
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min))
  }

  const place = (row: typeof nodes) => {
    const sum = row.reduce((s, n) => s + n.area, 0)
    if (w >= h) {
      const colW = sum / h
      let cy = y
      for (const n of row) {
        const th = n.area / colW
        out.push({ item: n.item, x, y: cy, w: colW, h: th })
        cy += th
      }
      x += colW
      w -= colW
    } else {
      const rowH = sum / w
      let cx = x
      for (const n of row) {
        const tw = n.area / rowH
        out.push({ item: n.item, x: cx, y, w: tw, h: rowH })
        cx += tw
      }
      y += rowH
      h -= rowH
    }
  }

  let row: typeof nodes = []
  for (const node of nodes) {
    const side = Math.min(w, h)
    const areas = row.map((n) => n.area)
    if (row.length === 0 || worst([...areas, node.area], side) <= worst(areas, side)) {
      row.push(node)
    } else {
      place(row)
      row = [node]
    }
  }
  if (row.length) place(row)
  return out
}
