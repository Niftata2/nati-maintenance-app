export function downloadCSV(csvContent: string, fileName: string) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  export function convertArrayToCSV(array: any[]): string {
    if (!array || array.length === 0) return ""
  
    const headers = Object.keys(array[0])
    const headerRow = headers.join(",")
  
    const rows = array.map((obj) =>
      headers
        .map((header) => {
          const value = obj[header]
          // Escape quotes and wrap in quotes to handle commas in text
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(",")
    )
  
    return [headerRow, ...rows].join("\n")
  }