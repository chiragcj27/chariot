import Image from "next/image";

export default function LoaderOverlay() {
  return (
    <div className="loader-overlay" id="css-loader">
      <Image src="/loader.gif" alt="Loading..." width={100} height={100} />
    </div>
  );
}
