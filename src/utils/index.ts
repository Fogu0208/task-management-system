/**
 * 格式化时间戳
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的日期字符串 (YYYY-MM-DD HH:mm)
 */
export const formatTime = (timestamp?: number): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}
