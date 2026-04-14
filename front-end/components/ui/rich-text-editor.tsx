'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<any>(null)

  return (
    <div className="bg-white rounded-xl overflow-hidden [&_.tox-tinymce]:border-0 border border-border">
      <Editor
        apiKey="o1q1v6d1y9q5i6j6m4u5d8m8x9y7w5v7z2c4w6z7x1n5n3v2"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media table | removeformat | fullscreen code preview help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px }'
        }}
      />
    </div>
  )
}
