import api from '@/lib/axios'

export async function downloadBackup(): Promise<{ blob: Blob; filename: string }> {
  const response = await api.post('/backups/download', null, {
    responseType: 'blob',
    headers: {
      Accept: 'application/octet-stream',
    },
  })

  const disposition = response.headers['content-disposition'] || ''
  const filename =
    disposition.split('filename=')[1]?.replace(/"/g, '') || 'backup.sql'

  return { blob: response.data, filename }
}
