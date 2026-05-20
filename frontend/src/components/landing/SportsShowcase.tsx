const sports = [
  { name: "Fotboll", icon: "⚽", color: "from-green-400 to-green-600", bg: "bg-green-50" },
  { name: "Handboll", icon: "🤾", color: "from-orange-400 to-orange-600", bg: "bg-orange-50" },
  { name: "Innebandy", icon: "🏒", color: "from-blue-400 to-blue-600", bg: "bg-blue-50" },
  { name: "Bordtennis", icon: "🏓", color: "from-yellow-400 to-yellow-600", bg: "bg-yellow-50" },
  { name: "Volleyboll", icon: "🏐", color: "from-purple-400 to-purple-600", bg: "bg-purple-50" },
  { name: "Hockey", icon: "🏑", color: "from-red-400 to-red-600", bg: "bg-red-50" },
  { name: "Konståkning", icon: "⛸️", color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50" },
  { name: "Padel", icon: "🎾", color: "from-lime-400 to-lime-600", bg: "bg-lime-50" },
  { name: "Boxning", icon: "🥊", color: "from-rose-400 to-rose-600", bg: "bg-rose-50" },
  { name: "Basket", icon: "🏀", color: "from-amber-400 to-amber-600", bg: "bg-amber-50" },
];

export function SportsShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            10 sporter att prova
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Låt ditt barn hitta sin passion. Vi samarbetar med lokala idrottsklubbar inom alla populära sporter.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {sports.map((sport) => (
            <div
              key={sport.name}
              className={`${sport.bg} rounded-2xl p-5 text-center hover:scale-105 transition-transform cursor-default group`}
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{sport.icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{sport.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
