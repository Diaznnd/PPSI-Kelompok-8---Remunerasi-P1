export const rupiah = (n: number | undefined | null) => {
  if (n === undefined || n === null || isNaN(n)) return "Rp 0"
  return "Rp " + n.toLocaleString("id-ID")
}
