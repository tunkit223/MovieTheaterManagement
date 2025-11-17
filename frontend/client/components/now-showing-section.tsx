"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { MovieCard } from "./movie-card"
import { nowShowingMovies } from "@/lib/mock-data"

export function NowShowingSection() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  const genres = Array.from(new Set(nowShowingMovies.flatMap((m) => m.genre)))

  const filteredMovies = selectedGenre
    ? nowShowingMovies.filter((m) => m.genre.includes(selectedGenre))
    : nowShowingMovies

  return (
    <section id="now-showing" className="section-padding bg-background dark:bg-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />

      <div className="container-max relative z-10">
        {/* Section Header */}
        <div className="mb-12 space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50">
            <span className="text-purple-300 text-sm font-semibold">Featured Content</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Now Showing</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover the latest blockbusters and critically acclaimed films playing at CINEPLEX now.
          </p>
        </div>

        {/* Genre Filter */}
        <div className="mb-12 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedGenre === null
                ? "gradient-primary text-white"
                : "bg-muted dark:bg-slate-800 text-muted-foreground hover:bg-muted/80 dark:hover:bg-slate-700"
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGenre === genre
                  ? "gradient-primary text-white"
                  : "bg-muted dark:bg-slate-800 text-muted-foreground hover:bg-muted/80 dark:hover:bg-slate-700"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onBook={() => console.log("Book:", movie.title)} />
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <button className="px-8 py-4 rounded-lg border border-border dark:border-slate-700 text-foreground dark:text-white font-semibold hover:bg-muted dark:hover:bg-slate-800 transition-all flex items-center gap-2 group">
            View All Movies
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}
