import Head from "next/head";

interface NavbarProps {
  tftdleCount: number | undefined;
}

const Navbar = ({ tftdleCount }: NavbarProps) => {
  return (
    <div className="flex justify-center my-2">
      {tftdleCount && (
        <Head>
          <title>TFTdle - #{tftdleCount}</title>
        </Head>
      )}
      <p className="text-3xl font-semibold">
        TFTdle{tftdleCount ? ` - #${tftdleCount}` : ""}
      </p>
    </div>
  );
};

export default Navbar;
