'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function NewBlogPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category_name: 'Tin tức',
    thumbnail: '',
    content: '',
    author: 'Admin',
    is_published: true
  })

  const CATEGORIES = ['Tin tức', 'Kỹ thuật', 'Review sản phẩm', 'Hướng dẫn', 'Art & Design', 'Photograph - Nhiếp ảnh']

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'blogs')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, thumbnail: data.url }))
        toast.success('Tải ảnh thành công!')
      } else {
        toast.error(data.error || 'Upload thất bại')
      }
    } catch { 
      toast.error('Lỗi kết nối khi upload') 
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Vui lòng nhập Tiêu đề và Nội dung bài viết')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Lỗi lưu bài')
      }
      toast.success('Thêm bài viết thành công')
      router.push('/admin/blogs')
    } catch(e: any) {
      toast.error(e.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Viết bài mới</h1>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tiêu đề bài viết *</label>
            <input 
              value={form.title} 
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="Nhập tiêu đề..."
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-lime outline-none" 
            />
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Đường dẫn tĩnh (Slug)</label>
            <input 
              value={form.slug} 
              onChange={e => setForm(f => ({...f, slug: e.target.value}))}
              placeholder="de-trong-de-tu-tao"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-lime outline-none" 
            />
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Danh mục</label>
            <select 
              value={form.category_name} 
              onChange={e => setForm(f => ({...f, category_name: e.target.value}))}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-lime outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tác giả</label>
            <input 
              value={form.author} 
              onChange={e => setForm(f => ({...f, author: e.target.value}))}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-lime outline-none" 
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.is_published} 
                onChange={e => setForm(f => ({...f, is_published: e.target.checked}))}
                className="accent-lime w-5 h-5" 
              />
              <span className="text-sm font-medium">Xuất bản ngay</span>
            </label>
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Ảnh đại diện bài viết</label>
            <div className="flex items-center gap-6">
              {form.thumbnail ? (
                <div className="relative w-32 h-32 rounded-xl border border-border overflow-hidden">
                  <Image src={form.thumbnail} alt="" fill className="object-cover" />
                  <button onClick={() => setForm(f => ({...f, thumbnail: ''}))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs px-2">Xoá</button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground pb-2">
                  <ImageIcon className="h-8 w-8 mb-1 opacity-50" />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}
              
              <label className="flex items-center gap-2 px-4 py-2 border border-lime text-lime-dark hover:bg-lime/10 rounded-xl cursor-pointer transition-colors block w-fit">
                <Upload className="h-4 w-4" />
                {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 border-t border-border pt-4 mt-2">
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Nội dung bài viết * (Hỗ trợ HTML cơ bản)</label>
            <textarea 
              value={form.content} 
              onChange={e => setForm(f => ({...f, content: e.target.value}))}
              rows={15}
              placeholder="<p>Bài viết của bạn...</p>"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-lime outline-none font-mono text-sm leading-relaxed" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-lime hover:bg-lime-dark hover:text-white transition-colors text-lime-dark font-bold px-8 py-3 rounded-xl shadow-lg shadow-lime/20"
          >
            {saving ? 'Đang lưu...' : 'Lưu bài viết'}
          </button>
        </div>
      </div>
    </div>
  )
}
