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
                key={`${guess.set}, ${index}`}
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
          <div className="flex flex-col w-12 sm:w-16 md:w-20 items-center">
            <p className="font-semibold">Traits</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex transition-all duration-500 relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border mt-2 items-center justify-center ${
                  guess.traits.every((r) => champToGuess.traits.includes(r))
                    ? "bg-green-700 hover:bg-green-500"
                    : guess.traits.some((r) => champToGuess.traits.includes(r))
                    ? "bg-orange-700 hover:bg-orange-500"
                    : "bg-red-700 hover:bg-red-500"
                }`}
                key={`${guess.traits[0]}, ${index}`}
              >
                <div className="flex-col items-center hidden md:flex text-sm">
                  {guess.traits.map((trait, traitIndex) => (
                    <p key={`${trait},${traitIndex}`} className="z-10">
                      {trait}
                    </p>
                  ))}
                </div>
                <div className="flex-col items-center flex md:hidden">
                  {guess.traits.map((trait, traitIndex) => {
                    if (traitIndex < 2)
                      return (
                        <p key={`${trait},${traitIndex}`} className="z-10">
                          <Image
                            src={`/icons/${guess.set}/traits/${trait}.svg`}
                            key={`${guess.name},${guess.set},${trait}`}
                            width="20"
                            height="20"
                            alt={`${trait}`}
                          />
                        </p>
                      );
                  })}
                </div>
                {guess.traits.length > 2 && (
                  <div className="flex-col items-center flex md:hidden">
                    {guess.traits.map((trait, traitIndex) => {
                      if (traitIndex >= 2)
                        return (
                          <p key={`${trait},${traitIndex}`} className="z-10">
                            <Image
                              src={`/icons/${guess.set}/traits/${trait}.svg`}
                              key={`${guess.name},${guess.set},${trait}`}
                              width="20"
                              height="20"
                              alt={`${trait}`}
                            />
                          </p>
                        );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

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
                key={`${guess.cost}, ${index}`}
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
                key={`${guess.health}, ${index}`}
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
                key={`${guess.range}, ${index}`}
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
