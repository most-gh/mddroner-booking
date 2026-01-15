import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, MapPin, Calendar, Phone, Car } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

/**
 * Design System: Modern Minimalism
 * - Color: White background + Deep gray text + Gold accent (#D4AF37 in OKLCH)
 * - Typography: Playfair Display for headings, Inter for body
 * - Layout: Non-symmetric, floating cards with subtle shadows
 * - Interaction: Smooth transitions, hover effects with elevation
 */

type RouteType = "classic" | "industrial" | "coastal";
type FormStep = 1 | 2 | 3 | 4;

const ROUTES = {
  classic: {
    name: "經典山道",
    description: "大帽山 / 飛鵝山 / 汀九",
    image: "/images/AwiRKuumrc46.jpg",
  },
  industrial: {
    name: "工業美學",
    description: "大潭 / 昂船洲 / 欣澳",
    image: "/images/I8tjhfN0AxQm.jpg",
  },
  coastal: {
    name: "海岸秘境",
    description: "東壩 / 布袋澳 / 清水灣",
    image: "/images/YGeLV2wfkxVO.jpg",
  },
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carModel: "",
    carPlate: "",
    date: "",
    multipleVehicles: false,
    videoUpgrade: false,
  });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleRouteSelect = (route: RouteType) => {
    setSelectedRoute(route);
    setCurrentStep(2);
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

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.carModel || !formData.date) {
      toast.error("請填寫所有必填欄位");
      return;
    }

    const message = `
感謝預約！MDDroner 已收到你的報名。

路線：${selectedRoute ? ROUTES[selectedRoute].name : ""}
姓名：${formData.name}
聯絡電話：${formData.phone}
車型：${formData.carModel}
車牌：${formData.carPlate}
預期日期：${formData.date}
多台車：${formData.multipleVehicles ? "是" : "否"}
動態跟拍：${formData.videoUpgrade ? "是" : "否"}

我們會於 24 小時內透過 WhatsApp 聯絡你確認詳細時間與天氣安排。
    `;

    console.log("Form submitted:", message);
    toast.success("報名成功！我們會盡快與您聯絡。");
    setCurrentStep(1);
    setSelectedRoute(null);
    setFormData({
      name: "",
      phone: "",
      carModel: "",
      carPlate: "",
      date: "",
      multipleVehicles: false,
      videoUpgrade: false,
    });
  };

  const scrollToForm = () => {
    const formElement = document.getElementById("booking-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/Jwcm8Zfbmvlw.jpg')`,
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            預約你的天際視角
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            3 個經典地點，1 個專屬套餐
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

      {/* Booking Form Section */}
      <section id="booking-form" className="py-16 md:py-24 bg-background">
        <div className="container max-w-4xl">
          {/* Step 1: Route Selection */}
          {currentStep >= 1 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">01</span>
                <h2 className="text-3xl font-bold">選擇你的路線</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.entries(ROUTES) as [RouteType, typeof ROUTES.classic][]).map(
                  ([key, route]) => (
                    <button
                      key={key}
                      onClick={() => handleRouteSelect(key)}
                      className={`card-minimal overflow-hidden group cursor-pointer transition-all duration-300 ${
                        selectedRoute === key
                          ? "ring-2 ring-accent"
                          : "hover:ring-2 hover:ring-accent/50"
                      }`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={route.image}
                          alt={route.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">{route.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {route.description}
                        </p>
                      </div>
                    </button>
                  )
                )}
              </div>

              {selectedRoute && (
                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    已選擇：<span className="font-semibold">{ROUTES[selectedRoute].name}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="divider-line my-12" />

          {/* Step 2: Basic Information */}
          {currentStep >= 2 && selectedRoute && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">02</span>
                <h2 className="text-3xl font-bold">填寫基本資料</h2>
              </div>

              <div className="space-y-6">
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
              </div>

              <Button
                onClick={() => setCurrentStep(3)}
                className="mt-8 bg-accent hover:bg-accent/90 text-white w-full"
              >
                下一步
              </Button>
            </div>
          )}

          <div className="divider-line my-12" />

          {/* Step 3: Add-ons */}
          {currentStep >= 3 && selectedRoute && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">03</span>
                <h2 className="text-3xl font-bold">附加選項</h2>
              </div>

              <div className="space-y-4">
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
                    <span>我有多於一台車參與</span>
                    <span className="text-accent ml-2">+$800/台</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-secondary transition-colors">
                  <Checkbox
                    id="videoUpgrade"
                    checked={formData.videoUpgrade}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("videoUpgrade", checked as boolean)
                    }
                  />
                  <Label htmlFor="videoUpgrade" className="flex-1 cursor-pointer font-medium">
                    <span>我想加購 15s 動態跟拍影片</span>
                    <span className="text-accent ml-2">+$500/地點</span>
                  </Label>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(4)}
                className="mt-8 bg-accent hover:bg-accent/90 text-white w-full"
              >
                檢查並提交
              </Button>
            </div>
          )}

          <div className="divider-line my-12" />

          {/* Step 4: Review & Submit */}
          {currentStep >= 4 && selectedRoute && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="step-counter">04</span>
                <h2 className="text-3xl font-bold">確認預約</h2>
              </div>

              <Card className="p-6 bg-secondary border-border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">選擇路線</p>
                    <p className="font-semibold">{ROUTES[selectedRoute].name}</p>
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
                    <p className="text-sm text-muted-foreground mb-1">預計費用</p>
                    <p className="font-semibold text-accent">
                      基礎套餐
                      {formData.multipleVehicles && " + 多台車"}
                      {formData.videoUpgrade && " + 動態影片"}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="bg-secondary p-6 rounded-lg mb-6 border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>✓</span> 天氣保障
                </h3>
                <p className="text-sm text-muted-foreground">
                  如拍攝前 2 小時遇降雨或強風，可免費更改日期。
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  返回修改
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                >
                  確認提交
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Elements Section */}
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
            <p className="text-muted-foreground mb-4">查看更多同路線作品</p>
            <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
              瀏覽作品集
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MDDroner Photography. 版權所有。</p>
          <p className="mt-2">聯絡我們：hello@mddroner.com | +852 9876 5432</p>
        </div>
      </footer>
    </div>
  );
}
