'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search } from 'lucide-react'

interface AddressPickerProps {
  initialAddress?: string
  onChange: (fullAddress: string) => void
}

export function AddressPicker({ initialAddress = '', onChange }: AddressPickerProps) {
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedWard, setSelectedWard] = useState<string>('')
  const [streetInfo, setStreetInfo] = useState<string>('')

  // Khởi tạo data
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(r => r.json())
      .then(data => {
        setProvinces(data)
        
        // Cố gắng phân tách initialAddress (rất thủ công)
        if (initialAddress) {
           const parts = initialAddress.split(',').map(s => s.trim())
           if (parts.length >= 4) {
             setStreetInfo(parts[0])
             // Tìm khớp tương đối tỉnh/huyện/xã sẽ khó nên để simple: chỉ gán chuỗi
           } else {
             setStreetInfo(initialAddress)
           }
        }
      })
      .catch(console.error)
  }, [])

  // Auto ghép chuỗi khi các trường thay đổi
  useEffect(() => {
    const provName = provinces.find(p => p.code == selectedProvince)?.name || ''
    const distName = districts.find(d => d.code == selectedDistrict)?.name || ''
    const wardName = wards.find(w => w.code == selectedWard)?.name || ''
    
    // Gửi lại full string lên cha
    const arr = [streetInfo, wardName, distName, provName].filter(Boolean)
    const full = arr.join(', ')
    if (full) {
      onChange(full)
    }
  }, [streetInfo, selectedProvince, selectedDistrict, selectedWard])

  const handleProvinceChange = (val: string) => {
    setSelectedProvince(val)
    setSelectedDistrict('')
    setSelectedWard('')
    const p = provinces.find(x => x.code == val)
    setDistricts(p?.districts || [])
    setWards([])
  }

  const handleDistrictChange = (val: string) => {
    setSelectedDistrict(val)
    setSelectedWard('')
    const d = districts.find(x => x.code == val)
    setWards(d?.wards || [])
  }

  const searchMapNominatim = async () => {
     if (!streetInfo && !selectedProvince) return;
     const provName = provinces.find(p => p.code == selectedProvince)?.name || ''
     const q = `${streetInfo}, ${provName}`;
     try {
       const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`)
       const data = await res.json()
       if (data && data.length > 0) {
         // Auto fill what Nominatim understands
         // We just alert logic since mapping boundaries to VN open API is complex
         console.log("Map coordinates found:", data[0].lat, data[0].lon)
       }
     } catch (err) {}
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-500 uppercase">Tỉnh / Thành phố</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger className="w-full bg-white border-lime/30 h-11 rounded-xl">
              <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {provinces.map(p => <SelectItem key={p.code} value={String(p.code)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-500 uppercase">Quận / Huyện</Label>
          <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedProvince}>
            <SelectTrigger className="w-full bg-white border-lime/30 h-11 rounded-xl">
              <SelectValue placeholder="Chọn Quận/Huyện" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {districts.map(d => <SelectItem key={d.code} value={String(d.code)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-500 uppercase">Phường / Xã</Label>
          <Select value={selectedWard} onValueChange={(v) => setSelectedWard(v)} disabled={!selectedDistrict}>
            <SelectTrigger className="w-full bg-white border-lime/30 h-11 rounded-xl">
              <SelectValue placeholder="Chọn Phường/Xã" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {wards.map(w => <SelectItem key={w.code} value={String(w.code)}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase">Số nhà, Tên đường, Thôn/Xóm</Label>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lime-dark" />
            <Input 
              placeholder="Ví dụ: Số 123, Phố Chùa Láng" 
              value={streetInfo}
              onChange={(e) => setStreetInfo(e.target.value)}
              className="pl-10 h-11 rounded-xl border-lime/30 shadow-sm"
            />
          </div>
          {/* <button type="button" onClick={searchMapNominatim} className="h-11 px-4 rounded-xl bg-lime/20 text-lime-dark font-bold text-sm flex gap-2 items-center hover:bg-lime/30 border border-lime border-dashed shrink-0 transition-colors">
            <Search className="h-4 w-4" /> Bản đồ
          </button> */}
        </div>
      </div>
    </div>
  )
}
