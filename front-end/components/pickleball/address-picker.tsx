'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, MapPin, Loader2, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

const API_BASE = 'https://provinces.open-api.vn/api'

interface AddressData {
  province: string
  district: string
  ward: string
  detail: string
  fullAddress: string
  lat?: number
  lng?: number
}

interface Props {
  onChange: (address: AddressData) => void
  initialAddress?: string
}

// Dynamic import MapPicker (no SSR)
const MapPicker = dynamic(() => import('./map-picker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] rounded-xl bg-lime-dark/5 border border-lime-dark/10 flex items-center justify-center">
      <Loader2 className="h-6 w-6 text-lime-dark animate-spin" />
    </div>
  ),
})

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

  const [showMap, setShowMap] = useState(false)
  const [mapPosition, setMapPosition] = useState<[number, number]>([10.7769, 106.7009]) // HCM default
  const [mapAddress, setMapAddress] = useState('')

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

  // Update ward name
  useEffect(() => {
    if (selectedWard) {
      const ward = wards.find(w => String(w.code) === selectedWard)
      if (ward) setWardName(ward.name)
    }
  }, [selectedWard, wards])

  // Update parent when address changes
  useEffect(() => {
    const parts = [detail, wardName, districtName, provinceName].filter(Boolean)
    const fullAddress = parts.join(', ')
    onChange({
      province: provinceName,
      district: districtName,
      ward: wardName,
      detail,
      fullAddress,
      lat: mapPosition[0],
      lng: mapPosition[1],
    })
  }, [provinceName, districtName, wardName, detail, mapPosition])

  // Reverse geocode when map is clicked
  const handleMapClick = async (lat: number, lng: number) => {
    setMapPosition([lat, lng])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`)
      const data = await res.json()
      if (data.display_name) {
        setMapAddress(data.display_name)
        setDetail(data.display_name.split(',').slice(0, 2).join(',').trim())
      }
    } catch {
      // Ignore geocoding errors
    }
  }

  // Use current location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setMapPosition([latitude, longitude])
          handleMapClick(latitude, longitude)
          setShowMap(true)
        },
        () => alert('Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí.'),
        { enableHighAccuracy: true }
      )
    } else {
      alert('Trình duyệt không hỗ trợ định vị')
    }
  }

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

      {/* Map Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-lime-dark/20 text-sm font-medium text-lime-dark hover:bg-lime-dark/5 transition-all"
        >
          <MapPin className="h-4 w-4" />
          {showMap ? 'Ẩn bản đồ' : '📍 Chọn trên bản đồ'}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/20 text-sm font-medium text-blue-600 hover:bg-blue-500/5 transition-all"
        >
          <Navigation className="h-4 w-4" />
          Vị trí của tôi
        </button>
      </div>

      {/* Map Picker */}
      {showMap && (
        <div className="rounded-xl overflow-hidden border border-lime-dark/20 shadow-lg">
          <MapPicker
            position={mapPosition}
            onPositionChange={handleMapClick}
          />
          {mapAddress && (
            <div className="p-2.5 bg-white border-t border-lime-dark/10 flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-lime-dark mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-tight">{mapAddress}</p>
            </div>
          )}
        </div>
      )}

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
