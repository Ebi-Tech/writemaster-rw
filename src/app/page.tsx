import Link from 'next/link';
import { BookOpen, GraduationCap, Lock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">WriteMaster<span className="text-blue-600">RW</span></span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="#features" className="text-slate-600 hover:text-blue-600">Features</Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-blue-600">How It Works</Link>
              <Link href="#modes" className="text-slate-600 hover:text-blue-600">Writing Modes</Link>
            </nav>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Write <span className="text-blue-600">Better</span> Essays & Theses
            <br />
            <span className="text-3xl">The Rwandan Way</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            A stage-locked writing assistant that ensures you build strong academic work, 
            following REB and University of Rwanda guidelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/essay" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <BookOpen size={20} />
              Start Essay Mode (REB)
            </Link>
            <Link 
              href="/thesis" 
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <GraduationCap size={20} />
              Start Thesis Mode (UR)
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stage-Locked Progression</h3>
            <p className="text-slate-600">
              Cannot proceed to next stage until current work meets quality standards. Prevents building on weak foundations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">REB & UR Aligned</h3>
            <p className="text-slate-600">
              Scoring and feedback based on official Rwandan examination board and university guidelines.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Writing DNA Analysis</h3>
            <p className="text-slate-600">
              Track your writing patterns, strengths, and areas for improvement over time.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="bg-white rounded-2xl p-8 shadow-sm border mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">How WriteMaster RW Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Choose Mode', desc: 'Essay (REB) or Thesis (UR)' },
              { step: '2', title: 'Write Stage', desc: 'Complete current writing stage' },
              { step: '3', title: 'Get Assessed', desc: 'AI checks against rubrics' },
              { step: '4', title: 'Unlock Next', desc: 'Proceed when requirements met' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Improve Your Academic Writing?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join students across Rwanda who are building stronger essays and theses with our guided, stage-locked approach.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Start Writing for Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">WriteMaster<span className="text-blue-600">RW</span></span>
            </div>
            <div className="text-slate-600 text-center md:text-right">
              <p>Built for Rwandan students • Follows REB & UR guidelines</p>
              <p className="text-sm mt-1">© {new Date().getFullYear()} WriteMaster RW. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}