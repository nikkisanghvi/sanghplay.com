import { ALL_AREAS, LOCATION_REGIONS } from "@/lib/locations";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
};

export function AreaSelect({
  value,
  onChange,
  className = "rounded-xl border border-black/10 px-3 py-2",
  id,
  allowEmpty,
  emptyLabel = "Select area",
}: Props) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}
      {(Object.entries(LOCATION_REGIONS) as [string, readonly string[]][]).map(([region, cities]) => (
        <optgroup key={region} label={region}>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
              {region === "United States" || region === "United Kingdom" ? ` · ${region === "United States" ? "US" : "UK"}` : ""}
              {region === "Singapore" ? " · SG" : ""}
              {region === "India" ? " · IN" : ""}
            </option>
          ))}
        </optgroup>
      ))}
      {value && !ALL_AREAS.includes(value) ? (
        <option value={value}>{value} (custom)</option>
      ) : null}
    </select>
  );
}
