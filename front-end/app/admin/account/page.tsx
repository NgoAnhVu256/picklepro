'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Eye, EyeOff, Mail, Phone, Shield, Key, User, Camera, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AdminAccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Profile form
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // Load profile
      const res = await fetch('/api/account/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setAvatarUrl(data.avatar_url || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone, avatar_url: avatarUrl })
      })
      if (res.ok) showMessage('success', 'Cập nhật thông tin thành công!')
      else showMessage('error', 'Không thể cập nhật thông tin')
    } catch { showMessage('error', 'Có lỗi xảy ra') }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Mật khẩu xác nhận không khớp')
      return
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setChangingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) showMessage('error', error.message)
      else {
        showMessage('success', 'Đổi mật khẩu thành công!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch { showMessage('error', 'Có lỗi xảy ra') }
    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-800/50 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Tài khoản Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {/* Toast Message */}
      {message.text && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-lime/10 text-lime border border-lime/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <User className="h-5 w-5 text-lime" />
          <h2 className="text-white font-bold">Thông tin cá nhân</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.email?.charAt(0)?.toUpperCase() ?? 'A'
              )}
            </div>
            <div>
              <p className="text-white font-medium">{user?.email}</p>
              <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1"><Shield className="h-3 w-3" /> Quyền Admin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Họ và tên</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Số điện thoại</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1.5 block">Email (không thể thay đổi)</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-500 text-sm">
              <Mail className="h-4 w-4" /> {user?.email}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-white transition-all text-sm disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <Key className="h-5 w-5 text-orange-400" />
          <h2 className="text-white font-bold">Đổi mật khẩu</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1.5 block">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
              <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1.5 block">Xác nhận mật khẩu mới</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className={`w-full px-3 py-2.5 rounded-xl bg-gray-800 border text-white focus:outline-none text-sm ${
                confirmPassword && confirmPassword !== newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-lime'
              }`} />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
            )}
          </div>
          <div className="flex justify-end">
            <button onClick={handleChangePassword}
              disabled={changingPassword || !newPassword || newPassword !== confirmPassword}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all text-sm disabled:opacity-50">
              <Key className="h-4 w-4" /> {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Thông tin tài khoản</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">ID</span><span className="text-gray-300 font-mono text-xs">{user?.id?.slice(0, 16)}...</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Vai trò</span><span className="text-lime font-medium">Admin</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Đăng nhập lần cuối</span><span className="text-gray-300">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('vi-VN') : '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Tạo tài khoản</span><span className="text-gray-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}</span></div>
        </div>
      </div>
    </div>
  )
}
