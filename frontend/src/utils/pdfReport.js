const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const LINE_HEIGHT = 15
const SECTION_GAP = 14

function sanitizeText(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .normalize('NFKD')
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value) {
  return sanitizeText(value)
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeText).filter(Boolean).join(', ')
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => `${titleCase(key)}: ${formatValue(val)}`)
      .filter(Boolean)
      .join('; ')
  }
  return sanitizeText(value)
}

function addLine(lines, text = '', options = {}) {
  lines.push({ text: sanitizeText(text), ...options })
}

function addSection(lines, title) {
  addLine(lines, '')
  addLine(lines, title, { size: 16, bold: true, gapBefore: SECTION_GAP })
}

function addBullets(lines, items, indent = 12) {
  ;(items || []).map(formatValue).filter(Boolean).forEach(item => {
    addLine(lines, `- ${item}`, { indent })
  })
}

function addKeyValues(lines, data, indent = 0) {
  Object.entries(data || {}).forEach(([key, value]) => {
    const formatted = formatValue(value)
    if (formatted) addLine(lines, `${titleCase(key)}: ${formatted}`, { indent })
  })
}

function buildReportLines(plan) {
  const lines = []
  const overview = plan.overview || {}

  addLine(lines, 'WanderMind Travel Plan', { size: 22, bold: true })
  addLine(lines, overview.destination || 'Generated Trip Report', { size: 18, bold: true })
  if (overview.tagline) addLine(lines, overview.tagline, { italic: true })
  addLine(lines, `Generated: ${new Date().toLocaleDateString()}`)

  if (overview.quickStats) {
    addSection(lines, 'Trip Overview')
    addKeyValues(lines, overview.quickStats)
  }

  if (overview.highlights?.length) {
    addSection(lines, 'Trip Highlights')
    addBullets(lines, overview.highlights)
  }

  if (overview.weatherSummary) {
    addSection(lines, 'Weather Overview')
    addLine(lines, overview.weatherSummary)
  }

  if (overview.packingSuggestions?.length) {
    addSection(lines, 'Packing Essentials')
    addBullets(lines, overview.packingSuggestions)
  }

  if (plan.destinations?.length) {
    addSection(lines, 'Best Places To Visit')
    plan.destinations.forEach((place, index) => {
      addLine(lines, `${index + 1}. ${formatValue(place.placeName)}`, { bold: true })
      if (place.description) addLine(lines, place.description, { indent: 12 })
      addKeyValues(lines, {
        category: place.category,
        visitDuration: place.visitDuration,
        estimatedCost: place.estimatedCost,
        activities: place.activities,
      }, 12)
    })
  }

  if (plan.itinerary?.days?.length) {
    addSection(lines, 'Day-Wise Itinerary')
    plan.itinerary.days.forEach((day, index) => {
      addLine(lines, `Day ${day.day || index + 1}: ${formatValue(day.theme || '')}`, { bold: true })
      if (day.date) addLine(lines, `Date: ${day.date}`, { indent: 12 })
      if (day.weather_note) addLine(lines, `Weather: ${day.weather_note}`, { indent: 12 })
      ;['morning', 'afternoon', 'evening'].forEach(period => {
        const activity = day[period]
        if (!activity) return
        addLine(lines, `${titleCase(period)}: ${formatValue(activity.activity)}`, { indent: 12, bold: true })
        addKeyValues(lines, {
          place: activity.place,
          duration: activity.duration,
          tip: activity.tip,
        }, 24)
      })
      if (day.meals) addLine(lines, `Meals: ${formatValue(day.meals)}`, { indent: 12 })
      if (day.day_tip) addLine(lines, `Insider Tip: ${day.day_tip}`, { indent: 12 })
    })
  }

  const transport = plan.transport_hotels || {}
  if (Object.keys(transport).length) {
    addSection(lines, 'Transport And Hotels')
    ;(transport.flights || []).forEach((flight, index) => {
      addLine(lines, `Flight ${index + 1}: ${formatValue(flight.airline)}`, { bold: true })
      addKeyValues(lines, flight, 12)
    })
    ;(transport.trains || []).forEach((train, index) => {
      addLine(lines, `Train ${index + 1}: ${formatValue(train.trainName)}`, { bold: true })
      addKeyValues(lines, train, 12)
    })
    ;(transport.buses || []).forEach((bus, index) => {
      addLine(lines, `Bus ${index + 1}: ${formatValue(bus.operator)}`, { bold: true })
      addKeyValues(lines, bus, 12)
    })
    ;(transport.hotels || []).forEach((hotel, index) => {
      addLine(lines, `Hotel ${index + 1}: ${formatValue(hotel.hotelName)}`, { bold: true })
      addKeyValues(lines, hotel, 12)
    })
    if (transport.localTransport) {
      addLine(lines, 'Local Transport', { bold: true })
      addKeyValues(lines, transport.localTransport, 12)
    }
  }

  if (plan.budget) {
    addSection(lines, 'Budget')
    if (plan.budget.grandTotal) addKeyValues(lines, plan.budget.grandTotal)
    if (plan.budget.breakdown) {
      addLine(lines, 'Cost Breakdown', { bold: true })
      addKeyValues(lines, plan.budget.breakdown, 12)
    }
    if (plan.budget.savingTips?.length) {
      addLine(lines, 'Money-Saving Tips', { bold: true })
      addBullets(lines, plan.budget.savingTips, 12)
    }
  }

  if (plan.weather?.forecast?.length) {
    addSection(lines, 'Weather Forecast')
    plan.weather.forecast.forEach(day => {
      addLine(lines, `${formatValue(day.date)}: ${formatValue(day.condition)} | Low ${formatValue(day.temp_min)} | High ${formatValue(day.temp_max)}`)
    })
  }

  if (plan.precautions) {
    addSection(lines, 'Precautions')
    addKeyValues(lines, plan.precautions)
  }

  return lines
}

function wrapText(text, maxChars) {
  if (!text) return ['']
  const words = text.split(' ')
  const lines = []
  let current = ''

  words.forEach(word => {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  })

  if (current) lines.push(current)
  return lines
}

function escapePdfText(text) {
  return sanitizeText(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function paginate(lines) {
  const pages = [[]]
  let y = PAGE_HEIGHT - MARGIN

  lines.forEach(line => {
    const size = line.size || 11
    const maxChars = Math.max(32, Math.floor((PAGE_WIDTH - MARGIN * 2 - (line.indent || 0)) / (size * 0.52)))
    const wrapped = wrapText(line.text, maxChars)
    const needed = (line.gapBefore || 0) + wrapped.length * (line.lineHeight || LINE_HEIGHT)

    if (y - needed < MARGIN) {
      pages.push([])
      y = PAGE_HEIGHT - MARGIN
    }

    if (line.gapBefore) y -= line.gapBefore
    wrapped.forEach((text, index) => {
      pages[pages.length - 1].push({ ...line, text, continued: index > 0 })
      y -= line.lineHeight || LINE_HEIGHT
    })
  })

  return pages
}

function buildPdf(pages) {
  const objects = []
  const addObject = content => {
    objects.push(content)
    return objects.length
  }

  const fontRegular = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const fontBold = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  const fontItalic = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>')
  const pageRefs = []

  pages.forEach((page, pageIndex) => {
    let y = PAGE_HEIGHT - MARGIN
    const streamLines = ['BT']

    page.forEach(line => {
      const size = line.size || 11
      const font = line.bold ? 'F2' : line.italic ? 'F3' : 'F1'
      const x = MARGIN + (line.continued ? (line.indent || 0) + 10 : (line.indent || 0))
      if (line.gapBefore && !line.continued) y -= line.gapBefore
      streamLines.push(`/${font} ${size} Tf`)
      streamLines.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(line.text)}) Tj`)
      y -= line.lineHeight || LINE_HEIGHT
    })

    streamLines.push('/F1 9 Tf')
    streamLines.push(`1 0 0 1 ${MARGIN.toFixed(2)} 28 Tm (Page ${pageIndex + 1} of ${pages.length}) Tj`)
    streamLines.push('ET')

    const stream = streamLines.join('\n')
    const contentRef = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    const pageRef = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R /F3 ${fontItalic} 0 R >> >> /Contents ${contentRef} 0 R >>`)
    pageRefs.push(pageRef)
  })

  const pagesRef = addObject(`<< /Type /Pages /Kids [${pageRefs.map(ref => `${ref} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`)
  const catalogRef = addObject(`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`)

  pageRefs.forEach(ref => {
    objects[ref - 1] = objects[ref - 1].replace('/Parent 0 0 R', `/Parent ${pagesRef} 0 R`)
  })

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return pdf
}

function buildFileName(plan) {
  const destination = sanitizeText(plan.overview?.destination || 'travel-plan')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${destination || 'travel-plan'}-report.pdf`
}

export function downloadPlanPdf(plan) {
  const pages = paginate(buildReportLines(plan))
  const pdf = buildPdf(pages)
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = buildFileName(plan)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
