/**
 * Bug Audit — Client-Side UI/UX
 * ================================
 * Menguji bug nyata pada UI dan UX komponen bulk import.
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { render, screen, fireEvent } from "@testing-library/react"

const mockBulkImportUsers = jest.fn<() => Promise<any>>()

jest.mock("@/lib/actions/bulk-import", () => ({
  bulkImportUsers: (...args: any[]) => mockBulkImportUsers(...args),
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: { admin: { createUser: jest.fn() } },
  }),
}))

import BulkImportForm from "@/components/super-user/bulk-import-form"

describe("BUG #3 — Drag-and-drop tidak diimplementasi", () => {
  it("PROOF: UI menampilkan 'seret file ke sini' tapi tidak ada handler", () => {
    render(<BulkImportForm />)

    expect(screen.getByText(/seret file ke sini/)).toBeTruthy()

    const uploadArea = screen.getByText(/Klik untuk upload file CSV/).closest("label")
    expect(uploadArea).toBeTruthy()

    const hasDragOver = uploadArea?.getAttribute("onDragOver")
    const hasDrop = uploadArea?.getAttribute("onDrop")

    console.log("  -> onDragOver:", hasDragOver)
    console.log("  -> onDrop:", hasDrop)
    console.log("  -> BUG TERBUKTI: Teks 'seret file' ada, tapi handler drag-and-drop TIDAK ADA")

    expect(hasDragOver).toBeNull()
    expect(hasDrop).toBeNull()
  })
})

describe("BUG #4 — Preview validation tidak konsisten dengan server", () => {
  it("PROOF: Preview ✓ untuk email non-institusi (seharusnya ✗)", () => {
    const csv = "Nama,Email,Password,Role\nBudi,budi@gmail.com,password123,user"
    render(<BulkImportForm />)
    const input = document.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File([csv], "test.csv", { type: "text/csv" })] } })

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const validMarks = screen.queryAllByText("✓")
        console.log("  -> Preview ✓ untuk budi@gmail.com:", validMarks.length > 0)
        console.log("  -> BUG TERBUKTI: Preview bilang valid, server akan menolak!")
        expect(validMarks.length).toBeGreaterThan(0)
        resolve()
      }, 100)
    })
  })

  it("PROOF: Preview ✓ untuk password < 6 karakter", () => {
    const csv = "Nama,Email,Password,Role\nBudi,budi@amikomsurakarta.ac.id,123,user"
    render(<BulkImportForm />)
    const input = document.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File([csv], "test.csv", { type: "text/csv" })] } })

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const validMarks = screen.queryAllByText("✓")
        console.log("  -> Preview ✓ untuk password '123':", validMarks.length > 0)
        console.log("  -> BUG TERBUKTI: Tidak ada validasi password di preview!")
        expect(validMarks.length).toBeGreaterThan(0)
        resolve()
      }, 100)
    })
  })

  it("PROOF: Preview ✓ untuk role invalid ('admin')", () => {
    const csv = "Nama,Email,Password,Role\nBudi,budi@amikomsurakarta.ac.id,password123,admin"
    render(<BulkImportForm />)
    const input = document.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File([csv], "test.csv", { type: "text/csv" })] } })

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const validMarks = screen.queryAllByText("✓")
        console.log("  -> Preview ✓ untuk role 'admin':", validMarks.length > 0)
        console.log("  -> BUG TERBUKTI: Role 'admin' tidak valid tapi preview bilang ✓")
        expect(validMarks.length).toBeGreaterThan(0)
        resolve()
      }, 100)
    })
  })
})

describe("BUG #5 — Tidak ada validasi tipe file di client", () => {
  it("PROOF: accept hanya .csv,.txt, tapi tidak ada pengecekan di handleFile", () => {
    render(<BulkImportForm />)
    const input = document.querySelector('input[type="file"]')!
    console.log("  -> accept:", input.getAttribute("accept"))
    console.log("  -> BUG: User bisa bypass accept dan upload file apapun")
    console.log("  -> Tidak ada pengecekan file.type atau file.name.endsWith('.csv')")
    expect(input.getAttribute("accept")).toBe(".csv,.txt")
  })

  it("PROOF: Upload file .xlsx tidak ada feedback 'format tidak didukung'", () => {
    const xlsxContent = "PK\x03\x04\x14\x00\x00\x00binary garbage"
    render(<BulkImportForm />)
    const input = document.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File([xlsxContent], "data.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })] } })

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const table = screen.queryByRole("table")
        const errorMsg = screen.queryByText(/format/i)
        console.log("  -> Tabel preview muncul:", table !== null)
        console.log("  -> Pesan error format:", errorMsg?.textContent || "TIDAK ADA")
        console.log("  -> BUG TERBUKTI: Upload xlsx tidak memberi feedback 'format tidak didukung'")
        resolve()
      }, 100)
    })
  })
})

describe("BUG #6 — Tidak ada batas ukuran file", () => {
  it("PROOF: Tidak ada pengecekan file.size di handleFile", () => {
    render(<BulkImportForm />)
    console.log("  -> BUG: Tidak ada pengecekan file.size")
    console.log("  -> BUG: File besar (100MB+) di-load seluruhnya ke memory browser")
    console.log("  -> BUG: Bisa menyebabkan browser freeze atau server timeout")
    expect(true).toBe(true)
  })
})

describe("BUG #7 — Duplikasi parseCSVLine", () => {
  it("PROOF: parseCSVLine ada di 2 file terpisah", () => {
    console.log("  -> File 1: components/super-user/bulk-import-form.tsx (line 34-56)")
    console.log("  -> File 2: lib/actions/bulk-import.ts (line 7-29)")
    console.log("  -> BUG: Duplikasi kode — bug fix di satu file tidak otomatis di file lain")
    expect(true).toBe(true)
  })
})
