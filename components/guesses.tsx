import type { Champ } from "../lib/types";

import Image from "next/image";

interface GuessesProps {
  guesses: Champ[];
  champToGuess: Champ | undefined;
}

const Guesses = ({ guesses, champToGuess }: GuessesProps) => {
  return (
    <>
      {champToGuess && guesses.length > 0 && (
        <div className="flex justify-center mt-4 space-x-4 select-none text-xs sm:text-sm md:text-base">
          {/* NAME */}
          <div className="flex flex-col w-12 sm:w-16 md:w-20 items-center">
            <p className="font-semibold">Champion</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex transition-all duration-500 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border mt-2 items-center justify-center`}
                key={`${guess.name}, ${index}`}
              >
                <Image
                  src={`/${guess.icon}`}
                  alt={`${guess.name}${index}`}
                  width="128"
                  height="128"
                />
              </div>
            ))}
          </div>

          {/* SET */}
          <div className="flex flex-col w-12 sm:w-16 md:w-20 items-center">
            <p className="font-semibold">Set</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex transition-all duration-500 relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border mt-2 items-center justify-center ${
                  guess.set === champToGuess.set
                    ? "bg-green-700 hover:bg-green-500"
                    : "bg-red-700 hover:bg-red-500"
                }`}
                key={`${guess.name}, ${index}`}
              >
                {guess.set < champToGuess.set ? (
                  <Image
                    src="/icons/up_arrow.png"
                    alt="arrow"
                    width="64"
                    height="64"
                    className="absolute opacity-40"
                  />
                ) : (
                  guess.set > champToGuess.set && (
                    <Image
                      src="/icons/up_arrow.png"
                      alt="arrow"
                      width="64"
                      height="64"
                      className="absolute opacity-40 rotate-180"
                    />
                  )
                )}
                <p className="z-10">{guess.set.replace("-", ".")}</p>
              </div>
            ))}
          </div>

          {/* TRAITS */}
          {/* TODO */}

          {/* COST */}
          <div className="flex flex-col w-12 sm:w-16 md:w-20 items-center">
            <p className="font-semibold">Cost</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex transition-all duration-500 relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border mt-2 items-center justify-center ${
                  guess.cost === champToGuess.cost
                    ? "bg-green-700 hover:bg-green-500"
                    : "bg-red-700 hover:bg-red-500"
                }`}
                key={`${guess.name}, ${index}`}
              >
                {guess.cost < champToGuess.cost ? (
                  <Image
                    src="/icons/up_arrow.png"
                    alt="arrow"
                    width="64"
                    height="64"
                    className="absolute opacity-40"
                  />
                ) : (
                  guess.cost > champToGuess.cost && (
                    <Image
                      src="/icons/up_arrow.png"
                      alt="arrow"
                      width="64"
                      height="64"
                      className="absolute opacity-40 rotate-180"
                    />
                  )
                )}
                <p className="z-10">{guess.cost}</p>
              </div>
            ))}
          </div>

          {/* HEALTH */}
          <div className="flex flex-col w-12 sm:w-16 md:w-20 items-center">
            <p className="font-semibold">Health</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex transition-all duration-500 relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border mt-2 items-center justify-center ${
                  guess.health.split("/")[0].trim() ===
                  champToGuess.health.split("/")[0].trim()
                    ? "bg-green-700 hover:bg-green-500"
                    : "bg-red-700 hover:bg-red-500"
                }`}
                key={`${guess.name}, ${index}`}
              >
                {guess.health.split("/")[0].trim() <
                champToGuess.health.split("/")[0].trim() ? (
                  <Image
                    src="/icons/up_arrow.png"
                    alt="arrow"
                    width="72"
                    height="72"
                    className="absolute opacity-40"
                  />
                ) : (
                  guess.health.split("/")[0].trim() >
                    champToGuess.health.split("/")[0].trim() && (
                    <Image
                      src="/icons/up_arrow.png"
                      alt="arrow"
                      width="64"
                      height="64"
                      className="absolute opacity-40 rotate-180"
                    />
                  )
                )}
                <p className="z-10">{guess.health.split("/")[0].trim()}</p>
              </div>
            ))}
          </div>

          {/* RANGE */}
          <div className="flex flex-col w-12 sm:w-16 md:w-20 items-center">
            <p className="font-semibold">Range</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex transition-all duration-500 relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border mt-2 items-center justify-center ${
                  guess.range === champToGuess.range
                    ? "bg-green-700 hover:bg-green-500"
                    : "bg-red-700 hover:bg-red-500"
                }`}
                key={`${guess.name}, ${index}`}
              >
                {guess.range < champToGuess.range ? (
                  <Image
                    src="/icons/up_arrow.png"
                    alt="arrow"
                    width="72"
                    height="72"
                    className="absolute opacity-40"
                  />
                ) : (
                  guess.range > champToGuess.range && (
                    <Image
                      src="/icons/up_arrow.png"
                      alt="arrow"
                      width="64"
                      height="64"
                      className="absolute opacity-40 rotate-180"
                    />
                  )
                )}
                <p className="z-10">{guess.range}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Guesses;
