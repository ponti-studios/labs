import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CountryPicker } from "~/components/country-picker/country-picker";

export default function CovidCountryLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { countryCode = "OWID_WRL" } = useParams();

  const handleCountryChange = (newCountryCode: string) => {
    const pathParts = location.pathname.split("/");

    if (pathParts.length >= 3 && pathParts[1] === "covid") {
      pathParts[2] = newCountryCode;
      navigate(pathParts.join("/"));
      return;
    }

    navigate(`/covid/${newCountryCode}`);
  };

  const navigationItems = [
    { href: `/covid/${countryCode}`, title: "Dashboard" },
    { href: `/covid/${countryCode}/pandemic-waves`, title: "Pandemic Waves" },
    { href: `/covid/${countryCode}/vaccination-effectiveness`, title: "Vaccination Impact" },
    { href: `/covid/${countryCode}/seasonal-patterns`, title: "Seasonal Analysis" },
    { href: `/covid/${countryCode}/outlier-detection`, title: "Outlier Detection" },
  ];

  return (
    <>
      <header>
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="ui-data-label">COVID-19</span>
            <span className="text-border">|</span>
            <span className="text-xs text-muted-foreground">Analytics</span>
          </div>

          <CountryPicker
            countryCode={countryCode}
            onChange={handleCountryChange}
            className="w-48"
          />
        </div>

        <nav className="mx-auto max-w-6xl px-6 flex gap-1 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </>
  );
}
