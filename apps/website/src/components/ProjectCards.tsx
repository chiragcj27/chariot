import Image from "next/image";

const projects = [
  {
    name: "Spexi",
    description: "DroneTech",
    image: "/temp.png", // Placeholder, replace with actual image path
  },
  {
    name: "Cytora",
    description: "UK",
    image: "/temp.png", // Placeholder, replace with actual image path
  },
  {
    name: "Seen",
    description: "Norway",
    image: "/temp.png", // Placeholder, replace with actual image path
  },
];

export default function ProjectCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl">
      {projects.map((project) => (
        <div
          key={project.name}
          className="overflow-hidden flex flex-col"
        >
          <div className="relative w-full aspect-square">
            <Image
              src={project.image}
              alt={project.name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <div className="px-3 pt-3">
            <h3 className="text-[15px] font-semibold">{project.name}</h3>
            <p className="text-gray-500 text-[13px]">{project.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 