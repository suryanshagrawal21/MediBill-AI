const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function uploadBill(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        throw new Error("Failed to upload bill")
    }

    return response.json()
}

export async function analyzeBill(items: any[]) {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
    })

    if (!response.ok) {
        throw new Error("Failed to analyze bill")
    }

    return response.json()
}

export async function generateReport(analysisResult: any) {
    const response = await fetch(`${API_BASE_URL}/report`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisResult),
    })

    if (!response.ok) {
        throw new Error("Failed to generate report")
    }

    return response.blob()
}

export async function generateLegalLetter(analysisResult: any) {
    const response = await fetch(`${API_BASE_URL}/generate-letter`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisResult),
    })

    if (!response.ok) {
        throw new Error("Failed to generate legal letter")
    }

    return response.json()
}
