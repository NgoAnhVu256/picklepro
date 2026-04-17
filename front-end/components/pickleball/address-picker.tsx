'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Map as MapIcon, Loader2, Search } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('@/components/pickleball/map-picker'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed"><Loader2 className="animate-spin text-lime" /></div>
})

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

  // Map state
  const [showMap, setShowMap] = useState(false)
  const [mapPosition, setMapPosition] = useState<[number, number]>([21.028511, 105.804817]) // Hanoi default
  const [isLocating, setIsLocating] = useState(false)

  // Khởi tạo data
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(r => r.json())
      .then(data => {
        setProvinces(data)
        
        if (initialAddress) {
           const parts = initialAddress.split(',').map(s => s.trim())
           if (parts.length >= 4) {
             setStreetInfo(parts[0])
           } else {
             setStreetInfo(initialAddress)
           }
        }
      })
      .catch(console.error)
  }, [initialAddress])

  // Auto ghép chuỗi khi các trường thay đổi
  useEffect(() => {
    const provName = provinces.find(p => p.code == selectedProvince)?.name || ''
    const distName = districts.find(d => d.code == selectedDistrict)?.name || ''
    const wardName = wards.find(w => w.code == selectedWard)?.name || ''
    
    const arr = [streetInfo, wardName, distName, provName].filter(Boolean)
    const full = arr.join(', ')
    if (full) {
      onChange(full)
    }
  }, [streetInfo, selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards])

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

  const handleMapConfirm = async () => {
    setIsLocating(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition[0]}&lon=${mapPosition[1]}&zoom=18&addressdetails=1`)
      const data = await res.json()
      
      if (data && data.address) {
        const addr = data.address
        const city = addr.city || addr.province || addr.state || ''
        const district = addr.county || addr.district || addr.suburb || ''
        const ward = addr.village || addr.quarter || addr.suburb || ''
        const road = addr.road || ''
        const houseNumber = addr.house_number || ''
        
        let street = road
        if (houseNumber && road) street = `${houseNumber} ${road}`

        // Auto match with Provinces Open API
        if (provinces.length > 0) {
          // Normalize strings for matching
          const normalize = (str: string) => str.toLowerCase().replace(/thành phố|tỉnh|quận|huyện|thị xã|phường|xã|thị trấn/g, '').trim()
          
          const matchedProv = provinces.find(p => normalize(p.name).includes(normalize(city)) || normalize(city).includes(normalize(p.name)))
          if (matchedProv) {
            setSelectedProvince(String(matchedProv.code))
            setDistricts(matchedProv.districts)
            
            const matchedDist = matchedProv.districts.find((d: any) => normalize(d.name).includes(normalize(district)) || normalize(district).includes(normalize(d.name)))
            if (matchedDist) {
              setSelectedDistrict(String(matchedDist.code))
              setWards(matchedDist.wards)
              
              const matchedWard = matchedDist.wards.find((w: any) => normalize(w.name).includes(normalize(ward)) || normalize(ward).includes(normalize(w.name)))
              if (matchedWard) {
                setSelectedWard(String(matchedWard.code))
              }
            }
          }
        }
        
        setStreetInfo(street || data.display_name.split(',')[0])
      }
    } catch (e) {
      console.error("Map locator error:", e)
    } finally {
      setIsLocating(false)
      setShowMap(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-500 uppercase">Tỉnh / Thành phố</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger className="w-full bg-white border-blue-200 h-11 rounded-md">
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
            <SelectTrigger className="w-full bg-white border-blue-200 h-11 rounded-md">
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
            <SelectTrigger className="w-full bg-white border-blue-200 h-11 rounded-md">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input 
              placeholder="Ví dụ: Số 123, Phố Chùa Láng" 
              value={streetInfo}
              onChange={(e) => setStreetInfo(e.target.value)}
              className="pl-10 h-11 rounded-md border-blue-200 shadow-sm"
            />
          </div>
          <button 
            type="button" 
            onClick={() => setShowMap(!showMap)} 
            className="h-11 px-4 rounded-md bg-blue-50 text-blue-600 font-bold text-sm flex gap-2 items-center hover:bg-blue-100 border border-blue-200 shrink-0 transition-colors"
          >
            <MapIcon className="h-4 w-4" /> Bản đồ
          </button>
        </div>
      </div>

      {showMap && (
        <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-white shadow-lg space-y-4 relative animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2 text-blue-800">
              <MapIcon className="w-4 h-4" /> Di chuyển ghim để chọn vị trí chính xác
            </Label>
          </div>
          <div className="w-full rounded-lg overflow-hidden border border-gray-200">
            <MapPicker position={mapPosition} onPositionChange={(lat, lng) => setMapPosition([lat, lng])} />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setShowMap(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Huỷ
            </button>
            <button 
              type="button"
              onClick={handleMapConfirm}
              disabled={isLocating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLocating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLocating ? 'Đang phân tích...' : 'Lấy địa chỉ này'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
