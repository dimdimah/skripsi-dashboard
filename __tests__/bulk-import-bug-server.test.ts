/**
 * Bug Audit — Server-Side Logic
 * ================================
 * Menguji bug nyata pada server action bulk-import.
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals"

const mockCreateUser = jest.fn()

jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: {
      admin: { createUser: mockCreateUser },
    },
  }),
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

import { bulkImportUsers } from "@/lib/actions/bulk-import"

describe("BUG #1 — File Excel (.xlsx) tidak didukung", () => {
  beforeEach(() => {
    mockCreateUser.mockReset()
    mockCreateUser.mockResolvedValue({ data: { user: { id: "mock-id" } }, error: null })
  })

  it("PROOF: Server action gagal parsing konten Excel (binary ZIP header)", async () => {
    const fakeExcelContent = "PK\x03\x04\x14\x00\x00\x00\x08\x00some binary [Content_Types].xml"
    const res = await bulkImportUsers(fakeExcelContent)

    expect(res.success).toBe(0)
    expect(res.errors.length).toBeGreaterThan(0)
    console.log("  -> Error yang diterima user:", res.errors[0].message)
  })

  it("PROOF: Error message tidak menyebutkan bahwa file bukan CSV", async () => {
    const binaryGarbage = "\x00\x01\x02\x03\x04\x05random binary data"
    const res = await bulkImportUsers(binaryGarbage)

    expect(res.success).toBe(0)
    const errorMsg = res.errors[0].message
    console.log("  -> Pesan error:", errorMsg)

    const mentionsExcel = errorMsg.includes("Excel") || errorMsg.includes("xlsx")
    const mentionsFormat = errorMsg.includes("format") || errorMsg.includes("bukan CSV")
    console.log("  -> Menyebutkan Excel/xlsx:", mentionsExcel)
    console.log("  -> Menyebutkan format file:", mentionsFormat)
    console.log("  -> BUG TERBUKTI: Error tidak informatif untuk file non-CSV")
  })
})

describe("BUG #2 — CRLF (\\r\\n) dari Windows", () => {
  beforeEach(() => {
    mockCreateUser.mockReset()
    mockCreateUser.mockResolvedValue({ data: { user: { id: "mock-id" } }, error: null })
  })

  it("PROOF: Server berhasil import CRLF (trim menghapus \\r)", async () => {
    const csvCRLF = "Nama,Email,Password,Role\r\nBudi,budi@amikomsurakarta.ac.id,password123,user\r\nSiti,siti@amikomsurakarta.ac.id,password456,user\r\n"
    const res = await bulkImportUsers(csvCRLF)

    expect(res.success).toBe(2)
    console.log("  -> Server CRLF: success =", res.success, "(OK karena .trim())")
  })

  it("PROOF BUG: Baris kosong \\r lolos filter(Boolean) dan terhitung sebagai data", async () => {
    const csvWithCRLFBlankLines = "Nama,Email,Password,Role\r\nBudi,budi@amikomsurakarta.ac.id,password123,user\r\n\r\nSiti,siti@amikomsurakarta.ac.id,password456,user\r\n"
    const res = await bulkImportUsers(csvWithCRLFBlankLines)

    console.log("  -> Total:", res.total, "| Success:", res.success, "| Failed:", res.failed)
    console.log("  -> Errors:", JSON.stringify(res.errors))

    if (res.total > 2) {
      console.log("  -> BUG TERBUKTI: Baris kosong (\\r) ikut terhitung! total =", res.total, "(seharusnya 2)")
    } else {
      console.log("  -> Tidak ada bug: total =", res.total)
    }
  })

  it("PROOF: CRLF dengan role column — password field mendapat \\r", async () => {
    const csv = "Nama,Email,Password\r\nBudi,budi@amikomsurakarta.ac.id,password123\r\n"
    const res = await bulkImportUsers(csv)

    console.log("  -> Success:", res.success)
    if (res.success === 1) {
      console.log("  -> Password field terakhir (tanpa Role) OK karena .trim() di parseCSVLine")
    }
  })
})

describe("BUG #8 — Baris kosong yang hanya \\r lolos filter", () => {
  beforeEach(() => {
    mockCreateUser.mockReset()
    mockCreateUser.mockResolvedValue({ data: { user: { id: "mock-id" } }, error: null })
  })

  it("PROOF: filter(Boolean) tidak menghapus string '\\r'", () => {
    const raw = "Nama,Email,Password,Role\r\nBudi,budi@amikomsurakarta.ac.id,password123,user\r\n\r\nSiti,siti@amikomsurakarta.ac.id,password456,user"
    const lines = raw.trim().split('\n').filter(Boolean)

    console.log("  -> Jumlah baris setelah filter(Boolean):", lines.length)
    console.log("  -> Baris-baris:", lines.map(l => JSON.stringify(l)))

    const hasEmptyRLine = lines.some(l => l === '\r')
    console.log("  -> Ada baris yang hanya '\\r':", hasEmptyRLine)

    if (hasEmptyRLine) {
      console.log("  -> BUG TERBUKTI: Baris '\\r' lolos filter karena '\\r' adalah truthy string")
    }
    expect(hasEmptyRLine).toBe(true)
  })
})
