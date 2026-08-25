const BRANDS = ["Slekco Sport", "Slekco Wear", "Slekco Tech", "Slekco Home"];

export default function FilterSidebar({ categories, filters, onChange }) {
  return (
    <aside className="space-y-7">
      <div>
        <div className="label">Category</div>
        <div className="space-y-1.5">
          <button
            onClick={() => onChange({ category: "" })}
            className={`block text-sm ${!filters.category ? "font-semibold text-ink" : "text-ink/60 hover:text-ink"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => onChange({ category: c.slug })}
              className={`block text-sm ${filters.category === c.slug ? "font-semibold text-ink" : "text-ink/60 hover:text-ink"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="label">Brand</div>
        <div className="space-y-1.5">
          {BRANDS.map((b) => {
            const active = filters.brand?.split(",").includes(b);
            return (
              <label key={b} className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={!!active}
                  onChange={(e) => {
                    const current = filters.brand ? filters.brand.split(",") : [];
                    const next = e.target.checked
                      ? [...current, b]
                      : current.filter((x) => x !== b);
                    onChange({ brand: next.join(",") });
                  }}
                  className="h-3.5 w-3.5 rounded border-ink/30"
                />
                {b}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="label">Price</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={filters.minPrice || ""}
            onBlur={(e) => onChange({ minPrice: e.target.value })}
            className="input w-full"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={filters.maxPrice || ""}
            onBlur={(e) => onChange({ maxPrice: e.target.value })}
            className="input w-full"
          />
        </div>
      </div>

      <button
        onClick={() => onChange({ category: "", brand: "", minPrice: "", maxPrice: "", q: "" })}
        className="text-xs font-medium text-ink/50 underline hover:text-ink"
      >
        Clear all filters
      </button>
    </aside>
  );
}
