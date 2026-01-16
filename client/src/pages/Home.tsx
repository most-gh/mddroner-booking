import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, MapPin, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type LocationType = 
  | "luk_keng" | "tai_tam" | "shek_o" | "ting_kau" | "clear_water" 
  | "sam_mun" | "tko_bridge" | "central_wheel"
  | "tai_mo_shan" | "lantau_link" | "kc_container" | "tso_wo_hang"
  | "tai_po_road" | "tai_ping_shan" | "hill_road" | "tai_koo_bridge" | "kai_tak"
  | "science_park" | "chai_wan" | "tai_mei_duk" | "ha_cheng_men";

type FormStep = 1 | 2 | 3 | 4;

const LOCATIONS: Record<LocationType, { name: string; image: string }> = {
  luk_keng: { name: "鹿頸", image: "/images/luk_keng.jpg" },
  tai_tam: { name: "大潭水壩", image: "/images/tai_tam.jpg" },
  shek_o: { name: "石澳", image: "/images/shek_o.jpg" },
  ting_kau: { name: "汀九", image: "/images/ting_kau.jpg" },
  clear_water: { name: "清水灣", image: "/images/clear_water_bay.jpg" },
  sam_mun: { name: "三門仔", image: "/images/sam_mun_tsai.jpg" },
  tko_bridge: { name: "將軍澳跨灣大橋", image: "/images/tko.jpg" },
  central_wheel: { name: "中環摩天輪", image: "/images/central.jpg" },
  tai_mo_shan: { name: "大帽山", image: "/images/tai_mo_shan.jpg" },
  lantau_link: { name: "大嶼山觀景台", image: "/images/lantau_link.jpg" },
  kc_container: { name: "葵涌貨櫃碼頭", image: "/images/kwai_chung_cargo.jpg" },
  tso_wo_hang: { name: "早禾坑碼頭", image: "/images/tso_wo_hang.jpg" },
  tai_po_road: { name: "大埔道", image: "/images/tai_po_road.jpg" },
  tai_ping_shan: { name: "太平山街", image: "/images/tai_ping_shan.jpg" },
  hill_road: { name: "山道", image: "/images/hill_road.jpg" },
  tai_koo_bridge: { name: "太古天橋", image: "/images/taikoo.jpg" },
  kai_tak: { name: "啟德體育園", image: "/images/kai_tak.jpg" },
  science_park: { name: "科學園", image: "/images/sci_park.jpg" },
  chai_wan: { name: "柴灣道天橋", image: "/images/chai_wan_road.jpg" },
  ha_cheng_men: { name: "下城門水塘", image: "/images/lower_shing_mun.jpg" },
  tai_mei_duk: { name: "大美篤", image: "/images/tai_mei_duk.jpg" },
};

const LOCATION_KEYS = Object.keys(LOCATIONS) as LocationType[];

type ProposedRouteType = "route1" | "route2" | "route3";

const PROPOSED_ROUTES: Record<ProposedRouteType, { name: string; locations: LocationType[] }> = {
  route1: {
    name: "提議路線1",
    locations: ["sam_mun", "luk_keng", "science_park"],
  },
  route2: {
    name: "提議路線2",
    locations: ["chai_wan", "shek_o", "tai_tam"],
  },
  route3: {
    name: "提議路線3",
    locations: ["ting_kau", "tai_mo_shan", "kc_container"],
  },
};

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [selectedLocations, setSelectedLocations] = useState<LocationType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carModel: "",
    carPlate: "",
    date: "",
    specialRequests: "",
    multipleVehicles: false,
    extraVehicleCount: "",
    videoUpgrade: false,
    videoLocationCount: "",
  });
  const heroRef = useRef<HTMLDivElement>(null);
  const submitBooking = trpc.booking.submit.useMutation();

  const handleLocationToggle = (location: LocationType) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else if (selectedLocations.length < 3) {
      setSelectedLocations([...selectedLocations, location]);
    } else {
      toast.error("最多只能選擇 3 個地點");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const calculateEstimatedCost = () => {
    const BASE_PRICE = 2800;
    const MULTIPLE_VEHICLES_PRICE = 800;
    const VIDEO_UPGRADE_PRICE = 500;

    let total = BASE_PRICE;
    
    if (formData.multipleVehicles && formData.extraVehicleCount) {
      const extraCount = parseInt(formData.extraVehicleCount, 10);
      if (!isNaN(extraCount) && extraCount > 0) {
        total += MULTIPLE_VEHICLES_PRICE * extraCount;
      }
    }
    
    if (formData.videoUpgrade && formData.videoLocationCount) {
      const videoCount = parseInt(formData.videoLocationCount, 10);
      if (!isNaN(videoCount) && videoCount > 0) {
        total += VIDEO_UPGRADE_PRICE * videoCount;
      }
    }
    
    return total;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.carModel || !formData.date || selectedLocations.length === 0) {
      toast.error("請填寫所有必填欄位並選擇地點");
      return;
    }

    try {
      const locationsStr = selectedLocations.map(l => LOCATIONS[l].name).join(", ");
      await submitBooking.mutateAsync({
        route: locationsStr,
        name: formData.name,
        phone: formData.phone,
        carModel: formData.carModel,
        carPlate: formData.carPlate || undefined,
        bookingDate: formData.date,
        specialRequests: formData.specialRequests || undefined,
        multipleVehicles: formData.multipleVehicles,
        videoUpgrade: formData.videoUpgrade,
      });

      toast.success("報名成功！我們會於 24 小時內透過 WhatsApp 聯絡你確認詳細時間與天氣安排。");
      setCurrentStep(1);
      setSelectedLocations([]);
      setFormData({
        name: "",
        phone: "",
        carModel: "",
        carPlate: "",
        date: "",
        specialRequests: "",
        multipleVehicles: false,
        extraVehicleCount: "",
        videoUpgrade: false,
        videoLocationCount: "",
      });
    } catch (error) {
      console.error("Booking submission failed:", error);
      toast.error("報名失敗，請稍後重試。");
    }
  };

  const scrollToForm = () => {
    const formElement = document.getElementById("booking-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/tai_mo_shan.jpg')`,
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight whitespace-nowrap">
            預約你的天際視角
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            揀選經典地點，留下美好回憶!
          </p>
          <Button
            onClick={scrollToForm}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-lg flex items-center gap-2 mx-auto"
          >
            立即預約
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <section id="booking-form" className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl">
          {currentStep >= 1 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">01</span>
                <h2 className="text-3xl font-bold">選擇你的地點</h2>
              </div>

              <div className="mb-8">
                <p className="text-base font-semibold mb-4">選擇提議路線：</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PROPOSED_ROUTES).map(([key, route]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedLocations(route.locations);
                      }}
                      className="p-4 border-2 border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all duration-300 text-left"
                    >
                      <p className="font-semibold text-accent">{route.name}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {route.locations.map(loc => LOCATIONS[loc].name).join(" + ")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider-line my-6" />
              <p className="text-base font-semibold mb-4">或自訂地點 (最多 3 個)：</p>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {LOCATION_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleLocationToggle(key)}
                    className={`card-minimal overflow-hidden group cursor-pointer transition-all duration-300 p-3 rounded-lg border-2 relative ${
                      selectedLocations.includes(key)
                        ? "ring-2 ring-accent border-accent"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="relative h-24 overflow-hidden mb-2 rounded">
                      <img
                        src={LOCATIONS[key].image}
                        alt={LOCATIONS[key].name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-center">{LOCATIONS[key].name}</p>
                    {selectedLocations.includes(key) && (
                      <div className="absolute top-2 right-2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedLocations.length > 0 && (
                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    已選擇 {selectedLocations.length} 個地點：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((loc) => (
                      <div key={loc} className="bg-accent text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {LOCATIONS[loc].name}
                        <button
                          onClick={() => handleLocationToggle(loc)}
                          className="hover:opacity-80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={selectedLocations.length === 0}
                className="mt-8 bg-accent hover:bg-accent/90 text-white w-full max-w-2xl disabled:opacity-50"
              >
                下一步
              </Button>
            </div>
          )}

          <div className="divider-line my-12" />

          {currentStep >= 2 && selectedLocations.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">02</span>
                <h2 className="text-3xl font-bold">填寫基本資料</h2>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold mb-2 block">
                    姓名 *
                  </Label>
                  <Input
                    id="name"
                    placeholder="請輸入您的姓名"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-semibold mb-2 block">
                    聯絡電話 (WhatsApp) *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="例如：+852 9876 5432"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="carModel" className="text-base font-semibold mb-2 block">
                    車輛型號 (Make & Model) *
                  </Label>
                  <Input
                    id="carModel"
                    placeholder="例如：Porsche 911 / Honda Civic FL5"
                    value={formData.carModel}
                    onChange={(e) => handleInputChange("carModel", e.target.value)}
                    className="border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="carPlate" className="text-base font-semibold mb-2 block">
                    車牌號碼
                  </Label>
                  <Input
                    id="carPlate"
                    placeholder="例如：AB 1234"
                    value={formData.carPlate}
                    onChange={(e) => handleInputChange("carPlate", e.target.value)}
                    className="border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-base font-semibold mb-2 block">
                    預期拍攝日期 *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="text-base font-semibold mb-2 block">
                    特別要求
                  </Label>
                  <textarea
                    id="specialRequests"
                    placeholder="例如：其他隱世地點、標準拍攝時間、特殊拍攝需求、其他註意事項等"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    className="border border-border rounded-md p-3 min-h-24 resize-none"
                  />
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(3)}
                className="mt-8 bg-accent hover:bg-accent/90 text-white w-full max-w-2xl"
              >
                下一步
              </Button>
            </div>
          )}

          <div className="divider-line my-12" />

          {currentStep >= 3 && selectedLocations.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">03</span>
                <h2 className="text-3xl font-bold">附加選項</h2>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-secondary transition-colors">
                    <Checkbox
                      id="multipleVehicles"
                      checked={formData.multipleVehicles}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("multipleVehicles", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="multipleVehicles"
                      className="flex-1 cursor-pointer font-medium"
                    >
                      <span>我有多於一架車參與</span>
                      <span className="text-accent ml-2">+$800/架</span>
                    </Label>
                  </div>
                  {formData.multipleVehicles && (
                    <div className="mt-3 pl-4">
                      <Label htmlFor="extraVehicleCount" className="text-sm font-semibold mb-2 block">
                        需要拍攝的額外車輛數量
                      </Label>
                      <Input
                        id="extraVehicleCount"
                        type="number"
                        min="1"
                        placeholder="輸入數量 (e.g., 2)"
                        value={formData.extraVehicleCount}
                        onChange={(e) => handleInputChange("extraVehicleCount", e.target.value)}
                        className="border-border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-secondary transition-colors">
                    <Checkbox
                      id="videoUpgrade"
                      checked={formData.videoUpgrade}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("videoUpgrade", checked as boolean)
                      }
                    />
                    <Label htmlFor="videoUpgrade" className="flex-1 cursor-pointer font-medium">
                      <span>我想加購 15s 動態跏拍影片</span>
                      <span className="text-accent ml-2">+$500/地點</span>
                    </Label>
                  </div>
                  {formData.videoUpgrade && (
                    <div className="mt-3 pl-4">
                      <Label htmlFor="videoLocationCount" className="text-sm font-semibold mb-2 block">
                        需要拍攝動態影片的地點數量
                      </Label>
                      <Input
                        id="videoLocationCount"
                        type="number"
                        min="1"
                        max={selectedLocations.length}
                        placeholder={`輸入數量 (1-${selectedLocations.length})`}
                        value={formData.videoLocationCount}
                        onChange={(e) => handleInputChange("videoLocationCount", e.target.value)}
                        className="border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(4)}
                className="mt-8 bg-accent hover:bg-accent/90 text-white w-full max-w-2xl"
              >
                檢查並提交
              </Button>
            </div>
          )}

          <div className="divider-line my-12" />

          {currentStep >= 4 && selectedLocations.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">04</span>
                <h2 className="text-3xl font-bold">確認預約</h2>
              </div>

              <Card className="p-6 bg-secondary border-border mb-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">選擇地點</p>
                    <p className="font-semibold text-sm">{selectedLocations.map(l => LOCATIONS[l].name).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">姓名</p>
                    <p className="font-semibold">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">聯絡電話</p>
                    <p className="font-semibold">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">車型</p>
                    <p className="font-semibold">{formData.carModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">預期日期</p>
                    <p className="font-semibold">{formData.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">揀選計劃</p>
                    <p className="font-semibold text-accent">
                      基本套餐
                      {formData.multipleVehicles && " + 多架車"}
                      {formData.videoUpgrade && " + 動態影片"}
                    </p>
                  </div>
                </div>
                {formData.specialRequests && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">特別要求</p>
                    <p className="font-semibold text-sm whitespace-pre-wrap">{formData.specialRequests}</p>
                  </div>
                )}
              </Card>

              <div className="bg-accent/10 p-6 rounded-lg mb-6 border-2 border-accent max-w-2xl">
                <h3 className="font-semibold mb-4 text-lg">預估費用</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>基本套餐 (只包1架車)</span>
                    <span>$2,800</span>
                  </div>
                  {formData.multipleVehicles && formData.extraVehicleCount && (
                    <div className="flex justify-between text-sm">
                      <span>多架車加價 ({formData.extraVehicleCount} 架, 總計 {1 + parseInt(formData.extraVehicleCount, 10)} 架車)</span>
                      <span>+${800 * parseInt(formData.extraVehicleCount, 10)}</span>
                    </div>
                  )}
                  {formData.videoUpgrade && formData.videoLocationCount && (
                    <div className="flex justify-between text-sm">
                      <span>動態影片加價 ({formData.videoLocationCount} 個地點)</span>
                      <span>+${500 * parseInt(formData.videoLocationCount, 10)}</span>
                    </div>
                  )}
                  <div className="border-t border-accent/30 pt-3 flex justify-between font-bold text-lg">
                    <span>總費用</span>
                    <span className="text-accent">${calculateEstimatedCost()}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">*最終費用以確認電郵為準</p>
              </div>

              <div className="bg-secondary p-6 rounded-lg mb-6 border border-border max-w-2xl">
                <h3 className="font-semibold mb-4 text-lg">基本套餐詳情</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-accent font-bold">•</span>
                    <div>
                      <p className="font-semibold">靜態航拍照片</p>
                      <p className="text-muted-foreground">15-25 張精修高解析度照片（包含多角度、多高度拍攝）</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent font-bold">•</span>
                    <div>
                      <p className="font-semibold">動態影片</p>
                      <p className="text-muted-foreground">可選加購 15-30 秒 4K 動態跟拍影片</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent font-bold">•</span>
                    <div>
                      <p className="font-semibold">拍攝時長</p>
                      <p className="text-muted-foreground">60-90 分鐘現場拍攝</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent font-bold">•</span>
                    <div>
                      <p className="font-semibold">交付時間</p>
                      <p className="text-muted-foreground">7-10 個工作天內交付</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent font-bold">•</span>
                    <div>
                      <p className="font-semibold">包含地點</p>
                      <p className="text-muted-foreground">最多 3 個地點（可自訂或選擇提議路線）</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent font-bold">•</span>
                    <div>
                      <p className="font-semibold">天氣保障</p>
                      <p className="text-muted-foreground">拍攝前 2 小時遇降雨或強風可免費改期</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-6 rounded-lg mb-6 border border-border max-w-2xl">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>✓</span> 天氣保障
                </h3>
                <p className="text-sm text-muted-foreground">
                  如拍攝前 2 小時遇降雨或強風，可免費更改日期。
                </p>
              </div>

              <div className="flex gap-4 max-w-2xl">
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  返回修改
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitBooking.isPending}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                >
                  {submitBooking.isPending ? "提交中..." : "確認提交"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">為什麼選擇 MDDroner</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">✓</span>
              </div>
              <h3 className="font-bold mb-2">天氣保障</h3>
              <p className="text-sm text-muted-foreground">
                如拍攝前 2 小時遇降雨或強風，可免費更改日期。
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">✓</span>
              </div>
              <h3 className="font-bold mb-2">專業團隊</h3>
              <p className="text-sm text-muted-foreground">
                經驗豐富的無人機操作員與攝影師，確保最佳拍攝效果。
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">✓</span>
              </div>
              <h3 className="font-bold mb-2">快速交付</h3>
              <p className="text-sm text-muted-foreground">
                拍攝後 7 天內收到精修後的高質量照片與影片。
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">查看更多同地點作品</p>
            <a href="https://www.mddronerphotography.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                瀏覽作品集
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-background border-t border-border">
        <div className="container max-w-4xl">
          <div className="flex flex-col items-center justify-center mb-8">
            <img src="/mddroner-logo.png" alt="MDDroner" className="h-12 mb-4" />
            <p className="text-sm text-muted-foreground text-center">&copy; 2025 MDDroner Photography. 版權所有。</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
