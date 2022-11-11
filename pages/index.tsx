import Navbar from "../components/navbar";

import Head from "next/head";
import Image from "next/image";
import Searchbox from "../components/searchbox";
import type { Champ } from "./types";
import { useEffect, useState } from "react";
import Guesses from "../components/guesses";
import champs from "../json/all_champs.json";

export default function Home() {
  const [guesses, setGuesses] = useState<Champ[]>([]);
  const [champToGuess, setChampToGuess] = useState<Champ | undefined>();

  useEffect(() => {
    setChampToGuess(champs[Math.floor(Math.random() * champs.length)]);
  }, []);

  const handleGuess = (champ: Champ) => {
    setGuesses([champ, ...guesses]);

    if (champ === champToGuess) {
      alert("YOU GUESSED CORRECTLY POG");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>TFTdle</title>
        <meta name="description" content="TFT inspired wordle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="border-t-[1px] border-gray-700 mb-4" />
      <div className="flex flex-col items-center">
        <Searchbox handleGuess={handleGuess} />
      </div>
      <Guesses guesses={guesses} champToGuess={champToGuess} />
    </div>
  );
}
