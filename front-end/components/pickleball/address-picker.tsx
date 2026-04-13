'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Loader2 } from 'lucide-react'

const API_BASE = 'https://provinces.open-api.vn/api'

interface AddressData {
  province: string
  district: string
  ward: string
  detail: string
  fullAddress: string
}

interface Props {
  onChange: (address: AddressData) => void
  initialAddress?: string
}

export function AddressPicker({ onChange, initialAddress }: Props) {
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedWard, setSelectedWard] = useState('')
  const [detail, setDetail] = useState(initialAddress || '')

  const [provinceName, setProvinceName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [wardName, setWardName] = useState('')

  const [loadingP, setLoadingP] = useState(true)
  const [loadingD, setLoadingD] = useState(false)
  const [loadingW, setLoadingW] = useState(false)

  // Load provinces
  useEffect(() => {
    setLoadingP(true)
    fetch(`${API_BASE}/p/`)
      .then(r => r.json())
      .then(data => { setProvinces(data); setLoadingP(false) })
      .catch(() => setLoadingP(false))
  }, [])

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); return }
    setLoadingD(true)
    setSelectedDistrict('')
    setSelectedWard('')
    setDistricts([])
    setWards([])
    fetch(`${API_BASE}/p/${selectedProvince}?depth=2`)
      .then(r => r.json())
      .then(data => {
        setDistricts(data.districts || [])
        setProvinceName(data.name || '')
        setLoadingD(false)
      })
      .catch(() => setLoadingD(false))
  }, [selectedProvince])

  // Load wards when district changes
  useEffect(() => {
    if (!selectedDistrict) { setWards([]); return }
    setLoadingW(true)
    setSelectedWard('')
    setWards([])
    fetch(`${API_BASE}/d/${selectedDistrict}?depth=2`)
      .then(r => r.json())
      .then(data => {
        setWards(data.wards || [])
        setDistrictName(data.name || '')
        setLoadingW(false)
      })
      .catch(() => setLoadingW(false))
  }, [selectedDistrict])

  // Update parent whenever address changes
  useEffect(() => {
    if (selectedWard) {
      const ward = wards.find(w => String(w.code) === selectedWard)
      if (ward) setWardName(ward.name)
    }
  }, [selectedWard, wards])

  useEffect(() => {
    const parts = [detail, wardName, districtName, provinceName].filter(Boolean)
    const fullAddress = parts.join(', ')
    onChange({
      province: provinceName,
      district: districtName,
      ward: wardName,
      detail,
      fullAddress,
    })
  }, [provinceName, districtName, wardName, detail])

  const selectClass = "w-full px-3 py-3 rounded-xl border border-lime-dark/20 bg-white text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-lime-dark/30 focus:border-lime-dark/50 text-sm transition-all"

  return (
    <div className="space-y-3">
      {/* Province / District Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tỉnh/Thành phố */}
        <div className="relative">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tỉnh / Thành phố *</label>
          <div className="relative">
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className={selectClass}
              disabled={loadingP}
            >
              <option value="">-- Chọn Tỉnh/Thành phố --</option>
              {provinces.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            {loadingP && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-lime-dark animate-spin" />}
          </div>
        </div>

        {/* Quận/Huyện */}
        <div className="relative">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Quận / Huyện *</label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className={selectClass}
              disabled={!selectedProvince || loadingD}
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            {loadingD && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-lime-dark animate-spin" />}
          </div>
        </div>
      </div>

      {/* Ward */}
      <div className="relative">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Phường / Xã *</label>
        <div className="relative">
          <select
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
            className={selectClass}
            disabled={!selectedDistrict || loadingW}
          >
            <option value="">-- Chọn Phường/Xã --</option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {loadingW && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-lime-dark animate-spin" />}
        </div>
      </div>

      {/* Detail Address */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Số nhà, đường, xóm</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-lime-dark/20 bg-white text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-lime-dark/30 focus:border-lime-dark/50 text-sm transition-all"
          />
        </div>
      </div>

      {/* Full Address Preview */}
      {(provinceName || detail) && (
        <div className="p-3 rounded-xl bg-lime-dark/5 border border-lime-dark/10">
          <p className="text-xs text-muted-foreground mb-0.5">📍 Địa chỉ hoàn chỉnh:</p>
          <p className="text-sm font-medium text-foreground">
            {[detail, wardName, districtName, provinceName].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
