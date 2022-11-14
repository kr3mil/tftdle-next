import Navbar from "../components/navbar";

import Head from "next/head";
import Image from "next/image";
import Searchbox from "../components/searchbox";
import type { Champ } from "../lib/types";
import { useEffect, useState } from "react";
import Guesses from "../components/guesses";
import champs from "../json/all_champs.json";

export default function Home() {
  const [guesses, setGuesses] = useState<Champ[]>([]);
  const [champToGuess, setChampToGuess] = useState<Champ | undefined>();
  const [guessedCorrectly, setGuessedCorrectly] = useState<Boolean>(false);

  useEffect(() => {
    setChampToGuess(champs[Math.floor(Math.random() * champs.length)]);
  }, []);

  useEffect(() => {
    console.log(champToGuess);
  }, [champToGuess]);

  const handleGuess = (champ: Champ) => {
    setGuesses([champ, ...guesses]);

    if (champ === champToGuess) {
      setGuessedCorrectly(true);
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
      <div className="border-t-[1px] border-gray-700" />
      {!guessedCorrectly && (
        <div className="flex flex-col items-center mt-4">
          <Searchbox handleGuess={handleGuess} />
        </div>
      )}

      <Guesses guesses={guesses} champToGuess={champToGuess} />
    </div>
  );
}
