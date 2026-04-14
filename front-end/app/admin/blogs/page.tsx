'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async (q = '') => {
    try {
      const res = await fetch(`/api/admin/blogs?search=${encodeURIComponent(q)}&limit=100`)
      const data = await res.json()
      setBlogs(data.blogs || [])
    } catch (e) {
      toast.error('Lỗi khi tải danh sách bài viết')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc xoá bài viết này không?')) return
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
      toast.success('Đã xoá bài viết')
      setBlogs(b => b.filter(x => x.id !== id))
    } catch (e) {
      toast.error('Lỗi khi xoá bài viết')
    }
  }

  const togglePublish = async (blog: any) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !blog.is_published })
      })
      if (res.ok) {
        toast.success('Đã cập nhật trạng thái')
        setBlogs(b => b.map(x => x.id === blog.id ? { ...x, is_published: !x.is_published } : x))
      }
    } catch (e) {
      toast.error('Lỗi cập nhật')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Quản lý Bài Viết</h1>
        <Link href="/admin/blogs/new" className="bg-lime-dark hover:bg-lime-dark/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> Viết bài mới
        </Link>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              fetchBlogs(e.target.value)
            }}
          />
        </div>

        {loading ? (
          <div className="py-20 text-center">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="font-medium p-4">Ảnh</th>
                  <th className="font-medium p-4">Tiêu đề & Slug</th>
                  <th className="font-medium p-4">Danh mục</th>
                  <th className="font-medium p-4 text-center">Hiển thị</th>
                  <th className="font-medium p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {blogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      {blog.thumbnail?.startsWith('http') ? (
                        <Image src={blog.thumbnail} alt="" width={48} height={48} className="rounded-lg object-cover w-12 h-12" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-lime/10 flex items-center justify-center text-xl">{blog.thumbnail || '📰'}</div>
                      )}
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="font-semibold truncate">{blog.title}</p>
                      <p className="text-xs text-muted-foreground truncate">/{blog.slug}</p>
                    </td>
                    <td className="p-4">{blog.category_name}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePublish(blog)} className="text-muted-foreground hover:text-lime-dark">
                        {blog.is_published ? <Eye className="h-5 w-5 mx-auto text-green-600" /> : <EyeOff className="h-5 w-5 mx-auto text-gray-400" />}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/blogs/edit/${blog.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 mr-2">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(blog.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
