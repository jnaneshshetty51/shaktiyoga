"use client";

import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Program {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  weeklySessions?: Array<{ day: string; name: string; detail: string }>;
  conditions?: string[];
  sessions?: Array<{ name: string; detail: string }>;
  featured?: boolean;
  price?: number;
}

// Fallback programs for when API fails
const FALLBACK_PROGRAMS: Program[] = [
  {
    id: 'fallback-1',
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
    id: 'fallback-2',
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
    id: 'fallback-3',
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
    id: 'fallback-4',
    title: "Deha Shodhana",
    subtitle: "Detoxification",
    description: "Toxins disrupt the body's natural balance. Our specialized Kriya-based cleansing techniques help eliminate impurities, restoring organ function and promoting overall vitality. Experience deep purification and immediate relief through this powerful detox program.",
    featured: false,
  },
  {
    id: 'fallback-5',
    title: "Chandrayana Vrata",
    subtitle: "Tool for Karma & Deha Shuddhi",
    description: "A 30-day transformative journey that aligns food consumption with the moon's cycle. This unique method regulates metabolism, corrects BMI, and aids in mindful eating, supporting both physical and karmic purification.",
    featured: false,
  },
  {
    id: 'fallback-6',
    title: "Mitashana",
    subtitle: "Dietary Management",
    description: "Nutrition plays a crucial role in holistic wellness. Our customized dietary programs are designed based on individual body types and preferences, making weight management and overall well-being effortless.",
    featured: false,
  },
  {
    id: 'fallback-7',
    title: "Chittakshamata",
    subtitle: "Yoga for Stress Management",
    description: "Our meticulously crafted modules help individuals overcome all forms of stress—be it mental, emotional, or physical. This program strengthens the mind, enhancing focus, resilience, and inner stability.",
    featured: false,
  },
  {
    id: 'fallback-8',
    title: "Antaranga Yoga",
    subtitle: "Meditation Classes",
    description: "True stability begins within. Our dedicated meditation rooms and guided meditation programs offer deep relaxation, improved concentration, and a profound sense of inner peace. Experience self-transformation through structured meditative practices.",
    featured: false,
  }
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(FALLBACK_PROGRAMS);

  useEffect(() => {
    fetch('/api/content/programs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPrograms(data);
        }
      })
      .catch(err => console.error('Failed to fetch programs:', err));
  }, []);

  const featuredProgram = programs.find(p => p.featured) || programs[0];
  const otherPrograms = programs.filter(p => p !== featuredProgram);

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
              <h2 className="font-serif text-3xl md:text-4xl text-text mb-2">{featuredProgram.title}</h2>
              <p className="text-lg text-secondary font-sans uppercase tracking-widest">{featuredProgram.subtitle}</p>
            </div>

            <p className="font-sans text-text/80 text-center text-lg leading-relaxed mb-10 max-w-4xl mx-auto">
              {featuredProgram.description}
            </p>

            {featuredProgram.weeklySessions && (
              <div className="grid md:grid-cols-5 gap-4">
                {featuredProgram.weeklySessions.map((session, index) => (
                  <div key={index} className="bg-gradient-to-b from-primary/5 to-white p-6 rounded-lg text-center border border-primary/10 hover:border-primary/30 transition-colors">
                    <div className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                      {session.day}
                    </div>
                    <h3 className="font-serif text-lg text-primary mb-2">{session.name}</h3>
                    <p className="text-sm text-text/70 font-sans">{session.detail}</p>
                  </div>
                ))}
              </div>
            )}

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
            {otherPrograms.map((program, index) => (
              <div key={program.id || index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-secondary">
                <span className="inline-block bg-secondary/10 text-secondary text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  {program.subtitle || 'Program'}
                </span>
                <h3 className="font-serif text-2xl text-text mb-1">{program.title}</h3>
                <p className="text-primary font-sans uppercase tracking-widest text-sm mb-4">{program.subtitle}</p>
                <p className="font-sans text-text/80 mb-6 leading-relaxed">
                  {program.description}
                </p>

                {program.conditions && (
                  <ul className="space-y-2 mb-6 font-sans text-text/80">
                    {program.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600">✔</span>
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {program.sessions && (
                  <ul className="space-y-3 mb-6 font-sans text-text/80">
                    {program.sessions.map((session, idx) => (
                      <li key={idx}>
                        <span className="font-bold text-text">{session.name}</span> – {session.detail}
                      </li>
                    ))}
                  </ul>
                )}

                <Link href="/checkout?plan=everyday" className="inline-block py-3 px-6 bg-secondary text-white font-sans uppercase tracking-widest text-sm rounded hover:bg-primary transition-colors">
                  Learn More
                </Link>
              </div>
            ))}
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
