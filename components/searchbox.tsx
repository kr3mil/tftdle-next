import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import champs from "../json/all_champs.json";

import Image from "next/image";

const Searchbox = () => {
  const [selectedPerson, setSelectedPerson] = useState(undefined);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    console.log(champs);
  }, []);

  const filteredChamps =
    searchText === ""
      ? []
      : champs.filter((champ) => {
          return champ.name.toLowerCase().startsWith(searchText.toLowerCase());
        });

  return (
    <div className="relative cursor-default overflow-hidden rounded-lg text-left w-[42rem] shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
      <Combobox value={selectedPerson} onChange={setSelectedPerson}>
        <Combobox.Input
          placeholder="Type champion name..."
          onChange={(event) => setSearchText(event.target.value)}
          className="border-none py-4 pl-3 pr-10 w-full text-lg leading-5 focus:ring-0 focus:outline-none"
        />
        <Combobox.Options className="max-h-[40rem] overflow-y-scroll">
          {filteredChamps.map((champ) => (
            <Combobox.Option
              key={`${champ.name} - ${champ.set}`}
              value={champ}
              className="flex space-x-2 items-center last:border-b-0 border-b-[1px] p-2 hover:bg-blue-300 hover:cursor-pointer"
            >
              <Image
                src={`/${champ.icon}`}
                alt={champ.name}
                width="48"
                height="48"
                className="border"
              />
              <p>
                {champ.name} - Set {champ.set.replace("-", ".")}
              </p>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default Searchbox;
