import { UserPlus, Baby, Search, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Skapa konto",
    description: "Registrera dig gratis på några minuter. Ange din e-post och lösenord.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Baby,
    step: "2",
    title: "Lägg till dina barn",
    description: "Fyll i dina barns uppgifter: namn, ålder och nödkontakt.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Search,
    step: "3",
    title: "Bläddra & välj",
    description: "Utforska kommande sportdagar och välj de sporter som passar ditt barn.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: CheckCircle,
    step: "4",
    title: "Boka plats",
    description: "Boka din plats med ett klick. Systemet kontrollerar ålder och tillgänglighet automatiskt.",
    color: "bg-purple-100 text-purple-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Så här fungerar det
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Det är enkelt att komma igång. Fyra steg och ditt barn är redo för sport!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-x-6 z-0" />
              )}
              <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-4 relative z-10`}>
                <s.icon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold text-gray-400 mb-1">STEG {s.step}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
