import { useState, type ReactNode } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowLeft,
  RotateCcw,
  Globe,
  MapPin,
  Lock,
  LogOut,
  Package,
} from "lucide-react";
import { useTours } from "../toursStore";
import {
  CATEGORIES,
  DOMESTIC_CATEGORIES,
  type Tour,
  type DomesticTour,
  type TourBase,
} from "../data";

/* ─────────────────── helpers ─────────────────── */

const emptyTourBase = (): Omit<TourBase, "id"> => ({
  title: "",
  city: "",
  country: "",
  flag: "🌍",
  days: 5,
  nights: 4,
  price: 500,
  oldPrice: undefined,
  rating: 4.5,
  reviews: 0,
  image: "https://images.pexels.com/photos/18341554/pexels-photo-18341554.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  tag: "",
  nextDates: [],
  seatsLeft: 10,
  includes: [],
  itinerary: [{ day: "1-kun", text: "" }],
  currency: "usd",
});

const ADMIN_PASSWORD = "baytrip2025";

/* ─────────────────── Login ─────────────────── */

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem("baytrip_admin", "1");
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink">BayTrip Admin Panel</h1>
          <p className="mt-1 text-sm text-ink-soft">Paketlar kartochkalarini boshqarish</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">Parol</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError(false);
              }}
              placeholder="Parolni kiriting"
              className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            {error && <p className="mt-1.5 text-xs font-bold text-hot">Parol noto'g'ri!</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
          >
            Kirish
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-ink-soft">
          Standart parol: <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] font-bold">baytrip2025</code>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────── Tour Form ─────────────────── */

function TourForm({
  initial,
  onSave,
  onCancel,
  mode,
  isDomestic,
}: {
  initial: TourBase;
  onSave: (data: TourBase) => void;
  onCancel: () => void;
  mode: "add" | "edit";
  isDomestic: boolean;
}) {
  const [form, setForm] = useState<TourBase>({ ...initial });
  const [datesInput, setDatesInput] = useState(initial.nextDates.join(", "));
  const [includesInput, setIncludesInput] = useState(initial.includes.join(", "));

  const handleSave = () => {
    onSave({
      ...form,
      nextDates: datesInput.split(",").map((d) => d.trim()).filter(Boolean),
      includes: includesInput.split(",").map((d) => d.trim()).filter(Boolean),
    });
  };

  const updateItinerary = (idx: number, field: "day" | "text", val: string) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
    }));
  };

  const addItineraryItem = () => {
    setForm((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: `${prev.itinerary.length + 1}-kun`, text: "" }],
    }));
  };

  const removeItineraryItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-extrabold text-ink">
          {mode === "add" ? "Yangi paket qo'shish" : "Paketni tahrirlash"}
        </h3>
        <button
          onClick={onCancel}
          className="grid h-9 w-9 place-items-center rounded-full bg-surface text-ink-soft transition hover:bg-hot hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Asosiy ma'lumotlar */}
      <fieldset className="space-y-4 rounded-2xl border border-black/5 bg-surface/50 p-5">
        <legend className="px-2 text-sm font-extrabold text-brand-600">Asosiy ma'lumotlar</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Sarlavha">
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="ID (slug)">
            <input className={inputCls} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={mode === "edit"} placeholder="masalan: dubai" />
          </Field>
          <Field label="Shahar">
            <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Davlat">
            <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </Field>
          <Field label="Bayroq (emoji)">
            <input className={inputCls} value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} />
          </Field>
          <Field label="Kategoriya">
            <select
              className={inputCls}
              value={(form as any).category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value } as any)}
            >
              {(isDomestic ? DOMESTIC_CATEGORIES : CATEGORIES)
                .filter((c) => c.id !== "all")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <Field label="Rasm URL">
          <input className={inputCls} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          {form.image && (
            <img src={form.image} alt="preview" className="mt-2 h-28 w-full rounded-xl object-cover" />
          )}
        </Field>
      </fieldset>

      {/* Narx va muddat */}
      <fieldset className="space-y-4 rounded-2xl border border-black/5 bg-surface/50 p-5">
        <legend className="px-2 text-sm font-extrabold text-brand-600">Narx va muddat</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Kun">
            <input type="number" className={inputCls} value={form.days} onChange={(e) => setForm({ ...form, days: +e.target.value })} />
          </Field>
          <Field label="Tun">
            <input type="number" className={inputCls} value={form.nights} onChange={(e) => setForm({ ...form, nights: +e.target.value })} />
          </Field>
          <Field label="Narx">
            <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
          </Field>
          <Field label="Eski narx">
            <input type="number" className={inputCls} value={form.oldPrice ?? ""} onChange={(e) => setForm({ ...form, oldPrice: e.target.value ? +e.target.value : undefined })} />
          </Field>
          <Field label="Reyting">
            <input type="number" step="0.1" className={inputCls} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} />
          </Field>
          <Field label="Sharhlar soni">
            <input type="number" className={inputCls} value={form.reviews} onChange={(e) => setForm({ ...form, reviews: +e.target.value })} />
          </Field>
          <Field label="Qolgan joylar">
            <input type="number" className={inputCls} value={form.seatsLeft} onChange={(e) => setForm({ ...form, seatsLeft: +e.target.value })} />
          </Field>
          <Field label="Valyuta">
            <select className={inputCls} value={form.currency || "usd"} onChange={(e) => setForm({ ...form, currency: e.target.value as any })}>
              <option value="usd">USD ($)</option>
              <option value="som">So'm</option>
            </select>
          </Field>
        </div>
      </fieldset>

      {/* Tag va sanalar */}
      <fieldset className="space-y-4 rounded-2xl border border-black/5 bg-surface/50 p-5">
        <legend className="px-2 text-sm font-extrabold text-brand-600">Qo'shimcha</legend>
        <Field label="Teg (masalan: Eng ommabop)">
          <input className={inputCls} value={form.tag || ""} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
        </Field>
        <Field label="Keyingi sanalar (vergul bilan)">
          <input className={inputCls} value={datesInput} onChange={(e) => setDatesInput(e.target.value)} placeholder="14-iyun, 28-iyun, 12-iyul" />
        </Field>
        <Field label="Narxga kiradi (vergul bilan)">
          <input className={inputCls} value={includesInput} onChange={(e) => setIncludesInput(e.target.value)} placeholder="Aviachipta, Mehmonxona, Transfer" />
        </Field>
      </fieldset>

      {/* Itinerary */}
      <fieldset className="space-y-4 rounded-2xl border border-black/5 bg-surface/50 p-5">
        <legend className="px-2 text-sm font-extrabold text-brand-600">Dastur (itinerary)</legend>
        {form.itinerary.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <input
              className={inputCls + " w-28 shrink-0"}
              value={item.day}
              onChange={(e) => updateItinerary(idx, "day", e.target.value)}
              placeholder="1-kun"
            />
            <input
              className={inputCls + " flex-1"}
              value={item.text}
              onChange={(e) => updateItinerary(idx, "text", e.target.value)}
              placeholder="Kun dasturi..."
            />
            <button
              onClick={() => removeItineraryItem(idx)}
              className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-hot hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button onClick={addItineraryItem} className="text-sm font-bold text-brand-600 transition hover:text-brand-700">
          + Kun qo'shish
        </button>
      </fieldset>

      {/* Saqlash */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          Saqlash
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition hover:text-ink"
        >
          Bekor qilish
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

/* ─────────────────── Tour Card (list item) ─────────────────── */

function TourCard({
  tour,
  onEdit,
  onDelete,
}: {
  tour: TourBase;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition hover:shadow-md">
      <img src={tour.image} alt={tour.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-extrabold text-ink">{tour.flag} {tour.title}</h4>
        <p className="mt-0.5 text-xs text-ink-soft">
          {tour.city}, {tour.country} · {tour.days} kun / {tour.nights} tun · {tour.price.toLocaleString()} {tour.currency === "som" ? "so'm" : "$"}
        </p>
        {tour.tag && (
          <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
            {tour.tag}
          </span>
        )}
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={onEdit}
          className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-ink-soft transition hover:bg-brand-100 hover:text-brand-700"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-ink-soft transition hover:bg-red-50 hover:text-hot"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── Main Admin Dashboard ─────────────────── */

function Dashboard({ onBack }: { onBack: () => void }) {
  const {
    tours,
    domesticTours,
    addTour,
    updateTour,
    deleteTour,
    addDomesticTour,
    updateDomesticTour,
    deleteDomesticTour,
    resetAll,
  } = useTours();

  const [tab, setTab] = useState<"international" | "domestic">("international");
  const [editing, setEditing] = useState<TourBase | null>(null);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleLogout = () => {
    sessionStorage.removeItem("baytrip_admin");
    onBack();
  };

  const handleSave = (data: TourBase) => {
    if (editMode === "add") {
      if (tab === "international") {
        addTour(data as Tour);
      } else {
        addDomesticTour(data as DomesticTour);
      }
    } else {
      if (tab === "international") {
        updateTour(data.id, data as Partial<Tour>);
      } else {
        updateDomesticTour(data.id, data as Partial<DomesticTour>);
      }
    }
    setEditing(null);
  };

  const handleEdit = (tour: TourBase) => {
    setEditing(tour);
    setEditMode("edit");
  };

  const handleAdd = () => {
    const newTour: TourBase = {
      ...emptyTourBase(),
      id: `tour-${Date.now()}`,
      category: tab === "international" ? "shahar" : "tarixiy",
    } as TourBase;
    setEditing(newTour);
    setEditMode("add");
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      if (tab === "international") deleteTour(id);
      else deleteDomesticTour(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const currentTours = tab === "international" ? tours : domesticTours;

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => setEditing(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </button>
        <TourForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          mode={editMode}
          isDomestic={tab === "domestic"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold text-ink">Admin Panel</h1>
              <p className="text-[11px] font-bold text-ink-soft">BayTrip paketlar boshqaruvi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirmReset) {
                  resetAll();
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                  setTimeout(() => setConfirmReset(false), 3000);
                }
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                confirmReset
                  ? "bg-hot text-white"
                  : "bg-surface text-ink-soft hover:text-ink"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {confirmReset ? "Tasdiqlang!" : "Asliga qaytarish"}
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink-soft transition hover:text-ink"
            >
              <Globe className="h-3.5 w-3.5" />
              Saytga
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink-soft transition hover:text-hot"
            >
              <LogOut className="h-3.5 w-3.5" />
              Chiqish
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Xalqaro turlar" value={tours.length} icon={<Globe className="h-5 w-5" />} color="brand" />
          <StatCard label="Ichki turlar" value={domesticTours.length} icon={<MapPin className="h-5 w-5" />} color="emerald" />
          <StatCard
            label="Jami paketlar"
            value={tours.length + domesticTours.length}
            icon={<Package className="h-5 w-5" />}
            color="sun"
          />
          <StatCard
            label="Qaynoq takliflar"
            value={[...tours, ...domesticTours].filter((t) => !!t.oldPrice || !!t.tag).length}
            icon={<span className="text-lg">🔥</span>}
            color="hot"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5 sm:w-fit">
          <button
            onClick={() => setTab("international")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
              tab === "international"
                ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Globe className="h-4 w-4" />
            Xalqaro turlar
          </button>
          <button
            onClick={() => setTab("domestic")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
              tab === "domestic"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Ichki turlar
          </button>
        </div>
      </div>

      {/* Tour List */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">
            {tab === "international" ? "Xalqaro paketlar" : "Ichki turizm paketlari"}
            <span className="ml-2 text-sm font-bold text-ink-soft">({currentTours.length} ta)</span>
          </h2>
          <button
            onClick={handleAdd}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] ${
              tab === "international"
                ? "bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand-600/30"
                : "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-600/30"
            }`}
          >
            <Plus className="h-4 w-4" />
            Paket qo'shish
          </button>
        </div>

        <div className="space-y-3">
          {currentTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onEdit={() => handleEdit(tour)}
              onDelete={() => handleDelete(tour.id)}
            />
          ))}
          {currentTours.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-black/10 py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-ink-soft/30" />
              <p className="mt-3 text-sm font-bold text-ink-soft">Hali hech qanday paket yo'q</p>
              <p className="text-xs text-ink-soft/60">Yuqoridagi tugmani bosib birinchi paketni qo'shing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    brand: "from-brand-500 to-brand-700 shadow-brand-600/20",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-600/20",
    sun: "from-amber-400 to-amber-500 shadow-amber-500/20",
    hot: "from-hot to-tangerine shadow-hot/20",
  };
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className={`mb-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-md`}>
        {icon}
      </div>
      <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-xs font-bold text-ink-soft">{label}</p>
    </div>
  );
}

/* ─────────────────── AdminPanel (entry) ─────────────────── */

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("baytrip_admin") === "1");

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <Dashboard onBack={onBack} />;
}
