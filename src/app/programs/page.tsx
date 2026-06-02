import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const programs = [
  {
    title: "Yoga for General Wellness",
    subtitle: "Thematic Weekly Practice",
    description: "Achieve holistic well-being with our structured theme-based yoga modules, practiced from Monday to Friday. This program ensures a balanced approach by systematically focusing on different aspects of the body and mind throughout the week.",
    weeklySessions: [
      { day: "Monday", name: "Basic Hatha Yoga", detail: "Gentle yet powerful classical yoga to improve flexibility, alignment, and breath awareness." },
      { day: "Tuesday", name: "Upper Body & Balance", detail: "Strengthen the shoulders, arms, and back while enhancing stability and coordination." },
      { day: "Wednesday", name: "Core & Strength", detail: "Build core strength and overall endurance with dynamic asanas and targeted sequences." },
      { day: "Thursday", name: "Detox & Cleansing", detail: "Purify the body with kriyas, twists, and pranayama (breathwork) for internal cleansing." },
      { day: "Friday", name: "Yoga for Self-Love", detail: "A restorative session with deep relaxation, meditation, and self-care practices to nourish the mind and soul." },
    ],
    featured: true,
  },
  {
    title: "Yoga Chikitsa",
    subtitle: "Yoga Therapy",
    description: "A holistic approach to managing and healing lifestyle disorders through yoga. Our therapy sessions help in maintaining and curing:",
    conditions: [
      "Obesity, Stress, Diabetes, and Insomnia",
      "Back/Neck Pain & Musculoskeletal Disorders",
      "Asthma & Other Respiratory Issues",
      "Digestive Disorders & Poor Cognition",
      "Cardiovascular Disorders & Thyroid Problems",
      "Menstrual Disorders & Hormonal Imbalance",
    ],
    featured: false,
  },
  {
    title: "Pre & Post Natal Yoga",
    subtitle: "For Expecting and New Mothers",
    description: "A nurturing and supportive yoga program specially designed for expecting and new mothers. Our sessions focus on enhancing physical comfort, emotional well-being, breath awareness, and relaxation during and after pregnancy.",
    sessions: [
      { name: "Prenatal Yoga", detail: "Gentle asanas, pranayama (breathwork), and relaxation techniques to support a healthy and comfortable pregnancy journey." },
      { name: "Postnatal Yoga", detail: "Safe recovery practices to rebuild strength, improve posture, restore core stability, and promote emotional balance after childbirth." },
      { name: "Garbhasamskara", detail: "Meditation and mindfulness practices to cultivate calmness, confidence, and inner connection during motherhood." },
    ],
    featured: false,
  },
  {
    title: "Deha Shodhana",
    subtitle: "Detoxification",
    description: "Toxins disrupt the body's natural balance. Our specialized Kriya-based cleansing techniques help eliminate impurities, restoring organ function and promoting overall vitality. Experience deep purification and immediate relief through this powerful detox program.",
    featured: false,
  },
  {
    title: "Chandrayana Vrata",
    subtitle: "Tool for Karma & Deha Shuddhi",
    description: "A 30-day transformative journey that aligns food consumption with the moon's cycle. This unique method regulates metabolism, corrects BMI, and aids in mindful eating, supporting both physical and karmic purification.",
    featured: false,
  },
  {
    title: "Mitashana",
    subtitle: "Dietary Management",
    description: "Nutrition plays a crucial role in holistic wellness. Our customized dietary programs are designed based on individual body types and preferences, making weight management and overall well-being effortless.",
    featured: false,
  },
  {
    title: "Chittakshamata",
    subtitle: "Yoga for Stress Management",
    description: "Our meticulously crafted modules help individuals overcome all forms of stress—be it mental, emotional, or physical. This program strengthens the mind, enhancing focus, resilience, and inner stability.",
    featured: false,
  },
  {
    title: "Antaranga Yoga",
    subtitle: "Meditation Classes",
    description: "True stability begins within. Our dedicated meditation rooms and guided meditation programs offer deep relaxation, improved concentration, and a profound sense of inner peace. Experience self-transformation through structured meditative practices.",
    featured: false,
  },
];

export default function ProgramsPage() {
  return (
    <main>
      <PageHeader
        title="Our Programs"
        subtitle="Choose the path that suits your lifestyle. From daily group energy to personalized one-on-one healing."
      />

      {/* Yoga for General Wellness - Featured */}
      <section className="py-20 px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl border-t-4 border-primary">
            <div className="text-center mb-10">
              <span className="inline-block bg-primary/10 text-primary text-sm font-sans uppercase tracking-widest px-4 py-1 rounded-full mb-4">
                Featured Program
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-text mb-2">Yoga for General Wellness</h2>
              <p className="text-lg text-secondary font-sans uppercase tracking-widest">Thematic Weekly Practice</p>
            </div>
            
            <p className="font-sans text-text/80 text-center text-lg leading-relaxed mb-10 max-w-4xl mx-auto">
              Achieve holistic well-being with our structured theme-based yoga modules, practiced from Monday to Friday. 
              This program ensures a balanced approach by systematically focusing on different aspects of the body and mind throughout the week.
            </p>

            <div className="grid md:grid-cols-5 gap-4">
              {programs[0].weeklySessions?.map((session, index) => (
                <div key={index} className="bg-gradient-to-b from-primary/5 to-white p-6 rounded-lg text-center border border-primary/10 hover:border-primary/30 transition-colors">
                  <div className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                    {session.day}
                  </div>
                  <h3 className="font-serif text-lg text-primary mb-2">{session.name}</h3>
                  <p className="text-sm text-text/70 font-sans">{session.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/trial" className="inline-block py-4 px-8 bg-primary text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-secondary transition-colors shadow-md">
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Programs Grid */}
      <section className="py-20 px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl text-primary text-center mb-12">Our Complete Programs</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Yoga Chikitsa */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-secondary">
              <span className="inline-block bg-secondary/10 text-secondary text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Therapy
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Yoga Chikitsa</h3>
              <p className="text-primary font-sans uppercase tracking-widest text-sm mb-4">Yoga Therapy</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                A holistic approach to managing and healing lifestyle disorders through yoga. Our therapy sessions help in maintaining and curing:
              </p>
              <ul className="space-y-2 mb-6 font-sans text-text/80">
                {programs[1].conditions?.map((condition, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600">✔</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
              <Link href="/yoga-therapy/start" className="inline-block py-3 px-6 bg-secondary text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-primary transition-colors">
                Learn More
              </Link>
            </div>

            {/* Pre & Post Natal */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-pink-400">
              <span className="inline-block bg-pink-100 text-pink-600 text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Special Programs
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Pre & Post Natal Yoga</h3>
              <p className="text-pink-600 font-sans uppercase tracking-widest text-sm mb-4">For Expecting and New Mothers</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                A nurturing and supportive yoga program specially designed for expecting and new mothers. Our sessions focus on enhancing physical comfort, emotional well-being, breath awareness, and relaxation during and after pregnancy.
              </p>
              <ul className="space-y-3 mb-6 font-sans text-text/80">
                {programs[2].sessions?.map((session, index) => (
                  <li key={index}>
                    <span className="font-bold text-text">{session.name}</span> – {session.detail}
                  </li>
                ))}
              </ul>
              <Link href="/yoga-therapy/start" className="inline-block py-3 px-6 bg-pink-500 text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-pink-600 transition-colors">
                Learn More
              </Link>
            </div>

            {/* Deha Shodhana */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
              <span className="inline-block bg-green-100 text-green-600 text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Detox
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Deha Shodhana</h3>
              <p className="text-green-600 font-sans uppercase tracking-widest text-sm mb-4">Detoxification</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                Toxins disrupt the body's natural balance. Our specialized Kriya-based cleansing techniques help eliminate impurities, restoring organ function and promoting overall vitality. Experience deep purification and immediate relief through this powerful detox program.
              </p>
              <Link href="/contact" className="inline-block py-3 px-6 bg-green-500 text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-green-600 transition-colors">
                Learn More
              </Link>
            </div>

            {/* Chandrayana Vrata */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
              <span className="inline-block bg-purple-100 text-purple-600 text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Transformative
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Chandrayana Vrata</h3>
              <p className="text-purple-600 font-sans uppercase tracking-widest text-sm mb-4">Tool for Karma & Deha Shuddhi</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                A 30-day transformative journey that aligns food consumption with the moon's cycle. This unique method regulates metabolism, corrects BMI, and aids in mindful eating, supporting both physical and karmic purification.
              </p>
              <Link href="/contact" className="inline-block py-3 px-6 bg-purple-500 text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-purple-600 transition-colors">
                Learn More
              </Link>
            </div>

            {/* Mitashana */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-orange-500">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Nutrition
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Mitashana</h3>
              <p className="text-orange-600 font-sans uppercase tracking-widest text-sm mb-4">Dietary Management</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                Nutrition plays a crucial role in holistic wellness. Our customized dietary programs are designed based on individual body types and preferences, making weight management and overall well-being effortless.
              </p>
              <Link href="/contact" className="inline-block py-3 px-6 bg-orange-500 text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-orange-600 transition-colors">
                Learn More
              </Link>
            </div>

            {/* Chittakshamata */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-teal-500">
              <span className="inline-block bg-teal-100 text-teal-600 text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Mental Wellness
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Chittakshamata</h3>
              <p className="text-teal-600 font-sans uppercase tracking-widest text-sm mb-4">Yoga for Stress Management</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                Our meticulously crafted modules help individuals overcome all forms of stress—be it mental, emotional, or physical. This program strengthens the mind, enhancing focus, resilience, and inner stability.
              </p>
              <Link href="/contact" className="inline-block py-3 px-6 bg-teal-500 text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-teal-600 transition-colors">
                Learn More
              </Link>
            </div>

            {/* Antaranga Yoga */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-indigo-500 md:col-span-2 md:max-w-xl md:mx-auto">
              <span className="inline-block bg-indigo-100 text-indigo-600 text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Meditation
              </span>
              <h3 className="font-serif text-2xl text-text mb-1">Antaranga Yoga</h3>
              <p className="text-indigo-600 font-sans uppercase tracking-widest text-sm mb-4">Meditation Classes</p>
              <p className="font-sans text-text/80 mb-6 leading-relaxed">
                True stability begins within. Our dedicated meditation rooms and guided meditation programs offer deep relaxation, improved concentration, and a profound sense of inner peace. Experience self-transformation through structured meditative practices.
              </p>
              <Link href="/contact" className="inline-block py-3 px-6 bg-indigo-500 text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-indigo-600 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Join Us & Transform Your Life</h2>
          <p className="font-sans text-lg text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            No matter where you are on your journey, our specialized programs are designed to support your physical, mental, and spiritual growth. Take the first step towards holistic well-being with Shakti Yoga Kendra.
          </p>
          <Link href="/signup" className="inline-block py-4 px-10 bg-white text-primary font-sans uppercase tracking-widest text-sm rounded hover:bg-secondary hover:text-white transition-colors shadow-lg">
            Join Now
          </Link>
        </div>
      </section>
    </main>
  );
}
