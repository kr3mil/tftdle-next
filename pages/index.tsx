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

  const handleCopyClipboardClick = () => {
    let textBuilder =
      "I found #TFTdle champion #LIGMA in only " +
      guesses.length +
      " attempts!\n\n";

    for (let i = guesses.length - 1; i >= 0; i--) {
      console.log(i);
      textBuilder += guesses[i].set === champToGuess!.set ? "🟩" : "🟥";
      textBuilder += guesses[i].cost === champToGuess!.cost ? "🟩" : "🟥";
      textBuilder += guesses[i].health === champToGuess!.health ? "🟩" : "🟥";
      textBuilder += guesses[i].range === champToGuess!.range ? "🟩" : "🟥";
      textBuilder += "\n";
    }

    textBuilder += "\nhttps://tftdle.com";

    navigator.clipboard.writeText(textBuilder);
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

      {guessedCorrectly && (
        <button
          className="rounded-xl border mt-4 w-[80%] self-center py-2 bg-cyan-800 text-white font-semibold"
          onClick={handleCopyClipboardClick}
        >
          Copy to Clipboard!
        </button>
      )}
    </div>
  );
}
