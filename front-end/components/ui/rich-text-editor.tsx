'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef, useEffect, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Dynamically import self-hosted tinymce core from node_modules
    import('tinymce/tinymce').then(() => {
      return Promise.all([
        import('tinymce/icons/default'),
        import('tinymce/themes/silver'),
        import('tinymce/models/dom'),
        // Plugins
        import('tinymce/plugins/advlist'),
        import('tinymce/plugins/autolink'),
        import('tinymce/plugins/lists'),
        import('tinymce/plugins/link'),
        import('tinymce/plugins/image'),
        import('tinymce/plugins/charmap'),
        import('tinymce/plugins/preview'),
        import('tinymce/plugins/anchor'),
        import('tinymce/plugins/searchreplace'),
        import('tinymce/plugins/visualblocks'),
        import('tinymce/plugins/code'),
        import('tinymce/plugins/fullscreen'),
        import('tinymce/plugins/insertdatetime'),
        import('tinymce/plugins/media'),
        import('tinymce/plugins/table'),
        import('tinymce/plugins/help'),
        import('tinymce/plugins/wordcount'),
      ])
    }).then(() => {
      setReady(true)
    }).catch((err) => {
      console.error('TinyMCE load error:', err)
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-lime-dark border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang tải trình soạn thảo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border [&_.tox-tinymce]:border-0 [&_.tox-notifications-container]:hidden [&_.tox-promotion]:hidden">
      <Editor
        onInit={(_evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(content) => onChange(content)}
        licenseKey="gpl"
        init={{
          height: 500,
          menubar: true,
          skin_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/7/skins/ui/oxide',
          content_css: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/7/skins/content/default/content.min.css',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media table | removeformat | fullscreen code preview help',
          content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; line-height:1.6; color:#334155; padding: 16px; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            h1,h2,h3,h4 { color: #0f172a; }
            a { color: #65a30d; }
            table { border-collapse: collapse; width: 100%; }
            table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
          `,
          branding: false,
          promotion: false,
        }}
      />
    </div>
  )
}
